const chatRoomDao = require('../dao/chatRoomDao');
const messageDao = require('../dao/messageDao');

class ChatController {
  async getChatRoomsByUser(req, res) {
    try {
      const { userId } = req.params;
      // DAO 메서드 호출
      const chatRooms = await chatRoomDao.getChatRoomsByUserId(userId);
      res.json(chatRooms);
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async createChatRoom(req, res) {
    try {
      const { userId, title } = req.body;
      
      // 채팅방 생성
      const chatRoomId = await chatRoomDao.createChatRoom(userId, title);
      
      // 환영 메시지 자동 추가
      const welcomeMessage = '안녕하세요! 서울과학기술대학교 AI 챗봇입니다. 🎓\n\n학교에 대한 궁금한 점이 있으시면 언제든 물어보세요!\n\n• 학과 및 전공 정보\n• 입학 및 진학 상담\n• 취업 및 진로 안내\n• 캠퍼스 생활 정보\n\n어떤 것이 궁금하신가요?';
      
      await messageDao.createMessage({
        chat_room_id: chatRoomId,
        role: 'bot',
        content: welcomeMessage
      });
      
      // 채팅방의 마지막 메시지 업데이트
      await chatRoomDao.updateChatRoomLastMessage(
        chatRoomId, 
        '안녕하세요! 서울과학기술대학교 AI 챗봇입니다. 🎓'
      );
      
      // 생성된 채팅방 정보 조회해서 반환
      const chatRoom = await chatRoomDao.getChatRoomById(chatRoomId);
      
      res.status(201).json(chatRoom);
    } catch (error) {
      console.error('Error creating chat room:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getChatRoomById(req, res) {
    try {
      // DAO 메서드 호출
      const chatRoom = await chatRoomDao.getChatRoomById(req.params.id);
      
      if (!chatRoom) {
        return res.status(404).json({ error: 'Chat room not found' });
      }
      
      res.json(chatRoom);
    } catch (error) {
      console.error('Error fetching chat room:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async updateChatRoomTitle(req, res) {
    try {
      const { id } = req.params;
      const { title } = req.body;

      // DAO 메서드 호출
      const affectedRows = await chatRoomDao.updateChatRoomTitle(id, title);
      
      if (affectedRows === 0) {
        return res.status(404).json({ error: 'Chat room not found' });
      }

      res.json({ message: 'Chat room title updated successfully' });
    } catch (error) {
      console.error('Error updating chat room:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async deleteChatRoom(req, res) {
    try {
      // DAO 메서드 호출
      const affectedRows = await chatRoomDao.deleteChatRoom(req.params.id);
      
      if (affectedRows === 0) {
        return res.status(404).json({ error: 'Chat room not found' });
      }

      res.json({ message: 'Chat room deleted successfully' });
    } catch (error) {
      console.error('Error deleting chat room:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = new ChatController();