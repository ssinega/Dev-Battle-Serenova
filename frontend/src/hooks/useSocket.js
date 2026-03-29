import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    if (!token) {
      if (socketRef.current) socketRef.current.disconnect();
      return;
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000', {
      auth: { token },
      withCredentials: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => setIsConnected(true));
    socket.on('disconnect', () => setIsConnected(false));
    socket.on('connect_error', (err) => console.error('Socket connect err:', err));
    
    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [token]);

  const joinSession = useCallback((sessionId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('session:join', { sessionId });
    }
  }, []);

  const leaveSession = useCallback((sessionId) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('session:leave', { sessionId });
    }
  }, []);

  const sendMessage = useCallback((sessionId, content, messageType = 'TEXT') => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('message:send', { sessionId, content, messageType });
    }
  }, []);

  const setTyping = useCallback((sessionId, isTyping) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit('user:typing', { sessionId, isTyping });
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected,
    joinSession,
    leaveSession,
    sendMessage,
    setTyping,
  };
};
