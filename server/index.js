const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const { sendSuccess, sendError } = require('./utils/responseHandler');
const errorConstants = require('./utils/errorConstants');
const logger = require('./config/logger'); // Winston 로거 임포트

const app = express();
const PORT = process.env.PORT || 5001;

// --- 인메모리 데이터 저장소 ---
let users = [];
let posts = [];
let nextUserId = 1;
let nextPostId = 1;
let activeTokens = new Map();

users.push({ id: nextUserId++, username: 'testuser', password: 'password' });
// --- 인메모리 데이터 저장소 끝 ---

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// --- 기존 serverLogError 함수를 Winston 로거 사용으로 대체 ---
// serverLogError 유틸리티는 이제 logger.error를 직접 사용하는 것으로 간주하고 삭제하거나 주석 처리합니다.
// 각 catch 블록에서 logger.error를 직접 호출합니다.

// --- 인증 미들웨어 ---
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const userId = activeTokens.get(token);
      if (userId) {
        const user = users.find(u => u.id === userId);
        if (user) {
          req.user = { id: user.id, username: user.username };
          return next();
        }
      }
    }
    logger.warn(`AuthMiddleware: Unauthorized access attempt from ${req.ip} to ${req.originalUrl}`, { context: 'AuthMiddleware' });
    return sendError(res, 'UNAUTHORIZED');
  } catch (error) {
    logger.error('AuthMiddleware error', { error, context: 'AuthMiddleware.catch', url: req.originalUrl });
    next(error);
  }
};
// --- 인증 미들웨어 끝 ---

app.get('/', (req, res) => {
  sendSuccess(res, {
    message: `백엔드 서버 실행 중! 사용자 수: ${users.length}, 게시글 수: ${posts.length}, 활성 토큰 수: ${activeTokens.size}`
  });
});

// --- 인증 API 라우트 ---
const authRouter = express.Router();

authRouter.post('/login', (req, res, next) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      logger.warn(`Login attempt: Missing username or password from ${req.ip}`, { context: 'AuthRouter.login', ip: req.ip });
      return sendError(res, 'MISSING_REQUIRED_FIELD', { message: '사용자 이름과 비밀번호를 모두 입력해야 합니다.' });
    }

    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
      const token = `token_${user.id}_${crypto.randomBytes(8).toString('hex')}_${Date.now()}`;
      activeTokens.set(token, user.id);
      logger.info(`User '${username}' logged in successfully from ${req.ip}. Token generated.`, { context: 'AuthRouter.login', username, ip: req.ip });
      const { password, ...userWithoutPassword } = user;
      sendSuccess(res, { user: userWithoutPassword, token });
    } else {
      logger.warn(`Login attempt: Invalid credentials for user '${username}' from ${req.ip}`, { context: 'AuthRouter.login', username, ip: req.ip });
      sendError(res, 'LOGIN_FAILED');
    }
  } catch (error) {
    logger.error('Login error', { error, context: 'AuthRouter.login.catch', username: req.body.username });
    next(error);
  }
});

authRouter.post('/logout', authMiddleware, (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (token && activeTokens.has(token)) {
      activeTokens.delete(token);
      logger.info(`User '${req.user.username}' logged out from ${req.ip}. Token invalidated.`, { context: 'AuthRouter.logout', username: req.user.username, ip: req.ip });
      sendSuccess(res, { message: '로그아웃 되었습니다.' });
    } else {
      logger.warn(`Logout attempt: No valid token found or already logged out by user '${req.user?.username}' from ${req.ip}`, { context: 'AuthRouter.logout', username: req.user?.username, ip: req.ip });
      sendError(res, 'ALREADY_LOGGED_OUT');
    }
  } catch (error) {
    logger.error('Logout error', { error, context: 'AuthRouter.logout.catch', username: req.user?.username });
    next(error);
  }
});

authRouter.get('/me', authMiddleware, (req, res, next) => {
  try {
    logger.info(`Current user info requested by '${req.user.username}' from ${req.ip}`, { context: 'AuthRouter.me', username: req.user.username, ip: req.ip });
    sendSuccess(res, { user: req.user });
  } catch (error) {
    logger.error('Get /me error', { error, context: 'AuthRouter.me.catch', username: req.user?.username });
    next(error);
  }
});

app.use('/api/auth', authRouter);
// --- 인증 API 라우트 끝 ---

// --- 게시판 API 라우트 ---
const postsRouter = express.Router();
postsRouter.use(authMiddleware);

postsRouter.get('/', (req, res, next) => {
  try {
    logger.info(`User '${req.user.username}' requested all posts from ${req.ip}.`, { context: 'PostsRouter.getAll', username: req.user.username, ip: req.ip });
    const sortedPosts = [...posts].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    sendSuccess(res, sortedPosts);
  } catch (error) {
    logger.error('Get all posts error', { error, context: 'PostsRouter.getAll.catch', username: req.user.username });
    next(error);
  }
});

postsRouter.post('/', (req, res, next) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) {
      logger.warn(`Post creation attempt: Missing title or content by user '${req.user.username}' from ${req.ip}`, { context: 'PostsRouter.create', username: req.user.username, ip: req.ip });
      return sendError(res, 'MISSING_REQUIRED_FIELD', { message: '게시글의 제목과 내용을 모두 입력해야 합니다.' });
    }

    const newPost = {
      id: nextPostId++,
      title,
      content,
      authorId: req.user.id,
      authorUsername: req.user.username,
      createdAt: new Date().toISOString(),
    };
    posts.push(newPost);
    logger.info(`User '${req.user.username}' created new post (ID: ${newPost.id}) from ${req.ip}: "${title}"`, { context: 'PostsRouter.create', username: req.user.username, postId: newPost.id, ip: req.ip });
    sendSuccess(res, newPost, 'SUCCESS', 201);
  } catch (error) {
    logger.error('Create post error', { error, context: 'PostsRouter.create.catch', username: req.user.username, title: req.body.title });
    next(error);
  }
});

postsRouter.get('/:postId', (req, res, next) => {
  try {
    const postId = parseInt(req.params.postId, 10);
    if (isNaN(postId)) {
      logger.warn(`Post fetch attempt: Invalid post ID format '${req.params.postId}' by user '${req.user.username}' from ${req.ip}`, { context: 'PostsRouter.getOne', username: req.user.username, postId: req.params.postId, ip: req.ip });
      return sendError(res, 'INVALID_POST_ID_FORMAT');
    }
    const post = posts.find(p => p.id === postId);

    if (post) {
      logger.info(`User '${req.user.username}' requested post ID ${postId} from ${req.ip}.`, { context: 'PostsRouter.getOne', username: req.user.username, postId, ip: req.ip });
      sendSuccess(res, post);
    } else {
      logger.warn(`Post fetch attempt: Non-existent post ID ${postId} by user '${req.user.username}' from ${req.ip}`, { context: 'PostsRouter.getOne', username: req.user.username, postId, ip: req.ip });
      sendError(res, 'POST_NOT_FOUND');
    }
  } catch (error) {
    logger.error('Get one post error', { error, context: 'PostsRouter.getOne.catch', username: req.user.username, postId: req.params.postId });
    next(error);
  }
});

app.use('/api/posts', postsRouter);
// --- 게시판 API 라우트 끝 ---

app.listen(PORT, () => {
  logger.info(`서버가 http://localhost:${PORT} 에서 실행 중입니다.`, { context: 'ServerStart' });
  const testUser = users.find(u => u.username === 'testuser');
  if (testUser) {
    logger.info('테스트 사용자:', { context: 'ServerStart', user: { id: testUser.id, username: testUser.username } });
  }
});

// --- 전역 오류 처리 미들웨어 ---
app.use((err, req, res, next) => {
  // Winston 로거는 기본적으로 error 객체를 잘 처리하므로, err.logged 플래그는 필수는 아님.
  // logger.error 호출 시 메시지와 함께 error 객체를 전달하는 것이 중요.
  logger.error('GlobalErrorHandler: Unhandled error in request', {
    error, // error 객체 자체를 전달하여 스택 트레이스 포함
    context: 'GlobalErrorHandler',
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  const errorKey = err.errorKey || 'SERVER_ERROR';
  const statusCode = err.httpStatusCode || null;
  // 여기서 sendError는 클라이언트에게 보내는 응답이므로, err.message를 사용하는 것이 적절.
  // Winston은 이미 err 객체 전체를 로깅했음.
  sendError(res, errorKey, { message: err.message || errorConstants[errorKey]?.message || '서버 오류' }, statusCode);
});
// --- 전역 오류 처리 미들웨어 끝 ---

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at Promise', { error: reason, context: 'UnhandledPromiseRejection' });
  // process.exit(1); // 실제 프로덕션에서는 필요에 따라 프로세스 재시작
});

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception thrown', { error, context: 'UncaughtException' });
  // process.exit(1); // 실제 프로덕션에서는 필요에 따라 프로세스 재시작
});
