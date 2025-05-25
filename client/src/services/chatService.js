import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

// API 인스턴스 생성
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 요청 인터셉터 (필요시 인증 토큰 추가)
api.interceptors.request.use(
  (config) => {
    // 필요시 여기에 인증 토큰 추가
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (에러 처리)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const chatService = {
  // 채팅방 관련
  async getChatRooms(userId) {
    try {
      const response = await api.get(`/chat-rooms/user/${userId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat rooms:', error);
      throw error;
    }
  },

  async createChatRoom(userId, title) {
    try {
      const response = await api.post('/chat-rooms', {
        userId,
        title: title || '새로운 채팅'
      });
      
      // 생성된 채팅방 정보 반환
      if (response.data.id) {
        // 생성된 채팅방의 전체 정보를 가져옴
        const chatRoom = await this.getChatRoom(response.data.id);
        return chatRoom;
      }
      
      return response.data;
    } catch (error) {
      console.error('Error creating chat room:', error);
      throw error;
    }
  },

  async getChatRoom(chatRoomId) {
    try {
      const response = await api.get(`/chat-rooms/${chatRoomId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching chat room:', error);
      throw error;
    }
  },

  async updateChatRoomTitle(chatRoomId, title) {
    try {
      const response = await api.put(`/chat-rooms/${chatRoomId}`, { title });
      return response.data;
    } catch (error) {
      console.error('Error updating chat room:', error);
      throw error;
    }
  },

  async deleteChatRoom(chatRoomId) {
    try {
      const response = await api.delete(`/chat-rooms/${chatRoomId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting chat room:', error);
      throw error;
    }
  },

  // 메시지 관련
  async getMessages(chatRoomId, limit = 100, offset = 0) {
    try {
      const response = await api.get(`/messages/chat-room/${chatRoomId}`, {
        params: { limit, offset }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  async sendMessage(chatRoomId, content) {
    try {
      const response = await api.post('/messages', {
        chat_room_id: chatRoomId,
        content: content.trim()
      });
      
      // 백엔드는 userMessage와 botMessage를 포함한 객체를 반환
      return response.data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  },

  async deleteMessage(messageId) {
    try {
      const response = await api.delete(`/messages/${messageId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  // 도움말 가져오기 (추가 기능)
  async getHelp() {
    try {
      const response = await api.get('/messages/help');
      return response.data;
    } catch (error) {
      console.error('Error getting help:', error);
      throw error;
    }
  }
};