/**
 * Authentication Routes
 * 인증 관련 라우트 정의
 */

import { Router } from 'express';
import { body } from 'express-validator';
import {
  register,
  login,
  verifyEmailToken,
  resendVerification,
  getMe,
  logout,
} from '../controllers/authController';
import { requireAuth } from '../middlewares/auth';
import { validate } from '../middlewares/validation';

const router = Router();

/**
 * POST /api/auth/register
 * 회원가입
 *
 * Body:
 * - email: string (이메일 형식)
 * - password: string (최소 8자)
 * - nickname: string (2-20자, 영문/한글/숫자)
 */
router.post(
  '/register',
  [
    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long'),
    body('nickname')
      .isLength({ min: 2, max: 20 })
      .withMessage('Nickname must be between 2 and 20 characters')
      .matches(/^[a-zA-Z0-9가-힣]+$/)
      .withMessage('Nickname can only contain letters, numbers, and Korean characters'),
  ],
  validate,
  register
);

/**
 * POST /api/auth/login
 * 로그인
 *
 * Body:
 * - email: string (이메일 형식)
 * - password: string
 */
router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
  ],
  validate,
  login
);

/**
 * GET /api/auth/verify-email/:token
 * 이메일 인증
 *
 * Params:
 * - token: string (UUID v4 형식)
 */
router.get('/verify-email/:token', verifyEmailToken);

/**
 * POST /api/auth/resend-verification
 * 인증 이메일 재전송
 *
 * Body:
 * - email: string (이메일 형식)
 */
router.post(
  '/resend-verification',
  [
    body('email')
      .isEmail()
      .withMessage('Invalid email format')
      .normalizeEmail(),
  ],
  validate,
  resendVerification
);

/**
 * GET /api/auth/me
 * 현재 사용자 정보 조회
 * 인증 필요
 */
router.get('/me', requireAuth, getMe);

/**
 * POST /api/auth/logout
 * 로그아웃
 * 클라이언트에서 토큰 삭제
 */
router.post('/logout', logout);

export default router;
