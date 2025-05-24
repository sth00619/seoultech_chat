// Mock 데이터로 작동하는 챗봇 서비스
let mockChatRooms = [];

let mockMessages = [];

let nextChatRoomId = 1;
let nextMessageId = 1;

// AI 응답 생성 함수
const generateBotResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('안녕') || lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
    return `안녕하세요! 서울과학기술대학교 AI 챗봇입니다. 무엇을 도와드릴까요? 😊`;
  }
  
  if (lowerMessage.includes('학교') || lowerMessage.includes('서울과기대') || lowerMessage.includes('seoultech')) {
    return `서울과학기술대학교는 1910년에 설립된 국립 기술대학교입니다. 실용적인 기술 교육을 중시하며, 공학, IT, 디자인 등 다양한 분야에서 우수한 교육을 제공하고 있습니다. 구체적으로 어떤 것이 궁금하신가요?`;
  }
  
  if (lowerMessage.includes('전공') || lowerMessage.includes('학과')) {
    return `서울과학기술대학교에는 다양한 전공이 있습니다:\n\n• 공과대학: 기계공학과, 전기정보공학과, 컴퓨터공학과 등\n• IT대학: 컴퓨터공학과, 전자IT미디어공학과 등\n• 조형대학: 디자인학과, 도예학과 등\n• 인문사회대학: 영어영문학과, 행정학과 등\n\n어떤 전공에 대해 더 자세히 알고 싶으신가요?`;
  }
  
  if (lowerMessage.includes('취업') || lowerMessage.includes('진로') || lowerMessage.includes('career')) {
    return `서울과학기술대학교는 높은 취업률을 자랑합니다! 💼\n\n주요 진로 지원:\n• 산학협력을 통한 현장실습\n• 다양한 기업과의 채용연계 프로그램\n• 창업지원센터 운영\n• 취업박람회 정기 개최\n\n구체적인 전공별 취업 정보가 궁금하시면 말씀해 주세요!`;
  }
  
  if (lowerMessage.includes('입학') || lowerMessage.includes('admission')) {
    return `서울과학기술대학교 입학 정보를 안내해드릴게요! 📚\n\n주요 전형:\n• 수시모집: 학생부종합전형, 학생부교과전형\n• 정시모집: 수능 성적 반영\n• 특별전형: 특성화고교졸업자, 농어촌학생 등\n\n자세한 입학 정보는 대학 홈페이지에서 확인하실 수 있습니다.`;
  }
  
  if (lowerMessage.includes('도움') || lowerMessage.includes('help')) {
    return `저는 서울과학기술대학교에 대한 다양한 정보를 제공해드릴 수 있습니다! 🎓\n\n• 학교 소개 및 역사\n• 전공/학과 정보\n• 취업 및 진로 안내\n• 입학 정보\n• 캠퍼스 생활\n• 장학금 및 복지\n\n궁금한 것이 있으면 언제든 물어보세요!`;
  }

  if (lowerMessage.includes('캠퍼스') || lowerMessage.includes('campus')) {
    return `서울과학기술대학교 캠퍼스 정보입니다! 🏫\n\n📍 위치: 서울특별시 노원구 공릉로 232\n🚇 교통: 7호선 공릉역 1번 출구 도보 5분\n\n주요 시설:\n• 중앙도서관\n• 학생회관\n• 체육관 및 수영장\n• 기숙사 (생활관)\n• 각종 연구소 및 실험실\n\n아름다운 캠퍼스에서 즐거운 대학생활을 보내실 수 있습니다!`;
  }
  
  // 기본 응답들
  const responses = [
    `"${userMessage}"에 대해 더 자세히 알려드릴게요! 서울과학기술대학교 관련 질문이시라면 구체적으로 말씀해 주세요.`,
    `흥미로운 질문이네요! "${userMessage}"와 관련하여 서울과학기술대학교의 어떤 정보가 궁금하신지 알려주시면 더 정확한 답변을 드릴 수 있습니다.`,
    `좋은 질문입니다! "${userMessage}"에 대해 도움을 드리고 싶습니다. 학교, 전공, 취업, 입학 등 어떤 분야에 대한 질문인지 좀 더 구체적으로 말씀해 주세요.`,
    `"${userMessage}"에 대한 답변을 준비했습니다! 서울과학기술대학교에서 제공하는 다양한 정보 중 어떤 것이 가장 궁금하신가요?`
  ];
  
  return responses[Math.floor(Math.random() * responses.length)];
};

export const chatService = {
  // 채팅방 관련
  async getChatRooms(userId) {
    // 약간의 지연으로 실제 API 호출처럼 보이게 함
    await new Promise(resolve => setTimeout(resolve, 300));
    return mockChatRooms.filter(room => room.user_id === userId);
  },

  async createChatRoom(userId, title) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newRoom = {
      id: nextChatRoomId++,
      user_id: userId,
      title: title || '새로운 채팅',
      last_message: null,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockChatRooms.unshift(newRoom);
    
    // 새 채팅방에 환영 메시지 자동 추가
    const welcomeMessage = {
      id: nextMessageId++,
      chat_room_id: newRoom.id,
      role: 'bot',
      content: '안녕하세요! 서울과학기술대학교 AI 챗봇입니다. 🎓\n\n학교에 대한 궁금한 점이 있으시면 언제든 물어보세요!\n\n• 학과 및 전공 정보\n• 입학 및 진학 상담\n• 취업 및 진로 안내\n• 캠퍼스 생활 정보\n\n어떤 것이 궁금하신가요?',
      message_order: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockMessages.push(welcomeMessage);
    
    // 채팅방의 마지막 메시지 업데이트
    newRoom.last_message = '안녕하세요! 서울과학기술대학교 AI 챗봇입니다. 🎓';
    
    return newRoom;
  },

  async getChatRoom(chatRoomId) {
    await new Promise(resolve => setTimeout(resolve, 100));
    return mockChatRooms.find(room => room.id === chatRoomId);
  },

  async updateChatRoomTitle(chatRoomId, title) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const room = mockChatRooms.find(room => room.id === chatRoomId);
    if (room) {
      room.title = title;
      room.updated_at = new Date().toISOString();
    }
    return room;
  },

  async deleteChatRoom(chatRoomId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = mockChatRooms.findIndex(room => room.id === chatRoomId);
    if (index > -1) {
      mockChatRooms.splice(index, 1);
    }
    // 해당 채팅방의 메시지들도 삭제
    mockMessages = mockMessages.filter(msg => msg.chat_room_id !== chatRoomId);
    return true;
  },

  // 메시지 관련
  async getMessages(chatRoomId, limit = 100, offset = 0) {
    await new Promise(resolve => setTimeout(resolve, 200));
    return mockMessages
      .filter(msg => msg.chat_room_id === chatRoomId)
      .slice(offset, offset + limit);
  },

  async sendMessage(chatRoomId, content) {
    await new Promise(resolve => setTimeout(resolve, 400)); // 조금 더 긴 지연으로 AI 생각하는 시간 시뮬레이션
    
    // 사용자 메시지 생성
    const userMessage = {
      id: nextMessageId++,
      chat_room_id: chatRoomId,
      role: 'user',
      content: content.trim(),
      message_order: mockMessages.filter(msg => msg.chat_room_id === chatRoomId).length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockMessages.push(userMessage);

    // AI 응답 생성
    const botResponse = generateBotResponse(content);
    const botMessage = {
      id: nextMessageId++,
      chat_room_id: chatRoomId,
      role: 'bot',
      content: botResponse,
      message_order: mockMessages.filter(msg => msg.chat_room_id === chatRoomId).length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    mockMessages.push(botMessage);

    // 채팅방의 마지막 메시지 업데이트
    const room = mockChatRooms.find(room => room.id === chatRoomId);
    if (room) {
      room.last_message = botResponse.length > 50 ? botResponse.substring(0, 50) + '...' : botResponse;
      room.updated_at = new Date().toISOString();
    }

    return {
      userMessage,
      botMessage
    };
  },

  async deleteMessage(messageId) {
    await new Promise(resolve => setTimeout(resolve, 200));
    const index = mockMessages.findIndex(msg => msg.id === messageId);
    if (index > -1) {
      mockMessages.splice(index, 1);
    }
    return true;
  }
};