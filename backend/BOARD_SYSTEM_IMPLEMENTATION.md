# 게시판 시스템 백엔드 구현 완료

## 생성된 파일 목록

### 1. 서비스 레이어
- `/src/services/boardService.ts` (16KB)
  - 게시판 비즈니스 로직 처리
  - Prisma를 사용한 데이터베이스 작업
  - 권한 확인 및 유효성 검증

### 2. 컨트롤러
- `/src/controllers/boardController.ts` (6.0KB)
  - API 엔드포인트 핸들러
  - 요청/응답 처리
  - 에러 핸들링

### 3. 미들웨어
- `/src/middlewares/boardAuth.ts` (2.2KB)
  - 게시판 권한 확인 미들웨어
  - 차단 사용자 확인 미들웨어
- `/src/middlewares/boardValidation.ts` (3.6KB)
  - 요청 데이터 유효성 검증 규칙
  - express-validator 사용

### 4. 라우트
- `/src/routes/boardRoutes.ts` (3.1KB)
  - API 엔드포인트 라우트 정의
  - 미들웨어 연결

### 5. 유틸리티
- `/src/utils/errors.ts` (1.2KB)
  - 커스텀 에러 클래스 정의
  - 일관된 에러 처리

### 6. 서버 업데이트
- `/src/server.ts` (업데이트됨)
  - boardRoutes를 `/api/boards`에 마운트
  - API 문서 업데이트

## 구현된 API 엔드포인트

### 게시판 개설 및 승인
1. `POST /api/boards/request` - 게시판 개설 요청
   - 인증 필요
   - Body: { name, slug, description, requestReason }
   - 응답: 201 Created

2. `POST /api/boards/:boardId/approve` - 게시판 승인
   - 관리자 권한 필요 (ADMIN, SUPER_ADMIN)
   - 응답: 200 OK
   - 트랜잭션으로 creator를 자동 관리자 추가

### 게시판 조회
3. `GET /api/boards` - 게시판 목록
   - 공개 엔드포인트
   - Query: page, limit, approved (true/false/all)
   - 응답: 200 OK, 페이지네이션 메타데이터 포함

4. `GET /api/boards/:slug` - 게시판 상세 조회
   - 공개 엔드포인트
   - creator 정보 및 관리자 목록 포함
   - 응답: 200 OK

### 게시판 관리
5. `PATCH /api/boards/:boardId` - 게시판 정보 수정
   - 권한 필요: creator, manager, admin
   - Body: { name?, description? }
   - 응답: 200 OK

6. `DELETE /api/boards/:boardId` - 게시판 삭제 (소프트 삭제)
   - 권한 필요: creator 또는 SUPER_ADMIN
   - 응답: 200 OK

### 관리자 관리
7. `POST /api/boards/:boardId/managers` - 관리자 추가
   - 권한 필요: creator, manager
   - Body: { userId }
   - 응답: 201 Created

8. `DELETE /api/boards/:boardId/managers/:managerId` - 관리자 제거
   - 권한 필요: creator, manager
   - creator는 제거 불가
   - 응답: 200 OK

### 사용자 차단
9. `POST /api/boards/:boardId/bans` - 사용자 차단
   - 권한 필요: creator, manager
   - Body: { userId, reason?, expiresAt? }
   - 응답: 201 Created

10. `DELETE /api/boards/:boardId/bans/:userId` - 차단 해제
    - 권한 필요: creator, manager
    - 응답: 200 OK

11. `GET /api/boards/:boardId/bans` - 차단 목록 조회
    - 권한 필요: creator, manager, admin
    - 응답: 200 OK

## 권한 체계 요약

### 사용자 역할
- **USER**: 일반 사용자
- **ADMIN**: 관리자
- **SUPER_ADMIN**: 최고 관리자

### 게시판 권한
- **creator**: 게시판 개설자
- **manager**: 게시판 관리자
- **admin**: 시스템 관리자 (ADMIN, SUPER_ADMIN)

### 작업별 권한 요구사항
| 작업 | 필요 권한 |
|------|----------|
| 게시판 개설 요청 | 로그인한 모든 사용자 |
| 게시판 승인 | ADMIN, SUPER_ADMIN |
| 게시판 조회 | 누구나 (공개) |
| 게시판 수정 | creator, manager, admin |
| 게시판 삭제 | creator, SUPER_ADMIN |
| 관리자 추가/제거 | creator, manager |
| 사용자 차단/해제 | creator, manager |
| 차단 목록 조회 | creator, manager, admin |

## 유효성 검증 규칙

### 게시판 개설
- **name**: 2-50자, 필수
- **slug**: 3-50자, 영문 소문자/숫자/하이픈만, 필수, 중복 불가
- **description**: 최대 500자, 선택
- **requestReason**: 최대 500자, 선택

### 게시판 수정
- **name**: 2-50자, 선택
- **description**: 최대 500자, 선택

### 사용자 차단
- **userId**: UUID, 필수
- **reason**: 최대 500자, 선택
- **expiresAt**: ISO8601 날짜 형식, 선택

### 페이지네이션
- **page**: 1 이상의 정수, 기본값 1
- **limit**: 1-100 사이의 정수, 기본값 20

## 주요 기능

### 1. 트랜잭션 처리
- 게시판 승인 시 creator를 자동으로 관리자로 추가하는 작업을 트랜잭션으로 처리
- 데이터 일관성 보장

### 2. 소프트 삭제
- 게시판 삭제 시 `isActive` 필드를 false로 설정
- 데이터 복구 가능

### 3. 자동 만료 처리
- 차단 확인 시 `expiresAt`가 현재 시간보다 이전이면 자동으로 차단 해제
- 만료된 차단 레코드 자동 삭제

### 4. 중복 검증
- slug 중복 확인
- 이미 관리자인 사용자 추가 방지
- 이미 차단된 사용자 재차단 방지

### 5. 페이지네이션
- 기본 limit: 20
- 최대 limit: 100
- 총 페이지 수, 전체 개수 포함

## 에러 처리

### 에러 상태 코드
- **400 Bad Request**: 잘못된 요청
- **401 Unauthorized**: 인증 필요
- **403 Forbidden**: 권한 없음
- **404 Not Found**: 리소스를 찾을 수 없음
- **409 Conflict**: 중복 (slug, 관리자, 차단)
- **422 Validation Error**: 유효성 검증 실패
- **500 Internal Server Error**: 서버 오류

### 에러 응답 형식
```json
{
  "status": "error",
  "message": "에러 메시지"
}
```

### 유효성 검증 에러 형식
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "필드명",
      "message": "에러 메시지",
      "value": "입력값"
    }
  ]
}
```

## 보안 고려사항

### 1. JWT 인증
- Authorization 헤더를 통한 토큰 검증
- 만료된 토큰 자동 거부
- 비활성화된 계정 접근 차단

### 2. 권한 검증
- 모든 권한이 필요한 작업에 대해 이중 검증
- 미들웨어 + 서비스 레이어 검증

### 3. 입력 검증
- express-validator를 사용한 모든 입력 검증
- SQL Injection 방지 (Prisma ORM 사용)
- XSS 방지를 위한 입력 sanitization

### 4. 중요 작업 제한
- creator는 관리자에서 제거 불가
- creator는 차단 불가
- 게시판 삭제는 creator 또는 SUPER_ADMIN만 가능

## 데이터베이스 스키마 활용

### 사용된 모델
1. **Board**: 게시판 정보
2. **BoardManager**: 게시판 관리자 매핑
3. **BoardBan**: 사용자 차단 정보
4. **User**: 사용자 정보

### 주요 관계
- Board → User (creator)
- BoardManager → Board, User (many-to-many)
- BoardBan → Board, User (many-to-many)

### 인덱스 활용
- slug (unique)
- boardId, userId (복합 인덱스)
- isApproved, isActive (필터링)
- createdAt (정렬)

## 테스트 가이드

### 1. 게시판 개설 흐름
```bash
# 1. 게시판 개설 요청
POST /api/boards/request
Authorization: Bearer {token}
{
  "name": "자유 게시판",
  "slug": "free-board",
  "description": "자유롭게 이야기하는 공간",
  "requestReason": "커뮤니티 활성화를 위해"
}

# 2. 관리자가 승인
POST /api/boards/{boardId}/approve
Authorization: Bearer {admin-token}

# 3. 게시판 목록에서 확인
GET /api/boards?approved=true
```

### 2. 관리자 추가 흐름
```bash
# 1. 관리자 추가
POST /api/boards/{boardId}/managers
Authorization: Bearer {creator-token}
{
  "userId": "{user-id}"
}

# 2. 게시판 상세에서 확인
GET /api/boards/{slug}
```

### 3. 사용자 차단 흐름
```bash
# 1. 사용자 차단
POST /api/boards/{boardId}/bans
Authorization: Bearer {manager-token}
{
  "userId": "{user-id}",
  "reason": "스팸 행위",
  "expiresAt": "2024-12-31T23:59:59Z"
}

# 2. 차단 목록 확인
GET /api/boards/{boardId}/bans
Authorization: Bearer {manager-token}

# 3. 차단 해제
DELETE /api/boards/{boardId}/bans/{user-id}
Authorization: Bearer {manager-token}
```

## 향후 개선 사항

### 1. 추가 기능
- [ ] 게시판 카테고리 시스템
- [ ] 게시판 통계 (게시글 수, 활성 사용자 등)
- [ ] 게시판 설정 (댓글 허용, 익명 허용 등)
- [ ] 관리자 권한 레벨 (읽기 전용 관리자 등)

### 2. 성능 최적화
- [ ] 게시판 목록 캐싱
- [ ] 권한 체크 결과 캐싱
- [ ] 데이터베이스 쿼리 최적화

### 3. 모니터링
- [ ] 게시판 개설 요청 로깅
- [ ] 관리자 작업 감사 로그
- [ ] 차단 이력 추적

## 주의사항

### TypeScript 컴파일
- Prisma 클라이언트 생성 필요: `npx prisma generate`
- 데이터베이스 마이그레이션: `npx prisma migrate dev`

### 환경 변수 설정
```env
DATABASE_URL="postgresql://..."
JWT_SECRET="your-secret-key"
NODE_ENV="development"
```

### 데이터베이스 초기화
```bash
# Prisma 마이그레이션 실행
npx prisma migrate dev

# 초기 관리자 계정 생성 (별도 스크립트 필요)
npm run seed
```

## 구현 완료 체크리스트

✅ boardService.ts - 모든 비즈니스 로직 구현
✅ boardController.ts - 11개 엔드포인트 핸들러 구현
✅ boardAuth.ts - 권한 확인 미들웨어 구현
✅ boardValidation.ts - 유효성 검증 규칙 구현
✅ boardRoutes.ts - 라우트 정의 및 미들웨어 연결
✅ server.ts - boardRoutes 마운트 및 API 문서 업데이트
✅ errors.ts - 커스텀 에러 클래스 구현
✅ 트랜잭션 처리 (게시판 승인)
✅ 소프트 삭제
✅ 페이지네이션
✅ 권한 체계 구현
✅ 에러 처리 일관성
✅ TypeScript strict mode 준수

---

**구현 완료일**: 2025-11-01
**구현자**: Claude Code Assistant
**프로젝트**: Community Forum Backend
