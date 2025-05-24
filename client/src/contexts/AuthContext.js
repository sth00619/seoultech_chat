import React, { createContext, useReducer, useEffect, useCallback } from 'react';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload, loading: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false };
    default:
      return state;
  }
};

// 가짜 사용자 정보 (테스트용) - 컴포넌트 외부에 정의하여 재생성 방지
const mockUser = {
  id: 1,
  email: 'test@seoultech.ac.kr',
  username: '테스트사용자',
  created_at: new Date().toISOString()
};

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true, // 초기에는 로딩 상태
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // 컴포넌트 마운트 시 한 번만 실행
    const initAuth = () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      // 짧은 지연 후 자동 로그인 (실제 앱처럼 보이게 하기 위함)
      setTimeout(() => {
        dispatch({ type: 'SET_USER', payload: mockUser });
      }, 500);
    };

    initAuth();
  }, []); // 빈 의존성 배열로 한 번만 실행

  // 모든 인증 관련 함수들을 useCallback으로 메모이제이션
  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // 실제 로그인 대신 가짜 성공 처리
      await new Promise(resolve => setTimeout(resolve, 300));
      dispatch({ type: 'SET_USER', payload: mockUser });
      return { user: mockUser };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '로그인에 실패했습니다.' });
      throw error;
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      // 실제 회원가입 대신 가짜 성공 처리
      await new Promise(resolve => setTimeout(resolve, 300));
      dispatch({ type: 'SET_LOADING', payload: false });
      return { message: 'Registration successful' };
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: '회원가입에 실패했습니다.' });
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    // 로그아웃해도 다시 자동 로그인 (테스트 모드이므로)
    dispatch({ type: 'LOGOUT' });
    setTimeout(() => {
      dispatch({ type: 'SET_USER', payload: mockUser });
    }, 100);
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };