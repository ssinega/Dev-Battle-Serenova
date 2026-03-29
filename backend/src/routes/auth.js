const express = require('express');
const { z } = require('zod');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimit');
const { authenticate } = require('../middleware/auth');
const authController = require('../controllers/auth.controller');

const router = express.Router();

const registerSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(8),
    username: z.string().optional(),
  }),
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1),
  }),
});

const verifyEmailSchema = z.object({
  body: z.object({
    email: z.string().email(),
    otp: z.string().length(6),
  }),
});

const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8),
  }),
});

const verify2FASchema = z.object({
  body: z.object({
    token: z.string().length(6),
  }),
});

router.post('/register', validate(registerSchema), authLimiter, authController.register);
router.post('/register/anonymous', authLimiter, authController.registerAnonymous);
router.post('/login', validate(loginSchema), authLimiter, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh', authController.refresh);
router.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), authLimiter, authController.resetPassword);

// Protected routes
router.use(authenticate);
router.post('/2fa/enable', authController.enable2FA);
router.post('/2fa/verify', validate(verify2FASchema), authController.verify2FA);

module.exports = router;
