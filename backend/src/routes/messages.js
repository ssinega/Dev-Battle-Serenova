const express = require('express');
const { authenticate } = require('../middleware/auth');
const messagesController = require('../controllers/messages.controller');

const router = express.Router();

router.use(authenticate);
router.get('/session/:sessionId', messagesController.getMessageHistory);

module.exports = router;
