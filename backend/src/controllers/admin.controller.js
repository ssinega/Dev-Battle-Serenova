const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllUsers = async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: parseInt(limit),
        select: { id: true, email: true, username: true, role: true, is_verified: true, created_at: true },
        orderBy: { created_at: 'desc' },
      }),
      prisma.user.count(),
    ]);
    res.json({ users, total });
  } catch (err) {
    next(err);
  }
};

const getPendingTherapists = async (req, res, next) => {
  try {
    const therapists = await prisma.therapist.findMany({
      where: { is_verified: false },
      include: { user: { select: { id: true, email: true, username: true } } },
    });
    res.json({ therapists });
  } catch (err) {
    next(err);
  }
};

const verifyTherapist = async (req, res, next) => {
  try {
    const therapist = await prisma.therapist.update({
      where: { id: req.params.id },
      data: { is_verified: true },
    });

    await prisma.notification.create({
      data: {
        user_id: therapist.user_id,
        title: 'Profile Verified',
        body: 'Congratulations! Your therapist profile has been verified.',
        type: 'system',
      },
    });

    res.json({ therapist });
  } catch (err) {
    next(err);
  }
};

const getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalTherapists, totalSessions, totalJournalEntries, totalMoodCheckins] = await Promise.all([
      prisma.user.count(),
      prisma.therapist.count({ where: { is_verified: true } }),
      prisma.session.count(),
      prisma.journalEntry.count(),
      prisma.moodCheckin.count(),
    ]);

    // Sessions by status
    const sessionsByStatus = await prisma.session.groupBy({
      by: ['status'],
      _count: { status: true },
    });

    // Registrations last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentUsers = await prisma.user.count({
      where: { created_at: { gte: sevenDaysAgo } },
    });

    res.json({
      totalUsers,
      totalTherapists,
      totalSessions,
      totalJournalEntries,
      totalMoodCheckins,
      recentUsers,
      sessionsByStatus,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getAllUsers, getPendingTherapists, verifyTherapist, getStats };
