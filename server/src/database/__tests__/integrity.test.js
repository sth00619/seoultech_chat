const pool = require('../../config/database');

describe('Database Integrity', () => {
  let userId, chatRoomId;

  beforeAll(async () => {
    // 테스트 데이터 정리
    await pool.query('DELETE FROM messages');
    await pool.query('DELETE FROM chat_rooms');
    await pool.query('DELETE FROM users WHERE email LIKE "%@test.com"');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('CASCADE DELETE가 올바르게 작동해야 함', async () => {
    // 1. 사용자 생성
    const [userResult] = await pool.query(
      'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
      ['cascade@test.com', 'cascadetest', 'password']
    );
    userId = userResult.insertId;

    // 2. 채팅방 생성
    const [chatRoomResult] = await pool.query(
      'INSERT INTO chat_rooms (user_id, title) VALUES (?, ?)',
      [userId, 'Test Room']
    );
    chatRoomId = chatRoomResult.insertId;

    // 3. 메시지 생성
    await pool.query(
      'INSERT INTO messages (chat_room_id, role, content) VALUES (?, ?, ?)',
      [chatRoomId, 'user', 'Test message']
    );

    // 4. 채팅방 삭제 시 메시지도 삭제되는지 확인
    await pool.query('DELETE FROM chat_rooms WHERE id = ?', [chatRoomId]);
   
    const [messages] = await pool.query(
      'SELECT * FROM messages WHERE chat_room_id = ?',
      [chatRoomId]
    );
   
    expect(messages.length).toBe(0);
  });

  it('UNIQUE 제약조건이 작동해야 함', async () => {
    await expect(async () => {
      await pool.query(
        'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
        ['duplicate@test.com', 'user1', 'password']
      );
     
      await pool.query(
        'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
        ['duplicate@test.com', 'user2', 'password']
      );
    }).rejects.toThrow();
  });
});
