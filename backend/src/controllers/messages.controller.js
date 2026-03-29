const { PrismaClient } = require('@prisma/client');
const { decrypt } = require('../utils/encryption');
const prisma = new PrismaClient();

const getMessageHistory = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { therapist: true },
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const isParticipant =
      session.patient_id === req.user.id ||
      session.therapist.user_id === req.user.id;
    if (!isParticipant && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const messages = await prisma.message.findMany({
      where: { session_id: sessionId },
      include: { sender: { select: { id: true, username: true, avatar_url: true } } },
      orderBy: { sent_at: 'asc' },
      skip,
      take: parseInt(limit),
    });

    const decryptedMessages = messages.map((msg) => ({
      ...msg,
      content: decrypt(msg.content_encrypted),
    }));

    res.json({ messages: decryptedMessages });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMessageHistory };
