const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const crisisController = require('../controllers/crisis.controller');

const router = express.Router();

const safetyPlanSchema = z.object({
  body: z.object({
    warning_signs: z.string().optional(),
    coping_strategies: z.string().optional(),
    support_contacts_json: z.any().optional(),
    professional_contacts_json: z.any().optional(),
  }),
});

router.use(authenticate);

router.get('/contacts', crisisController.getCrisisContacts);
router.get('/safety-plan', crisisController.getSafetyPlan);
router.post('/safety-plan', validate(safetyPlanSchema), crisisController.createSafetyPlan);
router.patch('/safety-plan', validate(safetyPlanSchema.deepPartial()), crisisController.updateSafetyPlan);

module.exports = router;
