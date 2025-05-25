"use strict";

const logger = require("../modules/log/winstornModule");
const UtilModule = require("../modules/UtilModule");
const { validationResult, body, param } = require("express-validator");

const ChatbotDao = require("../dao/chatBotDao");
const ChatMessageDao = require("../dao/chatMessageDao");
const ChatRoomDao = require("../dao/chatRoomDao");
const ChatAnalyticsDao = require("../dao/chatAnalyticsDao");

module.exports = function (app) {
  var express = require("express");
  const router = express.Router();

  /**
   * @swagger
   * /v1/chatbot/message:
   *   post:
   *     summary: 챗봇에게 메시지 전송
   *     description: 사용자 메시지를 챗봇에게 전송하고 AI 응답을 받습니다.
   *     tags:
   *       - Chatbot
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               chat_room_id:
   *                 type: integer
   *                 description: 채팅방 ID
   *                 example: 1
   *               content:
   *                 type: string
   *                 description: 사용자 메시지
   *                 example: "서울과기대에 대해 알려주세요"
   *     responses:
   *       200:
   *         description: 메시지 전송 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 userMessage:
   *                   type: object
   *                   description: 사용자 메시지 정보
   *                 botMessage:
   *                   type: object
   *                   description: 봇 응답 메시지 정보
   *                 matchedKnowledge:
   *                   type: object
   *                   description: 매칭된 지식베이스 정보
   *       400:
   *         description: 잘못된 요청
   *       500:
   *         description: 서버 에러
   */
  router.post(
    "/message",
    [
      body("chat_room_id").notEmpty().isInt().withMessage("채팅방 ID가 필요합니다"),
      body("content").notEmpty().withMessage("메시지 내용이 필요합니다")
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const startTime = Date.now();

      try {
        const { chat_room_id, content } = req.body;
        const user = req.user; // JWT에서 추출된 사용자 정보

        // 채팅방 존재 확인
        const chatRoomDao = new ChatRoomDao();
        const chatRoom = await chatRoomDao.getChatRoomById(chat_room_id);
        
        if (!chatRoom) {
          return res.status(404).json({ error: "Chat room not found" });
        }

        logger.info(`📥 User message received: "${content}" from user: ${user.no}`);

        // 사용자 메시지 저장
        const chatMessageDao = new ChatMessageDao();
        const userMessageId = await chatMessageDao.createMessage({
          chat_room_id,
          role: 'user',
          content: content.trim()
        });

        // AI 응답 생성
        let botResponse, matchedKnowledge;
        try {
          const result = await generateBotResponse(content);
          botResponse = result.response;
          matchedKnowledge = result.matchedKnowledge;
          
          logger.info(`📤 Bot response generated: "${botResponse.substring(0, 100)}..."`);
        } catch (aiError) {
          logger.error('❌ AI response generation failed:', aiError);
          botResponse = getFallbackResponse();
          matchedKnowledge = null;
        }

        // 봇 메시지 저장
        const botMessageId = await chatMessageDao.createMessage({
          chat_room_id,
          role: 'bot',
          content: botResponse
        });

        // 채팅방 마지막 메시지 업데이트
        const shortResponse = botResponse.length > 50 ? 
          botResponse.substring(0, 50) + '...' : botResponse;
        await chatRoomDao.updateChatRoomLastMessage(chat_room_id, shortResponse);

        // 저장된 메시지들 조회
        const userMessage = await chatMessageDao.getMessageById(userMessageId);
        const botMessage = await chatMessageDao.getMessageById(botMessageId);

        // 분석 로그 저장
        try {
          const responseTime = Date.now() - startTime;
          const chatAnalyticsDao = new ChatAnalyticsDao();
          await chatAnalyticsDao.logChatAnalytics(
            content,
            botResponse,
            matchedKnowledge?.id || null,
            responseTime
          );
        } catch (logError) {
          logger.error('Failed to log analytics:', logError);
        }

        return res.json({
          userMessage,
          botMessage,
          matchedKnowledge: matchedKnowledge ? {
            id: matchedKnowledge.id,
            category: matchedKnowledge.category_name,
            confidence: matchedKnowledge.match_count || 1
          } : null
        });

      } catch (err) {
        logger.error('Error in chatbot message:', err.stack);
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  /**
   * @swagger
   * /v1/chatbot/test:
   *   post:
   *     summary: 챗봇 응답 테스트
   *     description: 채팅방 생성 없이 챗봇 응답만 테스트합니다 (개발용)
   *     tags:
   *       - Chatbot
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               message:
   *                 type: string
   *                 description: 테스트할 메시지
   *                 example: "안녕하세요"
   *     responses:
   *       200:
   *         description: 테스트 성공
   *       400:
   *         description: 잘못된 요청
   *       500:
   *         description: 서버 에러
   */
  router.post(
    "/test",
    [body("message").notEmpty().withMessage("메시지가 필요합니다")],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { message } = req.body;
        
        logger.info(`🧪 Testing chatbot with message: "${message}"`);
        
        const startTime = Date.now();
        const { response, matchedKnowledge } = await generateBotResponse(message);
        const responseTime = Date.now() - startTime;
        
        logger.info(`🧪 Test completed in ${responseTime}ms`);
        
        return res.json({
          userMessage: message,
          botResponse: response,
          matchedKnowledge: matchedKnowledge ? {
            id: matchedKnowledge.id,
            category: matchedKnowledge.category_name,
            keywords: matchedKnowledge.keywords,
            question: matchedKnowledge.question,
            priority: matchedKnowledge.priority
          } : null,
          responseTime: `${responseTime}ms`,
          timestamp: new Date().toISOString()
        });
      } catch (err) {
        logger.error('Error testing chatbot:', err.stack);
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  /**
   * @swagger
   * /v1/chatbot/knowledge:
   *   get:
   *     summary: 지식베이스 조회
   *     description: 챗봇의 지식베이스를 조회합니다
   *     tags:
   *       - Chatbot Knowledge
   *     parameters:
   *       - in: query
   *         name: category
   *         schema:
   *           type: integer
   *         description: 카테고리 ID로 필터링
   *     responses:
   *       200:
   *         description: 지식베이스 조회 성공
   *       500:
   *         description: 서버 에러
   */
  router.get("/knowledge", async (req, res) => {
    try {
      const { category } = req.query;
      
      const chatbotDao = new ChatbotDao();
      let knowledge;
      
      if (category) {
        knowledge = await chatbotDao.getKnowledgeByCategory(category);
      } else {
        knowledge = await chatbotDao.getAllKnowledge();
      }
      
      return res.json(UtilModule.wrapContent(knowledge));
    } catch (err) {
      logger.error('Error fetching knowledge base:', err.stack);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  /**
   * @swagger
   * /v1/chatbot/knowledge:
   *   post:
   *     summary: 새 지식베이스 추가
   *     description: 챗봇에 새로운 지식을 추가합니다 (관리자용)
   *     tags:
   *       - Chatbot Knowledge
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             properties:
   *               category_id:
   *                 type: integer
   *                 example: 1
   *               keywords:
   *                 type: string
   *                 example: "안녕,hello,hi"
   *               question:
   *                 type: string
   *                 example: "안녕하세요"
   *               answer:
   *                 type: string
   *                 example: "안녕하세요! 서울과학기술대학교 AI 챗봇입니다."
   *               priority:
   *                 type: integer
   *                 example: 5
   *     responses:
   *       201:
   *         description: 지식베이스 추가 성공
   *       400:
   *         description: 잘못된 요청
   *       500:
   *         description: 서버 에러
   */
  router.post(
    "/knowledge",
    [
      body("category_id").notEmpty().isInt().withMessage("카테고리 ID가 필요합니다"),
      body("keywords").notEmpty().withMessage("키워드가 필요합니다"),
      body("question").notEmpty().withMessage("질문이 필요합니다"),
      body("answer").notEmpty().withMessage("답변이 필요합니다")
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      try {
        const { category_id, keywords, question, answer, priority = 1 } = req.body;
        
        const chatbotDao = new ChatbotDao();
        const knowledgeId = await chatbotDao.addKnowledge(
          category_id, keywords, question, answer, priority
        );
        
        return res.status(201).json({ 
          id: knowledgeId, 
          message: 'Knowledge added successfully' 
        });
      } catch (err) {
        logger.error('Error adding knowledge:', err.stack);
        return res.status(500).json({ error: "Internal server error" });
      }
    }
  );

  /**
   * @swagger
   * /v1/chatbot/analytics:
   *   get:
   *     summary: 채팅 분석 데이터 조회
   *     description: 챗봇 사용 통계 및 분석 데이터를 조회합니다 (관리자용)
   *     tags:
   *       - Chatbot Analytics
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
   *       500:
   *         description: 서버 에러
   */
  router.get("/analytics", async (req, res) => {
    try {
      const { limit = 100, offset = 0 } = req.query;
      
      const chatAnalyticsDao = new ChatAnalyticsDao();
      const analytics = await chatAnalyticsDao.getChatAnalytics(
        parseInt(limit), 
        parseInt(offset)
      );
      
      return res.json(UtilModule.wrapContent(analytics));
    } catch (err) {
      logger.error('Error fetching chat analytics:', err.stack);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  return router;

  // 내부 함수들
  async function generateBotResponse(userMessage) {
    try {
      logger.info(`🔍 Starting AI response generation for: "${userMessage}"`);
      
      const chatbotDao = new ChatbotDao();
      
      // 데이터베이스 연결 테스트
      const isConnected = await chatbotDao.testConnection();
      if (!isConnected) {
        logger.warn('❌ Database connection failed');
        return getFallbackResponse();
      }

      // 다단계 검색 수행
      let matchedKnowledge = null;

      // 1차: 개별 키워드 매칭
      try {
        matchedKnowledge = await chatbotDao.searchByIndividualKeywords(userMessage);
        if (matchedKnowledge) {
          logger.info(`✅ Found with individual keywords: ${matchedKnowledge.question}`);
          return {
            response: matchedKnowledge.answer,
            matchedKnowledge
          };
        }
      } catch (error) {
        logger.error('Individual keyword search failed:', error);
      }

      // 2차: 기본 키워드 검색
      try {
        matchedKnowledge = await chatbotDao.searchByKeywords(userMessage);
        if (matchedKnowledge) {
          logger.info(`✅ Found with basic keywords: ${matchedKnowledge.question}`);
          return {
            response: matchedKnowledge.answer,
            matchedKnowledge
          };
        }
      } catch (error) {
        logger.error('Basic keyword search failed:', error);
      }

      // 3차: 단순 텍스트 매칭
      try {
        matchedKnowledge = await chatbotDao.searchBySimpleText(userMessage);
        if (matchedKnowledge) {
          logger.info(`✅ Found with simple text: ${matchedKnowledge.question}`);
          return {
            response: matchedKnowledge.answer,
            matchedKnowledge
          };
        }
      } catch (error) {
        logger.error('Simple text search failed:', error);
      }

      // 모든 검색 실패 시 기본 응답
      logger.info('❌ No match found, using default response');
      return getDefaultResponse();

    } catch (error) {
      logger.error('❌ Error in generateBotResponse:', error);
      return getFallbackResponse();
    }
  }

  function getDefaultResponse() {
    const defaultResponses = [
      `죄송합니다. 정확한 답변을 찾지 못했어요. 😅

다음과 같은 주제로 질문해보시는 건 어떨까요?

• **"안녕하세요"** - 인사하기
• **"서울과기대 소개"** - 학교 소개  
• **"컴퓨터공학과"** - 전공 정보
• **"입학 정보"** - 입학 안내
• **"취업률"** - 취업 정보
• **"캠퍼스 시설"** - 시설 안내

더 구체적으로 질문해주시면 정확한 답변을 드릴 수 있어요!`,

      `아직 해당 질문에 대한 정보가 준비되어 있지 않아요. 🤔

**대신 이런 질문들을 시도해보세요:**
• "서울과기대에 대해 알려주세요"
• "어떤 전공이 있나요?"
• "입학 정보를 알려주세요"  
• "취업률이 어떻게 되나요?"
• "캠퍼스 생활은 어떤가요?"

더 많은 정보가 필요하시면 학교 홈페이지(www.seoultech.ac.kr)를 참고해주세요!`
    ];

    const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    
    return {
      response: randomResponse,
      matchedKnowledge: null
    };
  }

  function getFallbackResponse() {
    return {
      response: `죄송합니다. 현재 시스템에 일시적인 문제가 있습니다. 😔

**다시 시도해주시거나, 다음과 같이 질문해보세요:**
• "안녕하세요"
• "서울과기대 소개"
• "전공 정보"
• "입학 안내"

시스템이 복구되면 더 정확한 답변을 드릴 수 있습니다.`,
      matchedKnowledge: null
    };
  }
};