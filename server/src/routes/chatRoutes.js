const express = require('express');
const chatController = require('../controllers/chatController');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatRoom:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           description: 채팅방 고유 ID
 *         user_id:
 *           type: integer
 *           description: 채팅방 소유자 ID
 *         title:
 *           type: string
 *           description: 채팅방 제목
 *           example: "AI와의 대화"
 *         is_active:
 *           type: boolean
 *           description: 채팅방 활성화 상태
 *           default: true
 *         created_at:
 *           type: string
 *           format: date-time
 *           description: 채팅방 생성 일시
 *         updated_at:
 *           type: string
 *           format: date-time
 *           description: 채팅방 수정 일시
 *     ChatRoomCreate:
 *       type: object
 *       required:
 *         - userId
 *       properties:
 *         userId:
 *           type: integer
 *           description: 채팅방을 생성할 사용자 ID
 *           example: 1
 *         title:
 *           type: string
 *           description: 채팅방 제목
 *           example: "새로운 대화"
 *           default: "새로운 채팅"
 *     ChatRoomUpdate:
 *       type: object
 *       required:
 *         - title
 *       properties:
 *         title:
 *           type: string
 *           description: 새로운 채팅방 제목
 *           example: "학업 상담"
 */

/**
 * @swagger
 * /api/chat-rooms/user/{userId}:
 *   get:
 *     summary: 사용자의 채팅방 목록 조회
 *     description: 특정 사용자가 소유한 모든 활성 채팅방을 최근 업데이트 순으로 조회합니다.
 *     tags: [Chat Rooms]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         description: 조회할 사용자의 ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: 채팅방 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatRoom'
 *             examples:
 *               success:
 *                 summary: 성공적인 응답 예시
 *                 value:
 *                   - id: 1
 *                     user_id: 1
 *                     title: "AI와의 대화"
 *                     is_active: true
 *                     created_at: "2024-01-15T10:30:00Z"
 *                     updated_at: "2024-01-15T14:25:00Z"
 *                   - id: 2
 *                     user_id: 1
 *                     title: "학업 상담"
 *                     is_active: true
 *                     created_at: "2024-01-14T09:15:00Z"
 *                     updated_at: "2024-01-14T16:45:00Z"
 *       500:
 *         description: 서버 내부 오류
 */
router.get('/user/:userId', chatController.getChatRoomsByUser);

/**
 * @swagger
 * /api/chat-rooms:
 *   post:
 *     summary: 새 채팅방 생성
 *     description: 사용자를 위한 새로운 채팅방을 생성합니다.
 *     tags: [Chat Rooms]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRoomCreate'
 *           examples:
 *             default:
 *               summary: 기본 채팅방 생성
 *               value:
 *                 userId: 1
 *                 title: "새로운 채팅"
 *             custom:
 *               summary: 제목 지정 채팅방 생성
 *               value:
 *                 userId: 1
 *                 title: "프로그래밍 질문"
 *     responses:
 *       201:
 *         description: 채팅방 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 3
 *                 message:
 *                   type: string
 *                   example: "Chat room created successfully"
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 내부 오류
 */
router.post('/', chatController.createChatRoom);

/**
 * @swagger
 * /api/chat-rooms/{id}:
 *   get:
 *     summary: 특정 채팅방 조회
 *     description: ID로 특정 채팅방의 정보를 조회합니다.
 *     tags: [Chat Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 조회할 채팅방의 ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: 채팅방 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatRoom'
 *       404:
 *         description: 채팅방을 찾을 수 없음
 *       500:
 *         description: 서버 내부 오류
 */
router.get('/:id', chatController.getChatRoomById);

/**
 * @swagger
 * /api/chat-rooms/{id}:
 *   put:
 *     summary: 채팅방 제목 수정
 *     description: 기존 채팅방의 제목을 수정합니다.
 *     tags: [Chat Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 수정할 채팅방의 ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRoomUpdate'
 *           examples:
 *             update:
 *               summary: 제목 수정 예시
 *               value:
 *                 title: "수정된 채팅방 제목"
 *     responses:
 *       200:
 *         description: 채팅방 제목 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Chat room title updated successfully"
 *       404:
 *         description: 채팅방을 찾을 수 없음
 *       500:
 *         description: 서버 내부 오류
 */
router.put('/:id', chatController.updateChatRoomTitle);

/**
 * @swagger
 * /api/chat-rooms/{id}:
 *   delete:
 *     summary: 채팅방 삭제
 *     description: 채팅방을 비활성화합니다 (소프트 삭제).
 *     tags: [Chat Rooms]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 삭제할 채팅방의 ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: 채팅방 삭제 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Chat room deleted successfully"
 *       404:
 *         description: 채팅방을 찾을 수 없음
 *       500:
 *         description: 서버 내부 오류
 */
router.delete('/:id', chatController.deleteChatRoom);

module.exports = router;