const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const journalController = require('../controllers/journal.controller');

const router = express.Router();

const journalEntrySchema = z.object({
  body: z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    mood_tag: z.enum(['HAPPY', 'CALM', 'ANXIOUS', 'SAD', 'ANGRY']).optional(),
  }),
});

router.use(authenticate);

router.post('/', validate(journalEntrySchema), journalController.createEntry);
router.get('/', journalController.listEntries);
router.get('/mood-heatmap', journalController.getMoodHeatmap);
router.get('/:id', journalController.getEntry);
router.patch('/:id', validate(journalEntrySchema.deepPartial()), journalController.updateEntry);
router.delete('/:id', journalController.deleteEntry);

module.exports = router;
