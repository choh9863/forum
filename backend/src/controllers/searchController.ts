/**
 * Search Controller
 * 검색 관련 API 엔드포인트 핸들러
 */

import { Response } from 'express';
import { AuthRequest } from '../types';
import * as searchService from '../services/searchService';
import { validateSortType } from '../utils/search';

/**
 * 게시판 검색
 * GET /api/search/boards?q=query&page=1&limit=20
 */
export async function searchBoards(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const query = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // 검색어 확인
    if (!query) {
      res.status(400).json({
        status: 'error',
        message: 'Search query (q) is required',
      });
      return;
    }

    // 게시판 검색
    const result = await searchService.searchBoards(query, page, limit);

    res.status(200).json({
      status: 'success',
      data: result.boards,
      meta: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrev: result.page > 1,
        query,
      },
    });
  } catch (error: any) {
    console.error('Search boards error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to search boards',
    });
  }
}

/**
 * 전역 게시글 검색
 * GET /api/search/posts?q=query&type=all&sort=relevance&page=1&limit=20
 */
export async function searchPostsGlobal(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const query = req.query.q as string;
    const searchType = (req.query.type as searchService.SearchType) || 'all';
    const sortTypeParam = req.query.sort as string;
    const sortType = validateSortType(sortTypeParam);
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // 검색어 확인
    if (!query) {
      res.status(400).json({
        status: 'error',
        message: 'Search query (q) is required',
      });
      return;
    }

    // 전역 게시글 검색
    const result = await searchService.searchPostsGlobal(
      query,
      searchType,
      sortType,
      page,
      limit
    );

    res.status(200).json({
      status: 'success',
      data: result.posts,
      meta: {
        page: result.page,
        limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrev: result.page > 1,
        query,
        searchType,
        sortType,
      },
    });
  } catch (error: any) {
    console.error('Search posts global error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to search posts',
    });
  }
}

/**
 * 통합 검색 (게시판 + 게시글)
 * GET /api/search?q=query&page=1&limit=20
 */
export async function unifiedSearch(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const query = req.query.q as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    // 검색어 확인
    if (!query) {
      res.status(400).json({
        status: 'error',
        message: 'Search query (q) is required',
      });
      return;
    }

    // 통합 검색
    const result = await searchService.unifiedSearch(query, page, limit);

    res.status(200).json({
      status: 'success',
      data: {
        boards: result.boards,
        posts: result.posts,
        totalResults: result.totalResults,
      },
      meta: {
        page: result.pagination.page,
        limit: result.pagination.limit,
        totalPages: result.pagination.totalPages,
        hasNext: result.pagination.page < result.pagination.totalPages,
        hasPrev: result.pagination.page > 1,
        query,
      },
    });
  } catch (error: any) {
    console.error('Unified search error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to perform unified search',
    });
  }
}

/**
 * 검색 자동완성
 * GET /api/search/autocomplete?q=query&type=post
 */
export async function searchAutocomplete(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const query = req.query.q as string;
    const type = (req.query.type as 'board' | 'post') || 'post';

    // 검색어 확인
    if (!query) {
      res.status(400).json({
        status: 'error',
        message: 'Search query (q) is required',
      });
      return;
    }

    // 자동완성 검색
    const results = await searchService.searchAutocomplete(query, type);

    res.status(200).json({
      status: 'success',
      data: results,
      meta: {
        query,
        type,
        count: results.length,
      },
    });
  } catch (error: any) {
    console.error('Search autocomplete error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to get autocomplete results',
    });
  }
}
