const chatRoomDao = require('../dao/chatRoomDao');

class ChatController {
  // 사용자의 채팅방 목록 조회
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

  // 새 채팅방 생성
  async createChatRoom(req, res) {
    try {
      const { userId, title } = req.body;
      const chatRoomId = await chatRoomDao.createChatRoom(userId, title);
      res.status(201).json({ id: chatRoomId, message: 'Chat room created successfully' });
    } catch (error) {
      console.error('Error creating chat room:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  // 채팅방 정보 조회
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

  // 채팅방 제목 업데이트
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

  // 채팅방 삭제
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