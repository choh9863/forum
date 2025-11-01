/**
 * Search Routes
 * 검색 관련 라우트
 */

import { Router } from 'express';
import * as searchController from '../controllers/searchController';
import { optionalAuth } from '../middlewares/auth';

const router = Router();

/**
 * 모든 검색 엔드포인트는 인증 선택사항
 * (로그인하지 않아도 검색 가능, 하지만 인증되면 추가 기능 제공 가능)
 */

/**
 * GET /api/search
 * 통합 검색 (게시판 + 게시글)
 *
 * Query Parameters:
 * - q: 검색어 (필수)
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 페이지당 결과 수 (기본값: 20, 최대: 100)
 *
 * 응답:
 * {
 *   status: 'success',
 *   data: {
 *     boards: [...],
 *     posts: [...],
 *     totalResults: number
 *   },
 *   meta: { page, limit, totalPages, hasNext, hasPrev, query }
 * }
 */
router.get('/', optionalAuth, searchController.unifiedSearch);

/**
 * GET /api/search/boards
 * 게시판 검색
 *
 * Query Parameters:
 * - q: 검색어 (필수)
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 페이지당 결과 수 (기본값: 20, 최대: 100)
 *
 * 응답:
 * {
 *   status: 'success',
 *   data: [...boards],
 *   meta: { page, limit, total, totalPages, hasNext, hasPrev, query }
 * }
 */
router.get('/boards', optionalAuth, searchController.searchBoards);

/**
 * GET /api/search/posts
 * 전역 게시글 검색
 *
 * Query Parameters:
 * - q: 검색어 (필수)
 * - type: 검색 타입 (title|content|all, 기본값: all)
 * - sort: 정렬 방식 (relevance|latest|popular|views, 기본값: relevance)
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 페이지당 결과 수 (기본값: 20, 최대: 100)
 *
 * 응답:
 * {
 *   status: 'success',
 *   data: [...posts],
 *   meta: { page, limit, total, totalPages, hasNext, hasPrev, query, searchType, sortType }
 * }
 */
router.get('/posts', optionalAuth, searchController.searchPostsGlobal);

/**
 * GET /api/search/autocomplete
 * 검색 자동완성
 *
 * Query Parameters:
 * - q: 검색어 (필수)
 * - type: 자동완성 타입 (board|post, 기본값: post)
 *
 * 응답:
 * {
 *   status: 'success',
 *   data: [...results],
 *   meta: { query, type, count }
 * }
 */
router.get('/autocomplete', optionalAuth, searchController.searchAutocomplete);

export default router;
