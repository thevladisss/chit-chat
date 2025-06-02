const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

router.use(AuthMiddleware);

router.get('/', ChatController.getOnlineUsers);
router.get('/:chatId', ChatController.getChat);
router.post('/initialize', ChatController.initializeChat);

module.exports = router;
