import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// 업로드 디렉토리 설정
const UPLOAD_DIR = path.join(__dirname, '../../uploads');
const IMAGE_DIR = path.join(UPLOAD_DIR, 'images');
const VIDEO_DIR = path.join(UPLOAD_DIR, 'videos');

// 디렉토리 생성
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}
if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}
if (!fs.existsSync(VIDEO_DIR)) {
  fs.mkdirSync(VIDEO_DIR, { recursive: true });
}

// 허용된 MIME 타입
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp'
];

export const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/webm',
  'video/mpeg'
];

// 파일 크기 제한 (bytes)
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

// 파일 타입 체크 함수
export const isImageFile = (mimetype: string): boolean => {
  return ALLOWED_IMAGE_TYPES.includes(mimetype);
};

export const isVideoFile = (mimetype: string): boolean => {
  return ALLOWED_VIDEO_TYPES.includes(mimetype);
};

export const isAllowedFileType = (mimetype: string): boolean => {
  return isImageFile(mimetype) || isVideoFile(mimetype);
};

// Multer 저장소 설정
const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    // MIME 타입에 따라 저장 디렉토리 결정
    if (isImageFile(file.mimetype)) {
      cb(null, IMAGE_DIR);
    } else if (isVideoFile(file.mimetype)) {
      cb(null, VIDEO_DIR);
    } else {
      cb(new Error('허용되지 않은 파일 형식입니다.'), '');
    }
  },
  filename: (_req, file, cb) => {
    // 파일명: UUID + 원본 확장자
    const ext = path.extname(file.originalname);
    const filename = `${uuidv4()}${ext}`;
    cb(null, filename);
  }
});

// 파일 필터 (MIME 타입 검증)
const fileFilter = (
  _req: Express.Request,
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) => {
  if (isAllowedFileType(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`허용되지 않은 파일 형식입니다. (${file.mimetype})`));
  }
};

// 이미지 업로드 설정
export const imageUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_IMAGE_SIZE,
    files: 10 // 최대 10개 파일
  }
});

// 동영상 업로드 설정
export const videoUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_VIDEO_SIZE,
    files: 1 // 최대 1개 파일
  }
});

// 혼합 파일 업로드 설정 (이미지 + 동영상)
export const mixedUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: MAX_VIDEO_SIZE, // 최대 크기는 동영상 기준
    files: 10
  }
});

export default {
  imageUpload,
  videoUpload,
  mixedUpload,
  UPLOAD_DIR,
  IMAGE_DIR,
  VIDEO_DIR
};
