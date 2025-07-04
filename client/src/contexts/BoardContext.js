import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import logError from '../utils/errorHandler';

const BoardContext = createContext();
const API_BASE_PATH = '/api';

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (context === undefined) {
    throw new Error('useBoard must be used within a BoardProvider');
  }
  return context;
};

export const BoardProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { token, user: authUser } = useAuth();

  const fetchPosts = useCallback(async () => {
    if (!token) {
      setPosts([]);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_PATH}/posts`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      const responseData = await response.json(); // {resultCode, resultMessage, data}

      if (responseData.resultCode === 0 && responseData.data) {
        setPosts(responseData.data); // data는 게시글 배열
        console.log('Posts loaded from API.');
      } else {
        const errorMessage = responseData.resultMessage || "게시글을 불러오는데 실패했습니다.";
        logError('BoardContext.fetchPosts.api', new Error(errorMessage), {
          resultCode: responseData.resultCode,
          status: response.status
        });
        setError(errorMessage);
        setPosts([]);
      }
    } catch (err) {
      logError('BoardContext.fetchPosts.catch', err);
      setError("게시글 로딩 중 네트워크 오류 또는 서버 연결 문제가 발생했습니다.");
      setPosts([]);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authUser && token) {
      fetchPosts();
    } else {
      setPosts([]);
      setError(null);
      setIsLoading(false);
    }
  }, [authUser, token, fetchPosts]);

  const addPost = async (postData) => {
    if (!token) {
      setError("로그인이 필요합니다.");
      return false;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_PATH}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });
      const responseData = await response.json(); // {resultCode, resultMessage, data: newPost}

      if (responseData.resultCode === 0 && responseData.data) {
        // 서버에서 최신 목록을 다시 받아오는 것이 더 간단하고 일관적일 수 있음
        await fetchPosts();
        console.log('New post added via API and list refreshed:', responseData.data.title);
        setIsLoading(false);
        return true;
      } else {
        const errorMessage = responseData.resultMessage || "게시글 추가 중 오류가 발생했습니다.";
        logError('BoardContext.addPost.api', new Error(errorMessage), {
          resultCode: responseData.resultCode,
          status: response.status,
          postTitle: postData.title
        });
        setError(errorMessage);
        setIsLoading(false);
        return false;
      }
    } catch (err) {
      logError('BoardContext.addPost.catch', err, { postTitle: postData.title });
      setError("게시글 추가 중 네트워크 오류 또는 서버 연결 문제가 발생했습니다.");
      setIsLoading(false);
      return false;
    }
  };

  const getPost = (id) => {
    try {
      const postId = parseInt(id, 10);
      if (isNaN(postId)) {
        logError('BoardContext.getPost.validation', new Error(`Invalid post ID format: ${id}`), { postId: id });
        setError("잘못된 형식의 게시글 ID 입니다.");
        return null;
      }
      const foundPost = posts.find(post => post.id === postId);
      if (!foundPost) {
        // console.warn(`Post with id ${postId} not found in current client-side list.`);
        // setError(`ID ${postId}에 해당하는 게시글을 찾을 수 없습니다. 목록을 새로고침해보세요.`);
        return null;
      }
      return foundPost;
    } catch (err) {
      logError('BoardContext.getPost.catch', err, { postId: id });
      setError("특정 게시글을 찾는 중 오류가 발생했습니다.");
      return null;
    }
  };

  return (
    <BoardContext.Provider value={{ posts, addPost, getPost, fetchPosts, isLoading, error, setError }}>
      {children}
    </BoardContext.Provider>
  );
};
