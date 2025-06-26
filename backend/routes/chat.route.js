const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');
const AuthMiddleware = require('../middleware/auth.middleware');

router.use(AuthMiddleware);

router.get('/', ChatController.getAllChats);
router.get('/search', ChatController.getFilteredChats);
router.get('/:chatId', ChatController.getChat);
router.post('/initialize', ChatController.initializeChat);
router.post('/', ChatController.sendMessage);

module.exports = router;
