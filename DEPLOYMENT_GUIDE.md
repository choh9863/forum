# 커뮤니티 포럼 배포 가이드

## 📋 목차
1. [요구 사항](#요구-사항)
2. [로컬 개발 환경 설정](#로컬-개발-환경-설정)
3. [Docker를 이용한 개발](#docker를-이용한-개발)
4. [프로덕션 배포](#프로덕션-배포)
5. [환경 변수 설정](#환경-변수-설정)
6. [문제 해결](#문제-해결)

---

## 요구 사항

### 로컬 개발
- Node.js 20.x 이상
- npm 10.x 이상
- PostgreSQL 16.x 이상

### Docker 개발
- Docker 24.x 이상
- Docker Compose 2.x 이상

---

## 로컬 개발 환경 설정

### 1. 데이터베이스 설정

PostgreSQL 설치 및 데이터베이스 생성:
```bash
# PostgreSQL 설치 (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# PostgreSQL 서비스 시작
sudo systemctl start postgresql

# 데이터베이스 및 사용자 생성
sudo -u postgres psql
CREATE DATABASE forum;
CREATE USER forum_user WITH ENCRYPTED PASSWORD 'forum_password';
GRANT ALL PRIVILEGES ON DATABASE forum TO forum_user;
\q
```

### 2. 백엔드 설정

```bash
cd backend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 실제 값으로 변경

# Prisma 마이그레이션
npx prisma generate
npx prisma migrate dev --name init

# 개발 서버 실행
npm run dev
```

### 3. 프론트엔드 설정

```bash
cd frontend

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 편집하여 백엔드 URL 설정

# 개발 서버 실행
npm run dev
```

### 4. 접속

- 프론트엔드: http://localhost:5173
- 백엔드 API: http://localhost:3000
- API Health Check: http://localhost:3000/api/health

---

## Docker를 이용한 개발

### 1. 프로젝트 시작

```bash
# 모든 서비스 시작
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 특정 서비스 로그만 확인
docker-compose logs -f backend
docker-compose logs -f frontend
```

### 2. 데이터베이스 마이그레이션

```bash
# 백엔드 컨테이너에 접속
docker-compose exec backend sh

# Prisma 마이그레이션 실행
npx prisma migrate dev --name init
exit
```

### 3. 서비스 중지 및 제거

```bash
# 서비스 중지
docker-compose stop

# 서비스 중지 및 제거
docker-compose down

# 볼륨까지 모두 제거 (데이터베이스 데이터 삭제)
docker-compose down -v
```

### 4. 컨테이너 재시작

```bash
# 특정 서비스만 재시작
docker-compose restart backend
docker-compose restart frontend

# 모든 서비스 재시작
docker-compose restart
```

---

## 프로덕션 배포

### 1. 백엔드 프로덕션 빌드

```bash
cd backend

# TypeScript 컴파일
npm run build

# 프로덕션 실행
NODE_ENV=production node dist/server.js
```

### 2. 프론트엔드 프로덕션 빌드

```bash
cd frontend

# 프로덕션 빌드
npm run build

# 빌드된 파일은 dist/ 디렉토리에 생성됨
# Nginx, Apache 등 웹 서버로 서빙
```

### 3. Nginx 설정 예시

```nginx
# /etc/nginx/sites-available/forum

server {
    listen 80;
    server_name your-domain.com;

    # 프론트엔드
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 백엔드 API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Socket.io
    location /socket.io {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # 정적 파일 (업로드)
    location /uploads {
        proxy_pass http://localhost:3000/uploads;
    }
}
```

### 4. PM2를 이용한 백엔드 프로세스 관리

```bash
# PM2 설치
npm install -g pm2

# 백엔드 실행
cd backend
pm2 start dist/server.js --name forum-backend

# 로그 확인
pm2 logs forum-backend

# 재시작
pm2 restart forum-backend

# 부팅 시 자동 시작 설정
pm2 startup
pm2 save
```

---

## 환경 변수 설정

### 백엔드 (.env)

```env
# 데이터베이스
DATABASE_URL="postgresql://forum_user:forum_password@localhost:5432/forum"

# JWT 인증
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# 이메일 설정 (Gmail 예시)
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

### 프론트엔드 (.env)

```env
# API 서버 URL
VITE_API_URL=http://localhost:3000
VITE_WS_URL=http://localhost:3000
```

### Gmail 앱 비밀번호 생성

1. Google 계정 설정: https://myaccount.google.com/
2. 보안 → 2단계 인증 활성화
3. 앱 비밀번호 생성: https://myaccount.google.com/apppasswords
4. 생성된 16자리 비밀번호를 `EMAIL_PASSWORD`에 입력

---

## 문제 해결

### 1. Prisma Client 생성 오류

```bash
cd backend
npx prisma generate
```

### 2. 데이터베이스 연결 실패

- PostgreSQL 서비스 실행 확인
- DATABASE_URL 확인
- 방화벽 설정 확인

```bash
# PostgreSQL 서비스 상태 확인
sudo systemctl status postgresql

# 포트 확인
sudo netstat -tlnp | grep 5432
```

### 3. 포트 충돌

다른 애플리케이션이 3000번 또는 5173번 포트를 사용 중인 경우:

```bash
# 포트 사용 중인 프로세스 확인
lsof -i :3000
lsof -i :5173

# 프로세스 종료
kill -9 <PID>
```

### 4. Docker 빌드 실패

```bash
# 캐시 없이 다시 빌드
docker-compose build --no-cache

# 이미지 및 컨테이너 모두 제거 후 재시작
docker-compose down
docker system prune -a
docker-compose up -d --build
```

### 5. 파일 업로드 권한 오류

```bash
# uploads 디렉토리 권한 설정
cd backend
chmod -R 755 uploads
```

### 6. CORS 오류

백엔드 `server.ts`에서 CORS 설정 확인:
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
```

---

## 보안 체크리스트

프로덕션 배포 전 확인 사항:

- [ ] JWT_SECRET 변경
- [ ] 데이터베이스 비밀번호 강화
- [ ] HTTPS 설정 (Let's Encrypt)
- [ ] 환경 변수 파일 (.env) Git에서 제외
- [ ] SQL Injection 방지 (Prisma 사용)
- [ ] XSS 방지 (입력 sanitize)
- [ ] Rate Limiting 설정
- [ ] 파일 업로드 크기 제한
- [ ] CORS 설정 확인

---

## 모니터링 및 로그

### 로그 파일 위치

- PM2 로그: `~/.pm2/logs/`
- Nginx 로그: `/var/log/nginx/`
- PostgreSQL 로그: `/var/log/postgresql/`

### 로그 확인 명령어

```bash
# PM2 로그
pm2 logs forum-backend

# Nginx 로그
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# PostgreSQL 로그
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

---

## 백업

### 데이터베이스 백업

```bash
# 백업 생성
pg_dump -U forum_user -d forum > forum_backup_$(date +%Y%m%d).sql

# 복원
psql -U forum_user -d forum < forum_backup_20250101.sql
```

### 파일 업로드 백업

```bash
# uploads 디렉토리 백업
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz backend/uploads/
```

---

## 성능 최적화

### 1. 데이터베이스 인덱스

Prisma 스키마에 인덱스 추가:
```prisma
model Post {
  // ...
  @@index([boardId])
  @@index([createdAt])
  @@index([isDeleted])
}
```

### 2. Redis 캐싱 (선택사항)

```bash
# Redis 설치
sudo apt install redis-server

# 백엔드에서 Redis 사용
npm install redis
```

### 3. CDN 사용

정적 파일 (이미지, CSS, JS)을 CDN으로 서빙하여 성능 향상

---

이 가이드를 따라 커뮤니티 포럼을 성공적으로 배포하세요! 🚀
