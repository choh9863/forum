/**
 * Post Service
 * 게시글 관련 비즈니스 로직
 */

import prisma from '../utils/prisma';
import { hashPassword, verifyPostOwnership, isUserBannedFromBoard } from '../utils/postAuth';
import { Role } from '@prisma/client';
import sanitizeHtml from 'sanitize-html';

/**
 * HTML 컨텐츠 정제 (XSS 방지)
 */
function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img', 'h1', 'h2', 'h3']),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      img: ['src', 'alt', 'title', 'width', 'height'],
      a: ['href', 'target', 'rel'],
      '*': ['class', 'id'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
  });
}

/**
 * 게시글 작성 데이터 인터페이스
 */
export interface CreatePostData {
  title: string;
  content: string;
  contentHtml: string;
  password?: string;
}

/**
 * 게시글 수정 데이터 인터페이스
 */
export interface UpdatePostData {
  title?: string;
  content?: string;
  contentHtml?: string;
}

/**
 * 게시글 검색 타입
 */
export type SearchType = 'title' | 'content' | 'all';

/**
 * 게시글 정렬 타입
 */
export type SortType = 'latest' | 'popular' | 'views';

/**
 * 게시글 작성
 */
export async function createPost(
  boardId: string,
  data: CreatePostData,
  userId?: string,
  ipAddress?: string
): Promise<any> {
  // 입력 유효성 검증
  if (!data.title || data.title.length < 1 || data.title.length > 200) {
    throw new Error('Title must be between 1 and 200 characters');
  }

  if (!data.content || data.content.length < 1 || data.content.length > 50000) {
    throw new Error('Content must be between 1 and 50000 characters');
  }

  if (data.password && (data.password.length < 4 || data.password.length > 20)) {
    throw new Error('Password must be between 4 and 20 characters');
  }

  // 게시판 존재 및 활성화 확인
  const board = await prisma.board.findUnique({
    where: { id: boardId },
  });

  if (!board) {
    throw new Error('Board not found');
  }

  if (!board.isActive || !board.isApproved) {
    throw new Error('Board is not active or not approved');
  }

  // 로그인 사용자의 경우 게시판 차단 확인
  if (userId) {
    const isBanned = await isUserBannedFromBoard(boardId, userId);
    if (isBanned) {
      throw new Error('You are banned from this board');
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

  // 비밀번호 해싱 (익명 게시글의 경우)
  let hashedPassword: string | undefined;
  if (!userId && data.password) {
    hashedPassword = await hashPassword(data.password);
  }

  // HTML 컨텐츠 정제
  const sanitizedHtml = sanitizeContent(data.contentHtml);

  // 게시글 생성
  const post = await prisma.post.create({
    data: {
      boardId,
      authorId: userId || null,
      title: data.title,
      content: data.content,
      contentHtml: sanitizedHtml,
      password: hashedPassword,
      ipAddress: ipAddress || null,
      authorName,
    },
    include: {
      author: {
        select: {
          id: true,
          nickname: true,
          role: true,
        },
      },
      board: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return post;
}

/**
 * 게시글 목록 조회
 */
export async function getPosts(
  boardId: string,
  page: number = 1,
  limit: number = 20,
  sortBy: SortType = 'latest'
): Promise<{ posts: any[]; total: number; page: number; totalPages: number }> {
  // 페이지네이션 계산
  const skip = (page - 1) * limit;

  // 정렬 조건 설정
  let orderBy: any = { createdAt: 'desc' };
  if (sortBy === 'popular') {
    orderBy = { likeCount: 'desc' };
  } else if (sortBy === 'views') {
    orderBy = { viewCount: 'desc' };
  }

  // 게시글 조회
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: {
        boardId,
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
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy,
      skip,
      take: limit,
    }),
    prisma.post.count({
      where: {
        boardId,
        isActive: true,
        isDeleted: false,
      },
    }),
  ]);

  return {
    posts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

/**
 * 게시글 상세 조회
 */
export async function getPostById(postId: string): Promise<any> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: {
        select: {
          id: true,
          nickname: true,
          role: true,
        },
      },
      board: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      files: true,
      comments: {
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

  // 조회수 증가
  await prisma.post.update({
    where: { id: postId },
    data: {
      viewCount: {
        increment: 1,
      },
    },
  });

  return post;
}

/**
 * 게시글 수정
 */
export async function updatePost(
  postId: string,
  data: UpdatePostData,
  userId?: string,
  password?: string,
  userRole?: Role
): Promise<any> {
  // 입력 유효성 검증
  if (data.title && (data.title.length < 1 || data.title.length > 200)) {
    throw new Error('Title must be between 1 and 200 characters');
  }

  if (data.content && (data.content.length < 1 || data.content.length > 50000)) {
    throw new Error('Content must be between 1 and 50000 characters');
  }

  // 소유권 확인
  const hasOwnership = await verifyPostOwnership(postId, userId, password, userRole);
  if (!hasOwnership) {
    throw new Error('You do not have permission to update this post');
  }

  // 수정 데이터 준비
  const updateData: any = {};
  if (data.title) updateData.title = data.title;
  if (data.content) updateData.content = data.content;
  if (data.contentHtml) {
    updateData.contentHtml = sanitizeContent(data.contentHtml);
  }

  // 게시글 수정
  const post = await prisma.post.update({
    where: { id: postId },
    data: updateData,
    include: {
      author: {
        select: {
          id: true,
          nickname: true,
          role: true,
        },
      },
      board: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  return post;
}

/**
 * 게시글 삭제 (소프트 삭제)
 */
export async function deletePost(
  postId: string,
  userId?: string,
  password?: string,
  userRole?: Role
): Promise<void> {
  // 소유권 확인
  const hasOwnership = await verifyPostOwnership(postId, userId, password, userRole);
  if (!hasOwnership) {
    throw new Error('You do not have permission to delete this post');
  }

  // 소프트 삭제
  await prisma.post.update({
    where: { id: postId },
    data: {
      isDeleted: true,
      isActive: false,
    },
  });
}

/**
 * 게시글 좋아요
 */
export async function likePost(postId: string): Promise<any> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error('Post not found');
  }

  if (post.isDeleted) {
    throw new Error('Post has been deleted');
  }

  // 좋아요 카운트 증가
  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: {
      likeCount: {
        increment: 1,
      },
    },
    select: {
      id: true,
      likeCount: true,
    },
  });

  return updatedPost;
}

/**
 * 게시글 검색
 */
export async function searchPosts(
  boardId: string,
  query: string,
  searchType: SearchType = 'all',
  page: number = 1,
  limit: number = 20
): Promise<{ posts: any[]; total: number; page: number; totalPages: number }> {
  if (!query || query.trim().length === 0) {
    throw new Error('Search query is required');
  }

  const skip = (page - 1) * limit;

  // 검색 조건 설정
  let where: any = {
    boardId,
    isActive: true,
    isDeleted: false,
  };

  if (searchType === 'title') {
    where.title = {
      contains: query,
      mode: 'insensitive',
    };
  } else if (searchType === 'content') {
    where.content = {
      contains: query,
      mode: 'insensitive',
    };
  } else {
    // 'all' - 제목 또는 내용에서 검색
    where.OR = [
      {
        title: {
          contains: query,
          mode: 'insensitive',
        },
      },
      {
        content: {
          contains: query,
          mode: 'insensitive',
        },
      },
    ];
  }

  // 검색 실행
  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where,
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}
