const express = require('express');
const { authenticate, requireRole } = require('../middleware/auth');
const adminController = require('../controllers/admin.controller');

const router = express.Router();

// All routes here require ADMIN role
router.use(authenticate, requireRole('ADMIN'));

router.get('/users', adminController.getAllUsers);
router.get('/therapists/pending', adminController.getPendingTherapists);
router.patch('/therapists/:id/verify', adminController.verifyTherapist);
router.get('/stats', adminController.getStats);

module.exports = router;
