import { Router } from 'express';
import * as fileController from '../controllers/fileController';
import * as uploadMiddleware from '../middlewares/upload';
import { optionalAuth, requireAuth } from '../middlewares/auth';

const router = Router();

/**
 * 파일 업로드 라우트
 */

// 단일 이미지 업로드
// POST /api/files/upload/image
router.post(
  '/upload/image',
  optionalAuth,
  uploadMiddleware.uploadImage,
  fileController.uploadImage
);

// 다중 이미지 업로드 (최대 10개)
// POST /api/files/upload/images
router.post(
  '/upload/images',
  optionalAuth,
  uploadMiddleware.uploadImages,
  fileController.uploadImages
);

// 단일 동영상 업로드
// POST /api/files/upload/video
router.post(
  '/upload/video',
  optionalAuth,
  uploadMiddleware.uploadVideo,
  fileController.uploadVideo
);

// 혼합 파일 업로드 (이미지 + 동영상)
// POST /api/files/upload/files
router.post(
  '/upload/files',
  optionalAuth,
  uploadMiddleware.uploadFiles,
  fileController.uploadFiles
);

/**
 * 파일 조회 라우트
 */

// 파일 통계 조회
// GET /api/files/stats
router.get('/stats', fileController.getFileStats);

// 게시글의 파일 목록 조회
// GET /api/files/posts/:postId
router.get('/posts/:postId', fileController.getPostFiles);

// 파일 정보 조회
// GET /api/files/:fileId
router.get('/:fileId', fileController.getFile);

/**
 * 파일 삭제 라우트
 */

// 파일 삭제
// DELETE /api/files/:fileId
router.delete('/:fileId', requireAuth, fileController.deleteFile);

export default router;
