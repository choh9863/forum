import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import { isImageFile, isVideoFile, MAX_IMAGE_SIZE, MAX_VIDEO_SIZE } from '../config/multer';

const prisma = new PrismaClient();

// 환경 변수에서 백엔드 URL 가져오기
const BACKEND_URL = process.env.BACKEND_URL || process.env.API_URL || 'http://localhost:3000';

/**
 * 파일 정보를 DB에 저장
 */
export const saveFile = async (
  file: Express.Multer.File,
  postId: string,
  userId?: string
) => {
  try {
    // 파일 타입에 따라 URL 경로 결정
    const fileType = isImageFile(file.mimetype) ? 'images' : 'videos';
    const fileUrl = `${BACKEND_URL}/uploads/${fileType}/${file.filename}`;

    // DB에 파일 정보 저장
    const savedFile = await prisma.file.create({
      data: {
        postId,
        userId: userId || null,
        filename: file.filename,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: fileUrl
      }
    });

    return savedFile;
  } catch (error) {
    // DB 저장 실패 시 업로드된 파일 삭제
    if (fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    throw error;
  }
};

/**
 * 여러 파일을 DB에 저장
 */
export const saveFiles = async (
  files: Express.Multer.File[],
  postId: string,
  userId?: string
) => {
  try {
    const savedFiles = await Promise.all(
      files.map(file => saveFile(file, postId, userId))
    );
    return savedFiles;
  } catch (error) {
    // DB 저장 실패 시 업로드된 모든 파일 삭제
    files.forEach(file => {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    });
    throw error;
  }
};

/**
 * 게시글의 파일 목록 조회
 */
export const getFilesByPostId = async (postId: string) => {
  const files = await prisma.file.findMany({
    where: { postId },
    orderBy: { createdAt: 'asc' }
  });
  return files;
};

/**
 * 파일 상세 정보 조회
 */
export const getFileById = async (fileId: string) => {
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: {
      post: {
        select: {
          id: true,
          title: true,
          authorId: true
        }
      },
      user: {
        select: {
          id: true,
          nickname: true
        }
      }
    }
  });
  return file;
};

/**
 * 파일 삭제 (권한 확인 + DB + 실제 파일)
 */
export const deleteFile = async (fileId: string, userId?: string, isAdmin: boolean = false) => {
  // 파일 정보 조회
  const file = await prisma.file.findUnique({
    where: { id: fileId },
    include: {
      post: {
        select: {
          authorId: true
        }
      }
    }
  });

  if (!file) {
    throw new Error('파일을 찾을 수 없습니다.');
  }

  // 권한 확인: 게시글 작성자 또는 관리자만 삭제 가능
  const isAuthor = file.post.authorId === userId;
  if (!isAuthor && !isAdmin) {
    throw new Error('파일을 삭제할 권한이 없습니다.');
  }

  // DB에서 파일 정보 삭제
  await prisma.file.delete({
    where: { id: fileId }
  });

  // 실제 파일 삭제
  if (fs.existsSync(file.path)) {
    fs.unlinkSync(file.path);
  }

  return file;
};

/**
 * 여러 파일 삭제
 */
export const deleteFilesByPostId = async (postId: string, userId?: string, isAdmin: boolean = false) => {
  const files = await getFilesByPostId(postId);

  for (const file of files) {
    await deleteFile(file.id, userId, isAdmin);
  }

  return files;
};

/**
 * MIME 타입 검증
 */
export const validateFileType = (mimetype: string): boolean => {
  return isImageFile(mimetype) || isVideoFile(mimetype);
};

/**
 * 파일 크기 검증
 */
export const validateFileSize = (size: number, type: 'image' | 'video'): { valid: boolean; error?: string } => {
  const maxSize = type === 'image' ? MAX_IMAGE_SIZE : MAX_VIDEO_SIZE;
  const maxSizeMB = maxSize / 1024 / 1024;

  if (size > maxSize) {
    return {
      valid: false,
      error: `${type === 'image' ? '이미지' : '동영상'} 파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다. (현재: ${(size / 1024 / 1024).toFixed(2)}MB)`
    };
  }

  return { valid: true };
};

/**
 * 파일 존재 여부 확인
 */
export const fileExists = async (fileId: string): Promise<boolean> => {
  const file = await prisma.file.findUnique({
    where: { id: fileId }
  });
  return file !== null;
};

/**
 * 파일 통계 조회
 */
export const getFileStats = async (postId?: string, userId?: string) => {
  const where: any = {};
  if (postId) where.postId = postId;
  if (userId) where.userId = userId;

  const totalFiles = await prisma.file.count({ where });
  const totalSize = await prisma.file.aggregate({
    where,
    _sum: { size: true }
  });

  return {
    totalFiles,
    totalSize: totalSize._sum.size || 0
  };
};

export default {
  saveFile,
  saveFiles,
  getFilesByPostId,
  getFileById,
  deleteFile,
  deleteFilesByPostId,
  validateFileType,
  validateFileSize,
  fileExists,
  getFileStats
};
