
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