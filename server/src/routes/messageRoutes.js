const express = require('express');
const messageController = require('../controllers/messageController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 메시지 고유 ID
 *         chat_room_id:
 *           type: integer
 *           description: 소속 채팅방 ID
 *         role:
 *           type: string
 *           enum: [user, bot]
 *           description: 메시지 발신자 (사용자 또는 봇)
 *           example: "user"
 *         content:
 *           type: string
 *           description: 메시지 내용
 *           example: "안녕하세요! 학교 생활에 대해 궁금한 점이 있어요."
 *         message_order:
 *           type: integer
 *           description: 채팅방 내 메시지 순서
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 메시지 생성 일시
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 메시지 수정 일시
 *     MessageSend:
 *       type: object
 *       required:
 *         - chat_room_id
 *         - content
 *       properties:
 *         chat_room_id:
 *           type: integer
 *           description: 메시지를 보낼 채팅방 ID
 *           example: 1
 *         content:
 *           type: string
 *           description: 전송할 메시지 내용
 *           example: "서울과학기술대학교에 대해 알려주세요."
 *           minLength: 1
 *           maxLength: 2000
 *     MessageResponse:
 *       type: object
 *       properties:
 *         userMessage:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 1
 *             role:
 *               type: string
 *               example: "user"
 *             content:
 *               type: string
 *               example: "서울과학기술대학교에 대해 알려주세요."
 *         botMessage:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *               example: 2
 *             role:
 *               type: string
 *               example: "bot"
 *             content:
 *               type: string
 *               example: "서울과학기술대학교는 1910년에 설립된 국립대학교입니다..."
 */

/**
 * @swagger
 * /api/messages/help:
 *   get:
 *     summary: 챗봇 도움말 조회
 *     description: 챗봇이 답변할 수 있는 주제와 카테고리 목록을 조회합니다.
 *     tags: [Messages]
 *     responses:
 *       200:
 *         description: 도움말 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: 도움말 메시지
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *       500:
 *         description: 서버 내부 오류
 */
router.get('/help', messageController.getHelp);

/**
 * @swagger
 * /api/messages/chat-room/{chatRoomId}:
 *   get:
 *     summary: 채팅방의 메시지 목록 조회
 *     description: 특정 채팅방의 모든 메시지를 순서대로 조회합니다.
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: chatRoomId
 *         required: true
 *         description: 조회할 채팅방의 ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         description: 한 번에 가져올 메시지 수 (기본값: 100)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 500
 *           default: 100
 *           example: 50
 *       - in: query
 *         name: offset
 *         required: false
 *         description: 건너뛸 메시지 수 (기본값: 0)
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *           example: 0
 *     responses:
 *       200:
 *         description: 메시지 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 *       404:
 *         description: 채팅방을 찾을 수 없음
 *       500:
 *         description: 서버 내부 오류
 */
router.get('/chat-room/:chatRoomId', messageController.getMessages);

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: 새 메시지 전송 (AI 응답 포함)
 *     description: 사용자 메시지를 전송하고 AI 봇의 자동 응답을 받습니다.
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MessageSend'
 *     responses:
 *       201:
 *         description: 메시지 전송 및 AI 응답 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 채팅방을 찾을 수 없음
 *       500:
 *         description: 서버 내부 오류
 */
router.post('/', messageController.sendMessage);

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: 메시지 삭제
 *     description: 특정 메시지를 데이터베이스에서 완전히 삭제합니다.
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 삭제할 메시지의 ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 5
 *     responses:
 *       200:
 *         description: 메시지 삭제 성공
 *       404:
 *         description: 메시지를 찾을 수 없음
 *       500:
 *         description: 서버 내부 오류
 */
router.delete('/:id', messageController.deleteMessage);

module.exports = router;