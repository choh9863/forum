/**
 * Chat Service
 * 채팅 메시지 관련 비즈니스 로직
 */

import prisma from '../utils/prisma';
import { maskIP } from '../utils/ipMask';
import sanitizeHtml from 'sanitize-html';

/**
 * 메시지 저장
 * 로그인 사용자와 익명 사용자 모두 지원
 *
 * @param boardId - 게시판 ID
 * @param userId - 사용자 ID (nullable, 익명인 경우 null)
 * @param content - 메시지 내용
 * @param ipAddress - IP 주소 (익명 사용자의 경우 필수)
 * @param authorName - 작성자 이름
 * @returns 저장된 메시지
 */
export async function saveMessage(
  boardId: string,
  userId: string | null,
  content: string,
  ipAddress: string | null,
  authorName: string
) {
  try {
    // 내용 sanitize (XSS 방지)
    const sanitizedContent = sanitizeHtml(content, {
      allowedTags: [], // 모든 HTML 태그 제거
      allowedAttributes: {},
    });

    // IP 마스킹 (익명 사용자의 경우)
    const maskedIP = ipAddress && !userId ? maskIP(ipAddress) : null;

    // 메시지 저장
    const message = await prisma.chatMessage.create({
      data: {
        boardId,
        userId: userId || null,
        content: sanitizedContent,
        ipAddress: maskedIP,
        authorName,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            role: true,
          },
        },
      },
    });

    return message;
  } catch (error) {
    console.error('Error saving message:', error);
    throw new Error('Failed to save message');
  }
}

/**
 * 메시지 조회 (페이지네이션)
 *
 * @param boardId - 게시판 ID
 * @param page - 페이지 번호 (1부터 시작)
 * @param limit - 페이지당 메시지 수
 * @returns 메시지 목록과 페이지네이션 정보
 */
export async function getMessages(
  boardId: string,
  page: number = 1,
  limit: number = 50
) {
  try {
    const skip = (page - 1) * limit;

    // 총 메시지 수 조회
    const total = await prisma.chatMessage.count({
      where: { boardId },
    });

    // 메시지 조회 (최신순으로 정렬 후 역순으로)
    const messages = await prisma.chatMessage.findMany({
      where: { boardId },
      orderBy: {
        createdAt: 'asc',
      },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            role: true,
          },
        },
      },
    });

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return {
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasMore,
        hasPrev: page > 1,
      },
    };
  } catch (error) {
    console.error('Error fetching messages:', error);
    throw new Error('Failed to fetch messages');
  }
}

/**
 * 메시지 삭제
 * 작성자 본인 또는 게시판 관리자만 삭제 가능
 *
 * @param messageId - 메시지 ID
 * @param userId - 삭제 요청 사용자 ID
 * @returns 삭제된 메시지
 */
export async function deleteMessage(messageId: string, userId: string) {
  try {
    // 메시지 조회
    const message = await prisma.chatMessage.findUnique({
      where: { id: messageId },
      include: {
        board: {
          include: {
            creator: true,
            managers: {
              where: { userId },
            },
          },
        },
        user: true,
      },
    });

    if (!message) {
      throw new Error('Message not found');
    }

    // 권한 확인
    const isAuthor = message.userId === userId;
    const isBoardCreator = message.board.creatorId === userId;
    const isBoardManager = message.board.managers.length > 0;

    // 사용자 역할 확인 (관리자)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    const isAdmin = user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN');

    if (!isAuthor && !isBoardCreator && !isBoardManager && !isAdmin) {
      throw new Error('Permission denied');
    }

    // 메시지 삭제
    const deletedMessage = await prisma.chatMessage.delete({
      where: { id: messageId },
    });

    return deletedMessage;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Error deleting message:', error);
    throw new Error('Failed to delete message');
  }
}

/**
 * 최근 메시지 조회 (입장 시 사용)
 *
 * @param boardId - 게시판 ID
 * @param limit - 메시지 수 (기본 50개)
 * @returns 최근 메시지 목록
 */
export async function getRecentMessages(boardId: string, limit: number = 50) {
  try {
    const messages = await prisma.chatMessage.findMany({
      where: { boardId },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            role: true,
          },
        },
      },
    });

    // 시간순으로 정렬 (오름차순)
    return messages.reverse();
  } catch (error) {
    console.error('Error fetching recent messages:', error);
    throw new Error('Failed to fetch recent messages');
  }
}

/**
 * 사용자가 게시판에서 차단되었는지 확인
 *
 * @param boardId - 게시판 ID
 * @param userId - 사용자 ID
 * @returns 차단 여부
 */
export async function isUserBanned(
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

    // 만료 시간 확인
    if (ban.expiresAt && ban.expiresAt < new Date()) {
      // 만료된 차단은 삭제
      await prisma.boardBan.delete({
        where: { id: ban.id },
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error checking ban status:', error);
    return false;
  }
}

/**
 * 게시판 존재 여부 및 활성화 상태 확인
 *
 * @param boardId - 게시판 ID
 * @returns 게시판 정보 또는 null
 */
export async function validateBoard(boardId: string) {
  try {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      select: {
        id: true,
        name: true,
        slug: true,
        isApproved: true,
        isActive: true,
      },
    });

    if (!board) {
      throw new Error('Board not found');
    }

    if (!board.isApproved || !board.isActive) {
      throw new Error('Board is not active');
    }

    return board;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    console.error('Error validating board:', error);
    throw new Error('Failed to validate board');
  }
}

export default {
  saveMessage,
  getMessages,
  deleteMessage,
  getRecentMessages,
  isUserBanned,
  validateBoard,
};
