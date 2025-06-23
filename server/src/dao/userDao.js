const pool = require('../config/database');

class UserDao {
  async getAllUsers() {
    const [rows] = await pool.query('SELECT * FROM users');
    return rows;
  }

  async getUserById(id) {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
    return rows[0];
  }

  async getUserByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  }

  async getUserByOAuth(provider, oauthId) {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE oauth_provider = ? AND oauth_id = ?',
      [provider, oauthId]
    );
    return rows[0];
  }  

  async createUser(userData) {
    const { email, username, password_hash } = userData;
    const [result] = await pool.query(
      'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
      [email, username, password_hash]
    );
    return result.insertId;
  }

  async updateUser(id, userData) {
    const { username, email } = userData;
    const [result] = await pool.query(
      'UPDATE users SET username = ?, email = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [username, email, id]
    );
    return result.affectedRows;
  }

  async updatePassword(id, hashedPassword) {
    const [result] = await pool.query(
      'UPDATE users SET password = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [hashedPassword, id]
    );
    return result.affectedRows;
  }

  async updateOAuthInfo(id, provider, oauthId) {
    const [result] = await pool.query(
      'UPDATE users SET oauth_provider = ?, oauth_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [provider, oauthId, id]
    );
    return result.affectedRows;
  }

  async deleteUser(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows;
  }
}

module.exports = new UserDao();