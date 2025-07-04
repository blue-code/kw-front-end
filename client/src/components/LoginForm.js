import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import logError from '../utils/errorHandler'; // errorHandler 임포트

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // UI에 표시될 사용자 친화적 오류 메시지
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // 이전 오류 메시지 초기화

    if (!username.trim() || !password.trim()) {
      const errMsg = "사용자 이름과 비밀번호를 모두 입력해주세요.";
      setError(errMsg);
      logError('LoginForm.validation', new Error(errMsg), { username });
      return;
    }

    try {
      const success = login({ username, password }); // AuthContext의 login 함수는 내부적으로 오류 로깅 수행
      if (success) {
        navigate('/'); // 로그인 성공 시 메인 페이지로 이동
      } else {
        // AuthContext.login에서 이미 실패를 로깅했으므로, 여기서는 UI용 메시지만 설정
        setError('로그인 실패. 아이디 또는 비밀번호를 확인하세요.');
        // 추가적인 로깅이 필요하다면 여기서도 logError 호출 가능
        // logError('LoginForm.handleSubmit', new Error('Login attempt failed by AuthContext'), { username });
      }
    } catch (err) {
      // login 함수 자체가 예외를 던지는 경우 (예: AuthContext 내부의 예기치 않은 문제)
      const errMsg = '로그인 처리 중 예기치 않은 오류가 발생했습니다.';
      setError(errMsg);
      logError('LoginForm.handleSubmit.catch', err, { username });
    }
  };

  return (
    <div>
      <h2>로그인</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">사용자 이름:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>
        <div>
          <label htmlFor="password">비밀번호:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>
        {error && <p id="login-error" style={{ color: 'red' }} role="alert">{error}</p>}
        <button type="submit">로그인</button>
      </form>
    </div>
  );
};

export default LoginForm;
