const express = require('express');
const messageController = require('../controllers/messageController');

const router = express.Router();

// 환영 메시지 생성 라우트 (먼저 배치)
router.post('/welcome', messageController.createWelcomeMessage);

// 기존 메시지 라우트들
router.get('/chat-room/:chatRoomId', messageController.getMessages);
router.post('/', messageController.sendMessage);
router.delete('/:id', messageController.deleteMessage);

// 챗봇 테스트 라우트 (개발용)
router.post('/test-chatbot', messageController.testChatbot);

// 지식베이스 관리 라우트들 (관리자용)
router.get('/knowledge', messageController.getKnowledgeBase);
router.post('/knowledge', messageController.addKnowledge);
router.put('/knowledge/:id', messageController.updateKnowledge);

// 채팅 분석 라우트 (관리자용)
router.get('/analytics', messageController.getChatAnalytics);

/**
 * @swagger
 * /api/messages/test-chatbot:
 *   post:
 *     summary: 챗봇 응답 테스트
 *     description: 메시지를 보내고 챗봇 응답을 테스트합니다 (개발용)
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 example: "서울과기대에 대해 알려주세요"
 *     responses:
 *       200:
 *         description: 챗봇 응답 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 userMessage:
 *                   type: string
 *                 botResponse:
 *                   type: string
 *                 matchedKnowledge:
 *                   type: object
 *                 responseTime:
 *                   type: string
 */

/**
 * @swagger
 * /api/messages/knowledge:
 *   get:
 *     summary: 지식베이스 조회
 *     description: 챗봇의 지식베이스를 조회합니다
 *     tags: [Knowledge Base]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: integer
 *         description: 카테고리 ID로 필터링
 *     responses:
 *       200:
 *         description: 지식베이스 조회 성공
 *   post:
 *     summary: 새 지식베이스 추가
 *     description: 챗봇에 새로운 지식을 추가합니다
 *     tags: [Knowledge Base]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - category_id
 *               - keywords
 *               - question
 *               - answer
 *             properties:
 *               category_id:
 *                 type: integer
 *               keywords:
 *                 type: string
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               priority:
 *                 type: integer
 *     responses:
 *       201:
 *         description: 지식베이스 추가 성공
 */

/**
 * @swagger
 * /api/messages/analytics:
 *   get:
 *     summary: 채팅 분석 데이터 조회
 *     description: 챗봇 사용 통계 및 분석 데이터를 조회합니다
 *     tags: [Analytics]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 100
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           default: 0
 *     responses:
 *       200:
 *         description: 분석 데이터 조회 성공
 */

module.exports = router;