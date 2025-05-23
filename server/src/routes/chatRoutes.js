const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

/**
 * @swagger
 * /api/chat-rooms/user/{userId}:
 *   get:
 *     summary: 사용자의 채팅방 목록 조회
 *     tags: [Chat Rooms]
 */
router.get('/user/:userId', chatController.getChatRoomsByUser);

/**
 * @swagger
 * /api/chat-rooms:
 *   post:
 *     summary: 새 채팅방 생성
 *     tags: [Chat Rooms]
 */
router.post('/', chatController.createChatRoom);

router.get('/:id', chatController.getChatRoomById);
router.put('/:id', chatController.updateChatRoomTitle);
router.delete('/:id', chatController.deleteChatRoom);

module.exports = router;