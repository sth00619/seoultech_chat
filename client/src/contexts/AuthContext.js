import React, { createContext, useReducer, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

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

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // 앱 시작시 로컬스토리지에서 사용자 정보 확인
  useEffect(() => {
    const checkAuth = () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const savedUser = authService.getCurrentUser();
      const isAuth = authService.isAuthenticated();
      
      if (savedUser && isAuth) {
        dispatch({ type: 'SET_USER', payload: savedUser });
      } else {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    checkAuth();
  }, []);

  // 로그인
  const login = useCallback(async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await authService.login(email, password);
      
      if (response.user) {
        dispatch({ type: 'SET_USER', payload: response.user });
        return { user: response.user };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || '로그인에 실패했습니다.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // 회원가입
  const register = useCallback(async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      dispatch({ type: 'CLEAR_ERROR' });
      
      const response = await authService.register(userData);
      dispatch({ type: 'SET_LOADING', payload: false });
      
      return response;
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || '회원가입에 실패했습니다.';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    }
  }, []);

  // 로그아웃
  const logout = useCallback(() => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
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