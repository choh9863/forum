/**
 * Board Service
 * 게시판 관련 비즈니스 로직
 */

import prisma from '../utils/prisma';
import { Role } from '@prisma/client';
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from '../utils/errors';

/**
 * 게시판 개설 요청
 */
export const requestBoard = async (
  userId: string,
  name: string,
  slug: string,
  description: string | null,
  requestReason: string | null
) => {
  try {
    // slug 중복 확인
    const existingBoard = await prisma.board.findUnique({
      where: { slug },
    });

    if (existingBoard) {
      throw new ConflictError('이미 존재하는 슬러그입니다.');
    }

    // 게시판 생성 (승인 대기 상태)
    const board = await prisma.board.create({
      data: {
        name,
        slug,
        description,
        requestReason,
        creatorId: userId,
        isApproved: false,
        isActive: true,
      },
      include: {
        creator: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
      },
    });

    return board;
  } catch (error) {
    throw error;
  }
};

/**
 * 게시판 승인 (관리자)
 */
export const approveBoard = async (boardId: string, adminId: string) => {
  try {
    // 관리자 권한 확인
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
    });

    if (!admin || (admin.role !== Role.ADMIN && admin.role !== Role.SUPER_ADMIN)) {
      throw new ForbiddenError('관리자 권한이 필요합니다.');
    }

    // 게시판 존재 확인
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundError('게시판을 찾을 수 없습니다.');
    }

    if (board.isApproved) {
      throw new BadRequestError('이미 승인된 게시판입니다.');
    }

    // 트랜잭션: 게시판 승인 + creator를 관리자로 추가
    const result = await prisma.$transaction(async (tx) => {
      // 게시판 승인
      const approvedBoard = await tx.board.update({
        where: { id: boardId },
        data: { isApproved: true },
        include: {
          creator: {
            select: {
              id: true,
              nickname: true,
              email: true,
            },
          },
        },
      });

      // creator를 게시판 관리자로 추가
      await tx.boardManager.create({
        data: {
          boardId: boardId,
          userId: board.creatorId,
          assignedBy: adminId,
        },
      });

      return approvedBoard;
    });

    return result;
  } catch (error) {
    throw error;
  }
};

/**
 * 게시판 목록 조회
 */
export const getBoards = async (
  page: number = 1,
  limit: number = 20,
  isApproved?: boolean
) => {
  try {
    // limit 제한 (최대 100)
    const actualLimit = Math.min(limit, 100);
    const skip = (page - 1) * actualLimit;

    // 필터 조건
    const where: any = {
      isActive: true,
    };

    if (isApproved !== undefined) {
      where.isApproved = isApproved;
    }

    // 게시판 조회 및 카운트
    const [boards, total] = await Promise.all([
      prisma.board.findMany({
        where,
        skip,
        take: actualLimit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: {
            select: {
              id: true,
              nickname: true,
            },
          },
          _count: {
            select: {
              posts: true,
              managers: true,
            },
          },
        },
      }),
      prisma.board.count({ where }),
    ]);

    return {
      boards,
      total,
      page,
      totalPages: Math.ceil(total / actualLimit),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * slug로 게시판 조회
 */
export const getBoardBySlug = async (slug: string) => {
  try {
    const board = await prisma.board.findUnique({
      where: { slug },
      include: {
        creator: {
          select: {
            id: true,
            nickname: true,
            email: true,
            createdAt: true,
          },
        },
        managers: {
          include: {
            user: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
        },
        _count: {
          select: {
            posts: true,
            managers: true,
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundError('게시판을 찾을 수 없습니다.');
    }

    return board;
  } catch (error) {
    throw error;
  }
};

/**
 * 게시판 정보 수정
 */
export const updateBoard = async (
  boardId: string,
  userId: string,
  data: { name?: string; description?: string }
) => {
  try {
    // 게시판 존재 확인
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundError('게시판을 찾을 수 없습니다.');
    }

    // 권한 확인 (creator, manager, admin)
    const hasPermission = await checkBoardPermission(boardId, userId, [
      'creator',
      'manager',
      'admin',
    ]);

    if (!hasPermission) {
      throw new ForbiddenError('게시판을 수정할 권한이 없습니다.');
    }

    // 게시판 수정
    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description !== undefined && { description: data.description }),
      },
      include: {
        creator: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    return updatedBoard;
  } catch (error) {
    throw error;
  }
};

/**
 * 게시판 삭제 (소프트 삭제)
 */
export const deleteBoard = async (boardId: string, userId: string) => {
  try {
    // 게시판 존재 확인
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundError('게시판을 찾을 수 없습니다.');
    }

    // 권한 확인 (creator 또는 super_admin만 가능)
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('사용자를 찾을 수 없습니다.');
    }

    const isCreator = board.creatorId === userId;
    const isSuperAdmin = user.role === Role.SUPER_ADMIN;

    if (!isCreator && !isSuperAdmin) {
      throw new ForbiddenError('게시판을 삭제할 권한이 없습니다.');
    }

    // 소프트 삭제
    const deletedBoard = await prisma.board.update({
      where: { id: boardId },
      data: { isActive: false },
    });

    return deletedBoard;
  } catch (error) {
    throw error;
  }
};

/**
 * 게시판 관리자 추가
 */
export const addBoardManager = async (
  boardId: string,
  managerId: string,
  assignedBy: string
) => {
  try {
    // 게시판 존재 확인
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundError('게시판을 찾을 수 없습니다.');
    }

    // 권한 확인 (creator 또는 기존 manager)
    const hasPermission = await checkBoardPermission(boardId, assignedBy, [
      'creator',
      'manager',
    ]);

    if (!hasPermission) {
      throw new ForbiddenError('관리자를 추가할 권한이 없습니다.');
    }

    // 추가할 사용자 존재 확인
    const managerUser = await prisma.user.findUnique({
      where: { id: managerId },
    });

    if (!managerUser) {
      throw new NotFoundError('추가할 사용자를 찾을 수 없습니다.');
    }

    // 이미 관리자인지 확인
    const existingManager = await prisma.boardManager.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: managerId,
        },
      },
    });

    if (existingManager) {
      throw new ConflictError('이미 관리자로 등록된 사용자입니다.');
    }

    // 관리자 추가
    const boardManager = await prisma.boardManager.create({
      data: {
        boardId,
        userId: managerId,
        assignedBy,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
        assigner: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    return boardManager;
  } catch (error) {
    throw error;
  }
};

/**
 * 게시판 관리자 제거
 */
export const removeBoardManager = async (
  boardId: string,
  managerId: string,
  requesterId: string
) => {
  try {
    // 게시판 존재 확인
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundError('게시판을 찾을 수 없습니다.');
    }

    // creator는 제거할 수 없음
    if (board.creatorId === managerId) {
      throw new BadRequestError('게시판 개설자는 관리자에서 제거할 수 없습니다.');
    }

    // 권한 확인 (creator 또는 기존 manager)
    const hasPermission = await checkBoardPermission(boardId, requesterId, [
      'creator',
      'manager',
    ]);

    if (!hasPermission) {
      throw new ForbiddenError('관리자를 제거할 권한이 없습니다.');
    }

    // 관리자 레코드 확인
    const boardManager = await prisma.boardManager.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId: managerId,
        },
      },
    });

    if (!boardManager) {
      throw new NotFoundError('해당 사용자는 관리자가 아닙니다.');
    }

    // 관리자 제거
    await prisma.boardManager.delete({
      where: {
        boardId_userId: {
          boardId,
          userId: managerId,
        },
      },
    });

    return { message: '관리자가 제거되었습니다.' };
  } catch (error) {
    throw error;
  }
};

/**
 * 사용자 차단
 */
export const banUserFromBoard = async (
  boardId: string,
  userId: string,
  reason: string | null,
  bannedBy: string,
  expiresAt: Date | null
) => {
  try {
    // 게시판 존재 확인
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundError('게시판을 찾을 수 없습니다.');
    }

    // 권한 확인 (creator 또는 manager)
    const hasPermission = await checkBoardPermission(boardId, bannedBy, [
      'creator',
      'manager',
    ]);

    if (!hasPermission) {
      throw new ForbiddenError('사용자를 차단할 권한이 없습니다.');
    }

    // 차단할 사용자 존재 확인
    const userToBan = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userToBan) {
      throw new NotFoundError('차단할 사용자를 찾을 수 없습니다.');
    }

    // creator는 차단할 수 없음
    if (board.creatorId === userId) {
      throw new BadRequestError('게시판 개설자는 차단할 수 없습니다.');
    }

    // 이미 차단된 사용자인지 확인
    const existingBan = await prisma.boardBan.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId,
        },
      },
    });

    if (existingBan) {
      throw new ConflictError('이미 차단된 사용자입니다.');
    }

    // 사용자 차단
    const ban = await prisma.boardBan.create({
      data: {
        boardId,
        userId,
        reason,
        bannedBy,
        expiresAt,
      },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
          },
        },
        banner: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
    });

    return ban;
  } catch (error) {
    throw error;
  }
};

/**
 * 사용자 차단 해제
 */
export const unbanUserFromBoard = async (
  boardId: string,
  userId: string,
  requesterId: string
) => {
  try {
    // 게시판 존재 확인
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundError('게시판을 찾을 수 없습니다.');
    }

    // 권한 확인 (creator 또는 manager)
    const hasPermission = await checkBoardPermission(boardId, requesterId, [
      'creator',
      'manager',
    ]);

    if (!hasPermission) {
      throw new ForbiddenError('차단을 해제할 권한이 없습니다.');
    }

    // 차단 레코드 확인
    const ban = await prisma.boardBan.findUnique({
      where: {
        boardId_userId: {
          boardId,
          userId,
        },
      },
    });

    if (!ban) {
      throw new NotFoundError('차단 기록을 찾을 수 없습니다.');
    }

    // 차단 해제
    await prisma.boardBan.delete({
      where: {
        boardId_userId: {
          boardId,
          userId,
        },
      },
    });

    return { message: '차단이 해제되었습니다.' };
  } catch (error) {
    throw error;
  }
};

/**
 * 사용자 차단 여부 확인
 */
export const checkUserBan = async (boardId: string, userId: string) => {
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
      return { isBanned: false };
    }

    // 만료된 차단인지 확인
    if (ban.expiresAt && ban.expiresAt < new Date()) {
      // 만료된 차단은 자동으로 삭제
      await prisma.boardBan.delete({
        where: {
          boardId_userId: {
            boardId,
            userId,
          },
        },
      });
      return { isBanned: false };
    }

    return {
      isBanned: true,
      ban: {
        reason: ban.reason,
        expiresAt: ban.expiresAt,
        createdAt: ban.createdAt,
      },
    };
  } catch (error) {
    throw error;
  }
};

/**
 * 게시판 차단 목록 조회
 */
export const getBoardBans = async (boardId: string, requesterId: string) => {
  try {
    // 게시판 존재 확인
    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      throw new NotFoundError('게시판을 찾을 수 없습니다.');
    }

    // 권한 확인 (creator, manager, admin)
    const hasPermission = await checkBoardPermission(boardId, requesterId, [
      'creator',
      'manager',
      'admin',
    ]);

    if (!hasPermission) {
      throw new ForbiddenError('차단 목록을 조회할 권한이 없습니다.');
    }

    // 차단 목록 조회
    const bans = await prisma.boardBan.findMany({
      where: { boardId },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            email: true,
          },
        },
        banner: {
          select: {
            id: true,
            nickname: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return bans;
  } catch (error) {
    throw error;
  }
};

/**
 * 헬퍼 함수: 게시판 권한 확인
 */
export const checkBoardPermission = async (
  boardId: string,
  userId: string,
  permissions: ('creator' | 'manager' | 'admin')[]
): Promise<boolean> => {
  try {
    const [board, user, manager] = await Promise.all([
      prisma.board.findUnique({ where: { id: boardId } }),
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.boardManager.findUnique({
        where: {
          boardId_userId: {
            boardId,
            userId,
          },
        },
      }),
    ]);

    if (!board || !user) {
      return false;
    }

    // creator 권한 확인
    if (permissions.includes('creator') && board.creatorId === userId) {
      return true;
    }

    // manager 권한 확인
    if (permissions.includes('manager') && manager) {
      return true;
    }

    // admin 권한 확인
    if (
      permissions.includes('admin') &&
      (user.role === Role.ADMIN || user.role === Role.SUPER_ADMIN)
    ) {
      return true;
    }

    return false;
  } catch (error) {
    return false;
  }
};
