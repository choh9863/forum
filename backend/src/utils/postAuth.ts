/**
 * Post and Comment Ownership Verification Utilities
 * 게시글 및 댓글 소유권 확인 유틸리티
 */

import bcrypt from 'bcrypt';
import prisma from './prisma';
import { Role } from '@prisma/client';

/**
 * 게시글 소유권 확인
 *
 * @param postId - 게시글 ID
 * @param userId - 사용자 ID (로그인 사용자)
 * @param password - 비밀번호 (익명 게시글의 경우)
 * @param userRole - 사용자 역할 (관리자 권한 확인용)
 * @returns 소유권이 있으면 true, 없으면 false
 */
export async function verifyPostOwnership(
  postId: string,
  userId?: string,
  password?: string,
  userRole?: Role
): Promise<boolean> {
  try {
    // 게시글 조회
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        board: {
          include: {
            managers: true,
          },
        },
      },
    });

    if (!post) {
      return false;
    }

    // 관리자는 모든 게시글 수정/삭제 가능
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      return true;
    }

    // 게시판 관리자는 해당 게시판의 모든 게시글 수정/삭제 가능
    if (userId && post.board.managers.some(manager => manager.userId === userId)) {
      return true;
    }

    // 로그인 사용자가 작성한 게시글인 경우
    if (post.authorId && userId && post.authorId === userId) {
      return true;
    }

    // 익명 게시글인 경우 비밀번호 확인
    if (!post.authorId && post.password && password) {
      const isPasswordValid = await bcrypt.compare(password, post.password);
      return isPasswordValid;
    }

    return false;
  } catch (error) {
    console.error('Error verifying post ownership:', error);
    return false;
  }
}

/**
 * 댓글 소유권 확인
 *
 * @param commentId - 댓글 ID
 * @param userId - 사용자 ID (로그인 사용자)
 * @param password - 비밀번호 (익명 댓글의 경우)
 * @param userRole - 사용자 역할 (관리자 권한 확인용)
 * @returns 소유권이 있으면 true, 없으면 false
 */
export async function verifyCommentOwnership(
  commentId: string,
  userId?: string,
  password?: string,
  userRole?: Role
): Promise<boolean> {
  try {
    // 댓글 조회
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        post: {
          include: {
            board: {
              include: {
                managers: true,
              },
            },
          },
        },
      },
    });

    if (!comment) {
      return false;
    }

    // 관리자는 모든 댓글 수정/삭제 가능
    if (userRole === 'ADMIN' || userRole === 'SUPER_ADMIN') {
      return true;
    }

    // 게시판 관리자는 해당 게시판의 모든 댓글 수정/삭제 가능
    if (userId && comment.post.board.managers.some(manager => manager.userId === userId)) {
      return true;
    }

    // 로그인 사용자가 작성한 댓글인 경우
    if (comment.authorId && userId && comment.authorId === userId) {
      return true;
    }

    // 익명 댓글인 경우 비밀번호 확인
    if (!comment.authorId && comment.password && password) {
      const isPasswordValid = await bcrypt.compare(password, comment.password);
      return isPasswordValid;
    }

    return false;
  } catch (error) {
    console.error('Error verifying comment ownership:', error);
    return false;
  }
}

/**
 * 사용자의 게시판 차단 여부 확인
 *
 * @param boardId - 게시판 ID
 * @param userId - 사용자 ID
 * @returns 차단되어 있으면 true, 아니면 false
 */
export async function isUserBannedFromBoard(
  boardId: string,
  userId: string
): Promise<boolean> {
  try {
    const ban = await prisma.boardBan.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId,
        },
      },
    });

    if (!ban) {
      return false;
    }

    // 차단 만료 시간이 없으면 영구 차단
    if (!ban.expiresAt) {
      return true;
    }

    // 차단 만료 시간이 현재 시간보다 이후면 차단 중
    return ban.expiresAt > new Date();
  } catch (error) {
    console.error('Error checking board ban:', error);
    return false;
  }
}

/**
 * 게시판 관리자 여부 확인
 *
 * @param boardId - 게시판 ID
 * @param userId - 사용자 ID
 * @returns 관리자면 true, 아니면 false
 */
export async function isBoardManager(
  boardId: string,
  userId: string
): Promise<boolean> {
  try {
    const manager = await prisma.boardManager.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId,
        },
      },
    });

    return !!manager;
  } catch (error) {
    console.error('Error checking board manager:', error);
    return false;
  }
}

/**
 * 비밀번호 해싱
 *
 * @param password - 평문 비밀번호
 * @returns 해싱된 비밀번호
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

/**
 * 비밀번호 검증
 *
 * @param password - 평문 비밀번호
 * @param hashedPassword - 해싱된 비밀번호
 * @returns 비밀번호가 일치하면 true, 아니면 false
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
