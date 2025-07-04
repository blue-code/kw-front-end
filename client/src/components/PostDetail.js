import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBoard } from '../contexts/BoardContext';
import logError from '../utils/errorHandler'; // errorHandler 임포트

const PostDetail = () => {
  const { postId } = useParams();
  // BoardContext에서 getPost 함수와 Context 레벨의 error, setError를 가져옴
  const { getPost, error: boardContextError, setError: setBoardContextError } = useBoard();
  const [post, setPost] = useState(null);
  const [componentError, setComponentError] = useState(''); // 이 컴포넌트의 특정 오류 메시지

  useEffect(() => {
    setComponentError(''); // 이전 컴포넌트 오류 초기화
    setBoardContextError(null); // 이전 컨텍스트 오류 초기화 (필요하다면)

    try {
      const fetchedPost = getPost(postId); // getPost는 내부적으로 오류를 로깅할 수 있음
      if (fetchedPost) {
        setPost(fetchedPost);
      } else {
        // getPost가 null을 반환하면 (게시글을 찾지 못했거나, ID 형식이 잘못된 경우 등)
        const errMsg = `ID가 '${postId}'인 게시글을 찾을 수 없습니다. 목록으로 돌아가세요.`;
        setComponentError(errMsg);
        // getPost 내부에서 이미 로깅했을 수 있지만, 여기서 추가 컨텍스트와 함께 로깅 가능
        logError('PostDetail.useEffect', new Error('Post not found by getPost'), { postId });
      }
    } catch (err) {
      // getPost 함수 자체가 예외를 던지는 경우 (예: BoardContext 내부의 예기치 않은 문제)
      const errMsg = "게시글 상세 정보를 불러오는 중 예기치 않은 오류가 발생했습니다.";
      setComponentError(errMsg);
      logError('PostDetail.useEffect.catch', err, { postId });
    }
  }, [postId, getPost, setBoardContextError]);


  // BoardContext에서 발생한 전반적인 오류 (예: localStorage 로드 실패 등)
  if (boardContextError) {
    return <div className="alert alert-danger" role="alert">게시판 시스템 오류: {boardContextError} <Link to="/board" className="alert-link">목록으로</Link></div>;
  }

  // 이 컴포넌트 내에서 발생한 특정 오류 (예: 게시글 못 찾음)
  if (componentError) {
    return <div className="alert alert-danger" role="alert">{componentError} <Link to="/board" className="alert-link">목록으로</Link></div>;
  }

  // 게시글 로딩 중 (post가 아직 null이고 오류도 없는 경우)
  if (!post) {
    return <div className="alert alert-info">게시글 정보를 불러오는 중...</div>;
  }

  return (
    <div className="card mb-4">
      <div className="card-body">
        <h2 className="card-title mb-3">{post.title}</h2>
        <h6 className="card-subtitle mb-2 text-muted">작성자: {post.author || '익명'}</h6>
        <h6 className="card-subtitle mb-3 text-muted">작성일: {new Date(post.createdAt).toLocaleString()}</h6>
        <hr />
        <div className="card-text" style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
        <hr />
        <Link to="/board" className="btn btn-secondary">목록으로 돌아가기</Link>
      </div>
    </div>
  );
};

export default PostDetail;
