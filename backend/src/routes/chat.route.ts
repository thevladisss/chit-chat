import express, { Router } from 'express';
import ChatController from '../controllers/chat.controller';
import AuthMiddleware from '../middleware/auth.middleware';

const router: Router = express.Router();

router.use(AuthMiddleware);

router.get('/', ChatController.getAllChats);
router.get('/search', ChatController.getFilteredChats);
router.get('/:chatId', ChatController.getChat);
router.post('/:chatId/messages', ChatController.sendMessage);

export default router;
