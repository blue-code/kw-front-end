import React from 'react';
import { Link } from 'react-router-dom';
import { useBoard } from '../contexts/BoardContext';

const PostList = () => {
  const { posts, isLoading, error } = useBoard();

  if (isLoading) return <div className="alert alert-info">게시글을 불러오는 중...</div>;
  if (error) return <div className="alert alert-danger">오류: {error}</div>;

  return (
    <div className="card">
      <div className="card-body">
        <h3 className="card-title mb-3">게시글 목록</h3>
        {posts.length === 0 ? (
          <div className="alert alert-info">게시글이 없습니다.</div>
        ) : (
          <ul className="list-group list-group-flush">
            {posts.map(post => (
              <li key={post.id} className="list-group-item">
                <Link to={`/board/${post.id}`} className="text-decoration-none fw-bold">{post.title}</Link>
                <p className="text-muted small mb-0">작성일: {new Date(post.createdAt).toLocaleDateString()}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PostList;
