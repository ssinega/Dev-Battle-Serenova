const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const parseDbTherapist = (t) => {
  if (!t) return t;
  try { t.specializations = JSON.parse(t.specializations || '[]'); } catch (e) { t.specializations = []; }
  try { t.languages = JSON.parse(t.languages || '[]'); } catch (e) { t.languages = []; }
  try { t.session_types = JSON.parse(t.session_types || '[]'); } catch (e) { t.session_types = []; }
  try { t.availability_json = t.availability_json ? JSON.parse(t.availability_json) : {}; } catch (e) { t.availability_json = {}; }
  return t;
};

const listTherapists = async (req, res, next) => {
  try {
    const { specialty, language, type, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where = { is_verified: true };
    if (specialty) where.specializations = { contains: specialty };
    if (language) where.languages = { contains: language };
    if (type) where.session_types = { contains: type };

    const [therapists, total] = await Promise.all([
      prisma.therapist.findMany({
        where,
        include: { user: { select: { id: true, username: true, avatar_url: true, email: true } } },
        orderBy: { rating: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.therapist.count({ where }),
    ]);

    res.json({ therapists: therapists.map(parseDbTherapist), total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
};

const getTherapist = async (req, res, next) => {
  try {
    const therapist = await prisma.therapist.findUnique({
      where: { id: req.params.id },
      include: { user: { select: { id: true, username: true, avatar_url: true } } },
    });
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });
    res.json({ therapist: parseDbTherapist(therapist) });
  } catch (err) {
    next(err);
  }
};

const getAvailability = async (req, res, next) => {
  try {
    const therapist = await prisma.therapist.findUnique({
      where: { id: req.params.id },
      select: { availability_json: true },
    });
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });
    
    let availability = {};
    try { availability = therapist.availability_json ? JSON.parse(therapist.availability_json) : {}; } catch(e){}

    res.json({ availability });
  } catch (err) {
    next(err);
  }
};

const createTherapistProfile = async (req, res, next) => {
  try {
    const { full_name, bio, specializations, languages, session_types, hourly_rate, availability_json } = req.body;
    const existing = await prisma.therapist.findUnique({ where: { user_id: req.user.id } });
    if (existing) return res.status(409).json({ error: 'Therapist profile already exists' });

    const therapist = await prisma.therapist.create({
      data: {
        user_id: req.user.id,
        full_name,
        bio,
        specializations: JSON.stringify(specializations || []),
        languages: JSON.stringify(languages || []),
        session_types: JSON.stringify(session_types || []),
        hourly_rate: parseFloat(hourly_rate) || 0,
        availability_json: JSON.stringify(availability_json || {}),
      },
    });
    res.status(201).json({ therapist: parseDbTherapist(therapist) });
  } catch (err) {
    next(err);
  }
};

const updateTherapist = async (req, res, next) => {
  try {
    const therapist = await prisma.therapist.findUnique({ where: { id: req.params.id } });
    if (!therapist) return res.status(404).json({ error: 'Therapist not found' });
    if (therapist.user_id !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Forbidden' });
    }

    const payload = { ...req.body };
    if (payload.specializations) payload.specializations = JSON.stringify(payload.specializations);
    if (payload.languages) payload.languages = JSON.stringify(payload.languages);
    if (payload.session_types) payload.session_types = JSON.stringify(payload.session_types);
    if (payload.availability_json) payload.availability_json = JSON.stringify(payload.availability_json);

    const updated = await prisma.therapist.update({
      where: { id: req.params.id },
      data: payload,
    });
    res.json({ therapist: parseDbTherapist(updated) });
  } catch (err) {
    next(err);
  }
};

module.exports = { listTherapists, getTherapist, getAvailability, createTherapistProfile, updateTherapist };
