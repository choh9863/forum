/**
 * Authentication Controller
 * 인증 관련 API 엔드포인트 핸들러
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import {
  registerUser,
  loginUser,
  verifyEmail,
  resendVerificationEmail,
  getCurrentUser,
} from '../services/authService';

/**
 * POST /api/auth/register
 * 회원가입
 *
 * @body {string} email - 이메일 주소
 * @body {string} password - 비밀번호 (최소 8자)
 * @body {string} nickname - 닉네임 (2-20자)
 */
export async function register(req: Request, res: Response): Promise<void> {
  try {
    const { email, password, nickname } = req.body;

    // 서비스 함수 호출
    const user = await registerUser(email, password, nickname);

    res.status(201).json({
      success: true,
      data: user,
      message: 'User registered successfully. Please check your email to verify your account.',
    });
  } catch (error: any) {
    console.error('Register controller error:', error);

    // 중복 에러 처리
    if (error.message.includes('already registered') || error.message.includes('already taken')) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }

    // 기타 에러
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * POST /api/auth/login
 * 로그인
 *
 * @body {string} email - 이메일 주소
 * @body {string} password - 비밀번호
 */
export async function login(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    // 서비스 함수 호출
    const result = await loginUser(email, password);

    res.status(200).json({
      success: true,
      data: result,
      message: 'Login successful',
    });
  } catch (error: any) {
    console.error('Login controller error:', error);

    // 인증 실패 (이메일 또는 비밀번호 오류)
    if (error.message.includes('Invalid email or password')) {
      res.status(401).json({
        success: false,
        error: 'Invalid email or password',
      });
      return;
    }

    // 이메일 미인증
    if (error.message.includes('Email not verified')) {
      res.status(403).json({
        success: false,
        error: error.message,
      });
      return;
    }

    // 계정 비활성화
    if (error.message.includes('deactivated')) {
      res.status(403).json({
        success: false,
        error: 'Account is deactivated. Please contact support.',
      });
      return;
    }

    // 기타 에러
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * GET /api/auth/verify-email/:token
 * 이메일 인증
 *
 * @param {string} token - 이메일 인증 토큰
 */
export async function verifyEmailToken(req: Request, res: Response): Promise<void> {
  try {
    const { token } = req.params;

    // 서비스 함수 호출
    const user = await verifyEmail(token);

    res.status(200).json({
      success: true,
      data: user,
      message: 'Email verified successfully. You can now log in.',
    });
  } catch (error: any) {
    console.error('Verify email controller error:', error);

    // 유효하지 않은 토큰 또는 만료된 토큰
    if (error.message.includes('Invalid') || error.message.includes('expired')) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }

    // 기타 에러
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * POST /api/auth/resend-verification
 * 인증 이메일 재전송
 *
 * @body {string} email - 이메일 주소
 */
export async function resendVerification(req: Request, res: Response): Promise<void> {
  try {
    const { email } = req.body;

    // 서비스 함수 호출
    await resendVerificationEmail(email);

    res.status(200).json({
      success: true,
      message: 'Verification email sent successfully. Please check your inbox.',
    });
  } catch (error: any) {
    console.error('Resend verification controller error:', error);

    // 사용자를 찾을 수 없음
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // 이미 인증됨
    if (error.message.includes('already verified')) {
      res.status(400).json({
        success: false,
        error: 'Email is already verified',
      });
      return;
    }

    // 기타 에러
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * GET /api/auth/me
 * 현재 사용자 정보 조회
 * 인증 필요 (authMiddleware)
 */
export async function getMe(req: Request, res: Response): Promise<void> {
  try {
    const userId = (req as AuthRequest).user?.id;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      });
      return;
    }

    // 서비스 함수 호출
    const user = await getCurrentUser(userId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error: any) {
    console.error('Get me controller error:', error);

    // 사용자를 찾을 수 없음
    if (error.message.includes('not found')) {
      res.status(404).json({
        success: false,
        error: 'User not found',
      });
      return;
    }

    // 기타 에러
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}

/**
 * POST /api/auth/logout
 * 로그아웃
 * 클라이언트에서 토큰을 삭제하도록 200 응답만 반환
 */
export async function logout(_req: Request, res: Response): Promise<void> {
  try {
    res.status(200).json({
      success: true,
      message: 'Logout successful. Please remove the token from client storage.',
    });
  } catch (error: any) {
    console.error('Logout controller error:', error);

    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
}
