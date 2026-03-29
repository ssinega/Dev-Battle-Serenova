const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { totp } = require('otplib');
const qrcode = require('qrcode');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  setRefreshCookie,
  clearRefreshCookie,
} = require('../utils/jwt');
const { sendOTPEmail, sendPasswordResetEmail } = require('../utils/email');

const prisma = new PrismaClient();

// In-memory OTP store (use Redis in production)
const otpStore = new Map();
const resetTokenStore = new Map();

const register = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(email, { otp, expires: Date.now() + 10 * 60 * 1000 });

    const user = await prisma.user.create({
      data: {
        email,
        password_hash,
        username: username || email.split('@')[0],
        role: 'PATIENT',
        is_verified: false,
      },
    });

    await sendOTPEmail(email, otp);

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id);
    await prisma.user.update({ where: { id: user.id }, data: { refresh_token: refreshToken } });
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        is_verified: user.is_verified,
        avatar_url: user.avatar_url,
      },
      accessToken,
      message: 'Registration successful. Check your email for verification code.',
    });
  } catch (err) {
    next(err);
  }
};

const registerAnonymous = async (req, res, next) => {
  try {
    const alias = `Anon_${crypto.randomBytes(4).toString('hex')}`;

    const user = await prisma.user.create({
      data: {
        username: alias,
        role: 'PATIENT',
        is_anonymous: true,
        is_verified: true,
      },
    });

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id);
    await prisma.user.update({ where: { id: user.id }, data: { refresh_token: refreshToken } });
    setRefreshCookie(res, refreshToken);

    res.status(201).json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        is_anonymous: true,
        is_verified: true,
      },
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password_hash) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const accessToken = signAccessToken(user.id, user.role);
    const refreshToken = signRefreshToken(user.id);
    await prisma.user.update({ where: { id: user.id }, data: { refresh_token: refreshToken } });
    setRefreshCookie(res, refreshToken);

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        is_verified: user.is_verified,
        avatar_url: user.avatar_url,
        two_fa_enabled: user.two_fa_enabled,
      },
      accessToken,
    });
  } catch (err) {
    next(err);
  }
};

const logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      try {
        const decoded = verifyRefreshToken(refreshToken);
        await prisma.user.update({
          where: { id: decoded.userId },
          data: { refresh_token: null },
        });
      } catch (_) {}
    }
    clearRefreshCookie(res);
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

const refresh = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token' });
    }

    const decoded = verifyRefreshToken(refreshToken);
    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });

    if (!user || user.refresh_token !== refreshToken) {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const newAccessToken = signAccessToken(user.id, user.role);
    const newRefreshToken = signRefreshToken(user.id);
    await prisma.user.update({ where: { id: user.id }, data: { refresh_token: newRefreshToken } });
    setRefreshCookie(res, newRefreshToken);

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    next(err);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const stored = otpStore.get(email);

    if (!stored || stored.otp !== otp || Date.now() > stored.expires) {
      return res.status(400).json({ error: 'Invalid or expired OTP' });
    }

    otpStore.delete(email);
    await prisma.user.update({ where: { email }, data: { is_verified: true } });

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    next(err);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    // Always respond with success to prevent email enumeration
    if (user) {
      const resetToken = crypto.randomBytes(32).toString('hex');
      resetTokenStore.set(resetToken, { userId: user.id, expires: Date.now() + 60 * 60 * 1000 });
      const resetLink = `${process.env.CLIENT_ORIGIN}/reset-password?token=${resetToken}`;
      await sendPasswordResetEmail(email, resetLink);
    }

    res.json({ message: 'If that email exists, a reset link has been sent.' });
  } catch (err) {
    next(err);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const stored = resetTokenStore.get(token);

    if (!stored || Date.now() > stored.expires) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const password_hash = await bcrypt.hash(password, 12);
    await prisma.user.update({
      where: { id: stored.userId },
      data: { password_hash, refresh_token: null },
    });

    resetTokenStore.delete(token);
    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};

const enable2FA = async (req, res, next) => {
  try {
    const secret = totp.generateSecret();
    const otpAuthUrl = totp.keyuri(req.user.email || req.user.username, 'Serenova', secret);
    const qrCode = await qrcode.toDataURL(otpAuthUrl);

    // Store secret temporarily (confirm with /2fa/verify)
    await prisma.user.update({
      where: { id: req.user.id },
      data: { two_fa_secret: secret },
    });

    res.json({ secret, qrCode });
  } catch (err) {
    next(err);
  }
};

const verify2FA = async (req, res, next) => {
  try {
    const { token } = req.body;
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user.two_fa_secret) {
      return res.status(400).json({ error: '2FA not set up' });
    }

    const isValid = totp.check(token, user.two_fa_secret);
    if (!isValid) {
      return res.status(400).json({ error: 'Invalid 2FA code' });
    }

    await prisma.user.update({
      where: { id: req.user.id },
      data: { two_fa_enabled: true },
    });

    res.json({ message: '2FA enabled successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  registerAnonymous,
  login,
  logout,
  refresh,
  verifyEmail,
  forgotPassword,
  resetPassword,
  enable2FA,
  verify2FA,
};
