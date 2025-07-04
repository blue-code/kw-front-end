import React from 'react';
import { Link } from 'react-router-dom';
import { useBoard } from '../contexts/BoardContext';

const PostList = () => {
  const { posts, isLoading, error } = useBoard();

  if (isLoading) return <p>게시글을 불러오는 중...</p>;
  if (error) return <p style={{ color: 'red' }}>오류: {error}</p>;

  return (
    <div>
      <h3>게시글 목록</h3>
      {posts.length === 0 ? (
        <p>게시글이 없습니다.</p>
      ) : (
        <ul>
          {posts.map(post => (
            <li key={post.id}>
              <Link to={`/board/${post.id}`}>{post.title}</Link>
              <p>작성일: {new Date(post.createdAt).toLocaleDateString()}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PostList;
