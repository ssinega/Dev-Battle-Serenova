const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const getMe = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        is_anonymous: true,
        is_verified: true,
        two_fa_enabled: true,
        avatar_url: true,
        created_at: true,
      },
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

const updateMe = async (req, res, next) => {
  try {
    const { username, email, avatar_url } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { username, email, avatar_url },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        avatar_url: true,
        is_verified: true,
      },
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

const deleteMe = async (req, res, next) => {
  try {
    await prisma.user.delete({ where: { id: req.user.id } });
    res.json({ message: 'Account deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const exportData = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        journal_entries: true,
        mood_checkins: true,
        sessions: { include: { therapist: true } },
        safety_plans: true,
      },
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const { password_hash, refresh_token, two_fa_secret, ...safeUser } = user;

    res.setHeader('Content-Disposition', 'attachment; filename="serenova-data.json"');
    res.setHeader('Content-Type', 'application/json');
    res.json({ exportedAt: new Date().toISOString(), data: safeUser });
  } catch (err) {
    next(err);
  }
};

const toggleAnonymousMode = async (req, res, next) => {
  try {
    const { enabled } = req.body;
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { is_anonymous: enabled },
      select: { id: true, is_anonymous: true },
    });
    res.json({ user });
  } catch (err) {
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user.password_hash) {
      return res.status(400).json({ error: 'No password set (anonymous account)' });
    }

    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) return res.status(400).json({ error: 'Current password is incorrect' });

    const password_hash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.id }, data: { password_hash } });
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMe, updateMe, deleteMe, exportData, toggleAnonymousMode, changePassword };
