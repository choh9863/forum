# 실시간 채팅 시스템 가이드

## 개요

Socket.io 기반 게시판별 실시간 채팅 시스템이 성공적으로 구현되었습니다.

## 생성된 파일 목록

### 1. Socket.io 서버 설정
- **`/src/socket/index.ts`**
  - Socket.io 서버 초기화
  - CORS 설정 (FRONTEND_URL)
  - HTTP 서버와 통합
  - `/chat` 네임스페이스 설정

### 2. Socket.io 미들웨어
- **`/src/socket/middlewares/socketAuth.ts`**
  - JWT 토큰 검증 (선택적)
  - 로그인/익명 사용자 구분
  - socket.data에 사용자 정보 저장

### 3. 채팅 서비스
- **`/src/services/chatService.ts`**
  - `saveMessage()` - 메시지 DB 저장
  - `getMessages()` - 채팅 메시지 조회 (페이지네이션)
  - `deleteMessage()` - 메시지 삭제 (권한 확인)
  - `getRecentMessages()` - 최근 메시지 조회
  - `isUserBanned()` - 차단 여부 확인
  - `validateBoard()` - 게시판 유효성 확인

### 4. Socket.io 이벤트 핸들러
- **`/src/socket/handlers/chatHandler.ts`**
  - 게시판 채팅방 입장/퇴장
  - 메시지 전송/삭제
  - 실시간 브로드캐스팅

### 5. REST API 컨트롤러
- **`/src/controllers/chatController.ts`**
  - GET /api/boards/:boardId/messages - 메시지 조회
  - DELETE /api/messages/:messageId - 메시지 삭제

### 6. REST API 라우트
- **`/src/routes/chatRoutes.ts`**
  - 채팅 관련 REST API 라우트 정의

### 7. Server.ts (업데이트됨)
- **`/src/server.ts`**
  - Socket.io 서버 통합
  - HTTP 서버와 함께 시작

---

## Socket.io 이벤트 목록

### 클라이언트 → 서버 (발신 이벤트)

#### 1. `join:board` - 게시판 채팅방 입장
```typescript
socket.emit('join:board', { boardId: 'board-id-here' });
```
- **파라미터**: `{ boardId: string }`
- **설명**: 게시판 채팅방에 입장하고 최근 메시지 50개를 받습니다.

#### 2. `leave:board` - 게시판 채팅방 퇴장
```typescript
socket.emit('leave:board', { boardId: 'board-id-here' });
```
- **파라미터**: `{ boardId: string }`
- **설명**: 게시판 채팅방에서 퇴장합니다.

#### 3. `send:message` - 메시지 전송
```typescript
socket.emit('send:message', {
  boardId: 'board-id-here',
  content: '안녕하세요!'
});
```
- **파라미터**: `{ boardId: string, content: string }`
- **검증**: content는 1-500자
- **설명**: 채팅 메시지를 전송합니다.

#### 4. `delete:message` - 메시지 삭제
```typescript
socket.emit('delete:message', {
  messageId: 'message-id-here',
  boardId: 'board-id-here'
});
```
- **파라미터**: `{ messageId: string, boardId: string }`
- **권한**: 작성자 본인 또는 게시판 관리자
- **설명**: 채팅 메시지를 삭제합니다.

---

### 서버 → 클라이언트 (수신 이벤트)

#### 1. `messages:history` - 메시지 히스토리
```typescript
socket.on('messages:history', (data) => {
  console.log(data.messages); // 메시지 배열
  console.log(data.hasMore);  // 더 많은 메시지 여부
});
```
- **데이터**: `{ messages: Message[], hasMore: boolean }`
- **설명**: 채팅방 입장 시 최근 메시지 목록을 받습니다.

#### 2. `message:new` - 새 메시지 알림
```typescript
socket.on('message:new', (message) => {
  console.log(message);
});
```
- **데이터**:
```typescript
{
  id: string;
  boardId: string;
  content: string;
  authorName: string;
  userId?: string | null;
  createdAt: Date;
}
```
- **설명**: 같은 채팅방의 모든 사용자에게 브로드캐스트됩니다.

#### 3. `message:deleted` - 메시지 삭제 알림
```typescript
socket.on('message:deleted', (data) => {
  console.log(data.messageId); // 삭제된 메시지 ID
});
```
- **데이터**: `{ messageId: string }`
- **설명**: 메시지 삭제 시 같은 채팅방의 모든 사용자에게 알림됩니다.

#### 4. `error` - 에러 알림
```typescript
socket.on('error', (error) => {
  console.error(error.message);
});
```
- **데이터**: `{ message: string }`
- **설명**: 에러 발생 시 해당 클라이언트에게만 전송됩니다.

---

## REST API 엔드포인트

### 1. 메시지 조회 (페이지네이션)
```http
GET /api/boards/:boardId/messages?page=1&limit=50
```
- **Query Parameters**:
  - `page` (optional): 페이지 번호 (기본값: 1)
  - `limit` (optional): 페이지당 메시지 수 (기본값: 50, 최대: 100)
- **Response**:
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "id": "message-id",
        "boardId": "board-id",
        "content": "메시지 내용",
        "authorName": "작성자",
        "userId": "user-id 또는 null",
        "createdAt": "2025-11-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 100,
      "totalPages": 2,
      "hasMore": true,
      "hasPrev": false
    }
  }
}
```

### 2. 메시지 삭제
```http
DELETE /api/messages/:messageId
Authorization: Bearer YOUR_JWT_TOKEN
```
- **인증**: 필수 (JWT 토큰)
- **권한**: 작성자 본인 또는 게시판 관리자
- **Response**:
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

---

## 클라이언트 연결 가이드

### JavaScript/TypeScript 클라이언트

#### 1. 설치
```bash
npm install socket.io-client
```

#### 2. 기본 연결 (익명)
```typescript
import { io } from 'socket.io-client';

// Socket.io 연결
const socket = io('http://localhost:3000/chat', {
  transports: ['websocket', 'polling'],
});

// 연결 성공
socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

// 게시판 입장
socket.emit('join:board', { boardId: 'board-123' });

// 메시지 수신
socket.on('message:new', (message) => {
  console.log('New message:', message);
  // UI 업데이트
});

// 히스토리 수신
socket.on('messages:history', (data) => {
  console.log('Message history:', data.messages);
  console.log('Has more:', data.hasMore);
});

// 메시지 전송
function sendMessage(boardId: string, content: string) {
  socket.emit('send:message', { boardId, content });
}

// 에러 처리
socket.on('error', (error) => {
  console.error('Error:', error.message);
  alert(error.message);
});
```

#### 3. 인증된 연결 (로그인 사용자)
```typescript
import { io } from 'socket.io-client';

// JWT 토큰과 함께 연결
const socket = io('http://localhost:3000/chat', {
  auth: {
    token: 'YOUR_JWT_TOKEN_HERE',
  },
  transports: ['websocket', 'polling'],
});

// 나머지 코드는 동일...
```

#### 4. React 예시
```typescript
import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

function ChatComponent({ boardId, token }: { boardId: string; token?: string }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Socket 연결
    const newSocket = io('http://localhost:3000/chat', {
      auth: token ? { token } : undefined,
    });

    setSocket(newSocket);

    // 게시판 입장
    newSocket.emit('join:board', { boardId });

    // 히스토리 수신
    newSocket.on('messages:history', (data) => {
      setMessages(data.messages);
    });

    // 새 메시지 수신
    newSocket.on('message:new', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // 메시지 삭제 알림
    newSocket.on('message:deleted', (data) => {
      setMessages((prev) => prev.filter((m) => m.id !== data.messageId));
    });

    // 정리
    return () => {
      newSocket.emit('leave:board', { boardId });
      newSocket.close();
    };
  }, [boardId, token]);

  const handleSend = () => {
    if (socket && input.trim()) {
      socket.emit('send:message', { boardId, content: input });
      setInput('');
    }
  };

  const handleDelete = (messageId: string) => {
    if (socket) {
      socket.emit('delete:message', { messageId, boardId });
    }
  };

  return (
    <div>
      <div className="messages">
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.authorName}</strong>: {msg.content}
            <button onClick={() => handleDelete(msg.id)}>삭제</button>
          </div>
        ))}
      </div>
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
      />
      <button onClick={handleSend}>전송</button>
    </div>
  );
}

export default ChatComponent;
```

---

## 서버 시작

```bash
# 개발 모드
npm run dev

# 프로덕션 빌드
npm run build
npm start
```

서버 시작 시 로그:
```
==================================================
🚀 Server is running on port 3000
📝 Environment: development
🌐 API URL: http://localhost:3000/api
💬 Socket.io: ws://localhost:3000/chat
💚 Health Check: http://localhost:3000/api/health
==================================================
✅ Socket.io server initialized with /chat namespace
```

---

## 구현 특징

### ✅ 실시간 기능
- Socket.io room 기반 게시판별 채팅
- 실시간 메시지 전송/수신
- 실시간 메시지 삭제 알림

### ✅ 인증
- JWT 토큰으로 로그인 사용자 확인 (선택적)
- 익명 사용자도 채팅 가능
- 차단된 사용자는 채팅 불가

### ✅ 유효성 검증
- content: 1-500자
- boardId: 유효한 게시판 ID
- 게시판 활성화 및 승인 여부 확인

### ✅ IP 마스킹
- 익명 사용자의 IP는 마스킹 (119.70.***.****)
- 개인정보 보호

### ✅ 에러 처리
- Socket.io 에러는 `error` 이벤트로 클라이언트에 전송
- 일관된 에러 메시지 형식

### ✅ 보안
- CORS 설정
- XSS 방지 (메시지 내용 sanitize)
- 권한 기반 메시지 삭제

---

## 주의사항

### ⚠️ 기존 코드의 TypeScript 에러
빌드 시 다음 파일들에서 TypeScript 에러가 발생할 수 있습니다 (채팅 시스템과 무관):
- `src/services/boardService.ts`
- `src/services/commentService.ts`
- `src/services/postService.ts`
- `src/types/index.ts`
- `src/utils/jwt.ts`
- `src/utils/postAuth.ts`

이는 `@prisma/client`에서 `Role` enum을 export하지 않는 문제입니다.

**해결 방법**: Prisma schema에서 Role을 다시 생성하거나, 직접 타입을 정의해야 합니다.

```bash
# Prisma 재생성
npm run prisma:generate
```

### ⚠️ 프로덕션 배포 시 고려사항
1. **환경 변수 설정**
   - `FRONTEND_URL`: 프론트엔드 도메인
   - `JWT_SECRET`: 강력한 비밀키 사용

2. **스케일링**
   - Redis Adapter 사용 권장 (여러 서버 인스턴스)
   - Rate limiting 적용

3. **모니터링**
   - Socket 연결 수 모니터링
   - 메시지 전송 속도 제한

---

## 테스트

### Socket.io 연결 테스트
```bash
curl http://localhost:3000/api/health
```

### REST API 테스트
```bash
# 메시지 조회
curl http://localhost:3000/api/boards/board-id/messages?page=1&limit=10

# 메시지 삭제 (인증 필요)
curl -X DELETE http://localhost:3000/api/messages/message-id \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 문제 해결

### 1. Socket 연결이 안 됨
- CORS 설정 확인
- FRONTEND_URL 환경 변수 확인
- 네트워크 방화벽 확인

### 2. 메시지가 전송되지 않음
- 게시판 ID 확인
- 차단 여부 확인
- 메시지 길이 확인 (1-500자)

### 3. 인증 실패
- JWT 토큰 유효성 확인
- JWT_SECRET 환경 변수 확인

---

## 라이선스
이 프로젝트는 ISC 라이선스를 따릅니다.
