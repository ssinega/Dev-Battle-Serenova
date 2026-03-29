const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const sessionsController = require('../controllers/sessions.controller');

const router = express.Router();

const bookSessionSchema = z.object({
  body: z.object({
    therapist_id: z.string().min(1),
    scheduled_at: z.string().datetime(),
    duration_minutes: z.number().min(15).optional(),
    type: z.enum(['VIDEO', 'VOICE', 'CHAT']),
  }),
});

const reviewSessionSchema = z.object({
  body: z.object({
    rating: z.number().min(1).max(5),
    review: z.string().optional(),
  }),
});

router.use(authenticate);

router.post('/', validate(bookSessionSchema), sessionsController.bookSession);
router.get('/my', sessionsController.getMySessions);
router.get('/:id', sessionsController.getSession);
router.patch('/:id/cancel', sessionsController.cancelSession);
router.patch('/:id/complete', sessionsController.completeSession);
router.post('/:id/review', validate(reviewSessionSchema), sessionsController.reviewSession);

module.exports = router;
