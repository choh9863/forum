# 인증 시스템 API 엔드포인트

## 구현된 엔드포인트

### 1. 회원가입
- **POST** `/api/auth/register`
- **Body**: 
  ```json
  {
    "email": "user@example.com",
    "password": "password123",
    "nickname": "사용자닉네임"
  }
  ```
- **Response (201)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "nickname": "사용자닉네임",
      "role": "USER",
      "emailVerified": false,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "message": "User registered successfully. Please check your email to verify your account."
  }
  ```

### 2. 로그인
- **POST** `/api/auth/login`
- **Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "password123"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": "uuid",
        "email": "user@example.com",
        "nickname": "사용자닉네임",
        "role": "USER",
        "emailVerified": true,
        "isActive": true
      },
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    },
    "message": "Login successful"
  }
  ```

### 3. 이메일 인증
- **GET** `/api/auth/verify-email/:token`
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "nickname": "사용자닉네임",
      "role": "USER",
      "emailVerified": true,
      "isActive": true
    },
    "message": "Email verified successfully. You can now log in."
  }
  ```

### 4. 인증 이메일 재전송
- **POST** `/api/auth/resend-verification`
- **Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "Verification email sent successfully. Please check your inbox."
  }
  ```

### 5. 현재 사용자 정보 조회
- **GET** `/api/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response (200)**:
  ```json
  {
    "success": true,
    "data": {
      "id": "uuid",
      "email": "user@example.com",
      "nickname": "사용자닉네임",
      "role": "USER",
      "emailVerified": true,
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  }
  ```

### 6. 로그아웃
- **POST** `/api/auth/logout`
- **Response (200)**:
  ```json
  {
    "success": true,
    "message": "Logout successful. Please remove the token from client storage."
  }
  ```

## 에러 응답 형식

모든 에러는 다음 형식으로 반환됩니다:

```json
{
  "success": false,
  "error": "에러 메시지",
  "details": "상세 정보 (개발 환경에서만)"
}
```

## 유효성 검증 에러 (422)

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
