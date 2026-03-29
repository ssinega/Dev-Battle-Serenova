const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const moodController = require('../controllers/mood.controller');

const router = express.Router();

const checkinSchema = z.object({
  body: z.object({
    mood_score: z.number().int().min(1).max(5),
    note: z.string().optional(),
  }),
});

router.use(authenticate);

router.post('/checkin', validate(checkinSchema), moodController.checkin);
router.get('/history', moodController.getHistory);
router.get('/streak', moodController.getStreak);

module.exports = router;
