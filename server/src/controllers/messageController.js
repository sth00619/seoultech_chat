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

      // 채팅방 존재 확인
      const chatRoom = await chatRoomDao.getChatRoomById(chat_room_id);
      if (!chatRoom) {
        return res.status(404).json({ error: 'Chat room not found' });
      }

      // 사용자 메시지 저장
      const userMessageId = await messageDao.createMessage({
        chat_room_id,
        role: 'user',
        content
      });

      // AI 응답 생성 (현재는 간단한 응답, 추후 실제 AI API 연동)
      const botResponse = await this.generateBotResponse(content);

      // 봇 메시지 저장
      const botMessageId = await messageDao.createMessage({
        chat_room_id,
        role: 'bot',
        content: botResponse
      });

      // 채팅방 업데이트 시간 갱신
      await chatRoomDao.updateChatRoomTitle(chat_room_id, chatRoom.title);

      res.status(201).json({
        userMessage: { id: userMessageId, role: 'user', content },
        botMessage: { id: botMessageId, role: 'bot', content: botResponse }
      });
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // AI 응답 생성 (임시 구현)
  async generateBotResponse(userMessage) {
    // 추후 실제 AI API (OpenAI, Claude 등)로 교체
    const responses = [
      `"${userMessage}"에 대해 더 자세히 알려드릴게요!`,
      `흥미로운 질문이네요! "${userMessage}"에 대해 설명해드리겠습니다.`,
      `서울과학기술대학교 관련 질문이시군요. "${userMessage}"에 대한 답변입니다.`,
      `좋은 질문입니다! "${userMessage}"에 대해 도움을 드릴게요.`
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
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