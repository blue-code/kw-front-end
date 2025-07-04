import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import logError from '../utils/errorHandler';

const AuthContext = createContext(null);
const API_BASE_PATH = '/api'; // package.json의 프록시 설정

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }, [token]);

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_PATH}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });
      const responseData = await response.json(); // 백엔드 응답 구조 {resultCode, resultMessage, data}

      if (responseData.resultCode === 0 && responseData.data?.user && responseData.data?.token) {
        setUser(responseData.data.user);
        setToken(responseData.data.token);
        console.log('Login successful for user:', responseData.data.user.username);
        setIsLoading(false);
        return true;
      } else {
        const errorMessage = responseData.resultMessage || '로그인에 실패했습니다.';
        logError('AuthContext.login.api', new Error(errorMessage), {
          username: credentials.username,
          resultCode: responseData.resultCode,
          responseMessage: responseData.resultMessage,
          status: response.status
        });
        setIsLoading(false);
        throw new Error(errorMessage);
      }
    } catch (error) {
      // fetch 자체가 실패했거나, 위에서 throw된 에러
      logError('AuthContext.login.catch', error, { username: credentials.username });
      setIsLoading(false);
      throw error; // LoginForm에서 UI에 표시할 수 있도록 에러를 다시 throw
    }
  };

  const logout = useCallback(async () => {
    setIsLoading(true);
    if (token) {
      try {
        // 서버에 로그아웃 요청은 보내지만, 응답 성공 여부와 관계없이 클라이언트는 로그아웃 처리
        const response = await fetch(`${API_BASE_PATH}/auth/logout`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
        });
        const responseData = await response.json().catch(() => ({})); // JSON 파싱 실패 대비

        if (responseData.resultCode !== 0) {
          logError('AuthContext.logout.api', new Error(responseData.resultMessage || 'Logout API request failed'), {
            resultCode: responseData.resultCode,
            status: response.status
          });
        }
      } catch (error) {
        logError('AuthContext.logout.catch', error);
      }
    }
    setUser(null);
    setToken(null);
    console.log('User logged out.');
    setIsLoading(false);
  }, [token]);

  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        setIsLoading(true);
        try {
          const response = await fetch(`${API_BASE_PATH}/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` },
          });
          const responseData = await response.json();

          if (responseData.resultCode === 0 && responseData.data?.user) {
            setUser(responseData.data.user);
            console.log('User session restored via /auth/me for:', responseData.data.user.username);
          } else {
            logError('AuthContext.verifyUser.api', new Error(responseData.resultMessage || 'Failed to verify token'), {
              resultCode: responseData.resultCode,
              status: response.status
            });
            setUser(null);
            setToken(null);
          }
        } catch (error) {
          logError('AuthContext.verifyUser.catch', error);
          setUser(null);
          setToken(null);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    verifyUser();
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
