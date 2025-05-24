const pool = require('../config/database');

class MessageDao {
  async getMessagesByChatRoomId(chatRoomId, limit = 100, offset = 0) {
    const [rows] = await pool.query(
      `SELECT * FROM messages 
       WHERE chat_room_id = ? 
       ORDER BY message_order ASC, created_at ASC 
       LIMIT ? OFFSET ?`,
      [chatRoomId, limit, offset]
    );
    return rows;
  }

  async getMessageById(id) {
    const [rows] = await pool.query('SELECT * FROM messages WHERE id = ?', [id]);
    return rows[0];
  }

  async createMessage(messageData) {
    const { chat_room_id, role, content } = messageData;
    
    const [orderResult] = await pool.query(
      'SELECT COALESCE(MAX(message_order), 0) + 1 as next_order FROM messages WHERE chat_room_id = ?',
      [chat_room_id]
    );
    const message_order = orderResult[0].next_order;

    const [result] = await pool.query(
      'INSERT INTO messages (chat_room_id, role, content, message_order) VALUES (?, ?, ?, ?)',
      [chat_room_id, role, content, message_order]
    );
    
    return result.insertId;
  }

  async deleteMessage(id) {
    const [result] = await pool.query('DELETE FROM messages WHERE id = ?', [id]);
    return result.affectedRows;
  }

  async getMessageCount(chatRoomId) {
    const [rows] = await pool.query(
      'SELECT COUNT(*) as count FROM messages WHERE chat_room_id = ?',
      [chatRoomId]
    );
    return rows[0].count;
  }
}

module.exports = new MessageDao();