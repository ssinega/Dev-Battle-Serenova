const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const bookSession = async (req, res, next) => {
  try {
    const { therapist_id, scheduled_at, duration_minutes, type } = req.body;

    const therapist = await prisma.therapist.findUnique({ where: { id: therapist_id } });
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });

    const session = await prisma.session.create({
      data: {
        patient_id: req.user.id,
        therapist_id,
        scheduled_at: new Date(scheduled_at),
        duration_minutes: parseInt(duration_minutes) || 60,
        type,
        status: 'PENDING',
      },
      include: {
        therapist: { include: { user: { select: { username: true, avatar_url: true } } } },
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        user_id: req.user.id,
        title: 'Session Booked',
        body: `Your session with ${therapist.full_name} is booked for ${new Date(scheduled_at).toLocaleDateString()}.`,
        type: 'session',
      },
    });

    res.status(201).json({ session });
  } catch (err) {
    next(err);
  }
};

const getMySessions = async (req, res, next) => {
  try {
    const { status } = req.query;
    const where = {};

    if (req.user.role === 'THERAPIST') {
      const therapist = await prisma.therapist.findUnique({ where: { user_id: req.user.id } });
      if (therapist) where.therapist_id = therapist.id;
    } else {
      where.patient_id = req.user.id;
    }

    if (status) where.status = status;

    const sessions = await prisma.session.findMany({
      where,
      include: {
        therapist: {
          include: { user: { select: { username: true, avatar_url: true } } },
        },
        patient: { select: { id: true, username: true, avatar_url: true } },
      },
      orderBy: { scheduled_at: 'desc' },
    });

    res.json({ sessions });
  } catch (err) {
    next(err);
  }
};

const getSession = async (req, res, next) => {
  try {
    const session = await prisma.session.findUnique({
      where: { id: req.params.id },
      include: {
        therapist: { include: { user: { select: { id: true, username: true, avatar_url: true } } } },
        patient: { select: { id: true, username: true, avatar_url: true } },
      },
    });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const isParticipant =
      session.patient_id === req.user.id ||
      session.therapist.user_id === req.user.id;

    if (!isParticipant && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    res.json({ session });
  } catch (err) {
    next(err);
  }
};

const cancelSession = async (req, res, next) => {
  try {
    const session = await prisma.session.findUnique({ where: { id: req.params.id } });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    const updated = await prisma.session.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });
    res.json({ session: updated });
  } catch (err) {
    next(err);
  }
};

const completeSession = async (req, res, next) => {
  try {
    const { notes } = req.body;
    const updated = await prisma.session.update({
      where: { id: req.params.id },
      data: { status: 'COMPLETED', notes_encrypted: notes },
    });
    res.json({ session: updated });
  } catch (err) {
    next(err);
  }
};

const reviewSession = async (req, res, next) => {
  try {
    const { rating, review } = req.body;
    const session = await prisma.session.findUnique({ where: { id: req.params.id } });
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.patient_id !== req.user.id) return res.status(403).json({ error: 'Forbidden' });

    await prisma.session.update({
      where: { id: req.params.id },
      data: { rating: parseInt(rating), review },
    });

    // Update therapist average rating
    const sessions = await prisma.session.findMany({
      where: { therapist_id: session.therapist_id, rating: { not: null } },
      select: { rating: true },
    });
    const avg = sessions.reduce((sum, s) => sum + s.rating, 0) / sessions.length;
    await prisma.therapist.update({
      where: { id: session.therapist_id },
      data: { rating: parseFloat(avg.toFixed(1)), total_reviews: sessions.length },
    });

    res.json({ message: 'Review submitted' });
  } catch (err) {
    next(err);
  }
};

module.exports = { bookSession, getMySessions, getSession, cancelSession, completeSession, reviewSession };
