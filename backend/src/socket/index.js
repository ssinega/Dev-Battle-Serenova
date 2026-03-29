const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { encrypt, decrypt } = require('../utils/encryption');

const prisma = new PrismaClient();
let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });

  // Auth middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error('Authentication required'));

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, username: true, role: true, avatar_url: true },
      });

      if (!user) return next(new Error('User not found'));
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.user.username} (${socket.user.id})`);

    // Join a session room
    socket.on('session:join', async ({ sessionId }) => {
      try {
        const session = await prisma.session.findUnique({
          where: { id: sessionId },
          include: { therapist: true },
        });

        if (!session) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        const isParticipant =
          session.patient_id === socket.user.id ||
          session.therapist.user_id === socket.user.id;

        if (!isParticipant) {
          socket.emit('error', { message: 'Not authorized to join this session' });
          return;
        }

        socket.join(sessionId);
        console.log(`📍 ${socket.user.username} joined session ${sessionId}`);

        // Notify other participants
        socket.to(sessionId).emit('session:started', {
          userId: socket.user.id,
          username: socket.user.username,
          avatarUrl: socket.user.avatar_url,
          timestamp: new Date().toISOString(),
        });

        // Send message history
        const messages = await prisma.message.findMany({
          where: { session_id: sessionId },
          include: { sender: { select: { id: true, username: true, avatar_url: true } } },
          orderBy: { sent_at: 'asc' },
          take: 100,
        });

        const decryptedMessages = messages.map((msg) => ({
          ...msg,
          content: decrypt(msg.content_encrypted),
        }));

        socket.emit('messages:history', decryptedMessages);
      } catch (err) {
        console.error('session:join error:', err);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    // Send a message
    socket.on('message:send', async ({ sessionId, content, messageType = 'TEXT' }) => {
      try {
        const session = await prisma.session.findUnique({
          where: { id: sessionId },
          include: { therapist: true },
        });

        if (!session) return;

        const isParticipant =
          session.patient_id === socket.user.id ||
          session.therapist.user_id === socket.user.id;

        if (!isParticipant) return;

        const encryptedContent = encrypt(content);

        const message = await prisma.message.create({
          data: {
            session_id: sessionId,
            sender_id: socket.user.id,
            content_encrypted: encryptedContent,
            message_type: messageType,
          },
          include: {
            sender: { select: { id: true, username: true, avatar_url: true } },
          },
        });

        const messagePayload = {
          ...message,
          content: content, // Send decrypted to socket clients
        };

        // Emit to all in session room
        io.to(sessionId).emit('message:received', messagePayload);
      } catch (err) {
        console.error('message:send error:', err);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('user:typing', ({ sessionId, isTyping }) => {
      socket.to(sessionId).emit('user:typing', {
        userId: socket.user.id,
        username: socket.user.username,
        isTyping,
      });
    });

    // Leave session
    socket.on('session:leave', ({ sessionId }) => {
      socket.leave(sessionId);
      socket.to(sessionId).emit('session:ended', {
        userId: socket.user.id,
        username: socket.user.username,
        timestamp: new Date().toISOString(),
      });
      console.log(`🚪 ${socket.user.username} left session ${sessionId}`);
    });

    // Push notification to specific user
    socket.on('notification:send', async ({ targetUserId, notification }) => {
      const targetSocket = [...io.sockets.sockets.values()].find(
        (s) => s.user?.id === targetUserId
      );
      if (targetSocket) {
        targetSocket.emit('notification:new', notification);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.user.username}`);
    });
  });

  return io;
};

const getIO = () => io;

module.exports = { initSocket, getIO };
