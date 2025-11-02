/**
 * Post Controller
 * 게시글 관련 API 엔드포인트 핸들러
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as postService from '../services/postService';
import { getAndMaskClientIP } from '../utils/ipMask';

/**
 * 게시글 작성
 * POST /api/boards/:boardId/posts
 */
export async function createPost(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { boardId } = req.params;
    const { title, content, contentHtml, password } = req.body;

    // 입력 검증
    if (!title || !content || !contentHtml) {
      res.status(400).json({
        status: 'error',
        message: 'Title, content, and contentHtml are required',
      });
      return;
    }

    // 사용자 정보 및 IP 주소 추출
    const userId = req.user?.id;
    const ipAddress = getAndMaskClientIP(req);

    // 게시글 작성
    const post = await postService.createPost(
      boardId,
      { title, content, contentHtml, password },
      userId,
      ipAddress
    );

    res.status(201).json({
      status: 'success',
      message: 'Post created successfully',
      data: post,
    });
  } catch (error: any) {
    console.error('Create post error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to create post',
    });
  }
}

/**
 * 게시글 목록 조회
 * GET /api/boards/:boardId/posts
 */
export async function getPosts(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { boardId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const sort = (req.query.sort as postService.SortType) || 'latest';

    // 게시글 목록 조회
    const result = await postService.getPosts(boardId, page, limit, sort);

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
      },
    });
  } catch (error: any) {
    console.error('Get posts error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to get posts',
    });
  }
}

/**
 * 게시글 상세 조회
 * GET /api/posts/:postId
 */
export async function getPostById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { postId } = req.params;

    // 게시글 조회
    const post = await postService.getPostById(postId);

    res.status(200).json({
      status: 'success',
      data: post,
    });
  } catch (error: any) {
    console.error('Get post error:', error);
    const statusCode = error.message === 'Post not found' ? 404 : 400;
    res.status(statusCode).json({
      status: 'error',
      message: error.message || 'Failed to get post',
    });
  }
}

/**
 * 게시글 수정
 * PATCH /api/posts/:postId
 */
export async function updatePost(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { postId } = req.params;
    const { title, content, contentHtml, password } = req.body;

    // 최소한 하나의 수정 항목이 있어야 함
    if (!title && !content && !contentHtml) {
      res.status(400).json({
        status: 'error',
        message: 'At least one field (title, content, or contentHtml) is required',
      });
      return;
    }

    // 사용자 정보 추출
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // 게시글 수정
    const post = await postService.updatePost(
      postId,
      { title, content, contentHtml },
      userId,
      password,
      userRole
    );

    res.status(200).json({
      status: 'success',
      message: 'Post updated successfully',
      data: post,
    });
  } catch (error: any) {
    console.error('Update post error:', error);
    const statusCode = error.message.includes('permission') ? 403 : 400;
    res.status(statusCode).json({
      status: 'error',
      message: error.message || 'Failed to update post',
    });
  }
}

/**
 * 게시글 삭제
 * DELETE /api/posts/:postId
 */
export async function deletePost(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { postId } = req.params;
    const { password } = req.body;

    // 사용자 정보 추출
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // 게시글 삭제
    await postService.deletePost(postId, userId, password, userRole);

    res.status(200).json({
      status: 'success',
      message: 'Post deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete post error:', error);
    const statusCode = error.message.includes('permission') ? 403 : 400;
    res.status(statusCode).json({
      status: 'error',
      message: error.message || 'Failed to delete post',
    });
  }
}

/**
 * 게시글 좋아요
 * POST /api/posts/:postId/like
 */
export async function likePost(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { postId } = req.params;

    // 좋아요 증가
    const post = await postService.likePost(postId);

    res.status(200).json({
      status: 'success',
      message: 'Post liked successfully',
      data: post,
    });
  } catch (error: any) {
    console.error('Like post error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to like post',
    });
  }
}

/**
 * 게시글 검색
 * GET /api/boards/:boardId/posts/search
 */
export async function searchPosts(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { boardId } = req.params;
    const query = req.query.q as string;
    const searchType = (req.query.type as postService.SearchType) || 'all';
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

    // 게시글 검색
    const result = await postService.searchPosts(boardId, query, searchType, page, limit);

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
      },
    });
  } catch (error: any) {
    console.error('Search posts error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to search posts',
    });
  }
}
