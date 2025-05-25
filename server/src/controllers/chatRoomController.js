"use strict";

const logger = require("../modules/log/winstornModule");
const UtilModule = require("../modules/UtilModule");
const { validationResult, body, param } = require("express-validator");

const ChatRoomDao = require("../dao/chatRoomDao");
const ChatMessageDao = require("../dao/chatMessageDao");

module.exports = function (app) {
  var express = require("express");
  const router = express.Router();

  /**
   * @swagger
   * /v1/chat-room/list:
   *   get:
   *     summary: 사용자의 채팅방 목록 조회
   *     description: 로그인한 사용자의 모든 활성 채팅방을 최근 업데이트 순으로 조회합니다.
   *     tags:
   *       - Chat Room
   *     responses:
   *       200:
   *         description: 채팅방 목록 조회 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 content:
   *                   type: array
   *                   items:
   *                     type: object
   *                     properties:
   *                       id:
   *                         type: integer
   *                         description: 채팅방 ID
   *                       title:
   *                         type: string
   *                         description: 채팅방 제목
   *                       last_message:
   *                         type: string
   *                         description: 마지막 메시지
   *                       created_at:
   *                         type: string
   *                         format: date-time
   *                       updated_at:
   *                         type: string
   *                         format: date-time
   *       401:
   *         description: 인증이 유효하지 않습니다.
   *       500:
   *         description: 서버 에러가 발생했습니다.
   */
  router.get("/list", async (req, res) => {
    try {
      const { no: userId } = req.user;

      const chatRoomDao = new ChatRoomDao();
      const chatRooms = await chatRoomDao.getChatRoomsByUserId(userId);

      return res.json(UtilModule.wrapContent(chatRooms));
    } catch (err) {
      logger.error('Error fetching chat rooms:', err.stack);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * @swagger
   * /v1/chat-room:
   *   post:
   *     summary: 새 채팅방 생성
   *     description: 사용자를 위한 새로운 채팅방을 생성하고 환영 메시지를 자동으로 추가합니다.
   *     tags:
   *       - Chat Room
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 description: 채팅방 제목
   *                 example: "AI와의 대화"
   *             required:
   *               - title
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
  router.post(
    "",
    [body("title").notEmpty().withMessage("채팅방 제목이 필요합니다")],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { title } = req.body;
        const { no: userId } = req.user;
        
        // 채팅방 생성
        const chatRoomDao = new ChatRoomDao();
        const chatRoomId = await chatRoomDao.createChatRoom(userId, title);
        
        // 환영 메시지 자동 생성
        try {
          const welcomeMessage = `안녕하세요! 서울과학기술대학교 AI 챗봇입니다. 🎓

학교에 대한 궁금한 점이 있으시면 언제든 물어보세요!

• 학과 및 전공 정보
• 입학 및 진학 상담  
• 취업 및 진로 안내
• 캠퍼스 생활 정보

어떤 것이 궁금하신가요?`;

          // 봇 메시지 저장
          const chatMessageDao = new ChatMessageDao();
          await chatMessageDao.createMessage({
            chat_room_id: chatRoomId,
            role: 'bot',
            content: welcomeMessage
          });

          // 채팅방 마지막 메시지 업데이트
          await chatRoomDao.updateChatRoomLastMessage(
            chatRoomId, 
            '안녕하세요! 서울과학기술대학교 AI 챗봇입니다.'
          );

          logger.info(`✅ Welcome message created for chat room ${chatRoomId}`);
        } catch (welcomeError) {
          logger.error('Failed to create welcome message:', welcomeError);
          // 환영 메시지 실패해도 채팅방 생성은 성공으로 처리
        }

        return res.status(201).json({ 
          id: chatRoomId, 
          message: 'Chat room created successfully' 
        });
      } catch (err) {
        logger.error('Error creating chat room:', err.stack);
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  /**
   * @swagger
   * /v1/chat-room/{id}:
   *   get:
   *     summary: 특정 채팅방 조회
   *     description: ID로 특정 채팅방의 정보를 조회합니다.
   *     tags:
   *       - Chat Room
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
   *       404:
   *         description: 채팅방을 찾을 수 없음
   *       500:
   *         description: 서버 내부 오류
   */
  router.get(
    "/:id",
    [param("id").isInt().withMessage("유효한 채팅방 ID가 필요합니다")],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { id } = req.params;
        
        const chatRoomDao = new ChatRoomDao();
        const chatRoom = await chatRoomDao.getChatRoomById(id);
        
        if (!chatRoom) {
          return res.status(404).json({ error: 'Chat room not found' });
        }
        
        return res.json(UtilModule.wrapContent(chatRoom));
      } catch (err) {
        logger.error('Error fetching chat room:', err.stack);
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  /**
   * @swagger
   * /v1/chat-room/{id}:
   *   put:
   *     summary: 채팅방 제목 수정
   *     description: 기존 채팅방의 제목을 수정합니다.
   *     tags:
   *       - Chat Room
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
   *             type: object
   *             properties:
   *               title:
   *                 type: string
   *                 description: 새로운 채팅방 제목
   *                 example: "수정된 채팅방 제목"
   *             required:
   *               - title
   *     responses:
   *       200:
   *         description: 채팅방 제목 수정 성공
   *       400:
   *         description: 잘못된 요청
   *       404:
   *         description: 채팅방을 찾을 수 없음
   *       500:
   *         description: 서버 내부 오류
   */
  router.put(
    "/:id",
    [
      param("id").isInt().withMessage("유효한 채팅방 ID가 필요합니다"),
      body("title").notEmpty().withMessage("채팅방 제목이 필요합니다")
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { id } = req.params;
        const { title } = req.body;

        const chatRoomDao = new ChatRoomDao();
        const result = await chatRoomDao.updateChatRoomTitle(id, title);
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Chat room not found' });
        }

        return res.json({ message: 'Chat room title updated successfully' });
      } catch (err) {
        logger.error('Error updating chat room:', err.stack);
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  /**
   * @swagger
   * /v1/chat-room/{id}:
   *   delete:
   *     summary: 채팅방 삭제
   *     description: 채팅방을 비활성화합니다 (소프트 삭제).
   *     tags:
   *       - Chat Room
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
   *       404:
   *         description: 채팅방을 찾을 수 없음
   *       500:
   *         description: 서버 내부 오류
   */
  router.delete(
    "/:id",
    [param("id").isInt().withMessage("유효한 채팅방 ID가 필요합니다")],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { id } = req.params;
        
        const chatRoomDao = new ChatRoomDao();
        const result = await chatRoomDao.deleteChatRoom(id);
        
        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Chat room not found' });
        }

        return res.json({ message: 'Chat room deleted successfully' });
      } catch (err) {
        logger.error('Error deleting chat room:', err.stack);
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  /**
   * @swagger
   * /v1/chat-room/{id}/messages:
   *   get:
   *     summary: 채팅방의 메시지 목록 조회
   *     description: 특정 채팅방의 모든 메시지를 시간순으로 조회합니다.
   *     tags:
   *       - Chat Room
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         description: 채팅방 ID
   *         schema:
   *           type: integer
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           default: 100
   *         description: 가져올 메시지 수
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           default: 0
   *         description: 건너뛸 메시지 수
   *     responses:
   *       200:
   *         description: 메시지 목록 조회 성공
   *       404:
   *         description: 채팅방을 찾을 수 없음
   *       500:
   *         description: 서버 에러
   */
  router.get(
    "/:id/messages",
    [param("id").isInt().withMessage("유효한 채팅방 ID가 필요합니다")],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { id: chatRoomId } = req.params;
        const { limit = 100, offset = 0 } = req.query;

        // 채팅방 존재 확인
        const chatRoomDao = new ChatRoomDao();
        const chatRoom = await chatRoomDao.getChatRoomById(chatRoomId);
        if (!chatRoom) {
          return res.status(404).json({ error: 'Chat room not found' });
        }

        const chatMessageDao = new ChatMessageDao();
        const messages = await chatMessageDao.getMessagesByChatRoomId(
          chatRoomId, 
          parseInt(limit), 
          parseInt(offset)
        );
        
        return res.json(UtilModule.wrapContent(messages));
      } catch (err) {
        logger.error('Error fetching messages:', err.stack);
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  return router;
};