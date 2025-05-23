import React, { createContext, useReducer, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload, isAuthenticated: !!action.payload };
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

  useEffect(() => {
    const initAuth = () => {
      const user = authService.getCurrentUser();
      const isAuthenticated = authService.isAuthenticated();
      
      if (user && isAuthenticated) {
        dispatch({ type: 'SET_USER', payload: user });
      }
      dispatch({ type: 'SET_LOADING', payload: false });
    };

    initAuth();
  }, []);

  const login = async (email, password) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await authService.login(email, password);
      dispatch({ type: 'SET_USER', payload: result.user });
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message || '로그인에 실패했습니다.' });
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const result = await authService.register(userData);
      dispatch({ type: 'SET_LOADING', payload: false });
      return result;
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error.message || '회원가입에 실패했습니다.' });
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

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