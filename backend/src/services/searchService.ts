/**
 * Search Service
 * 검색 관련 비즈니스 로직
 */

import prisma from '../utils/prisma';
import {
  buildSearchQuery,
  validateSearchQuery,
  sanitizeSearchQuery,
  validatePagination,
  buildOrderBy,
  SortType,
} from '../utils/search';

/**
 * 검색 타입 정의
 */
export type SearchType = 'title' | 'content' | 'all';

/**
 * 게시판 검색
 * name 또는 description에서 검색
 */
export async function searchBoards(
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<{ boards: any[]; total: number; page: number; totalPages: number }> {
  // 검색어 유효성 검증
  const validation = validateSearchQuery(query);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 검색어 정제
  const sanitizedQuery = sanitizeSearchQuery(query);

  // 페이지네이션 검증
  const { page: validPage, limit: validLimit } = validatePagination(page, limit);
  const skip = (validPage - 1) * validLimit;

  // 검색 조건 설정
  const searchFields = buildSearchQuery(sanitizedQuery, ['name', 'description']);

  const where = {
    isApproved: true,
    isActive: true,
    OR: searchFields,
  };

  // 검색 실행
  const [boards, total] = await Promise.all([
    prisma.board.findMany({
      where,
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: validLimit,
    }),
    prisma.board.count({ where }),
  ]);

  return {
    boards,
    total,
    page: validPage,
    totalPages: Math.ceil(total / validLimit),
  };
}

/**
 * 게시판 내 게시글 검색 (postService.ts에 이미 구현됨)
 * 여기서는 참조용으로만 유지
 */
export async function searchPostsInBoard(
  boardId: string,
  query: string,
  searchType: SearchType = 'all',
  page: number = 1,
  limit: number = 20
): Promise<{ posts: any[]; total: number; page: number; totalPages: number }> {
  // 검색어 유효성 검증
  const validation = validateSearchQuery(query);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 검색어 정제
  const sanitizedQuery = sanitizeSearchQuery(query);

  // 페이지네이션 검증
  const { page: validPage, limit: validLimit } = validatePagination(page, limit);
  const skip = (validPage - 1) * validLimit;

  // 검색 조건 설정
  let searchCondition: any = {};

  if (searchType === 'title') {
    searchCondition = {
      title: {
        contains: sanitizedQuery,
        mode: 'insensitive',
      },
    };
  } else if (searchType === 'content') {
    searchCondition = {
      content: {
        contains: sanitizedQuery,
        mode: 'insensitive',
      },
    };
  } else {
    // 'all' - 제목 또는 내용에서 검색
    searchCondition = {
      OR: [
        {
          title: {
            contains: sanitizedQuery,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: sanitizedQuery,
            mode: 'insensitive',
          },
        },
      ],
    };
  }

  const where = {
    boardId,
    isActive: true,
    isDeleted: false,
    ...searchCondition,
  };

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
        board: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: validLimit,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    total,
    page: validPage,
    totalPages: Math.ceil(total / validLimit),
  };
}

/**
 * 전역 게시글 검색
 * 모든 게시판에서 게시글 검색
 */
export async function searchPostsGlobal(
  query: string,
  searchType: SearchType = 'all',
  sortType: SortType = 'relevance',
  page: number = 1,
  limit: number = 20
): Promise<{ posts: any[]; total: number; page: number; totalPages: number }> {
  // 검색어 유효성 검증
  const validation = validateSearchQuery(query);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 검색어 정제
  const sanitizedQuery = sanitizeSearchQuery(query);

  // 페이지네이션 검증
  const { page: validPage, limit: validLimit } = validatePagination(page, limit);
  const skip = (validPage - 1) * validLimit;

  // 검색 조건 설정
  let searchCondition: any = {};

  if (searchType === 'title') {
    searchCondition = {
      title: {
        contains: sanitizedQuery,
        mode: 'insensitive',
      },
    };
  } else if (searchType === 'content') {
    searchCondition = {
      content: {
        contains: sanitizedQuery,
        mode: 'insensitive',
      },
    };
  } else {
    // 'all' - 제목 또는 내용에서 검색
    searchCondition = {
      OR: [
        {
          title: {
            contains: sanitizedQuery,
            mode: 'insensitive',
          },
        },
        {
          content: {
            contains: sanitizedQuery,
            mode: 'insensitive',
          },
        },
      ],
    };
  }

  const where = {
    isActive: true,
    isDeleted: false,
    board: {
      isApproved: true,
      isActive: true,
    },
    ...searchCondition,
  };

  // 정렬 조건
  const orderBy = buildOrderBy(sortType);

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
        board: {
          select: {
            id: true,
            name: true,
            slug: true,
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
      take: validLimit,
    }),
    prisma.post.count({ where }),
  ]);

  return {
    posts,
    total,
    page: validPage,
    totalPages: Math.ceil(total / validLimit),
  };
}

/**
 * 통합 검색 (게시판 + 게시글)
 */
export async function unifiedSearch(
  query: string,
  page: number = 1,
  limit: number = 20
): Promise<{
  boards: any[];
  posts: any[];
  totalResults: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
}> {
  // 검색어 유효성 검증
  const validation = validateSearchQuery(query);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 검색어 정제
  const sanitizedQuery = sanitizeSearchQuery(query);

  // 페이지네이션 검증
  const { page: validPage, limit: validLimit } = validatePagination(page, limit);

  // 게시판과 게시글을 동시에 검색
  const boardSearchFields = buildSearchQuery(sanitizedQuery, ['name', 'description']);
  const postSearchFields = buildSearchQuery(sanitizedQuery, ['title', 'content']);

  const [boards, posts] = await Promise.all([
    // 게시판 검색 (최대 5개)
    prisma.board.findMany({
      where: {
        isApproved: true,
        isActive: true,
        OR: boardSearchFields,
      },
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
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
    // 게시글 검색 (페이지네이션 적용)
    prisma.post.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        board: {
          isApproved: true,
          isActive: true,
        },
        OR: postSearchFields,
      },
      include: {
        author: {
          select: {
            id: true,
            nickname: true,
          },
        },
        board: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        _count: {
          select: {
            comments: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (validPage - 1) * validLimit,
      take: validLimit,
    }),
  ]);

  // 총 결과 수 계산
  const totalResults = boards.length + posts.length;

  return {
    boards,
    posts,
    totalResults,
    pagination: {
      page: validPage,
      limit: validLimit,
      totalPages: Math.ceil(posts.length / validLimit),
    },
  };
}

/**
 * 검색 자동완성
 * 게시판 또는 게시글 제목 자동완성 제공
 */
export async function searchAutocomplete(
  query: string,
  type: 'board' | 'post' = 'post'
): Promise<any[]> {
  // 검색어 유효성 검증
  const validation = validateSearchQuery(query);
  if (!validation.isValid) {
    throw new Error(validation.error);
  }

  // 검색어 정제
  const sanitizedQuery = sanitizeSearchQuery(query);

  if (type === 'board') {
    // 게시판 자동완성
    const boards = await prisma.board.findMany({
      where: {
        isApproved: true,
        isActive: true,
        name: {
          contains: sanitizedQuery,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: { name: 'asc' },
      take: 10,
    });

    return boards;
  } else {
    // 게시글 자동완성 (제목만)
    const posts = await prisma.post.findMany({
      where: {
        isActive: true,
        isDeleted: false,
        board: {
          isApproved: true,
          isActive: true,
        },
        title: {
          contains: sanitizedQuery,
          mode: 'insensitive',
        },
      },
      select: {
        id: true,
        title: true,
        board: {
          select: {
            slug: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return posts;
  }
}

/**
 * 태그 검색 (선택사항 - 향후 구현)
 * 현재는 스키마에 태그가 없으므로 placeholder
 */
export async function searchByTags(
  _tags: string[],
  _operator: 'AND' | 'OR' = 'OR'
): Promise<any[]> {
  // TODO: 태그 기능이 추가되면 구현
  throw new Error('Tag search is not yet implemented');
}
