import { useEffect, useRef, useState, useCallback } from 'react';
import socket from '../services/socket';

export const useWebRTC = (roomId, user) => {
  const [participants, setParticipants] = useState([]); // Array of { socketId, user, stream, ... }
  const [localStream, setLocalStream] = useState(null);
  const [mediaError, setMediaError] = useState(null);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  const pcsRef = useRef({}); // { socketId: RTCPeerConnection }
  const localStreamRef = useRef(null);

  const ICE_SERVERS = {
    iceServers: [
      { urls: "stun:stun.l.google.com:19302" }
    ]
  };

  const cleanupPeer = useCallback((socketId) => {
    console.log(`[WEBRTC] Cleaning up peer: ${socketId}`);
    if (pcsRef.current[socketId]) {
      pcsRef.current[socketId].close();
      delete pcsRef.current[socketId];
    }
    setParticipants(prev => prev.filter(p => p.socketId !== socketId));
  }, []);

  const createPeerConnection = useCallback((targetSocketId, isInitiator) => {
    console.log(`[WEBRTC] Creating RTCPeerConnection for ${targetSocketId} (initiator: ${isInitiator})`);
    
    if (pcsRef.current[targetSocketId]) {
      console.warn(`[WEBRTC] Peer connection already exists for ${targetSocketId}, closing old one.`);
      pcsRef.current[targetSocketId].close();
    }

    const pc = new RTCPeerConnection(ICE_SERVERS);
    pcsRef.current[targetSocketId] = pc;

    // Add local tracks to the connection
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`[WEBRTC] Sending ICE candidate to ${targetSocketId}`);
        socket.emit("ice-candidate", {
          candidate: event.candidate,
          to: targetSocketId,
          roomId
        });
      }
    };

    pc.ontrack = (event) => {
      console.log(`[WEBRTC] Received remote track from ${targetSocketId}`);
      const remoteStream = event.streams[0];
      setParticipants(prev => {
        const existing = prev.find(p => p.socketId === targetSocketId);
        if (existing) {
          return prev.map(p => p.socketId === targetSocketId ? { ...p, stream: remoteStream } : p);
        }
        return [...prev, { 
          socketId: targetSocketId, 
          stream: remoteStream,
          isMuted: false,
          isCameraOff: false
        }];
      });
    };

    pc.onconnectionstatechange = () => {
      console.log(`[WEBRTC] Connection state for ${targetSocketId}: ${pc.connectionState}`);
      if (pc.connectionState === 'disconnected' || pc.connectionState === 'failed' || pc.connectionState === 'closed') {
        cleanupPeer(targetSocketId);
      }
    };

    return pc;
  }, [roomId, cleanupPeer]);

  const initiateCall = useCallback(async (targetSocketId) => {
    const pc = createPeerConnection(targetSocketId, true);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      console.log(`[WEBRTC] Sending offer to ${targetSocketId}`);
      socket.emit("call-user", { offer, to: targetSocketId, roomId });
    } catch (err) {
      console.error(`[WEBRTC] Error creating offer for ${targetSocketId}:`, err);
    }
  }, [roomId, createPeerConnection]);

  // Initialize Media and Join Room
  useEffect(() => {
    let mounted = true;

    const startMedia = async () => {
      try {
        console.log("[WEBRTC] Initializing local media...");
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
        console.log("[WEBRTC] Local stream acquired.");

        // Now join the room
        console.log(`[SOCKET] Emitting join-room for ${roomId}`);
        socket.emit('join-room', { roomId });
      } catch (err) {
        console.error('[WEBRTC] Media access error:', err);
        if (mounted) setMediaError('Camera/Mic access denied.');
      }
    };

    startMedia();

    return () => {
      mounted = false;
      console.log("[WEBRTC] Cleaning up useWebRTC hook...");
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(t => t.stop());
      }
      Object.values(pcsRef.current).forEach(pc => pc.close());
    };
  }, [roomId]);

  // Socket Listeners
  useEffect(() => {
    const handleParticipantsList = (list) => {
      console.log("[SOCKET] Received participants list:", list);
      // We are the new user, we don't initiate calls here, 
      // we wait for others to join or for the server to tell us who is there.
      // Actually, in a mesh network, the joiner usually initiates calls to existing members.
      list.forEach(u => {
        if (u.socketId !== socket.id) {
          initiateCall(u.socketId);
        }
      });
    };

    const handleUserConnected = ({ socketId, user: joinedUser }) => {
      console.log(`[SOCKET] User connected: ${socketId}`);
      // A new user joined, we'll wait for them to call us or we call them.
      // In this flow, let's have the joiner call everyone else.
      // So if we are already here, we just make sure we have their user info.
      setParticipants(prev => {
        if (prev.find(p => p.socketId === socketId)) return prev;
        return [...prev, { socketId, user: joinedUser, isMuted: false, isCameraOff: false }];
      });
    };

    const handleIncomingCall = async ({ offer, from, user: callerUser }) => {
      console.log(`[WEBRTC] Incoming call from ${from}`);
      const pc = createPeerConnection(from, false);
      
      try {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        setParticipants(prev => {
          const existing = prev.find(p => p.socketId === from);
          if (existing) return prev.map(p => p.socketId === from ? { ...p, user: callerUser } : p);
          return [...prev, { socketId: from, user: callerUser }];
        });

        console.log(`[WEBRTC] Sending answer to ${from}`);
        socket.emit("answer-call", { answer, to: from, roomId });
      } catch (err) {
        console.error(`[WEBRTC] Error handling incoming call from ${from}:`, err);
      }
    };

    const handleAnswerCall = async ({ answer, from }) => {
      console.log(`[WEBRTC] Received answer from ${from}`);
      const pc = pcsRef.current[from];
      if (pc) {
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
        } catch (err) {
          console.error(`[WEBRTC] Error setting remote description for ${from}:`, err);
        }
      }
    };

    const handleIceCandidate = async ({ candidate, from }) => {
      // console.log(`[WEBRTC] Received ICE candidate from ${from}`);
      const pc = pcsRef.current[from];
      if (pc) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (err) {
          console.error(`[WEBRTC] Error adding ICE candidate from ${from}:`, err);
        }
      }
    };

    const handleUserDisconnected = (socketId) => {
      console.log(`[SOCKET] User disconnected: ${socketId}`);
      cleanupPeer(socketId);
    };

    socket.on("participants-list", handleParticipantsList);
    socket.on("user-connected", handleUserConnected);
    socket.on("incoming-call", handleIncomingCall);
    socket.on("answer-call", handleAnswerCall);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("user-disconnected", handleUserDisconnected);

    return () => {
      socket.off("participants-list", handleParticipantsList);
      socket.off("user-connected", handleUserConnected);
      socket.off("incoming-call", handleIncomingCall);
      socket.off("answer-call", handleAnswerCall);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("user-disconnected", handleUserDisconnected);
    };
  }, [roomId, initiateCall, createPeerConnection, cleanupPeer]);

  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        console.log(`[WEBRTC] Mute toggled: ${!audioTrack.enabled}`);
        socket.emit('media_state_change', { 
          roomId, 
          type: 'audio', 
          enabled: audioTrack.enabled 
        });
        return !audioTrack.enabled;
      }
    }
    return false;
  }, [roomId]);

  const toggleCamera = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        console.log(`[WEBRTC] Camera toggled: ${!videoTrack.enabled}`);
        socket.emit('media_state_change', { 
          roomId, 
          type: 'video', 
          enabled: videoTrack.enabled 
        });
        return !videoTrack.enabled;
      }
    }
    return false;
  }, [roomId]);

  const shareScreen = useCallback(async () => {
    try {
      console.log("[WEBRTC] Starting screen share...");
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true });
      const screenTrack = screenStream.getVideoTracks()[0];
      
      // Replace the video track in all peer connections
      Object.values(pcsRef.current).forEach(pc => {
        const sender = pc.getSenders().find(s => s.track.kind === 'video');
        if (sender) {
          sender.replaceTrack(screenTrack);
        }
      });

      setIsScreenSharing(true);
      socket.emit('media_state_change', { roomId, type: 'screen', enabled: true });

      screenTrack.onended = () => {
        stopScreenShare();
      };

      return screenStream;
    } catch (err) {
      console.error('[WEBRTC] Error sharing screen:', err);
      return null;
    }
  }, [roomId]);

  const stopScreenShare = useCallback(() => {
    console.log("[WEBRTC] Stopping screen share...");
    if (!isScreenSharing) return;

    const cameraTrack = localStreamRef.current.getVideoTracks()[0];
    Object.values(pcsRef.current).forEach(pc => {
      const sender = pc.getSenders().find(s => s.track.kind === 'video');
      if (sender) {
        sender.replaceTrack(cameraTrack);
      }
    });

    setIsScreenSharing(false);
    socket.emit('media_state_change', { roomId, type: 'screen', enabled: false });
  }, [isScreenSharing, roomId]);

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
