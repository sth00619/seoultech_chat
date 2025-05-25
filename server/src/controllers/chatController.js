const chatRoomDao = require('../dao/chatRoomDao');
const messageDao = require('../dao/messageDao');

class ChatController {
  async getChatRoomsByUser(req, res) {
    try {
      const { userId } = req.params;
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
        await messageDao.createMessage({
          chat_room_id: chatRoomId,
          role: 'bot',
          content: welcomeMessage
        });

        // 채팅방 마지막 메시지 업데이트
        await chatRoomDao.updateChatRoomLastMessage(chatRoomId, '안녕하세요! 서울과학기술대학교 AI 챗봇입니다.');

        console.log(`✅ Welcome message created for chat room ${chatRoomId}`);
      } catch (welcomeError) {
        console.error('Failed to create welcome message:', welcomeError);
        // 환영 메시지 실패해도 채팅방 생성은 성공으로 처리
      }

      res.status(201).json({ 
        id: chatRoomId, 
        message: 'Chat room created successfully' 
      });
    } catch (error) {
      console.error('Error creating chat room:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async getChatRoomById(req, res) {
    try {
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