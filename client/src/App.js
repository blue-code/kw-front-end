import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Link, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import LoginForm from './components/LoginForm';
import BoardPage from './pages/BoardPage'; // BoardPage 임포트
import './App.css';

// 로그인 페이지 컴포넌트
const LoginPage = () => {
  const { user } = useAuth();
  // 이미 로그인한 사용자는 메인 페이지로 리다이렉트
  if (user) {
    console.log("User already logged in, redirecting to home.");
    return <Navigate to="/" replace />;
  }
  return <LoginForm />;
};

// 보호된 라우트 컴포넌트
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    console.warn('Attempted to access protected route without authentication. Redirecting to login.');
    // 사용자가 로그인하지 않았으면 로그인 페이지로 리다이렉트
    // `replace` 옵션은 히스토리 스택에서 현재 경로를 대체하여 뒤로가기 시 로그인 페이지로 돌아오지 않도록 함
    return <Navigate to="/login" replace />;
  }
  return children;
};

// 네비게이션 및 레이아웃을 포함하는 기본 레이아웃 컴포넌트
const Layout = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    try {
      logout();
      // ProtectedRoute에 의해 자동으로 /login으로 리다이렉트 될 것입니다.
      // 또는 명시적으로 navigate('/login')을 호출할 수도 있습니다 (useNavigate 사용 시).
    } catch (error) {
      console.error('Logout error:', error);
      // logErrorToFile('Logout error', error.toString());
    }
  };

  return (
    <>
      <nav>
        <ul>
          <li><Link to="/">홈</Link></li>
          {user && <li><Link to="/board">게시판</Link></li>}
          {!user && <li><Link to="/login">로그인</Link></li>}
          {user && <li><button onClick={handleLogout}>로그아웃</button></li>}
        </ul>
      </nav>
      <hr />
      <main>
        <Outlet /> {/* 중첩된 라우트의 컴포넌트가 여기에 렌더링됩니다. */}
      </main>
    </>
  );
};

// // 개념적인 파일 로깅 함수
// const logErrorToFile = (message, details) => {
//   console.error(`[FILE_LOG] ${message} ${details}`);
// };

// App 컴포넌트: 라우터 설정 및 전역 Provider 설정
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route element={<Layout />}> {/* 공통 레이아웃 적용 */}
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/board/*" // '/board'와 그 하위 모든 경로를 BoardPage에서 처리하도록 변경
              element={
                <ProtectedRoute>
                  <BoardPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <div>
                    <h1>메인 페이지</h1>
                    <p>환영합니다! 이 페이지는 로그인이 필요한 페이지입니다.</p>
                    {/* useAuth를 Layout 내부에서 호출했으므로 여기서는 직접 user 사용 불가. 필요시 Prop으로 넘기거나 Layout에서 처리 */}
                  </div>
                </ProtectedRoute>
              }
            />
          </Route>
          {/* Layout을 사용하지 않는 다른 최상위 라우트가 있다면 여기에 추가 */}
          <Route path="*" element={<Navigate to="/" replace />} /> {/* 일치하는 라우트가 없을 경우 홈으로 리다이렉트 */}
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
