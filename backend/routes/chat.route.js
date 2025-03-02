const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');

/* GET home page. */

router.get('/online', ChatController.getOnlineUsers);

module.exports = router;
