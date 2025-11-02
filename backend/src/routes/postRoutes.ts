/**
 * Post Routes
 * 게시글 관련 라우트
 */

import { Router } from 'express';
import * as postController from '../controllers/postController';
import { optionalAuth } from '../middlewares/auth';

const router = Router();

/**
 * 게시글 라우트
 */

// 게시판별 게시글 목록 조회
router.get('/boards/:boardId/posts', postController.getPosts);

// 게시판별 게시글 검색
router.get('/boards/:boardId/posts/search', postController.searchPosts);

// 게시글 작성 (로그인/익명 모두 가능)
router.post('/boards/:boardId/posts', optionalAuth, postController.createPost);

// 게시글 상세 조회
router.get('/posts/:postId', postController.getPostById);

// 게시글 수정 (로그인/익명 모두 가능, 권한 확인 필요)
router.patch('/posts/:postId', optionalAuth, postController.updatePost);

// 게시글 삭제 (로그인/익명 모두 가능, 권한 확인 필요)
router.delete('/posts/:postId', optionalAuth, postController.deletePost);

// 게시글 좋아요 (인증 불필요)
router.post('/posts/:postId/like', postController.likePost);

export default router;
