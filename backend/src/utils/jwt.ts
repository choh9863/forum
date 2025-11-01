/**
 * JWT Token Utilities
 * JWT 토큰 생성 및 검증
 */

import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types';

// JWT Secret (환경 변수에서 가져옴)
const JWT_SECRET: string = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

/**
 * JWT 토큰을 생성합니다.
 *
 * @param payload - JWT 페이로드 (userId, email, role)
 * @returns JWT 토큰 문자열
 *
 * @example
 * const token = generateToken({
 *   userId: 'user-id',
 *   email: 'user@example.com',
 *   role: 'USER'
 * });
 */
export function generateToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  try {
    const token = jwt.sign(
      { ...payload },
      JWT_SECRET,
      {
        expiresIn: JWT_EXPIRES_IN,
      }
    );
    return token;
  } catch (error) {
    console.error('Error generating JWT token:', error);
    throw new Error('Failed to generate token');
  }
}

/**
 * JWT 토큰을 검증하고 디코딩합니다.
 *
 * @param token - JWT 토큰 문자열
 * @returns 디코딩된 JWT 페이로드
 * @throws 토큰이 유효하지 않거나 만료된 경우 에러 발생
 *
 * @example
 * try {
 *   const payload = verifyToken(token);
 *   console.log(payload.userId);
 * } catch (error) {
 *   console.error('Invalid token');
 * }
 */
export function verifyToken(token: string): JwtPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    }) as JwtPayload;
    return decoded;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token has expired');
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    } else {
      console.error('Error verifying JWT token:', error);
      throw new Error('Failed to verify token');
    }
  }
}

/**
 * JWT 토큰을 디코딩합니다 (검증 없이).
 * 주의: 토큰의 유효성을 검증하지 않으므로 신뢰할 수 없는 토큰에는 사용하지 마세요.
 *
 * @param token - JWT 토큰 문자열
 * @returns 디코딩된 JWT 페이로드 또는 null
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    return decoded;
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
}
