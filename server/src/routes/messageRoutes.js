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
 * /api/messages/chat-room/{chatRoomId}:
 *   get:
 *     summary: 채팅방의 메시지 목록 조회
 *     description: 특정 채팅방의 모든 메시지를 순서대로 조회합니다. 페이지네이션을 지원합니다.
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
 *             examples:
 *               conversation:
 *                 summary: 일반적인 대화 예시
 *                 value:
 *                   - id: 1
 *                     chat_room_id: 1
 *                     role: "user"
 *                     content: "안녕하세요!"
 *                     message_order: 1
 *                     created_at: "2024-01-15T10:30:00Z"
 *                     updated_at: "2024-01-15T10:30:00Z"
 *                   - id: 2
 *                     chat_room_id: 1
 *                     role: "bot"
 *                     content: "안녕하세요! 서울과학기술대학교 AI 어시스턴트입니다. 무엇을 도와드릴까요?"
 *                     message_order: 2
 *                     created_at: "2024-01-15T10:30:05Z"
 *                     updated_at: "2024-01-15T10:30:05Z"
 *               empty:
 *                 summary: 빈 채팅방 예시
 *                 value: []
 *       404:
 *         description: 채팅방을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Chat room not found"
 *       500:
 *         description: 서버 내부 오류
 */
router.get('/chat-room/:chatRoomId', messageController.getMessages);

/**
 * @swagger
 * /api/messages:
 *   post:
 *     summary: 새 메시지 전송 (AI 응답 포함)
 *     description: 사용자 메시지를 전송하고 AI 봇의 자동 응답을 받습니다. 두 메시지 모두 데이터베이스에 저장됩니다.
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MessageSend'
 *           examples:
 *             greeting:
 *               summary: 인사 메시지
 *               value:
 *                 chat_room_id: 1
 *                 content: "안녕하세요! 처음 인사 드립니다."
 *             question:
 *               summary: 질문 메시지
 *               value:
 *                 chat_room_id: 1
 *                 content: "서울과학기술대학교의 전공 과정에 대해 알려주세요."
 *             long_message:
 *               summary: 긴 메시지 예시
 *               value:
 *                 chat_room_id: 1
 *                 content: "컴퓨터공학과에서 배우는 주요 과목들과 졸업 후 진로에 대해서 자세히 알고 싶습니다. 특히 취업 준비는 어떻게 해야 하는지 궁금해요."
 *     responses:
 *       201:
 *         description: 메시지 전송 및 AI 응답 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *             examples:
 *               success:
 *                 summary: 성공적인 메시지 전송 및 응답
 *                 value:
 *                   userMessage:
 *                     id: 5
 *                     role: "user"
 *                     content: "서울과학기술대학교에 대해 알려주세요."
 *                   botMessage:
 *                     id: 6
 *                     role: "bot"
 *                     content: "서울과학기술대학교는 1910년에 설립된 국립 기술대학교로, 실용적인 기술 교육을 중시하는 특성화된 대학입니다. 공학, IT, 디자인 등 다양한 분야에서 우수한 교육을 제공하고 있습니다."
 *       400:
 *         description: 잘못된 요청 (필수 필드 누락, 내용이 너무 길거나 짧음)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   examples:
 *                     missing_field: "chat_room_id and content are required"
 *                     empty_content: "Message content cannot be empty"
 *                     too_long: "Message content is too long (max 2000 characters)"
 *       404:
 *         description: 채팅방을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Chat room not found"
 *       500:
 *         description: 서버 내부 오류 (AI 응답 생성 실패 등)
 */
router.post('/', messageController.sendMessage);

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: 메시지 삭제
 *     description: 특정 메시지를 데이터베이스에서 완전히 삭제합니다. 삭제된 메시지는 복구할 수 없습니다.
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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Message deleted successfully"
 *                 deletedMessageId:
 *                   type: integer
 *                   example: 5
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-01-15T14:30:00Z"
 *       404:
 *         description: 메시지를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Message not found"
 *                 messageId:
 *                   type: integer
 *                   example: 5
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.delete('/:id', messageController.deleteMessage);

/**
 * @swagger
 * /api/messages/{id}:
 *   get:
 *     summary: 특정 메시지 조회
 *     description: ID로 특정 메시지의 상세 정보를 조회합니다.
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: 조회할 메시지의 ID
 *         schema:
 *           type: integer
 *           minimum: 1
 *           example: 1
 *     responses:
 *       200:
 *         description: 메시지 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 *             examples:
 *               user_message:
 *                 summary: 사용자 메시지
 *                 value:
 *                   id: 1
 *                   chat_room_id: 1
 *                   role: "user"
 *                   content: "안녕하세요! 학교에 대해 궁금한 점이 있어요."
 *                   message_order: 1
 *                   created_at: "2024-01-15T10:30:00Z"
 *                   updated_at: "2024-01-15T10:30:00Z"
 *               bot_message:
 *                 summary: 봇 메시지
 *                 value:
 *                   id: 2
 *                   chat_room_id: 1
 *                   role: "bot"
 *                   content: "안녕하세요! 서울과학기술대학교에 대해 무엇이든 물어보세요."
 *                   message_order: 2
 *                   created_at: "2024-01-15T10:30:05Z"
 *                   updated_at: "2024-01-15T10:30:05Z"
 *       404:
 *         description: 메시지를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Message not found"
 *       500:
 *         description: 서버 내부 오류
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Internal server error"
 */
router.get('/:id', async (req, res) => {
  try {
    const messageDao = require('../dao/messageDao');
    const message = await messageDao.getMessageById(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }
    
    res.json(message);
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;