import React, { useState } from 'react';
import { useBoard } from '../contexts/BoardContext';
import { useAuth } from '../contexts/AuthContext';
import logError from '../utils/errorHandler'; // errorHandler 임포트

const PostForm = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  // useBoard에서 setError를 가져와 Context 레벨의 오류를 표시할 수도 있습니다.
  // 여기서는 폼 자체의 유효성 검사 오류와 제출 오류를 위한 로컬 error 상태를 사용합니다.
  const { addPost, error: boardError, setError: setBoardError } = useBoard();
  const { user } = useAuth();
  const [formError, setFormError] = useState(''); // 폼 입력 관련 오류 메시지

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormError(''); // 이전 폼 오류 메시지 초기화
    setBoardError(null); // 이전 게시판 컨텍스트 오류 메시지 초기화

    if (!title.trim() || !content.trim()) {
      const errMsg = "제목과 내용을 모두 입력해주세요.";
      setFormError(errMsg);
      logError('PostForm.validation', new Error(errMsg), { title, content, author: user?.username });
      return;
    }

    try {
      // addPost는 내부적으로 오류를 로깅하고 BoardContext의 error 상태를 설정할 수 있음
      addPost({ title, content, author: user?.username || 'Unknown' });

      // addPost가 성공적으로 실행되면 (즉, 예외를 throw하지 않으면),
      // BoardContext의 error 상태를 확인하여 실제로 성공했는지 판단할 수 있습니다.
      // 하지만 addPost가 예외를 던지지 않고 내부적으로 error 상태만 설정하는 경우,
      // 여기서는 그 상태를 직접 확인할 방법이 BoardContext의 error를 통하는 것 외엔 없습니다.
      // 일반적으로 Context의 함수는 성공/실패 여부를 boolean으로 반환하거나 예외를 던지는 것이 좋습니다.
      // 현재 BoardContext.addPost는 예외 발생 시 내부적으로 setError만 하고 있어서,
      // 여기서 직접적인 성공/실패를 알기 어렵습니다.
      // 이 부분을 개선하려면 addPost가 boolean을 반환하거나 예외를 던지도록 수정해야 합니다.
      // 여기서는 addPost가 예외를 던지지 않는다고 가정하고, 성공적으로 제출된 것으로 간주합니다.

      setTitle('');
      setContent('');
      console.log('Post submitted successfully by user:', user?.username);
      // 성공 알림 (예: alert 또는 토스트 메시지)
      // alert('게시글이 성공적으로 작성되었습니다.');
    } catch (err) {
      // addPost 함수가 직접 예외를 던지는 경우에 대한 처리
      const errMsg = "게시글 작성 중 예기치 않은 오류가 발생했습니다.";
      setFormError(errMsg); // 이 오류는 폼 제출 자체의 문제일 수 있음
      logError('PostForm.handleSubmit.catch', err, { title, author: user?.username });
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>새 게시글 작성</h3>
      {/* 폼 자체 유효성 검사 또는 직접적인 제출 오류 */}
      {formError && <p style={{ color: 'red' }} role="alert">{formError}</p>}
      {/* BoardContext에서 발생한 오류 (예: localStorage 저장 실패 등) */}
      {boardError && <p style={{ color: 'red' }} role="alert">게시판 오류: {boardError}</p>}
      <div>
        <label htmlFor="post-title">제목:</label>
        <input
          type="text"
          id="post-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          aria-describedby={formError || boardError ? "post-form-error" : undefined}
        />
      </div>
      <div>
        <label htmlFor="post-content">내용:</label>
        <textarea
          id="post-content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          aria-describedby={formError || boardError ? "post-form-error" : undefined}
        />
      </div>
      <div id="post-form-error" style={{ display: 'none' }}>
        {/* 스크린 리더가 오류 메시지를 참조할 수 있도록 빈 div 제공 가능 */}
      </div>
      <button type="submit">글쓰기</button>
    </form>
  );
};

export default PostForm;
