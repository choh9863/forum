/**
 * Socket.io Server Setup
 * Socket.io 서버 초기화 및 설정
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { socketAuthMiddleware } from './middlewares/socketAuth';
import { chatHandler } from './handlers/chatHandler';

let io: SocketIOServer | null = null;

/**
 * Socket.io 서버를 초기화합니다.
 *
 * @param httpServer - HTTP 서버 인스턴스
 * @returns Socket.io 서버 인스턴스
 */
export function initializeSocketServer(httpServer: HTTPServer): SocketIOServer {
  // CORS 설정
  io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST'],
    },
    // Socket.io 옵션
    transports: ['websocket', 'polling'],
    allowEIO3: true,
  });

  // 채팅 네임스페이스 생성
  const chatNamespace = io.of('/chat');

  // 인증 미들웨어 적용
  chatNamespace.use(socketAuthMiddleware);

  // 연결 이벤트 핸들러
  chatNamespace.on('connection', (socket) => {
    const user = socket.data.user;
    const isAuthenticated = socket.data.isAuthenticated;

    console.log(`Socket connected: ${socket.id}`);
    console.log(`User: ${isAuthenticated ? user?.nickname : 'Anonymous'}`);

    // 채팅 이벤트 핸들러 등록
    chatHandler(socket, chatNamespace);

    // 연결 해제 이벤트
    socket.on('disconnect', (reason) => {
      console.log(`Socket disconnected: ${socket.id}, Reason: ${reason}`);
    });
  });

  console.log('✅ Socket.io server initialized with /chat namespace');
  return io;
}

/**
 * Socket.io 서버 인스턴스를 반환합니다.
 *
 * @returns Socket.io 서버 인스턴스 또는 null
 */
export function getIO(): SocketIOServer | null {
  if (!io) {
    console.warn('Socket.io server not initialized');
  }
  return io;
}

export default { initializeSocketServer, getIO };
