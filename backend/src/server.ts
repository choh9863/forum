/**
 * Community Forum Backend Server
 * Express + TypeScript + Prisma + Socket.io
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import { createServer } from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { initializeSocketServer } from './socket';

// 환경 변수 로드
dotenv.config();

// 업로드 디렉토리 생성 확인
const UPLOAD_DIR = path.join(__dirname, '../uploads');
const IMAGE_DIR = path.join(UPLOAD_DIR, 'images');
const VIDEO_DIR = path.join(UPLOAD_DIR, 'videos');

if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  console.log('📁 Created uploads directory');
}
if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
  console.log('📁 Created uploads/images directory');
}
if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
  console.log('📁 Created uploads/videos directory');
}

// Express 앱 초기화
const app: Application = express();
const PORT = process.env.PORT || 3000;

// HTTP 서버 생성 (Socket.io와 함께 사용)
const httpServer = createServer(app);

/**
 * 미들웨어 설정
 */

// CORS 설정
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// JSON 파싱
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 정적 파일 제공 (업로드된 파일)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

/**
 * API 라우트
 */

// Authentication routes
import authRoutes from './routes/authRoutes';
app.use('/api/auth', authRoutes);

// Board routes
import boardRoutes from './routes/boardRoutes';
app.use('/api/boards', boardRoutes);

// Post and Comment routes
import postRoutes from './routes/postRoutes';
import commentRoutes from './routes/commentRoutes';
app.use('/api', postRoutes);
app.use('/api', commentRoutes);

// Search routes
import searchRoutes from './routes/searchRoutes';
app.use('/api/search', searchRoutes);

// File routes
import fileRoutes from './routes/fileRoutes';
app.use('/api/files', fileRoutes);

// Chat routes
import chatRoutes from './routes/chatRoutes';
app.use('/api', chatRoutes);

/**
 * 기본 라우트
 */

// Health Check 엔드포인트
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    message: 'Community Forum API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// API 루트 엔드포인트
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Welcome to Community Forum API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login',
        logout: 'POST /api/auth/logout',
        verifyEmail: 'GET /api/auth/verify-email/:token',
        resendVerification: 'POST /api/auth/resend-verification',
        me: 'GET /api/auth/me (requires authentication)',
      },
      boards: {
        list: 'GET /api/boards',
        detail: 'GET /api/boards/:slug',
        request: 'POST /api/boards/request (requires authentication)',
        approve: 'POST /api/boards/:boardId/approve (requires admin)',
        update: 'PATCH /api/boards/:boardId (requires permission)',
        delete: 'DELETE /api/boards/:boardId (requires permission)',
        managers: {
          add: 'POST /api/boards/:boardId/managers (requires permission)',
          remove: 'DELETE /api/boards/:boardId/managers/:managerId (requires permission)',
        },
        bans: {
          list: 'GET /api/boards/:boardId/bans (requires permission)',
          ban: 'POST /api/boards/:boardId/bans (requires permission)',
          unban: 'DELETE /api/boards/:boardId/bans/:userId (requires permission)',
        },
      },
      posts: {
        list: 'GET /api/boards/:boardId/posts',
        create: 'POST /api/boards/:boardId/posts',
        detail: 'GET /api/posts/:postId',
        update: 'PATCH /api/posts/:postId',
        delete: 'DELETE /api/posts/:postId',
        like: 'POST /api/posts/:postId/like',
        search: 'GET /api/boards/:boardId/posts/search',
      },
      comments: {
        list: 'GET /api/posts/:postId/comments',
        create: 'POST /api/posts/:postId/comments',
        detail: 'GET /api/comments/:commentId',
        update: 'PATCH /api/comments/:commentId',
        delete: 'DELETE /api/comments/:commentId',
      },
      search: {
        unified: 'GET /api/search?q=query (boards + posts)',
        boards: 'GET /api/search/boards?q=query',
        posts: 'GET /api/search/posts?q=query&type=all&sort=relevance',
        autocomplete: 'GET /api/search/autocomplete?q=query&type=post',
      },
      files: {
        uploadImage: 'POST /api/files/upload/image (multipart/form-data: file, postId)',
        uploadImages: 'POST /api/files/upload/images (multipart/form-data: files, postId)',
        uploadVideo: 'POST /api/files/upload/video (multipart/form-data: file, postId)',
        uploadFiles: 'POST /api/files/upload/files (multipart/form-data: files, postId)',
        getFile: 'GET /api/files/:fileId',
        getPostFiles: 'GET /api/files/posts/:postId',
        deleteFile: 'DELETE /api/files/:fileId (requires authentication)',
        stats: 'GET /api/files/stats',
        serve: 'GET /uploads/:type/:filename (static file serving)',
      },
      chat: {
        messages: 'GET /api/boards/:boardId/messages (query: page, limit)',
        deleteMessage: 'DELETE /api/messages/:messageId (requires authentication)',
        socket: 'WebSocket /chat (Socket.io namespace)',
      },
    },
  });
});

/**
 * 에러 핸들링 미들웨어
 */

// 404 Not Found 핸들러
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.path,
  });
});

// 전역 에러 핸들러
interface ErrorWithStatus extends Error {
  status?: number;
  statusCode?: number;
}

app.use((err: ErrorWithStatus, req: Request, res: Response, next: NextFunction) => {
  const status = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  console.error('Error:', {
    status,
    message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    timestamp: new Date().toISOString(),
  });

  res.status(status).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && {
      stack: err.stack,
      details: 'Check server logs for more information',
    }),
  });
});

/**
 * Socket.io 서버 초기화
 */
initializeSocketServer(httpServer);

/**
 * 서버 시작
 */
httpServer.listen(PORT, () => {
  console.log('='.repeat(50));
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 API URL: http://localhost:${PORT}/api`);
  console.log(`💬 Socket.io: ws://localhost:${PORT}/chat`);
  console.log(`💚 Health Check: http://localhost:${PORT}/api/health`);
  console.log('='.repeat(50));
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server');
  process.exit(0);
});

export default app;
