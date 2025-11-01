import { Response } from 'express';
import { AuthRequest } from '../types';
import * as fileService from '../services/fileService';

/**
 * 단일 이미지 업로드
 * POST /api/files/upload/image
 */
export const uploadImage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: '파일이 업로드되지 않았습니다.'
      });
      return;
    }

    const { postId } = req.body;

    // postId 검증 (선택적)
    if (!postId) {
      res.status(400).json({
        success: false,
        error: 'postId가 필요합니다.'
      });
      return;
    }

    // 파일 정보 저장
    const savedFile = await fileService.saveFile(
      req.file,
      postId,
      req.user?.id
    );

    res.status(201).json({
      success: true,
      message: '이미지가 성공적으로 업로드되었습니다.',
      data: savedFile
    });
  } catch (error: any) {
    console.error('이미지 업로드 오류:', error);
    res.status(500).json({
      success: false,
      error: '이미지 업로드 중 오류가 발생했습니다.',
      message: error.message
    });
  }
};

/**
 * 다중 이미지 업로드
 * POST /api/files/upload/images
 */
export const uploadImages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        error: '파일이 업로드되지 않았습니다.'
      });
      return;
    }

    const { postId } = req.body;

    // postId 검증 (선택적)
    if (!postId) {
      res.status(400).json({
        success: false,
        error: 'postId가 필요합니다.'
      });
      return;
    }

    // 파일들 저장
    const savedFiles = await fileService.saveFiles(
      req.files as Express.Multer.File[],
      postId,
      req.user?.id
    );

    res.status(201).json({
      success: true,
      message: `${savedFiles.length}개의 이미지가 성공적으로 업로드되었습니다.`,
      data: savedFiles
    });
  } catch (error: any) {
    console.error('이미지 업로드 오류:', error);
    res.status(500).json({
      success: false,
      error: '이미지 업로드 중 오류가 발생했습니다.',
      message: error.message
    });
  }
};

/**
 * 단일 동영상 업로드
 * POST /api/files/upload/video
 */
export const uploadVideo = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: '파일이 업로드되지 않았습니다.'
      });
      return;
    }

    const { postId } = req.body;

    // postId 검증 (선택적)
    if (!postId) {
      res.status(400).json({
        success: false,
        error: 'postId가 필요합니다.'
      });
      return;
    }

    // 파일 정보 저장
    const savedFile = await fileService.saveFile(
      req.file,
      postId,
      req.user?.id
    );

    res.status(201).json({
      success: true,
      message: '동영상이 성공적으로 업로드되었습니다.',
      data: savedFile
    });
  } catch (error: any) {
    console.error('동영상 업로드 오류:', error);
    res.status(500).json({
      success: false,
      error: '동영상 업로드 중 오류가 발생했습니다.',
      message: error.message
    });
  }
};

/**
 * 혼합 파일 업로드 (이미지 + 동영상)
 * POST /api/files/upload/files
 */
export const uploadFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({
        success: false,
        error: '파일이 업로드되지 않았습니다.'
      });
      return;
    }

    const { postId } = req.body;

    // postId 검증 (선택적)
    if (!postId) {
      res.status(400).json({
        success: false,
        error: 'postId가 필요합니다.'
      });
      return;
    }

    // 파일들 저장
    const savedFiles = await fileService.saveFiles(
      req.files as Express.Multer.File[],
      postId,
      req.user?.id
    );

    res.status(201).json({
      success: true,
      message: `${savedFiles.length}개의 파일이 성공적으로 업로드되었습니다.`,
      data: savedFiles
    });
  } catch (error: any) {
    console.error('파일 업로드 오류:', error);
    res.status(500).json({
      success: false,
      error: '파일 업로드 중 오류가 발생했습니다.',
      message: error.message
    });
  }
};

/**
 * 파일 정보 조회
 * GET /api/files/:fileId
 */
export const getFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;

    const file = await fileService.getFileById(fileId);

    if (!file) {
      res.status(404).json({
        success: false,
        error: '파일을 찾을 수 없습니다.'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: file
    });
  } catch (error: any) {
    console.error('파일 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '파일 조회 중 오류가 발생했습니다.',
      message: error.message
    });
  }
};

/**
 * 게시글의 파일 목록 조회
 * GET /api/files/posts/:postId
 */
export const getPostFiles = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;

    const files = await fileService.getFilesByPostId(postId);

    res.status(200).json({
      success: true,
      count: files.length,
      data: files
    });
  } catch (error: any) {
    console.error('파일 목록 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '파일 목록 조회 중 오류가 발생했습니다.',
      message: error.message
    });
  }
};

/**
 * 파일 삭제
 * DELETE /api/files/:fileId
 */
export const deleteFile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fileId } = req.params;

    // 인증 확인
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: '인증이 필요합니다.'
      });
      return;
    }

    // 관리자 권한 확인
    const isAdmin = req.user.role === 'ADMIN' || req.user.role === 'SUPER_ADMIN';

    // 파일 삭제
    const deletedFile = await fileService.deleteFile(fileId, req.user.id, isAdmin);

    res.status(200).json({
      success: true,
      message: '파일이 성공적으로 삭제되었습니다.',
      data: deletedFile
    });
  } catch (error: any) {
    console.error('파일 삭제 오류:', error);

    if (error.message === '파일을 찾을 수 없습니다.') {
      res.status(404).json({
        success: false,
        error: error.message
      });
      return;
    }

    if (error.message === '파일을 삭제할 권한이 없습니다.') {
      res.status(403).json({
        success: false,
        error: error.message
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: '파일 삭제 중 오류가 발생했습니다.',
      message: error.message
    });
  }
};

/**
 * 파일 통계 조회
 * GET /api/files/stats
 */
export const getFileStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { postId, userId } = req.query;

    const stats = await fileService.getFileStats(
      postId as string | undefined,
      userId as string | undefined
    );

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error: any) {
    console.error('파일 통계 조회 오류:', error);
    res.status(500).json({
      success: false,
      error: '파일 통계 조회 중 오류가 발생했습니다.',
      message: error.message
    });
  }
};

export default {
  uploadImage,
  uploadImages,
  uploadVideo,
  uploadFiles,
  getFile,
  getPostFiles,
  deleteFile,
  getFileStats
};
