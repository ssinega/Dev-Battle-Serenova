const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const parseDbPlan = (p) => {
  if (!p) return p;
  try { p.support_contacts_json = p.support_contacts_json ? JSON.parse(p.support_contacts_json) : null; } catch (e) { p.support_contacts_json = null; }
  try { p.professional_contacts_json = p.professional_contacts_json ? JSON.parse(p.professional_contacts_json) : null; } catch (e) { p.professional_contacts_json = null; }
  return p;
};

const getCrisisContacts = async (req, res, next) => {
  try {
    const contacts = await prisma.crisisContact.findMany({ orderBy: { country: 'asc' } });
    res.json({ contacts });
  } catch (err) {
    next(err);
  }
};

const getSafetyPlan = async (req, res, next) => {
  try {
    const plan = await prisma.safetyPlan.findFirst({ where: { user_id: req.user.id } });
    res.json({ plan: parseDbPlan(plan) });
  } catch (err) {
    next(err);
  }
};

const createSafetyPlan = async (req, res, next) => {
  try {
    const { warning_signs, coping_strategies, support_contacts_json, professional_contacts_json } = req.body;

    const existing = await prisma.safetyPlan.findFirst({ where: { user_id: req.user.id } });
    if (existing) {
      return res.status(409).json({ error: 'Safety plan already exists. Use PATCH to update.' });
    }

    const plan = await prisma.safetyPlan.create({
      data: {
        user_id: req.user.id,
        warning_signs,
        coping_strategies,
        support_contacts_json: support_contacts_json ? JSON.stringify(support_contacts_json) : null,
        professional_contacts_json: professional_contacts_json ? JSON.stringify(professional_contacts_json) : null,
      },
    });
    res.status(201).json({ plan: parseDbPlan(plan) });
  } catch (err) {
    next(err);
  }
};

const updateSafetyPlan = async (req, res, next) => {
  try {
    const plan = await prisma.safetyPlan.findFirst({ where: { user_id: req.user.id } });
    if (!plan) return res.status(404).json({ error: 'No safety plan found. Use POST to create.' });

    const payload = { ...req.body };
    if (payload.support_contacts_json !== undefined) payload.support_contacts_json = payload.support_contacts_json ? JSON.stringify(payload.support_contacts_json) : null;
    if (payload.professional_contacts_json !== undefined) payload.professional_contacts_json = payload.professional_contacts_json ? JSON.stringify(payload.professional_contacts_json) : null;

    const updated = await prisma.safetyPlan.update({
      where: { id: plan.id },
      data: payload,
    });
    res.json({ plan: parseDbPlan(updated) });
  } catch (err) {
    next(err);
  }
};

module.exports = { getCrisisContacts, getSafetyPlan, createSafetyPlan, updateSafetyPlan };
