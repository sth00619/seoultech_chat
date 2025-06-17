const request = require('supertest');
const app = require('../../../app');
const pool = require('../../config/database');

describe('API 통합 테스트', () => {
  let server;
  let testUser;

  beforeAll(async () => {
    // 테스트 DB 연결
    await pool.query('DELETE FROM messages');
    await pool.query('DELETE FROM chat_rooms');
    await pool.query('DELETE FROM users');

    server = app.listen(4000);
  });

  afterAll(async () => {
    await server.close();
    await pool.end();
  });

  describe('인증 플로우', () => {
    it('회원가입 -> 로그인 -> 채팅방 생성 전체 플로우', async () => {
      // 1. 회원가입
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'integration@test.com',
          username: 'integrationtest',
          password: 'password123'
        });

      expect(registerRes.status).toBe(201);
      testUser = registerRes.body;

      // 2. 로그인
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'integration@test.com',
          password: 'password123'
        });

      expect(loginRes.status).toBe(200);
      const { token } = loginRes.body;

      // 3. 채팅방 생성
      const chatRoomRes = await request(app)
        .post('/api/chat-rooms')
        .set('Authorization', Bearer ${token})
        .send({
          userId: testUser.user.id,
          title: '테스트 채팅방'
        });

      expect(chatRoomRes.status).toBe(201);
      expect(chatRoomRes.body.title).toBe('테스트 채팅방');
    });
  });
});