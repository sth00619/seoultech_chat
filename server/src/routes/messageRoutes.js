const express = require('express');
const messageController = require('../controllers/messageController');

const router = express.Router();

/**
 * @swagger
 * /api/messages/chat-room/{chatRoomId}:
 *   get:
 *     summary: 채팅방의 메시지 목록 조회
 *     tags: [Messages]
 */
router.get('/chat-room/:chatRoomId', messageController.getMessages);

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: 새 메시지 전송
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               chat_room_id:
 *                 type: integer
 *               content:
 *                 type: string
 */
router.post('/', messageController.sendMessage);

router.delete('/:id', messageController.deleteMessage);

module.exports = router;