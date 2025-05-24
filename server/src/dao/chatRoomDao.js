const pool = require('../config/database');

class ChatRoomDao {
  async getChatRoomsByUserId(userId) {
    const [rows] = await pool.query(
      'SELECT * FROM chat_rooms WHERE user_id = ? AND is_active = TRUE ORDER BY updated_at DESC',
      [userId]
    );
    return rows;
  }

  async getChatRoomById(id) {
    const [rows] = await pool.query('SELECT * FROM chat_rooms WHERE id = ?', [id]);
    return rows[0];
  }

  async createChatRoom(userId, title = '새로운 채팅') {
    const [result] = await pool.query(
      'INSERT INTO chat_rooms (user_id, title) VALUES (?, ?)',
      [userId, title]
    );
    return result.insertId;
  }

  async updateChatRoomTitle(id, title) {
    const [result] = await pool.query(
      'UPDATE chat_rooms SET title = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [title, id]
    );
    return result.affectedRows;
  }

  // 마지막 메시지 업데이트하는 새로운 메서드 추가
  async updateChatRoomLastMessage(id, lastMessage) {
    const [result] = await pool.query(
      'UPDATE chat_rooms SET last_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [lastMessage, id]
    );
    return result.affectedRows;
  }

  async deleteChatRoom(id) {
    const [result] = await pool.query(
      'UPDATE chat_rooms SET is_active = FALSE WHERE id = ?',
      [id]
    );
    return result.affectedRows;
  }
}

module.exports = new ChatRoomDao();