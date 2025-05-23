export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  CHAT: '/chat',
  PROFILE: '/profile',
  USERS: '/users',
  USER_MANAGEMENT: '/admin/users'
};

export const CHAT_ROLES = {
  USER: 'user',
  BOT: 'bot'
};

export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

export const MESSAGES = {
  LOGIN_SUCCESS: '로그인에 성공했습니다.',
  LOGIN_FAILED: '로그인에 실패했습니다.',
  LOGOUT_SUCCESS: '로그아웃되었습니다.',
  REGISTER_SUCCESS: '회원가입이 완료되었습니다.',
  REGISTER_FAILED: '회원가입에 실패했습니다.',
  MESSAGE_SEND_FAILED: '메시지 전송에 실패했습니다.',
  NETWORK_ERROR: '네트워크 오류가 발생했습니다.'
};