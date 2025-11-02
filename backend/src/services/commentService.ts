/**
 * Comment Service
 * 댓글 관련 비즈니스 로직
 */

import prisma from '../utils/prisma';
import { hashPassword, verifyCommentOwnership, isUserBannedFromBoard } from '../utils/postAuth';
import { Role } from '@prisma/client';

/**
 * 댓글 작성 데이터 인터페이스
 */
export interface CreateCommentData {
  content: string;
  password?: string;
  parentId?: string;
}

/**
 * 댓글 수정 데이터 인터페이스
 */
export interface UpdateCommentData {
  content: string;
}

/**
 * 댓글 작성
 */
export async function createComment(
  postId: string,
  data: CreateCommentData,
  userId?: string,
  ipAddress?: string
): Promise<any> {
  // 입력 유효성 검증
  if (!data.content || data.content.length < 1 || data.content.length > 5000) {
    throw new Error('Comment content must be between 1 and 5000 characters');
  }

  if (data.password && (data.password.length < 4 || data.password.length > 20)) {
    throw new Error('Password must be between 4 and 20 characters');
  }

  // 게시글 존재 확인
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      board: true,
    },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  if (post.isDeleted) {
    throw new Error('Post has been deleted');
  }

  if (!post.isActive) {
    throw new Error('Post is not active');
  }

  // 로그인 사용자의 경우 게시판 차단 확인
  if (userId) {
    const isBanned = await isUserBannedFromBoard(post.boardId, userId);
    if (isBanned) {
      throw new Error('You are banned from this board');
    }
  }

  // 부모 댓글 확인 (대댓글인 경우)
  if (data.parentId) {
    const parentComment = await prisma.comment.findUnique({
      where: { id: data.parentId },
    });

    if (!parentComment) {
      throw new Error('Parent comment not found');
    }

    if (parentComment.postId !== postId) {
      throw new Error('Parent comment does not belong to this post');
    }

    if (parentComment.isDeleted) {
      throw new Error('Parent comment has been deleted');
    }
  }

  // 작성자 이름 결정
  let authorName = '익명';
  if (userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { nickname: true },
    });
    if (user) {
      authorName = user.nickname;
    }
  }

  // 비밀번호 해싱 (익명 댓글의 경우)
  let hashedPassword: string | undefined;
  if (!userId && data.password) {
    hashedPassword = await hashPassword(data.password);
  }

  // 댓글 생성
  const comment = await prisma.comment.create({
    data: {
      postId,
      authorId: userId || null,
      content: data.content,
      password: hashedPassword,
      ipAddress: ipAddress || null,
      authorName,
      parentId: data.parentId || null,
    },
    include: {
      author: {
        select: {
          id: true,
          nickname: true,
        },
      },
      parent: {
        select: {
          id: true,
          authorName: true,
        },
      },
    },
  });

  return comment;
}

/**
 * 댓글 목록 조회
 */
export async function getComments(
  postId: string,
  page: number = 1,
  limit: number = 50
): Promise<{ comments: any[]; total: number; page: number; totalPages: number }> {
  // 게시글 존재 확인
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  // 페이지네이션 계산
  const skip = (page - 1) * limit;

  // 댓글 조회 (부모 댓글만 먼저 조회)
  const [comments, total] = await Promise.all([
    prisma.comment.findMany({
      where: {
        postId,
        parentId: null, // 부모 댓글만 (대댓글 제외)
        isActive: true,
        isDeleted: false,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        replies: {
          where: {
            isActive: true,
            isDeleted: false,
          },
          include: {
            author: {
              select: {
                id: true,
                nickname: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
      skip,
      take: limit,
    }),
    prisma.comment.count({
      where: {
        postId,
        parentId: null,
        isActive: true,
        isDeleted: false,
      },
    }),
  ]);

  return {
    comments,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * 댓글 수정
 */
export async function updateComment(
  commentId: string,
  data: UpdateCommentData,
  userId?: string,
  password?: string,
  userRole?: Role
): Promise<any> {
  // 입력 유효성 검증
  if (!data.content || data.content.length < 1 || data.content.length > 5000) {
    throw new Error('Comment content must be between 1 and 5000 characters');
  }

  // 소유권 확인
  const hasOwnership = await verifyCommentOwnership(commentId, userId, password, userRole);
  if (!hasOwnership) {
    throw new Error('You do not have permission to update this comment');
  }

  // 댓글 수정
  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: {
      content: data.content,
    },
    include: {
      author: {
        select: {
          id: true,
          nickname: true,
        },
      },
    },
  });

  return comment;
}

/**
 * 댓글 삭제 (소프트 삭제)
 */
export async function deleteComment(
  commentId: string,
  userId?: string,
  password?: string,
  userRole?: Role
): Promise<void> {
  // 소유권 확인
  const hasOwnership = await verifyCommentOwnership(commentId, userId, password, userRole);
  if (!hasOwnership) {
    throw new Error('You do not have permission to delete this comment');
  }

  // 소프트 삭제
  await prisma.comment.update({
    where: { id: commentId },
    data: {
      isDeleted: true,
      isActive: false,
    },
  });
}

/**
 * 댓글 상세 조회
 */
export async function getCommentById(commentId: string): Promise<any> {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      author: {
        select: {
          id: true,
          nickname: true,
        },
      },
      post: {
        select: {
          id: true,
          title: true,
          boardId: true,
        },
      },
      parent: {
        select: {
          id: true,
          authorName: true,
        },
      },
      replies: {
        where: {
          isActive: true,
          isDeleted: false,
        },
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
            },
          },
        },
      },
    },
  });

  if (!comment) {
    throw new Error('Comment not found');
  }

  if (comment.isDeleted) {
    throw new Error('Comment has been deleted');
  }

  return comment;
}
