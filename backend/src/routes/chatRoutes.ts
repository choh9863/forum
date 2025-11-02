/**
 * Chat Routes
 * Socket.io를 보조하는 REST API 라우트
 */

import { Router } from 'express';
import { getChatMessages, deleteChatMessage } from '../controllers/chatController';
import { requireAuth } from '../middlewares/auth';

const router = Router();

/**
 * 게시판의 채팅 메시지 조회 (페이지네이션)
 * GET /api/boards/:boardId/messages
 *
 * Query Parameters:
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 페이지당 메시지 수 (기본값: 50, 최대 100)
 *
 * Response:
 * {
 *   success: true,
 *   data: {
 *     messages: [
 *       {
 *         id: string,
 *         boardId: string,
 *         content: string,
 *         authorName: string,
 *         userId: string | null,
 *         createdAt: Date
 *       }
 *     ],
 *     pagination: {
 *       page: number,
 *       limit: number,
 *       total: number,
 *       totalPages: number,
 *       hasMore: boolean,
 *       hasPrev: boolean
 *     }
 *   }
 * }
 */
router.get('/boards/:boardId/messages', getChatMessages);

/**
 * 채팅 메시지 삭제
 * DELETE /api/messages/:messageId
 *
 * 인증 필요
 * 권한: 작성자 본인 또는 게시판 관리자
 *
 * Response:
 * {
 *   success: true,
 *   message: "Message deleted successfully"
 * }
 */
router.delete('/messages/:messageId', requireAuth, deleteChatMessage);

export default router;
