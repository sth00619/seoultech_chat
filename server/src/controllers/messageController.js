const messageDao = require('../dao/messageDao');
const chatRoomDao = require('../dao/chatRoomDao');
const chatbotDao = require('../dao/chatBotDao'); // 새로 추가된 DAO

class MessageController {
  // 채팅방의 메시지 목록 조회
  async getMessages(req, res) {
    try {
      const { chatRoomId } = req.params;
      const { limit = 100, offset = 0 } = req.query;

      // 채팅방 존재 확인
      const chatRoom = await chatRoomDao.getChatRoomById(chatRoomId);
      if (!chatRoom) {
        return res.status(404).json({ error: 'Chat room not found' });
      }

      const messages = await messageDao.getMessagesByChatRoomId(
        chatRoomId, 
        parseInt(limit), 
        parseInt(offset)
      );
      
      res.json(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 환영 메시지 생성 (챗봇이 먼저 인사)
  async createWelcomeMessage(req, res) {
    try {
      const { chat_room_id } = req.body;

      if (!chat_room_id) {
        return res.status(400).json({ error: 'chat_room_id is required' });
      }

      // 채팅방 존재 확인
      const chatRoom = await chatRoomDao.getChatRoomById(chat_room_id);
      if (!chatRoom) {
        return res.status(404).json({ error: 'Chat room not found' });
      }

      // 이미 메시지가 있는지 확인 (중복 환영 메시지 방지)
      const existingMessages = await messageDao.getMessagesByChatRoomId(chat_room_id, 1, 0);
      if (existingMessages.length > 0) {
        return res.json({ message: 'Welcome message already exists' });
      }

      // 환영 메시지 생성
      const welcomeMessage = `안녕하세요! 서울과학기술대학교 AI 챗봇입니다. 🎓

학교에 대한 궁금한 점이 있으시면 언제든 물어보세요!

• 학과 및 전공 정보
• 입학 및 진학 상담  
• 취업 및 진로 안내
• 캠퍼스 생활 정보

어떤 것이 궁금하신가요?`;

      // 봇 메시지 저장
      const botMessageId = await messageDao.createMessage({
        chat_room_id,
        role: 'bot',
        content: welcomeMessage
      });

      // 채팅방 마지막 메시지 업데이트
      await chatRoomDao.updateChatRoomLastMessage(chat_room_id, '안녕하세요! 서울과학기술대학교 AI 챗봇입니다.');

      // 저장된 메시지 조회해서 반환
      const botMessage = await messageDao.getMessageById(botMessageId);

      res.status(201).json({
        message: 'Welcome message created successfully',
        botMessage
      });

    } catch (error) {
      console.error('Error creating welcome message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 새 메시지 전송 (사용자 메시지 + AI 응답) - 개선된 버전
  async sendMessage(req, res) {
    const startTime = Date.now();
    
    try {
      const { chat_room_id, content } = req.body;

      // 입력 검증
      if (!chat_room_id || !content) {
        return res.status(400).json({ error: 'chat_room_id and content are required' });
      }

      // 채팅방 존재 확인
      const chatRoom = await chatRoomDao.getChatRoomById(chat_room_id);
      if (!chatRoom) {
        return res.status(404).json({ error: 'Chat room not found' });
      }

      console.log(`📥 User message received: "${content}"`);

      // 사용자 메시지 저장
      const userMessageId = await messageDao.createMessage({
        chat_room_id,
        role: 'user',
        content: content.trim()
      });

      // 데이터베이스 기반 AI 응답 생성 (강화된 버전)
      let botResponse, matchedKnowledge;
      try {
        console.log('🤖 Generating bot response...');
        const result = await this.generateBotResponseFromDB(content);
        botResponse = result.response;
        matchedKnowledge = result.matchedKnowledge;
        console.log(`📤 Bot response generated: "${botResponse.substring(0, 100)}..."`);
      } catch (dbError) {
        console.error('❌ Database response generation failed:', dbError);
        // 데이터베이스 실패 시 기본 응답
        botResponse = '죄송합니다. 일시적인 시스템 오류가 발생했습니다. 잠시 후 다시 시도해 주세요. 🤖';
        matchedKnowledge = null;
      }

      // 봇 메시지 저장
      const botMessageId = await messageDao.createMessage({
        chat_room_id,
        role: 'bot',
        content: botResponse
      });

      // 채팅방 업데이트 시간 갱신 및 마지막 메시지 설정
      const shortResponse = botResponse.length > 50 ? botResponse.substring(0, 50) + '...' : botResponse;
      await chatRoomDao.updateChatRoomLastMessage(chat_room_id, shortResponse);

      // 저장된 메시지들 조회해서 반환
      const userMessage = await messageDao.getMessageById(userMessageId);
      const botMessage = await messageDao.getMessageById(botMessageId);

      // 채팅 분석 로그 저장 (에러가 나도 메시지 전송은 성공)
      try {
        const responseTime = Date.now() - startTime;
        await chatbotDao.logChatAnalytics(
          content, 
          botResponse, 
          matchedKnowledge?.id || null, 
          responseTime
        );
      } catch (logError) {
        console.error('Failed to log analytics:', logError);
      }

      res.status(201).json({
        userMessage,
        botMessage,
        matchedKnowledge: matchedKnowledge ? {
          id: matchedKnowledge.id,
          category: matchedKnowledge.category_name,
          confidence: matchedKnowledge.match_count || 1
        } : null
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 데이터베이스 기반 AI 응답 생성 (완전히 새로운 버전)
  async generateBotResponseFromDB(userMessage) {
    try {
      console.log(`🔍 Starting DB search for: "${userMessage}"`);
      
      // 먼저 데이터베이스 연결 및 데이터 확인
      const isReady = await chatbotDao.testConnection();
      if (!isReady) {
        console.log('❌ Database not ready, using fallback response');
        return this.getFallbackResponse();
      }

      // 1차 시도: 통합 검색 (가장 강력한 검색)
      let matchedKnowledge = await chatbotDao.searchBestMatch(userMessage);
      
      if (matchedKnowledge) {
        console.log(`✅ Found match with searchBestMatch: ${matchedKnowledge.question}`);
        return {
          response: matchedKnowledge.answer,
          matchedKnowledge
        };
      }

      // 2차 시도: 개별 키워드 매칭
      matchedKnowledge = await chatbotDao.searchByIndividualKeywords(userMessage);
      
      if (matchedKnowledge) {
        console.log(`✅ Found match with searchByIndividualKeywords: ${matchedKnowledge.question}`);
        return {
          response: matchedKnowledge.answer,
          matchedKnowledge
        };
      }

      // 3차 시도: 기본 키워드 검색
      matchedKnowledge = await chatbotDao.searchByKeywords(userMessage);
      
      if (matchedKnowledge) {
        console.log(`✅ Found match with searchByKeywords: ${matchedKnowledge.question}`);
        return {
          response: matchedKnowledge.answer,
          matchedKnowledge
        };
      }

      // 4차 시도: 단순 텍스트 매칭
      matchedKnowledge = await chatbotDao.searchBySimpleText(userMessage);
      
      if (matchedKnowledge) {
        console.log(`✅ Found match with searchBySimpleText: ${matchedKnowledge.question}`);
        return {
          response: matchedKnowledge.answer,
          matchedKnowledge
        };
      }

      // 모든 검색 실패 시 기본 응답
      console.log('❌ No match found in any search method, using default response');
      return this.getDefaultResponse();

    } catch (error) {
      console.error('❌ Error in generateBotResponseFromDB:', error);
      return this.getFallbackResponse();
    }
  }

  // 기본 응답 (검색 결과 없을 때)
  getDefaultResponse() {
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

더 많은 정보가 필요하시면 학교 홈페이지(www.seoultech.ac.kr)를 참고해주세요!`,

      `흥미로운 질문이네요! 하지만 정확한 정보를 찾지 못했습니다. 😊

**서울과학기술대학교 관련 질문이라면:**
• 학과/전공 관련 질문
• 입학/진학 상담  
• 취업/진로 정보
• 캠퍼스 생활 정보

이런 주제들로 다시 질문해주시면 도움을 드릴 수 있어요!`
    ];

    const randomResponse = defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    
    return {
      response: randomResponse,
      matchedKnowledge: null
    };
  }

  // 시스템 오류 시 폴백 응답
  getFallbackResponse() {
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

  // 메시지 삭제
  async deleteMessage(req, res) {
    try {
      const affectedRows = await messageDao.deleteMessage(req.params.id);
      
      if (affectedRows === 0) {
        return res.status(404).json({ error: 'Message not found' });
      }

      res.json({ message: 'Message deleted successfully' });
    } catch (error) {
      console.error('Error deleting message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 지식베이스 관리 (관리자용)
  async getKnowledgeBase(req, res) {
    try {
      const { category } = req.query;
      
      let knowledge;
      if (category) {
        knowledge = await chatbotDao.getKnowledgeByCategory(category);
      } else {
        knowledge = await chatbotDao.getAllKnowledge();
      }
      
      res.json(knowledge);
    } catch (error) {
      console.error('Error fetching knowledge base:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 새 지식베이스 추가 (관리자용)
  async addKnowledge(req, res) {
    try {
      const { category_id, keywords, question, answer, priority = 1 } = req.body;
      
      if (!category_id || !keywords || !question || !answer) {
        return res.status(400).json({ 
          error: 'category_id, keywords, question, and answer are required' 
        });
      }
      
      const knowledgeId = await chatbotDao.addKnowledge(
        category_id, keywords, question, answer, priority
      );
      
      res.status(201).json({ 
        id: knowledgeId, 
        message: 'Knowledge added successfully' 
      });
    } catch (error) {
      console.error('Error adding knowledge:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 지식베이스 업데이트 (관리자용)
  async updateKnowledge(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      const affectedRows = await chatbotDao.updateKnowledge(id, updateData);
      
      if (affectedRows === 0) {
        return res.status(404).json({ error: 'Knowledge not found' });
      }
      
      res.json({ message: 'Knowledge updated successfully' });
    } catch (error) {
      console.error('Error updating knowledge:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 채팅 분석 데이터 조회 (관리자용)
  async getChatAnalytics(req, res) {
    try {
      const { limit = 100, offset = 0 } = req.query;
      
      const [rows] = await require('../config/database').query(`
        SELECT 
          ca.*,
          kb.question as matched_question,
          kb.category_id,
          kc.name as category_name
        FROM chat_analytics ca
        LEFT JOIN knowledge_base kb ON ca.matched_knowledge_id = kb.id
        LEFT JOIN knowledge_categories kc ON kb.category_id = kc.id
        ORDER BY ca.created_at DESC
        LIMIT ? OFFSET ?
      `, [parseInt(limit), parseInt(offset)]);
      
      res.json(rows);
    } catch (error) {
      console.error('Error fetching chat analytics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 챗봇 테스트 (개발용) - 강화된 버전
  async testChatbot(req, res) {
    try {
      const { message } = req.body;
      
      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }
      
      console.log(`🧪 Testing chatbot with message: "${message}"`);
      
      const startTime = Date.now();
      const { response, matchedKnowledge } = await this.generateBotResponseFromDB(message);
      const responseTime = Date.now() - startTime;
      
      console.log(`🧪 Test completed in ${responseTime}ms`);
      
      res.json({
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
        timestamp: new Date().toISOString(),
        searchStrategy: matchedKnowledge ? 'database_match' : 'default_response'
      });
    } catch (error) {
      console.error('Error testing chatbot:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new MessageController();