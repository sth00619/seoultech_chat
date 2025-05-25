import api from './api';

export const chatService = {
  // 채팅방 관련
  async getChatRooms(userId) {
    try {
      const response = await api.get(`/chat-rooms/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get chat rooms:', error);
      // 에러 시 빈 배열 반환
      return [];
    }
  },

  async createChatRoom(userId, title) {
    try {
      const response = await api.post('/chat-rooms', { userId, title });
      const chatRoomId = response.data.id;
      
      // 서버에서 자동으로 환영 메시지를 생성하므로 추가 작업 불필요
      const newChatRoom = {
        id: chatRoomId,
        user_id: userId,
        title: title || '새로운 채팅',
        last_message: '안녕하세요! 서울과학기술대학교 AI 챗봇입니다.',
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      return newChatRoom;
    } catch (error) {
      console.error('Failed to create chat room:', error);
      throw error;
    }
  },

  async getChatRoom(chatRoomId) {
    try {
      const response = await api.get(`/chat-rooms/${chatRoomId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get chat room:', error);
      throw error;
    }
  },

  async updateChatRoomTitle(chatRoomId, title) {
    try {
      const response = await api.put(`/chat-rooms/${chatRoomId}`, { title });
      return response.data;
    } catch (error) {
      console.error('Failed to update chat room title:', error);
      throw error;
    }
  },

  async deleteChatRoom(chatRoomId) {
    try {
      const response = await api.delete(`/chat-rooms/${chatRoomId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete chat room:', error);
      throw error;
    }
  },

  // 메시지 관련
  async getMessages(chatRoomId, limit = 100, offset = 0) {
    try {
      const response = await api.get(`/messages/chat-room/${chatRoomId}?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get messages:', error);
      // 에러 시 빈 배열 반환
      return [];
    }
  },

  async sendMessage(chatRoomId, content) {
    try {
      const response = await api.post('/messages', {
        chat_room_id: chatRoomId,
        content
      });
      return response.data;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },

  async deleteMessage(messageId) {
    try {
      const response = await api.delete(`/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete message:', error);
      throw error;
    }
  },

  // 챗봇 테스트 (개발용)
  async testChatbot(message) {
    try {
      const response = await api.post('/messages/test-chatbot', { message });
      return response.data;
    } catch (error) {
      console.error('Failed to test chatbot:', error);
      throw error;
    }
  },

  // 지식베이스 관리 (관리자용)
  async getKnowledgeBase(category = null) {
    try {
      const params = category ? { category } : {};
      const response = await api.get('/messages/knowledge', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to get knowledge base:', error);
      return [];
    }
  },

  async addKnowledge(knowledgeData) {
    try {
      const response = await api.post('/messages/knowledge', knowledgeData);
      return response.data;
    } catch (error) {
      console.error('Failed to add knowledge:', error);
      throw error;
    }
  },

  async updateKnowledge(id, knowledgeData) {
    try {
      const response = await api.put(`/messages/knowledge/${id}`, knowledgeData);
      return response.data;
    } catch (error) {
      console.error('Failed to update knowledge:', error);
      throw error;
    }
  },

  // 채팅 분석 데이터 (관리자용)
  async getChatAnalytics(limit = 100, offset = 0) {
    try {
      const response = await api.get(`/messages/analytics?limit=${limit}&offset=${offset}`);
      return response.data;
    } catch (error) {
      console.error('Failed to get chat analytics:', error);
      return [];
    }
  }
};