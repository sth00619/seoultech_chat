const messageDao = require('../dao/messageDao');
const chatRoomDao = require('../dao/chatRoomDao');

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

      // AI 응답 생성
      const botResponse = await this.generateBotResponse(content);

      // 봇 메시지 저장
      const botMessageId = await messageDao.createMessage({
        chat_room_id,
        role: 'bot',
        content: botResponse
      });

      // 채팅방 업데이트 시간 갱신 및 마지막 메시지 설정
      await chatRoomDao.updateChatRoomLastMessage(chat_room_id, botResponse);

      // 저장된 메시지들 조회해서 반환
      const userMessage = await messageDao.getMessageById(userMessageId);
      const botMessage = await messageDao.getMessageById(botMessageId);

      res.status(201).json({
        userMessage,
        botMessage
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // AI 응답 생성 (개선된 버전)
  async generateBotResponse(userMessage) {
    try {
      // 메시지 내용에 따른 다양한 응답
      const lowerMessage = userMessage.toLowerCase();
      
      if (lowerMessage.includes('안녕') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
        return `안녕하세요! 서울과학기술대학교 AI 챗봇입니다. 무엇을 도와드릴까요? 😊`;
      }
      
      if (lowerMessage.includes('학교') || lowerMessage.includes('서울과기대') || lowerMessage.includes('seoultech')) {
        return `서울과학기술대학교는 1910년에 설립된 국립 기술대학교입니다. 실용적인 기술 교육을 중시하며, 공학, IT, 디자인 등 다양한 분야에서 우수한 교육을 제공하고 있습니다. 구체적으로 어떤 것이 궁금하신가요?`;
      }
      
      if (lowerMessage.includes('전공') || lowerMessage.includes('학과')) {
        return `서울과학기술대학교에는 다양한 전공이 있습니다:\n\n• 공과대학: 기계공학과, 전기정보공학과, 컴퓨터공학과 등\n• IT대학: 컴퓨터공학과, 전자IT미디어공학과 등\n• 조형대학: 디자인학과, 도예학과 등\n• 인문사회대학: 영어영문학과, 행정학과 등\n\n어떤 전공에 대해 더 자세히 알고 싶으신가요?`;
      }
      
      if (lowerMessage.includes('취업') || lowerMessage.includes('진로') || lowerMessage.includes('career')) {
        return `서울과학기술대학교는 높은 취업률을 자랑합니다! 💼\n\n주요 진로 지원:\n• 산학협력을 통한 현장실습\n• 다양한 기업과의 채용연계 프로그램\n• 창업지원센터 운영\n• 취업박람회 정기 개최\n\n구체적인 전공별 취업 정보가 궁금하시면 말씀해 주세요!`;
      }
      
      if (lowerMessage.includes('입학') || lowerMessage.includes('admission')) {
        return `서울과학기술대학교 입학 정보를 안내해드릴게요! 📚\n\n주요 전형:\n• 수시모집: 학생부종합전형, 학생부교과전형\n• 정시모집: 수능 성적 반영\n• 특별전형: 특성화고교졸업자, 농어촌학생 등\n\n자세한 입학 정보는 대학 홈페이지에서 확인하실 수 있습니다.`;
      }
      
      if (lowerMessage.includes('도움') || lowerMessage.includes('help')) {
        return `저는 서울과학기술대학교에 대한 다양한 정보를 제공해드릴 수 있습니다! 🎓\n\n• 학교 소개 및 역사\n• 전공/학과 정보\n• 취업 및 진로 안내\n• 입학 정보\n• 캠퍼스 생활\n• 장학금 및 복지\n\n궁금한 것이 있으면 언제든 물어보세요!`;
      }
      
      // 기본 응답들
      const responses = [
        `"${userMessage}"에 대해 더 자세히 알려드릴게요! 서울과학기술대학교 관련 질문이시라면 구체적으로 말씀해 주세요.`,
        `흥미로운 질문이네요! "${userMessage}"와 관련하여 서울과학기술대학교의 어떤 정보가 궁금하신지 알려주시면 더 정확한 답변을 드릴 수 있습니다.`,
        `좋은 질문입니다! "${userMessage}"에 대해 도움을 드리고 싶습니다. 학교, 전공, 취업, 입학 등 어떤 분야에 대한 질문인지 좀 더 구체적으로 말씀해 주세요.`,
        `"${userMessage}"에 대한 답변을 준비했습니다! 서울과학기술대학교에서 제공하는 다양한 정보 중 어떤 것이 가장 궁금하신가요?`
      ];
      
      return responses[Math.floor(Math.random() * responses.length)];
      
    } catch (error) {
      console.error('Error generating bot response:', error);
      return '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해 주세요.';
    }
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
}

module.exports = new MessageController();