const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { authenticate, requireRole } = require('../middleware/auth');
const therapistsController = require('../controllers/therapists.controller');

const router = express.Router();

const createTherapistSchema = z.object({
  body: z.object({
    full_name: z.string().min(2),
    bio: z.string().optional(),
    specializations: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    session_types: z.array(z.enum(['VIDEO', 'VOICE', 'CHAT'])).optional(),
    hourly_rate: z.number().min(0).optional(),
    availability_json: z.any().optional(),
  }),
});

// Public routes (or authenticated but any role)
router.use(authenticate);
router.get('/', therapistsController.listTherapists);
router.get('/:id', therapistsController.getTherapist);
router.get('/:id/availability', therapistsController.getAvailability);

// Therapist-only routes
router.post('/', requireRole('THERAPIST'), validate(createTherapistSchema), therapistsController.createTherapistProfile);
router.patch('/:id', requireRole('THERAPIST', 'ADMIN'), therapistsController.updateTherapist);

module.exports = router;
