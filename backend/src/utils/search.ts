/**
 * Search Utilities
 * 검색 관련 유틸리티 함수
 */

/**
 * Prisma 검색 쿼리 빌더
 * 여러 필드에서 검색하기 위한 OR 조건 생성
 */
export function buildSearchQuery(query: string, fields: string[]): any[] {
  if (!query || query.trim().length === 0) {
    return [];
  }

  return fields.map((field) => ({
    [field]: {
      contains: query.trim(),
      mode: 'insensitive' as const,
    },
  }));
}

/**
 * 검색어 유효성 검증
 */
export function validateSearchQuery(query: string): { isValid: boolean; error?: string } {
  if (!query || query.trim().length === 0) {
    return { isValid: false, error: 'Search query is required' };
  }

  const trimmedQuery = query.trim();

  if (trimmedQuery.length < 1) {
    return { isValid: false, error: 'Search query must be at least 1 character' };
  }

  if (trimmedQuery.length > 100) {
    return { isValid: false, error: 'Search query must be at most 100 characters' };
  }

  return { isValid: true };
}

/**
 * 검색어 정제 (XSS 방지)
 * 특수문자 처리 및 공백 정리
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return '';

  return query
    .trim()
    .replace(/[<>]/g, '') // XSS 방지를 위한 기본 태그 제거
    .replace(/\s+/g, ' '); // 연속된 공백을 하나로
}

/**
 * 검색 결과에서 검색어 하이라이트
 * HTML 마크업 추가 (선택사항)
 */
export function highlightSearchTerm(text: string, query: string): string {
  if (!text || !query) return text;

  const sanitizedQuery = sanitizeSearchQuery(query);
  const regex = new RegExp(`(${sanitizedQuery})`, 'gi');

  return text.replace(regex, '<mark>$1</mark>');
}

/**
 * 페이지네이션 유효성 검증 및 정규화
 */
export function validatePagination(
  page?: number,
  limit?: number
): { page: number; limit: number } {
  const defaultPage = 1;
  const defaultLimit = 20;
  const maxLimit = 100;

  const validPage = Math.max(1, Number(page) || defaultPage);
  const validLimit = Math.min(maxLimit, Math.max(1, Number(limit) || defaultLimit));

  return { page: validPage, limit: validLimit };
}

/**
 * 정렬 타입 유효성 검증
 */
export type SortType = 'relevance' | 'latest' | 'popular' | 'views';

export function validateSortType(sort?: string): SortType {
  const validSorts: SortType[] = ['relevance', 'latest', 'popular', 'views'];

  if (sort && validSorts.includes(sort as SortType)) {
    return sort as SortType;
  }

  return 'relevance'; // 기본값
}

/**
 * 정렬 조건 빌더
 */
export function buildOrderBy(sortType: SortType): any {
  switch (sortType) {
    case 'latest':
      return { createdAt: 'desc' };
    case 'popular':
      return { likeCount: 'desc' };
    case 'views':
      return { viewCount: 'desc' };
    case 'relevance':
    default:
      // 관련성 정렬은 Prisma의 기본 정렬 또는 커스텀 로직 사용
      // 여기서는 최신순을 기본으로 사용 (full-text search 미사용 시)
      return { createdAt: 'desc' };
  }
}
