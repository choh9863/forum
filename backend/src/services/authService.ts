/**
 * Authentication Service
 * 인증 관련 비즈니스 로직
 */

import { v4 as uuidv4 } from 'uuid';
import prisma from '../utils/prisma';
import { hashPassword, comparePassword } from '../utils/hash';
import { generateToken } from '../utils/jwt';
import { sendVerificationEmail } from '../utils/email';

/**
 * 회원가입
 *
 * @param email - 사용자 이메일
 * @param password - 비밀번호 (평문)
 * @param nickname - 닉네임
 * @returns 생성된 사용자 정보 (비밀번호 제외)
 *
 * @throws {Error} 이메일 또는 닉네임이 이미 사용 중인 경우
 */
export async function registerUser(
  email: string,
  password: string,
  nickname: string
) {
  try {
    // 이메일 중복 확인
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUserByEmail) {
      throw new Error('Email is already registered');
    }

    // 닉네임 중복 확인
    const existingUserByNickname = await prisma.user.findUnique({
      where: { nickname },
    });

    if (existingUserByNickname) {
      throw new Error('Nickname is already taken');
    }

    // 비밀번호 해싱
    const hashedPassword = await hashPassword(password);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        nickname,
        role: 'USER',
        emailVerified: false,
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // 이메일 인증 토큰 생성
    const verificationToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24시간 후 만료

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt,
      },
    });

    // 이메일 인증 메일 발송
    try {
      await sendVerificationEmail(user.email, verificationToken, user.nickname);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
      // 이메일 발송 실패는 치명적이지 않으므로 계속 진행
    }

    return user;
  } catch (error) {
    console.error('Register user error:', error);
    throw error;
  }
}

/**
 * 로그인
 *
 * @param email - 사용자 이메일
 * @param password - 비밀번호 (평문)
 * @returns 사용자 정보와 JWT 토큰
 *
 * @throws {Error} 사용자를 찾을 수 없거나 비밀번호가 일치하지 않는 경우
 */
export async function loginUser(email: string, password: string) {
  try {
    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true,
        nickname: true,
        role: true,
        emailVerified: true,
        isActive: true,
      },
    });

    if (!user) {
      throw new Error('Invalid email or password');
    }

    // 계정 활성화 확인
    if (!user.isActive) {
      throw new Error('Account is deactivated');
    }

    // 비밀번호 검증
    const isPasswordValid = await comparePassword(password, user.password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // 이메일 인증 여부 확인
    if (!user.emailVerified) {
      throw new Error('Email not verified. Please check your email for verification link.');
    }

    // JWT 토큰 생성
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // 비밀번호를 제외한 사용자 정보 반환
    const { password: _, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
    };
  } catch (error) {
    console.error('Login user error:', error);
    throw error;
  }
}

/**
 * 이메일 인증
 *
 * @param token - 이메일 인증 토큰
 * @returns 인증된 사용자 정보
 *
 * @throws {Error} 토큰이 유효하지 않거나 만료된 경우
 */
export async function verifyEmail(token: string) {
  try {
    // 토큰으로 인증 정보 조회
    const verification = await prisma.emailVerification.findUnique({
      where: { token },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            nickname: true,
            emailVerified: true,
          },
        },
      },
    });

    if (!verification) {
      throw new Error('Invalid verification token');
    }

    // 만료 시간 확인
    if (new Date() > verification.expiresAt) {
      // 만료된 토큰 삭제
      await prisma.emailVerification.delete({
        where: { id: verification.id },
      });
      throw new Error('Verification token has expired');
    }

    // 이미 인증된 경우
    if (verification.user.emailVerified) {
      // 인증 토큰 삭제
      await prisma.emailVerification.delete({
        where: { id: verification.id },
      });
      return verification.user;
    }

    // 사용자 이메일 인증 상태 업데이트
    const updatedUser = await prisma.user.update({
      where: { id: verification.userId },
      data: { emailVerified: true },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        emailVerified: true,
        isActive: true,
      },
    });

    // 사용된 인증 토큰 삭제
    await prisma.emailVerification.delete({
      where: { id: verification.id },
    });

    return updatedUser;
  } catch (error) {
    console.error('Verify email error:', error);
    throw error;
  }
}

/**
 * 인증 이메일 재전송
 *
 * @param email - 사용자 이메일
 *
 * @throws {Error} 사용자를 찾을 수 없거나 이미 인증된 경우
 */
export async function resendVerificationEmail(email: string) {
  try {
    // 사용자 조회
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        nickname: true,
        emailVerified: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // 이미 인증된 경우
    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }

    // 기존 인증 토큰 삭제 (있는 경우)
    await prisma.emailVerification.deleteMany({
      where: { userId: user.id },
    });

    // 새 인증 토큰 생성
    const verificationToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24시간 후 만료

    await prisma.emailVerification.create({
      data: {
        userId: user.id,
        token: verificationToken,
        expiresAt,
      },
    });

    // 이메일 발송
    await sendVerificationEmail(user.email, verificationToken, user.nickname);

    return { message: 'Verification email sent successfully' };
  } catch (error) {
    console.error('Resend verification email error:', error);
    throw error;
  }
}

/**
 * 현재 사용자 정보 조회
 *
 * @param userId - 사용자 ID
 * @returns 사용자 정보 (비밀번호 제외)
 *
 * @throws {Error} 사용자를 찾을 수 없는 경우
 */
export async function getCurrentUser(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        role: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (error) {
    console.error('Get current user error:', error);
    throw error;
  }
}
