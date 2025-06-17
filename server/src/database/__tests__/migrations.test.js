const pool = require('../../config/database');
const fs = require('fs').promises;
const path = require('path');

describe('Database Migrations', () => {
  beforeAll(async () => {
    // 테스트 DB 연결
    process.env.DB_NAME = 'api_test_migrations';
  });

  afterAll(async () => {
    await pool.end();
  });

  it('모든 테이블이 올바르게 생성되어야 함', async () => {
    // 스키마 파일 실행
    const schema = await fs.readFile(
      path.join(__dirname, '../../../../database/schema.sql'),
      'utf8'
    );

    // 각 쿼리 실행
    const queries = schema.split(';').filter(q => q.trim());
    for (const query of queries) {
      if (query.trim()) {
        await pool.query(query);
      }
    }

    // 테이블 존재 확인
    const [tables] = await pool.query('SHOW TABLES');
    const tableNames = tables.map(t => Object.values(t)[0]);

    expect(tableNames).toContain('users');
    expect(tableNames).toContain('chat_rooms');
    expect(tableNames).toContain('messages');
    expect(tableNames).toContain('knowledge_base');
  });

  it('users 테이블 구조가 올바른지 확인', async () => {
    const [columns] = await pool.query('DESCRIBE users');
    const columnNames = columns.map(c => c.Field);

    expect(columnNames).toContain('id');
    expect(columnNames).toContain('email');
    expect(columnNames).toContain('username');
    expect(columnNames).toContain('password');
    expect(columnNames).toContain('created_at');
  });
});

<client/src/services/__tests__/chatService.test.js>

import axios from 'axios';
import { chatService } from '../chatService';

jest.mock('axios');

describe('ChatService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.setItem('token', 'fake-token');
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getChatRooms', () => {
    it('사용자의 채팅방 목록을 가져와야 함', async () => {
      const mockChatRooms = [
        { id: 1, title: '채팅방 1', user_id: 1 },
        { id: 2, title: '채팅방 2', user_id: 1 }
      ];

      axios.create.mockReturnValue({
        get: jest.fn().mockResolvedValue({ data: mockChatRooms })
      });

      const result = await chatService.getChatRooms(1);

      expect(result).toEqual(mockChatRooms);
    });
  });

  describe('sendMessage', () => {
    it('메시지를 전송하고 응답을 받아야 함', async () => {
      const mockResponse = {
        userMessage: { id: 1, content: 'Hello', role: 'user' },
        botMessage: { id: 2, content: 'Hi there!', role: 'bot' }
      };

      axios.create.mockReturnValue({
        post: jest.fn().mockResolvedValue({ data: mockResponse })
      });

      const result = await chatService.sendMessage(1, 'Hello');

      expect(result).toEqual(mockResponse);
    });
  });
});
