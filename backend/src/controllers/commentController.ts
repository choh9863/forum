/**
 * Comment Controller
 * 댓글 관련 API 엔드포인트 핸들러
 */

import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import * as commentService from '../services/commentService';
import { getAndMaskClientIP } from '../utils/ipMask';

/**
 * 댓글 작성
 * POST /api/posts/:postId/comments
 */
export async function createComment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { postId } = req.params;
    const { content, password, parentId } = req.body;

    // 입력 검증
    if (!content) {
      res.status(400).json({
        status: 'error',
        message: 'Content is required',
      });
      return;
    }

    // 사용자 정보 및 IP 주소 추출
    const userId = req.user?.id;
    const ipAddress = getAndMaskClientIP(req);

    // 댓글 작성
    const comment = await commentService.createComment(
      postId,
      { content, password, parentId },
      userId,
      ipAddress
    );

    res.status(201).json({
      status: 'success',
      message: 'Comment created successfully',
      data: comment,
    });
  } catch (error: any) {
    console.error('Create comment error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to create comment',
    });
  }
}

/**
 * 댓글 목록 조회
 * GET /api/posts/:postId/comments
 */
export async function getComments(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    // 댓글 목록 조회
    const result = await commentService.getComments(postId, page, limit);

    res.status(200).json({
      status: 'success',
      data: result.comments,
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
    console.error('Get comments error:', error);
    res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to get comments',
    });
  }
}

/**
 * 댓글 수정
 * PATCH /api/comments/:commentId
 */
export async function updateComment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { commentId } = req.params;
    const { content, password } = req.body;

    // 입력 검증
    if (!content) {
      res.status(400).json({
        status: 'error',
        message: 'Content is required',
      });
      return;
    }

    // 사용자 정보 추출
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // 댓글 수정
    const comment = await commentService.updateComment(
      commentId,
      { content },
      userId,
      password,
      userRole
    );

    res.status(200).json({
      status: 'success',
      message: 'Comment updated successfully',
      data: comment,
    });
  } catch (error: any) {
    console.error('Update comment error:', error);
    const statusCode = error.message.includes('permission') ? 403 : 400;
    res.status(statusCode).json({
      status: 'error',
      message: error.message || 'Failed to update comment',
    });
  }
}

/**
 * 댓글 삭제
 * DELETE /api/comments/:commentId
 */
export async function deleteComment(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { commentId } = req.params;
    const { password } = req.body;

    // 사용자 정보 추출
    const userId = req.user?.id;
    const userRole = req.user?.role;

    // 댓글 삭제
    await commentService.deleteComment(commentId, userId, password, userRole);

    res.status(200).json({
      status: 'success',
      message: 'Comment deleted successfully',
    });
  } catch (error: any) {
    console.error('Delete comment error:', error);
    const statusCode = error.message.includes('permission') ? 403 : 400;
    res.status(statusCode).json({
      status: 'error',
      message: error.message || 'Failed to delete comment',
    });
  }
}

/**
 * 댓글 상세 조회
 * GET /api/comments/:commentId
 */
export async function getCommentById(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { commentId } = req.params;

    // 댓글 조회
    const comment = await commentService.getCommentById(commentId);

    res.status(200).json({
      status: 'success',
      data: comment,
    });
  } catch (error: any) {
    console.error('Get comment error:', error);
    const statusCode = error.message === 'Comment not found' ? 404 : 400;
    res.status(statusCode).json({
      status: 'error',
      message: error.message || 'Failed to get comment',
    });
  }
}
