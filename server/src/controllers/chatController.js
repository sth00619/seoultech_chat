const chatRoomDao = require('../dao/chatRoomDao');

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
      // DAO 메서드 호출
      const chatRoomId = await chatRoomDao.createChatRoom(userId, title);
      res.status(201).json({ id: chatRoomId, message: 'Chat room created successfully' });
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