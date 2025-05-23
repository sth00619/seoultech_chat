import api from './api';

export const chatService = {
  // 채팅방 관련
  async getChatRooms(userId) {
    const response = await api.get(`/chat-rooms/user/${userId}`);
    return response.data;
  },

  async createChatRoom(userId, title) {
    const response = await api.post('/chat-rooms', { userId, title });
    return response.data;
  },

  async getChatRoom(chatRoomId) {
    const response = await api.get(`/chat-rooms/${chatRoomId}`);
    return response.data;
  },

  async updateChatRoomTitle(chatRoomId, title) {
    const response = await api.put(`/chat-rooms/${chatRoomId}`, { title });
    return response.data;
  },

  async deleteChatRoom(chatRoomId) {
    const response = await api.delete(`/chat-rooms/${chatRoomId}`);
    return response.data;
  },

  // 메시지 관련
  async getMessages(chatRoomId, limit = 100, offset = 0) {
    const response = await api.get(`/messages/chat-room/${chatRoomId}?limit=${limit}&offset=${offset}`);
    return response.data;
  },

  async sendMessage(chatRoomId, content) {
    const response = await api.post('/messages', {
      chat_room_id: chatRoomId,
      content
    });
    return response.data;
  },

  async deleteMessage(messageId) {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  }
};