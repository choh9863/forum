import { Request, Response, NextFunction } from 'express';
import { imageUpload, videoUpload, mixedUpload, isImageFile, isVideoFile, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from '../config/multer';

// 에러 처리 래퍼
const handleMulterError = (err: any, res: Response, next: NextFunction): void => {
  if (err) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(413).json({
        success: false,
        error: '파일 크기가 너무 큽니다.',
        message: err.message
      });
      return;
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      res.status(400).json({
        success: false,
        error: '파일 개수가 제한을 초과했습니다.',
        message: err.message
      });
      return;
    }
    if (err.code === 'LIMIT_UNEXPECTED_FILE') {
      res.status(400).json({
        success: false,
        error: '예상치 못한 필드에서 파일이 전송되었습니다.',
        message: err.message
      });
      return;
    }
    res.status(400).json({
      success: false,
      error: '파일 업로드 중 오류가 발생했습니다.',
      message: err.message
    });
    return;
  }
  next();
};

// 파일 크기 및 타입 검증
const validateFile = (file: Express.Multer.File): { valid: boolean; error?: string } => {
  // MIME 타입 검증
  if (!isImageFile(file.mimetype) && !isVideoFile(file.mimetype)) {
    return {
      valid: false,
      error: `허용되지 않은 파일 형식입니다: ${file.mimetype}`
    };
  }

  // 파일 크기 검증
  if (isImageFile(file.mimetype) && file.size > MAX_IMAGE_SIZE) {
    return {
      valid: false,
      error: `이미지 파일 크기는 10MB를 초과할 수 없습니다. (현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
    };
  }

  if (isVideoFile(file.mimetype) && file.size > MAX_VIDEO_SIZE) {
    return {
      valid: false,
      error: `동영상 파일 크기는 100MB를 초과할 수 없습니다. (현재: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
    };
  }

  return { valid: true };
};

// 단일 이미지 업로드 미들웨어
export const uploadImage = (req: Request, res: Response, next: NextFunction): void => {
  imageUpload.single('file')(req, res, (err) => {
    if (err) {
      handleMulterError(err, res, next);
      return;
    }

    // 파일이 없으면 에러
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: '파일이 업로드되지 않았습니다.'
      });
      return;
    }

    // 파일 검증
    const validation = validateFile(req.file);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: validation.error
      });
      return;
    }

    next();
  });
};

// 다중 이미지 업로드 미들웨어 (최대 10개)
export const uploadImages = (req: Request, res: Response, next: NextFunction): void => {
  imageUpload.array('files', 10)(req, res, (err) => {
    if (err) {
      handleMulterError(err, res, next);
      return;
    }

    // 파일이 없으면 에러
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      res.status(400).json({
        success: false,
        error: '파일이 업로드되지 않았습니다.'
      });
      return;
    }

    // 모든 파일 검증
    const files = req.files as Express.Multer.File[];
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          error: validation.error
        });
        return;
      }
    }

    next();
  });
};

// 단일 동영상 업로드 미들웨어
export const uploadVideo = (req: Request, res: Response, next: NextFunction): void => {
  videoUpload.single('file')(req, res, (err) => {
    if (err) {
      handleMulterError(err, res, next);
      return;
    }

    // 파일이 없으면 에러
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: '파일이 업로드되지 않았습니다.'
      });
      return;
    }

    // 파일 검증
    const validation = validateFile(req.file);
    if (!validation.valid) {
      res.status(400).json({
        success: false,
        error: validation.error
      });
      return;
    }

    next();
  });
};

// 혼합 파일 업로드 미들웨어 (이미지 + 동영상)
export const uploadFiles = (req: Request, res: Response, next: NextFunction): void => {
  mixedUpload.array('files', 10)(req, res, (err) => {
    if (err) {
      handleMulterError(err, res, next);
      return;
    }

    // 파일이 없으면 에러
    if (!req.files || (Array.isArray(req.files) && req.files.length === 0)) {
      res.status(400).json({
        success: false,
        error: '파일이 업로드되지 않았습니다.'
      });
      return;
    }

    // 모든 파일 검증
    const files = req.files as Express.Multer.File[];
    for (const file of files) {
      const validation = validateFile(file);
      if (!validation.valid) {
        res.status(400).json({
          success: false,
          error: validation.error
        });
        return;
      }
    }

    next();
  });
};
