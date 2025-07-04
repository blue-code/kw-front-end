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
    return <p style={{ color: 'red' }} role="alert">게시판 시스템 오류: {boardContextError} <Link to="/board">목록으로</Link></p>;
  }

  // 이 컴포넌트 내에서 발생한 특정 오류 (예: 게시글 못 찾음)
  if (componentError) {
    return <p style={{ color: 'red' }} role="alert">{componentError} <Link to="/board">목록으로</Link></p>;
  }

  // 게시글 로딩 중 (post가 아직 null이고 오류도 없는 경우)
  if (!post) {
    return <p>게시글 정보를 불러오는 중...</p>;
  }

  return (
    <div>
      <h2>{post.title}</h2>
      <p><strong>작성자:</strong> {post.author || '익명'}</p>
      <p><strong>작성일:</strong> {new Date(post.createdAt).toLocaleString()}</p>
      <hr />
      <div style={{ whiteSpace: 'pre-wrap' }}>{post.content}</div>
      <hr />
      <Link to="/board">목록으로 돌아가기</Link>
    </div>
  );
};

export default PostDetail;
