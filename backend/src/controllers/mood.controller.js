const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const checkin = async (req, res, next) => {
  try {
    const { mood_score, note } = req.body;
    if (mood_score < 1 || mood_score > 5) {
      return res.status(400).json({ error: 'mood_score must be between 1 and 5' });
    }

    // Check if already checked in today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const existing = await prisma.moodCheckin.findFirst({
      where: {
        user_id: req.user.id,
        checked_in_at: { gte: today, lt: tomorrow },
      },
    });

    let checkin;
    if (existing) {
      checkin = await prisma.moodCheckin.update({
        where: { id: existing.id },
        data: { mood_score: parseInt(mood_score), note },
      });
    } else {
      checkin = await prisma.moodCheckin.create({
        data: {
          user_id: req.user.id,
          mood_score: parseInt(mood_score),
          note,
        },
      });
    }

    res.json({ checkin });
  } catch (err) {
    next(err);
  }
};

const getHistory = async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const checkins = await prisma.moodCheckin.findMany({
      where: {
        user_id: req.user.id,
        checked_in_at: { gte: thirtyDaysAgo },
      },
      orderBy: { checked_in_at: 'asc' },
    });

    res.json({ checkins });
  } catch (err) {
    next(err);
  }
};

const getStreak = async (req, res, next) => {
  try {
    const checkins = await prisma.moodCheckin.findMany({
      where: { user_id: req.user.id },
      orderBy: { checked_in_at: 'desc' },
      select: { checked_in_at: true },
    });

    if (!checkins.length) return res.json({ streak: 0 });

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < checkins.length; i++) {
      const checkinDay = new Date(checkins[i].checked_in_at);
      checkinDay.setHours(0, 0, 0, 0);

      const expectedDay = new Date(today);
      expectedDay.setDate(today.getDate() - i);

      if (checkinDay.getTime() === expectedDay.getTime()) {
        streak++;
      } else {
        break;
      }
    }

    res.json({ streak });
  } catch (err) {
    next(err);
  }
};

module.exports = { checkin, getHistory, getStreak };
