import { useEffect, useRef, useState, useCallback } from 'react';
import Peer from 'simple-peer';
import socket from '../services/socket';

export const useWebRTC = (roomId, user) => {
  const [participants, setParticipants] = useState([]); // Array of { userId, stream, name, avatar, isMuted, isCameraOff, isScreenSharing }
  const [localStream, setLocalStream] = useState(null);
  const [mediaError, setMediaError] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const peersRef = useRef({}); // { socketId: peer }
  const streamsRef = useRef({}); // { socketId: stream }
  const localStreamRef = useRef(null);

  const cleanupPeer = useCallback((socketId) => {
    if (peersRef.current[socketId]) {
      peersRef.current[socketId].destroy();
      delete peersRef.current[socketId];
    }
    if (streamsRef.current[socketId]) {
      delete streamsRef.current[socketId];
    }
    setParticipants(prev => prev.filter(p => p.socketId !== socketId));
  }, []);

  const createPeer = useCallback((targetSocketId, callerId, stream) => {
    const peer = new Peer({
      initiator: true,
      trickle: true,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }
        ]
      }
    });

    peer.on('connect', () => console.log('Peer CONNECTED to', targetSocketId));
    peer.on('error', (err) => console.error('Peer ERROR with', targetSocketId, err));

    peer.on('signal', (signal) => {
      socket.emit('webrtc_signal', {
        type: signal.type || (signal.candidate ? 'candidate' : 'offer'),
        targetSocketId,
        callerId,
        signal,
        roomId
      });
    });

    return peer;
  }, [roomId]);

  const addPeer = useCallback((incomingSignal, callerId, stream) => {
    const peer = new Peer({
      initiator: false,
      trickle: true,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478?transport=udp' }
        ]
      }
    });

    peer.on('connect', () => console.log('Peer CONNECTED with', callerId));
    peer.on('error', (err) => console.error('Peer ERROR with', callerId, err));

    peer.on('signal', (signal) => {
      socket.emit('webrtc_signal', {
        type: signal.type || (signal.candidate ? 'candidate' : 'answer'),
        targetSocketId: callerId,
        signal,
        roomId
      });
    });

    peer.signal(incomingSignal);
    return peer;
  }, [roomId]);

  // Initialize Media
  useEffect(() => {
    let mounted = true;

    const initMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });
        
        if (!mounted) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        setLocalStream(stream);
        localStreamRef.current = stream;
        
        // Notify others that we are ready
        socket.emit('join_video_call', { roomId });
      } catch (err) {
        console.error('Media access error:', err);
        if (mounted) setMediaError('Camera/Mic access denied.');
      }
    };

    initMedia();

    return () => {
      mounted = false;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      Object.values(peersRef.current).forEach(p => p.destroy());
    };
  }, [roomId]);

  // Socket Listeners for WebRTC
  useEffect(() => {
    if (!localStream) return;

    const handleUserJoined = ({ socketId, user: joinedUser }) => {
      console.log('User joined video call:', socketId);
      if (peersRef.current[socketId]) return;

      const peer = createPeer(socketId, socket.id, localStream);
      
      peer.on('stream', (remoteStream) => {
        streamsRef.current[socketId] = remoteStream;
        setParticipants(prev => {
          if (prev.find(p => p.socketId === socketId)) return prev;
          return [...prev, { 
            socketId, 
            user: joinedUser, 
            stream: remoteStream,
            isMuted: false,
            isCameraOff: false,
            isScreenSharing: false
          }];
        });
      });

      peer.on('close', () => cleanupPeer(socketId));
      peer.on('error', (err) => {
        console.error('Peer error:', err);
        cleanupPeer(socketId);
      });

      peersRef.current[socketId] = peer;
    };

    const handleWebRTCSignal = ({ type, signal, fromSocketId, user: signalUser }) => {
      console.log(`WebRTC signal received from ${fromSocketId}:`, type);
      
      let peer = peersRef.current[fromSocketId];

      if (type === 'offer') {
        if (peer) {
          console.warn('Received offer for existing peer, destroying old one.');
          peer.destroy();
        }
        
        peer = addPeer(signal, fromSocketId, localStream);
        
        peer.on('stream', (remoteStream) => {
          console.log('Remote stream received from:', fromSocketId);
          streamsRef.current[fromSocketId] = remoteStream;
          setParticipants(prev => {
            if (prev.find(p => p.socketId === fromSocketId)) return prev;
            return [...prev, { 
              socketId: fromSocketId, 
              user: signalUser, 
              stream: remoteStream,
              isMuted: false,
              isCameraOff: false,
              isScreenSharing: false
            }];
          });
        });

        peer.on('close', () => {
          console.log('Peer connection closed:', fromSocketId);
          cleanupPeer(fromSocketId);
        });

        peer.on('error', (err) => {
          console.error('Peer error:', fromSocketId, err);
          cleanupPeer(fromSocketId);
        });

        peersRef.current[fromSocketId] = peer;
      } else if (peer) {
        // This handles 'answer' and 'ice-candidate' (trickle ICE)
        peer.signal(signal);
      } else {
        console.warn('Received signal for unknown peer:', fromSocketId);
      }
    };

    const handleUserLeft = (socketId) => {
      cleanupPeer(socketId);
    };

    const handleMediaStateChange = ({ socketId, type, enabled }) => {
      setParticipants(prev => prev.map(p => {
        if (p.socketId === socketId) {
          if (type === 'audio') return { ...p, isMuted: !enabled };
          if (type === 'video') return { ...p, isCameraOff: !enabled };
          if (type === 'screen') return { ...p, isScreenSharing: enabled };
        }
        return p;
      }));
    };

    socket.on('user_joined_video', handleUserJoined);
    socket.on('webrtc_signal', handleWebRTCSignal);
    socket.on('user_left_video', handleUserLeft);
    socket.on('user_media_state_changed', handleMediaStateChange);

    return () => {
      socket.off('user_joined_video', handleUserJoined);
      socket.off('webrtc_signal', handleWebRTCSignal);
      socket.off('user_left_video', handleUserLeft);
      socket.off('user_media_state_changed', handleMediaStateChange);
    };
  }, [localStream, createPeer, addPeer, cleanupPeer]);

  const toggleMute = useCallback(() => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        socket.emit('media_state_change', { 
          roomId, 
          type: 'audio', 
          enabled: audioTrack.enabled 
        });
        return !audioTrack.enabled;
      }
    }
    return false;
  }, [localStream, roomId]);

  const toggleCamera = useCallback(() => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        socket.emit('media_state_change', { 
          roomId, 
          type: 'video', 
          enabled: videoTrack.enabled 
        });
        return !videoTrack.enabled;
      }
    }
    return false;
  }, [localStream, roomId]);

  const shareScreen = useCallback(async () => {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      
      Object.values(peersRef.current).forEach(peer => {
        const videoTrack = localStream.getVideoTracks()[0];
        peer.replaceTrack(videoTrack, screenTrack, localStream);
      });

      setIsScreenSharing(true);
      socket.emit('media_state_change', { roomId, type: 'screen', enabled: true });

      screenTrack.onended = () => {
        stopScreenShare();
      };

      return screenStream;
    } catch (err) {
      console.error('Error sharing screen:', err);
      return null;
    }
  }, [localStream, roomId]);

  const stopScreenShare = useCallback(() => {
    if (!isScreenSharing) return;

    const cameraTrack = localStream.getVideoTracks()[0];
    Object.values(peersRef.current).forEach(peer => {
      // Find the track currently being sent which is the screen track
      const screenTrack = peer.streams[0].getVideoTracks().find(t => t.label.includes('screen') || t !== cameraTrack);
      if (screenTrack) {
        peer.replaceTrack(screenTrack, cameraTrack, localStream);
      }
    });

    setIsScreenSharing(false);
    socket.emit('media_state_change', { roomId, type: 'screen', enabled: false });
  }, [isScreenSharing, localStream, roomId]);

  return {
    participants,
    localStream,
    mediaError,
    isScreenSharing,
    toggleMute,
    toggleCamera,
    shareScreen,
    stopScreenShare
  };
};
