const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');
const resourcesController = require('../controllers/resources.controller');

const router = express.Router();

const resourceSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    description: z.string().min(1),
    category: z.enum(['ANXIETY', 'DEPRESSION', 'STRESS', 'SLEEP', 'TRAUMA', 'RELATIONSHIPS']),
    type: z.enum(['ARTICLE', 'VIDEO', 'AUDIO', 'WORKSHEET']),
    url: z.string().url(),
    thumbnail_url: z.string().url().optional(),
  }),
});

router.use(authenticate);

router.get('/', resourcesController.listResources);
router.get('/:id', resourcesController.getResource);

// Admin only
router.post('/', requireRole('ADMIN'), validate(resourceSchema), resourcesController.createResource);

module.exports = router;
