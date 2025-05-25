const BaseDao = require("./baseDao");

class ChatMessageDao extends BaseDao {
  constructor(body) {
    super(body);
    this.body = body;
  }

  // 채팅방의 메시지 목록 조회
  async getMessagesByChatRoomId(chatRoomId, limit = 100, offset = 0) {
    try {
      this.query = `
        SELECT * FROM messages 
        WHERE chat_room_id = :chatRoomId 
        ORDER BY message_order ASC, created_at ASC 
        LIMIT :limit OFFSET :offset
      `;

      this.param = {
        chatRoomId,
        limit,
        offset
      };

      return await this.selectQuery();
    } catch (err) {
      throw err;
    }
  }

  // 특정 메시지 조회
  async getMessageById(id) {
    try {
      this.query = 'SELECT * FROM messages WHERE id = :id';
      
      this.param = {
        id
      };

      const result = await this.selectQuery();
      return result && result.length > 0 ? result[0] : null;
    } catch (err) {
      throw err;
    }
  }

  // 새 메시지 생성
  async createMessage(messageData) {
    try {
      const { chat_room_id, role, content } = messageData;
      
      // 메시지 순서 조회
      this.query = `
        SELECT COALESCE(MAX(message_order), 0) + 1 as next_order 
        FROM messages WHERE chat_room_id = :chat_room_id
      `;
      
      this.param = {
        chat_room_id
      };

      const orderResult = await this.selectQuery();
      const message_order = orderResult[0].next_order;

      // 메시지 삽입
      this.query = `
        INSERT INTO messages (chat_room_id, role, content, message_order) 
        VALUES (:chat_room_id, :role, :content, :message_order)
      `;

      this.param = {
        chat_room_id,
        role,
        content,
        message_order
      };

      const result = await this.insertQuery();
      return result.insertId;
    } catch (err) {
      throw err;
    }
  }

  // 메시지 삭제
  async deleteMessage(id) {
    try {
      this.query = 'DELETE FROM messages WHERE id = :id';
      
      this.param = {
        id
      };

      return await this.deleteQuery();
    } catch (err) {
      throw err;
    }
  }

  // 채팅방의 메시지 수 조회
  async getMessageCount(chatRoomId) {
    try {
      this.query = `
        SELECT COUNT(*) as count FROM messages WHERE chat_room_id = :chatRoomId
      `;

      this.param = {
        chatRoomId
      };

      const result = await this.selectQuery();
      return result && result.length > 0 ? result[0].count : 0;
    } catch (err) {
      throw err;
    }
  }
}

module.exports = ChatMessageDao;