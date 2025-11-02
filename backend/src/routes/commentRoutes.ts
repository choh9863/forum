/**
 * Comment Routes
 * 댓글 관련 라우트
 */

import { Router } from 'express';
import * as commentController from '../controllers/commentController';
import { optionalAuth } from '../middlewares/auth';

const router = Router();

/**
 * 댓글 라우트
 */

// 게시글별 댓글 목록 조회
router.get('/posts/:postId/comments', commentController.getComments);

// 댓글 작성 (로그인/익명 모두 가능)
router.post('/posts/:postId/comments', optionalAuth, commentController.createComment);

// 댓글 상세 조회
router.get('/comments/:commentId', commentController.getCommentById);

// 댓글 수정 (로그인/익명 모두 가능, 권한 확인 필요)
router.patch('/comments/:commentId', optionalAuth, commentController.updateComment);

// 댓글 삭제 (로그인/익명 모두 가능, 권한 확인 필요)
router.delete('/comments/:commentId', optionalAuth, commentController.deleteComment);

export default router;
