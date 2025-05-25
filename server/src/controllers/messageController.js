const messageDao = require('../dao/messageDao');
const chatRoomDao = require('../dao/chatRoomDao');
const knowledgeDao = require('../dao/knowledgeDao');

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

  // 새 메시지 전송 (사용자 메시지 + AI 응답)
  async sendMessage(req, res) {
    try {
      console.log('sendMessage called with:', req.body); // 디버깅용
      const startTime = Date.now();
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

      // 사용자 메시지 저장
      const userMessageId = await messageDao.createMessage({
        chat_room_id,
        role: 'user',
        content: content.trim()
      });

      // DB 기반 AI 응답 생성 - this 대신 직접 메서드 호출
      const messageController = new MessageController();
      const { response: botResponse, matchedId } = await messageController.generateBotResponseFromDB(content);
      const responseTime = Date.now() - startTime;
      console.log('Bot response generated:', { botResponse, matchedId, responseTime }); // 디버깅용

      // 봇 메시지 저장
      const botMessageId = await messageDao.createMessage({
        chat_room_id,
        role: 'bot',
        content: botResponse
      });

      // 채팅방 업데이트 시간 갱신 및 마지막 메시지 설정
      await chatRoomDao.updateChatRoomLastMessage(chat_room_id, botResponse);

      // 채팅 분석 로그 저장
      await knowledgeDao.logChatAnalytics(
        content.trim(),
        botResponse,
        matchedId,
        responseTime
      );

      // 저장된 메시지들 조회해서 반환
      const userMessage = await messageDao.getMessageById(userMessageId);
      const botMessage = await messageDao.getMessageById(botMessageId);

      res.status(201).json({
        userMessage,
        botMessage
      });
    } catch (error) {
      console.error('Error sending message - Full error:', error); // 상세 에러 로그
      console.error('Error stack:', error.stack); // 스택 트레이스
      res.status(500).json({ 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined 
      });
    }
  }

  // DB 기반 AI 응답 생성
  async generateBotResponseFromDB(userMessage) {
    try {
      console.log('Generating response for:', userMessage);

      // 1. 먼저 정확한 질문 매칭 시도
      const exactMatch = await knowledgeDao.getExactAnswer(userMessage);
      if (exactMatch) {
        console.log('Exact match found:', exactMatch.id);
        return {
          response: exactMatch.answer,
          matchedId: exactMatch.id
        };
      }

      // 2. 키워드 기반 검색
      const keywordResults = await knowledgeDao.searchByKeywords(userMessage);
      if (keywordResults.length > 0) {
        console.log('Keyword match found:', keywordResults[0].id);
        // 가장 높은 점수의 답변 반환
        return {
          response: keywordResults[0].answer,
          matchedId: keywordResults[0].id
        };
      }

      // 3. 단어별 매칭 검색 (좀 더 유연한 검색)
      const wordResults = await knowledgeDao.searchByWords(userMessage);
      if (wordResults.length > 0) {
        console.log('Word match found:', wordResults[0].id);
        // 가장 많이 매칭된 답변 반환
        return {
          response: wordResults[0].answer,
          matchedId: wordResults[0].id
        };
      }

      // 4. 매칭된 결과가 없는 경우 기본 응답
      console.log('No match found, returning default response');
      const controller = new MessageController();
      return {
        response: controller.getDefaultResponse(userMessage),
        matchedId: null
      };

    } catch (error) {
      console.error('Error generating bot response from DB:', error);
      return {
        response: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해 주세요.',
        matchedId: null
      };
    }
  }

  // 기본 응답 생성 (DB에 매칭되는 답변이 없을 때)
  getDefaultResponse(userMessage) {
    const defaultResponses = [
      `"${userMessage}"에 대한 정보를 찾을 수 없습니다. 다른 질문을 해주시거나, 다음과 같은 주제로 물어봐 주세요:\n\n• 학교 소개\n• 전공/학과 정보\n• 입학 정보\n• 취업/진로\n• 캠퍼스 생활\n• 장학금`,
      `죄송합니다. "${userMessage}"에 대한 답변을 준비하지 못했습니다. 서울과학기술대학교에 대한 다른 궁금한 점이 있으시면 말씀해 주세요!`,
      `입력하신 "${userMessage}"에 대한 정보를 찾지 못했습니다. 좀 더 구체적으로 질문해 주시거나, '도움'이라고 입력하시면 제가 답변할 수 있는 주제들을 안내해 드리겠습니다.`
    ];

    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
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

  // 카테고리별 도움말 제공 (추가 기능)
  async getHelp(req, res) {
    try {
      const categories = await knowledgeDao.getAllCategories();
      
      let helpMessage = "서울과학기술대학교 AI 챗봇이 도와드릴 수 있는 주제들입니다:\n\n";
      
      categories.forEach(category => {
        helpMessage += `• **${category.name}**: ${category.description}\n`;
      });
      
      helpMessage += "\n궁금한 주제에 대해 자유롭게 질문해 주세요!";
      
      res.json({ message: helpMessage, categories });
    } catch (error) {
      console.error('Error getting help:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new MessageController();