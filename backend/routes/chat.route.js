const express = require('express');
const router = express.Router();
const ChatController = require('../controllers/chat.controller');

/* GET home page. */

router.get('/', ChatController.getOnlineUsers);

module.exports = router;
