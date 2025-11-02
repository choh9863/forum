# 인증 API 테스트 Curl 명령어 예시

## 기본 설정
```bash
BASE_URL="http://localhost:3000"
```

## 1. 회원가입

```bash
curl -X POST $BASE_URL/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "nickname": "테스트유저"
  }'
```

## 2. 로그인

```bash
curl -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**응답에서 토큰을 저장하세요:**
```bash
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 3. 이메일 인증

```bash
# 이메일에서 받은 토큰으로 인증
curl -X GET $BASE_URL/api/auth/verify-email/YOUR_VERIFICATION_TOKEN
```

## 4. 인증 이메일 재전송

```bash
curl -X POST $BASE_URL/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com"
  }'
```

## 5. 현재 사용자 정보 조회 (인증 필요)

```bash
curl -X GET $BASE_URL/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## 6. 로그아웃

```bash
curl -X POST $BASE_URL/api/auth/logout
```

## 전체 테스트 시나리오

### 1단계: 회원가입
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123",
    "nickname": "신규사용자"
  }'
```

### 2단계: 이메일 인증 (이메일에서 토큰 확인 후)
```bash
# 예시 토큰: 12345678-1234-1234-1234-123456789abc
curl -X GET http://localhost:3000/api/auth/verify-email/12345678-1234-1234-1234-123456789abc
```

### 3단계: 로그인 및 토큰 저장
```bash
RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "SecurePass123"
  }')

# jq가 설치되어 있다면:
TOKEN=$(echo $RESPONSE | jq -r '.data.token')
echo "Token: $TOKEN"

# jq가 없다면 수동으로 토큰 복사
echo $RESPONSE
```

### 4단계: 인증이 필요한 엔드포인트 테스트
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

## 에러 테스트 예시

### 잘못된 이메일 형식
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "password123",
    "nickname": "테스트"
  }'
```

### 짧은 비밀번호
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "short",
    "nickname": "테스트"
  }'
```

### 잘못된 로그인 정보
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "wrongpassword"
  }'
```

### 토큰 없이 인증 필요 엔드포인트 접근
```bash
curl -X GET http://localhost:3000/api/auth/me
```

### 잘못된 토큰으로 접근
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer invalid_token_here"
```

## 응답 예시

### 성공 응답 (200/201)
```json
{
  "success": true,
  "data": { ... },
  "message": "Success message"
}
```

### 유효성 검증 실패 (422)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format",
      "value": "invalid-email"
    }
  ]
}
```

### 인증 실패 (401)
```json
{
  "success": false,
  "error": "Invalid email or password"
}
```

### 권한 부족 (403)
```json
{
  "success": false,
  "error": "Email not verified. Please check your email for verification link."
}
```

## 참고사항

- 서버가 `http://localhost:3000`에서 실행 중이어야 합니다
- 데이터베이스가 연결되어 있어야 합니다
- .env 파일에 JWT_SECRET이 설정되어 있어야 합니다
- 이메일 발송 기능을 테스트하려면 EMAIL_* 환경 변수를 설정해야 합니다
