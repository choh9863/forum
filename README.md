# 커뮤니티 포럼 프로젝트

DCInside와 아카라이브와 유사한 커뮤니티 포럼 플랫폼

## 기술 스택

### 프론트엔드
- React 18 + TypeScript
- Vite
- TailwindCSS
- React Query (서버 상태 관리)
- Zustand (클라이언트 상태 관리)
- React Router (라우팅)
- Socket.io-client (실시간 채팅)
- Quill (리치 텍스트 에디터)

### 백엔드
- Node.js + Express + TypeScript
- PostgreSQL
- Prisma ORM
- Socket.io (WebSocket)
- JWT (인증)
- Multer (파일 업로드)
- Nodemailer (이메일 인증)
- bcrypt (비밀번호 암호화)

## 주요 기능

### 1. 인증 시스템
- 회원가입 (이메일 인증)
- 로그인/로그아웃
- 고유 닉네임 시스템

### 2. 게시판 시스템
- **게시판 개설**: 로그인 유저가 요청, 관리자 승인
- **게시판 관리**: 개설자/관리자/운영자 권한
- **글 작성**:
  - 비로그인: 익명 + IP 표시 (예: 119.70.***.***)
  - 로그인: 닉네임 표시
  - 글 비밀번호 설정
  - 이미지/동영상 업로드
  - HTML/리치 텍스트 지원
- **댓글 시스템**
- **실시간 채팅**: 게시판별 채팅방
- **검색**: 게시판 내 글 제목/내용 검색

### 3. 전역 검색
- 게시판 이름 검색
- 전체 게시판 글/내용 검색

## 프로젝트 구조

```
/forum
  /frontend        # React 프론트엔드
  /backend         # Express 백엔드
  /shared          # 공통 타입 정의
  docker-compose.yml
  README.md
```

## 개발 시작

### 1. 의존성 설치

```bash
# Frontend
cd frontend
npm install

# Backend
cd backend
npm install
```

### 2. 데이터베이스 설정

```bash
docker-compose up -d
cd backend
npx prisma migrate dev
```

### 3. 개발 서버 실행

```bash
# Frontend (터미널 1)
cd frontend
npm run dev

# Backend (터미널 2)
cd backend
npm run dev
```

## 환경 변수

### Backend (.env)
```
DATABASE_URL="postgresql://user:password@localhost:5432/forum"
JWT_SECRET="your-secret-key"
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
```

### Frontend (.env)
```
VITE_API_URL="http://localhost:3000"
VITE_WS_URL="http://localhost:3000"
```

## 라이선스

MIT License
