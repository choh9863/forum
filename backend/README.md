# Community Forum Backend API

커뮤니티 포럼 프로젝트의 백엔드 API 서버입니다.

## 기술 스택

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT
- **File Upload**: Multer
- **Email**: Nodemailer
- **Real-time**: Socket.IO

## 프로젝트 구조

```
/backend
  /src
    /controllers    # 컨트롤러 (비즈니스 로직)
    /routes         # 라우트 정의
    /middlewares    # 미들웨어 (인증, 에러 핸들링 등)
    /services       # 서비스 레이어
    /types          # TypeScript 타입 정의
    /utils          # 유틸리티 함수
    server.ts       # 서버 진입점
  /prisma
    schema.prisma   # 데이터베이스 스키마
  package.json
  tsconfig.json
  .env.example
```

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example` 파일을 복사하여 `.env` 파일을 생성하고 환경 변수를 설정합니다.

```bash
cp .env.example .env
```

필수 환경 변수:
- `DATABASE_URL`: PostgreSQL 데이터베이스 연결 문자열
- `JWT_SECRET`: JWT 토큰 암호화 키
- `EMAIL_*`: 이메일 서비스 설정 (SMTP)

### 3. 데이터베이스 설정

```bash
# Prisma Client 생성
npm run prisma:generate

# 데이터베이스 마이그레이션
npm run prisma:migrate

# Prisma Studio 실행 (데이터베이스 GUI)
npm run prisma:studio
```

### 4. 개발 서버 실행

```bash
npm run dev
```

서버가 http://localhost:3000 에서 실행됩니다.

### 5. 프로덕션 빌드

```bash
# TypeScript 컴파일
npm run build

# 프로덕션 서버 실행
npm start
```

## API 엔드포인트

### Health Check

```
GET /api/health
```

서버 상태를 확인합니다.

**응답 예시:**
```json
{
  "status": "OK",
  "message": "Community Forum API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "development"
}
```

## 데이터베이스 스키마

### 주요 엔티티

1. **User (사용자)**
   - 이메일 인증
   - 역할 관리 (USER, ADMIN, SUPER_ADMIN)
   - 계정 활성화 상태

2. **Board (게시판)**
   - 개설 요청 및 승인 시스템
   - 게시판별 관리자 지정
   - 슬러그 기반 URL

3. **Post (게시글)**
   - 로그인/익명 작성 지원
   - 마크다운 콘텐츠
   - 조회수/좋아요 카운트
   - 소프트 삭제

4. **Comment (댓글)**
   - 대댓글 지원
   - 익명 작성 지원
   - 비밀번호 보호

5. **File (파일)**
   - 게시글 첨부 파일
   - MIME 타입 및 크기 관리

6. **ChatMessage (채팅)**
   - 게시판별 실시간 채팅
   - Socket.IO 연동

7. **BoardBan (게시판 차단)**
   - 사용자 차단 관리
   - 차단 기간 설정

## 개발 가이드

### IP 주소 마스킹

개인정보 보호를 위해 IP 주소를 마스킹하여 저장합니다.

```typescript
import { maskIP, getAndMaskClientIP } from './utils/ipMask';

// 직접 마스킹
const maskedIP = maskIP('119.70.123.456');
// 결과: '119.70.***.***.''

// Express Request에서 자동 추출 및 마스킹
const maskedIP = getAndMaskClientIP(req);
```

### Prisma Client 사용

```typescript
import prisma from './utils/prisma';

// 예시: 사용자 조회
const user = await prisma.user.findUnique({
  where: { email: 'user@example.com' }
});
```

## Scripts

- `npm run dev` - 개발 서버 실행 (nodemon + ts-node)
- `npm run build` - TypeScript 컴파일
- `npm start` - 프로덕션 서버 실행
- `npm run prisma:generate` - Prisma Client 생성
- `npm run prisma:migrate` - 데이터베이스 마이그레이션
- `npm run prisma:studio` - Prisma Studio 실행
- `npm run prisma:push` - 스키마를 데이터베이스에 푸시

## 보안

- 비밀번호는 bcrypt로 해싱
- JWT 기반 인증
- IP 주소 마스킹 (개인정보 보호)
- CORS 설정
- 환경 변수 분리

## 라이선스

ISC
