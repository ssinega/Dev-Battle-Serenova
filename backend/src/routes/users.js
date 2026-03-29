const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const usersController = require('../controllers/users.controller');

const router = express.Router();

const updateMeSchema = z.object({
  body: z.object({
    username: z.string().optional(),
    email: z.string().email().optional(),
    avatar_url: z.string().url().optional(),
  }),
});

const toggleAnonymousSchema = z.object({
  body: z.object({
    enabled: z.boolean(),
  }),
});

const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
  }),
});

router.use(authenticate);

router.get('/me', usersController.getMe);
router.patch('/me', validate(updateMeSchema), usersController.updateMe);
router.delete('/me', usersController.deleteMe);
router.get('/me/export', usersController.exportData);
router.patch('/me/anonymous-mode', validate(toggleAnonymousSchema), usersController.toggleAnonymousMode);
router.post('/me/change-password', validate(changePasswordSchema), usersController.changePassword);

module.exports = router;
