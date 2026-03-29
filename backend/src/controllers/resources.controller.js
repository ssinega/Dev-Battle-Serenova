const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const listResources = async (req, res, next) => {
  try {
    const { category, type, page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const where = {};
    if (category) where.category = category;
    if (type) where.type = type;

    const [resources, total] = await Promise.all([
      prisma.resource.findMany({
        where,
        orderBy: { created_at: 'desc' },
        skip,
        take: parseInt(limit),
      }),
      prisma.resource.count({ where }),
    ]);

    res.json({ resources, total, page: parseInt(page), totalPages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    next(err);
  }
};

const getResource = async (req, res, next) => {
  try {
    const resource = await prisma.resource.findUnique({ where: { id: req.params.id } });
    if (!resource) return res.status(404).json({ error: 'Resource not found' });
    res.json({ resource });
  } catch (err) {
    next(err);
  }
};

const createResource = async (req, res, next) => {
  try {
    const { title, description, category, type, url, thumbnail_url } = req.body;
    const resource = await prisma.resource.create({
      data: { title, description, category, type, url, thumbnail_url },
    });
    res.status(201).json({ resource });
  } catch (err) {
    next(err);
  }
};

module.exports = { listResources, getResource, createResource };
