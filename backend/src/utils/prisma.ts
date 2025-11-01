/**
 * Prisma Client Singleton
 * 데이터베이스 연결을 위한 Prisma 클라이언트 인스턴스
 */

import { PrismaClient } from '@prisma/client';

// Prisma Client 전역 타입 선언 (개발 환경에서 핫 리로드 시 중복 인스턴스 방지)
declare global {
  var prisma: PrismaClient | undefined;
}

// Prisma Client 인스턴스 생성
const prisma = global.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development'
    ? ['query', 'error', 'warn']
    : ['error'],
});

// 개발 환경에서는 전역 변수에 저장하여 핫 리로드 시 재사용
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

// Graceful shutdown 처리
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;
