import React from 'react';
import { Routes, Route, Link, Outlet, useNavigate } from 'react-router-dom';
import PostList from '../components/PostList';
import PostForm from '../components/PostForm';
import PostDetail from '../components/PostDetail';
import { BoardProvider } from '../contexts/BoardContext';
import { useAuth } from '../contexts/AuthContext';
import logError from '../utils/errorHandler'; // errorHandler 임포트

const BoardLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      logout(); // AuthContext의 logout은 내부적으로 오류 로깅 가능
      // ProtectedRoute에 의해 /login으로 리다이렉트되지만, 명시적으로 navigate도 가능
      navigate('/login');
      console.log('User logged out from BoardPage.');
    } catch (error) {
      // AuthContext.logout에서 처리하지 못한 예외가 있다면 여기서 로깅
      logError('BoardLayout.handleLogout', error);
      // 사용자에게 오류 알림 (예: alert)
      alert('로그아웃 중 오류가 발생했습니다. 문제가 지속되면 관리자에게 문의하세요.');
    }
  };

  return (
    // BoardProvider는 게시판 관련 상태와 함수를 제공하며, 내부적으로 오류를 처리하고 로깅할 수 있습니다.
    // BoardProvider 자체에서 발생하는 초기화 오류 등은 ErrorBoundary에서 처리될 수 있습니다.
    <BoardProvider>
      <div>
        <h1>게시판</h1>
        <p>환영합니다, {user?.username || '방문자'} 님!</p>
        <nav>
          <Link to="">게시글 목록</Link> | {" "} {/* 상대 경로 사용 /board/ */}
          <Link to="new">새 글 작성</Link> | {" "} {/* 상대 경로 사용 /board/new */}
          <button onClick={handleLogout}>로그아웃</button>
        </nav>
        <hr />
        {/* Outlet을 통해 중첩된 라우트(PostList, PostForm, PostDetail)가 렌더링됩니다.
            이들 컴포넌트 내부의 오류는 각 컴포넌트 또는 BoardContext에서 처리됩니다. */}
        <Outlet />
      </div>
    </BoardProvider>
  );
};

// BoardPage는 BoardLayout 내에서 중첩된 라우트를 관리합니다.
// BoardPage 자체는 주로 라우팅 구조를 정의하므로,
// 직접적인 오류 처리 로직보다는 하위 컴포넌트나 Context의 오류 처리에 의존합니다.
const BoardPage = () => {
  // 이 컴포넌트가 마운트될 때 또는 특정 작업 수행 시 오류가 발생한다면 try...catch와 logError 사용 가능
  // 예: useEffect(() => { try { /* 작업 */ } catch(e) { logError('BoardPage.effect', e); } }, []);

  return (
    <Routes>
      {/* path="/"는 BoardPage가 렌더링되는 기본 경로 (/board)에 대한 BoardLayout을 의미합니다. */}
      <Route path="/" element={<BoardLayout />}>
        {/* index는 부모 라우트의 경로와 정확히 일치할 때 (즉, /board) 렌더링됩니다. */}
        <Route index element={<PostList />} />
        {/* "new"는 /board/new 경로에 해당합니다. */}
        <Route path="new" element={<PostForm />} />
        {/* ":postId"는 /board/어떤ID 형태의 동적 경로에 해당합니다. */}
        <Route path=":postId" element={<PostDetail />} />
        {/* /board 하위의 다른 경로가 필요하다면 여기에 추가 */}
      </Route>
    </Routes>
  );
};

export default BoardPage;
