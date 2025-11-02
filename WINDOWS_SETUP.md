# Windows 환경에서 커뮤니티 포럼 실행하기

Windows에서 Docker 없이 로컬 개발 환경으로 커뮤니티 포럼을 실행하는 가이드입니다.

---

## 📋 필요 사항

- **Node.js** 20.x 이상
- **npm** 10.x 이상
- Git (선택사항)

**PostgreSQL 설치 불필요!** SQLite를 사용합니다.

---

## 🚀 빠른 시작

### 1. Node.js 설치

1. https://nodejs.org/ 방문
2. **LTS 버전** 다운로드 (20.x 이상)
3. 설치 프로그램 실행
4. 설치 완료 후 PowerShell 또는 명령 프롬프트 열기
5. 버전 확인:
   ```bash
   node --version
   npm --version
   ```

### 2. 프로젝트 다운로드

```bash
# Git으로 클론 (Git 설치된 경우)
git clone https://github.com/choh9863/forum.git
cd forum

# 또는 ZIP 파일 다운로드 후 압축 해제
```

### 3. 백엔드 설정 및 실행

```bash
# backend 폴더로 이동
cd backend

# 의존성 설치
npm install

# 환경 변수 파일 생성
copy .env.example .env

# .env 파일 편집 (메모장으로 열기)
notepad .env
```

**`.env` 파일 내용** (기본값 사용):
```env
# Database (SQLite - 기본값, 변경 불필요)
DATABASE_URL="file:./dev.db"

# JWT 인증
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# 이메일 설정 (선택사항, 나중에 설정 가능)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-app-password"
EMAIL_FROM="noreply@forum.com"

# 서버 설정
PORT=3000
NODE_ENV=development
FRONTEND_URL="http://localhost:5173"
BACKEND_URL="http://localhost:3000"
```

**Prisma 설정 및 데이터베이스 생성:**
```bash
# Prisma 클라이언트 생성
npm run prisma:generate

# 데이터베이스 마이그레이션 (SQLite 파일 자동 생성)
npm run prisma:migrate

# 백엔드 서버 실행
npm run dev
```

백엔드가 http://localhost:3000 에서 실행됩니다.

### 4. 프론트엔드 설정 및 실행 (새 터미널)

**새 PowerShell 또는 명령 프롬프트 창을 열고:**

```bash
# forum 폴더로 이동
cd forum/frontend

# 의존성 설치
npm install

# 환경 변수 파일 생성
copy .env.example .env

# .env 파일 확인 (기본값 사용)
notepad .env
```

**`.env` 파일 내용** (기본값 사용):
```env
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

**프론트엔드 실행:**
```bash
npm run dev
```

프론트엔드가 http://localhost:5173 에서 실행됩니다.

### 5. 브라우저에서 접속

**프론트엔드**: http://localhost:5173

---

## 🗂️ SQLite 데이터베이스 파일

- 위치: `backend/dev.db`
- SQLite는 단일 파일 데이터베이스로, 별도 서버 설치가 불필요합니다.
- 데이터베이스 초기화가 필요한 경우:
  ```bash
  cd backend
  # dev.db 파일 삭제
  del dev.db
  # 마이그레이션 다시 실행
  npm run prisma:migrate
  ```

---

## 📊 데이터베이스 확인 (Prisma Studio)

SQLite 데이터베이스를 GUI로 확인하고 싶다면:

```bash
cd backend
npm run prisma:studio
```

브라우저에서 http://localhost:5555 자동 열림 → 데이터 조회/수정 가능

---

## ❓ 문제 해결

### 1. `npm install` 오류

**오류**: `npm ERR! code ERESOLVE`

**해결**:
```bash
# frontend 폴더에서
npm install --legacy-peer-deps
```

### 2. 포트 이미 사용 중

**오류**: `Error: listen EADDRINUSE: address already in use :::3000`

**해결**:
- 다른 프로그램이 3000번 또는 5173번 포트 사용 중
- 작업 관리자에서 Node.js 프로세스 종료
- 또는 `.env` 파일에서 포트 변경:
  ```env
  PORT=3001  # 백엔드 포트 변경
  ```

### 3. Prisma 마이그레이션 실패

**오류**: `Error: P1003: Database dev.db does not exist`

**해결**:
```bash
cd backend
npm run prisma:migrate
```

### 4. 백엔드 연결 실패

- 백엔드가 실행 중인지 확인: http://localhost:3000/api/health
- `.env` 파일의 `DATABASE_URL`이 `file:./dev.db`인지 확인

---

## 🔄 서버 중지 및 재시작

### 서버 중지
- PowerShell/명령 프롬프트에서 `Ctrl + C` 입력

### 서버 재시작
```bash
# 백엔드
cd backend
npm run dev

# 프론트엔드 (새 터미널)
cd frontend
npm run dev
```

---

## 📧 이메일 인증 설정 (선택사항)

이메일 인증 기능을 사용하려면:

1. Gmail 계정 준비
2. Gmail 2단계 인증 활성화
3. 앱 비밀번호 생성:
   - https://myaccount.google.com/security
   - "2단계 인증" 활성화
   - "앱 비밀번호" 생성
4. `.env` 파일에 설정:
   ```env
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASSWORD="앱-비밀번호-16자리"
   ```

이메일 설정을 하지 않으면 회원가입 시 이메일 인증 단계가 실패하지만, 로그인 없이도 익명으로 게시글 작성이 가능합니다.

---

## 🐳 Docker 환경으로 전환

나중에 PostgreSQL을 사용하고 싶다면:

1. Docker Desktop 설치 (https://www.docker.com/products/docker-desktop)
2. 프로젝트 폴더에서:
   ```bash
   docker-compose up -d
   ```

---

## 📚 추가 정보

- **전체 프로젝트 문서**: `README.md`
- **배포 가이드**: `DEPLOYMENT_GUIDE.md`
- **프로젝트 요약**: `PROJECT_SUMMARY.md`

---

## ✅ 체크리스트

실행 전 확인:

- [ ] Node.js 20.x 이상 설치
- [ ] `backend/.env` 파일 생성 (`DATABASE_URL="file:./dev.db"`)
- [ ] `frontend/.env` 파일 생성
- [ ] `backend` 폴더에서 `npm install` 완료
- [ ] `frontend` 폴더에서 `npm install` 완료
- [ ] `backend` 폴더에서 `npm run prisma:migrate` 실행
- [ ] 백엔드 실행 (`npm run dev`)
- [ ] 프론트엔드 실행 (`npm run dev`)
- [ ] 브라우저에서 http://localhost:5173 접속

---

**Windows에서 커뮤니티 포럼을 즐기세요!** 🎉

문제가 발생하면 `DEPLOYMENT_GUIDE.md`의 "문제 해결" 섹션을 참고하세요.
