import { useEffect, useRef, useState, useCallback } from 'react';
import SimplePeer from 'simple-peer';
import socket from '../services/socket';

const Peer = SimplePeer.default || SimplePeer;

export const useWebRTC = (roomId, user, isRoomJoined) => {
  const [participants, setParticipants] = useState([]); // Array of { userId, stream, name, avatar, isMuted, isCameraOff, isScreenSharing, screenStream }
  const [localStream, setLocalStream] = useState(null);
  const [mediaError, setMediaError] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [screenStream, setScreenStream] = useState(null);
  
  const peersRef = useRef({}); // { socketId: peer }
  const streamsRef = useRef({}); // { socketId: { camera: stream, screen: stream } }
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);

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
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
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
      trickle: false,
      stream,
      config: {
        iceServers: [
          { urls: 'stun:stun.l.google.com:19302' },
          { urls: 'stun:global.stun.twilio.com:3478' }
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

  useEffect(() => {
    if (!isRoomJoined) return;
    if (localStream || mediaError) {
      console.log('DEBUG: Emitting join_video_call for room', roomId);
      socket.emit('join_video_call', { roomId });
    }
  }, [isRoomJoined, localStream, mediaError, roomId]);

  useEffect(() => {
    if (!isRoomJoined) return;

    const handleUserJoined = ({ socketId, user: joinedUser }) => {
      console.log('User joined video call:', socketId);
      if (peersRef.current[socketId]) return;

      const peer = createPeer(socketId, socket.id, localStream);
      
      if (screenStreamRef.current) {
        peer.on('connect', () => {
          console.log('Adding screen stream to new peer', socketId);
          peer.addStream(screenStreamRef.current);
        });
      }

      peer.on('stream', (remoteStream) => {
        console.log('Stream received from', socketId, 'Stream ID:', remoteStream.id);
        if (!streamsRef.current[socketId]) {
          streamsRef.current[socketId] = { camera: remoteStream };
          setParticipants(prev => {
            if (prev.find(p => p.socketId === socketId)) return prev;
            return [...prev, { 
              socketId, 
              user: joinedUser, 
              stream: remoteStream,
              screenStream: null,
              isMuted: false,
              isCameraOff: false,
              isScreenSharing: false
            }];
          });
        } else {
          streamsRef.current[socketId].screen = remoteStream;
          setParticipants(prev => prev.map(p => {
            if (p.socketId === socketId) {
              return { ...p, screenStream: remoteStream };
            }
            return p;
          }));
        }
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
          console.log('Received renegotiation offer for existing peer, signaling.');
          peer.signal(signal);
          return;
        }
        
        peer = addPeer(signal, fromSocketId, localStream);

        if (screenStreamRef.current) {
          peer.on('connect', () => {
            console.log('Adding screen stream to peer', fromSocketId);
            peer.addStream(screenStreamRef.current);
          });
        }
        
        peer.on('stream', (remoteStream) => {
          console.log('Remote stream received from:', fromSocketId, 'Stream ID:', remoteStream.id);
          if (!streamsRef.current[fromSocketId]) {
            streamsRef.current[fromSocketId] = { camera: remoteStream };
            setParticipants(prev => {
              if (prev.find(p => p.socketId === fromSocketId)) return prev;
              return [...prev, { 
                socketId: fromSocketId, 
                user: signalUser, 
                stream: remoteStream,
                screenStream: null,
                isMuted: false,
                isCameraOff: false,
                isScreenSharing: false
              }];
            });
          } else {
            streamsRef.current[fromSocketId].screen = remoteStream;
            setParticipants(prev => prev.map(p => {
              if (p.socketId === fromSocketId) {
                return { ...p, screenStream: remoteStream };
              }
              return p;
            }));
          }
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
          if (type === 'screen') {
            return { 
              ...p, 
              isScreenSharing: enabled,
              screenStream: enabled ? p.screenStream : null
            };
          }
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
  }, [isRoomJoined, localStream, createPeer, addPeer, cleanupPeer]);

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
      const sStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: true 
      });
      screenStreamRef.current = sStream;
      const screenTrack = sStream.getVideoTracks()[0];

      Object.values(peersRef.current).forEach(peer => {
        peer.addStream(sStream);
      });

      setScreenStream(sStream);
      setIsScreenSharing(true);
      socket.emit('media_state_change', { roomId, type: 'screen', enabled: true });

      screenTrack.onended = () => {
        stopScreenShare();
      };

      return sStream;
    } catch (err) {
      console.error('Error sharing screen:', err);
      return null;
    }
  }, [roomId]);

  const stopScreenShare = useCallback(() => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      
      const sStream = screenStreamRef.current;
      Object.values(peersRef.current).forEach(peer => {
        try {
          peer.removeStream(sStream);
        } catch (e) {
          console.warn("Error removing stream from peer:", e);
        }
      });
      screenStreamRef.current = null;
    }

    setScreenStream(null);
    setIsScreenSharing(false);
    socket.emit('media_state_change', { roomId, type: 'screen', enabled: false });
  }, [roomId]);

  return {
    participants,
    localStream,
    mediaError,
    isScreenSharing,
    toggleMute,
    toggleCamera,
    shareScreen,
    stopScreenShare,
    screenStream
  };
};
