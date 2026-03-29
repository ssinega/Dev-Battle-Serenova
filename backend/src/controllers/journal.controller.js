const { PrismaClient } = require('@prisma/client');
const { encrypt, decrypt } = require('../utils/encryption');
const prisma = new PrismaClient();

const createEntry = async (req, res, next) => {
  try {
    const { title, content, mood_tag } = req.body;
    const entry = await prisma.journalEntry.create({
      data: {
        user_id: req.user.id,
        title,
        content_encrypted: encrypt(content),
        mood_tag: mood_tag || null,
      },
    });
    res.status(201).json({ entry: { ...entry, content } });
  } catch (err) {
    next(err);
  }
};

const listEntries = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [entries, total] = await Promise.all([
      prisma.journalEntry.findMany({
        where: { user_id: req.user.id },
        orderBy: { created_at: 'desc' },
        skip,
        take: parseInt(limit),
        select: {
          id: true,
          title: true,
          mood_tag: true,
          created_at: true,
          updated_at: true,
          content_encrypted: true,
        },
      }),
      prisma.journalEntry.count({ where: { user_id: req.user.id } }),
    ]);

    const decrypted = entries.map((e) => ({
      ...e,
      preview: decrypt(e.content_encrypted)?.substring(0, 120) + '...',
      content_encrypted: undefined,
    }));

    res.json({ entries: decrypted, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
};

const getEntry = async (req, res, next) => {
  try {
    const entry = await prisma.journalEntry.findFirst({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!entry) return res.status(404).json({ error: 'Entry not found' });
    res.json({ entry: { ...entry, content: decrypt(entry.content_encrypted) } });
  } catch (err) {
    next(err);
  }
};

const updateEntry = async (req, res, next) => {
  try {
    const { title, content, mood_tag } = req.body;
    const existing = await prisma.journalEntry.findFirst({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: 'Entry not found' });

    const entry = await prisma.journalEntry.update({
      where: { id: req.params.id },
      data: {
        title: title || existing.title,
        content_encrypted: content ? encrypt(content) : existing.content_encrypted,
        mood_tag: mood_tag !== undefined ? mood_tag : existing.mood_tag,
      },
    });
    res.json({ entry: { ...entry, content: content || decrypt(existing.content_encrypted) } });
  } catch (err) {
    next(err);
  }
};

const deleteEntry = async (req, res, next) => {
  try {
    const existing = await prisma.journalEntry.findFirst({
      where: { id: req.params.id, user_id: req.user.id },
    });
    if (!existing) return res.status(404).json({ error: 'Entry not found' });
    await prisma.journalEntry.delete({ where: { id: req.params.id } });
    res.json({ message: 'Entry deleted' });
  } catch (err) {
    next(err);
  }
};

const getMoodHeatmap = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const now = new Date();
    const targetYear = parseInt(year) || now.getFullYear();
    const targetMonth = parseInt(month) || now.getMonth() + 1;

    const start = new Date(targetYear, targetMonth - 1, 1);
    const end = new Date(targetYear, targetMonth, 0, 23, 59, 59);

    const entries = await prisma.journalEntry.findMany({
      where: {
        user_id: req.user.id,
        created_at: { gte: start, lte: end },
      },
      select: { created_at: true, mood_tag: true },
    });

    const heatmap = {};
    entries.forEach((e) => {
      const day = e.created_at.getDate();
      heatmap[day] = e.mood_tag;
    });

    res.json({ heatmap, year: targetYear, month: targetMonth });
  } catch (err) {
    next(err);
  }
};

module.exports = { createEntry, listEntries, getEntry, updateEntry, deleteEntry, getMoodHeatmap };
