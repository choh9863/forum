/**
 * Chat Controller
 * Socket.io를 보조하는 REST API 컨트롤러
 */

import { Request, Response } from 'express';
import { AuthRequest } from '../types';
import { getMessages, deleteMessage } from '../services/chatService';

/**
 * 게시판의 채팅 메시지 조회 (페이지네이션)
 * GET /api/boards/:boardId/messages
 *
 * Query Parameters:
 * - page: 페이지 번호 (기본값: 1)
 * - limit: 페이지당 메시지 수 (기본값: 50, 최대 100)
 */
export async function getChatMessages(req: Request, res: Response): Promise<void> {
  try {
    const { boardId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);

    // 유효성 검증
    if (!boardId) {
      res.status(400).json({
        success: false,
        error: 'boardId is required',
      });
      return;
    }

    if (page < 1) {
      res.status(400).json({
        success: false,
        error: 'page must be greater than 0',
      });
      return;
    }

    if (limit < 1 || limit > 100) {
      res.status(400).json({
        success: false,
        error: 'limit must be between 1 and 100',
      });
      return;
    }

    // 메시지 조회
    const result = await getMessages(boardId, page, limit);

    res.status(200).json({
      success: true,
      data: {
        messages: result.messages.map((msg: any) => ({
          id: msg.id,
          boardId: msg.boardId,
          content: msg.content,
          authorName: msg.authorName,
          userId: msg.userId,
          createdAt: msg.createdAt,
        })),
        pagination: result.pagination,
      },
    });
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch messages',
    });
  }
}

/**
 * 채팅 메시지 삭제
 * DELETE /api/messages/:messageId
 *
 * 인증 필요
 * 권한: 작성자 본인 또는 게시판 관리자
 */
export async function deleteChatMessage(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { messageId } = req.params;
    const user = req.user;

    // 인증 확인
    if (!user) {
      res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
      return;
    }

    // 유효성 검증
    if (!messageId) {
      res.status(400).json({
        success: false,
        error: 'messageId is required',
      });
      return;
    }

    // 메시지 삭제
    await deleteMessage(messageId, user.id);

    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting chat message:', error);

    if (error instanceof Error) {
      if (error.message === 'Message not found') {
        res.status(404).json({
          success: false,
          error: 'Message not found',
        });
        return;
      }

      if (error.message === 'Permission denied') {
        res.status(403).json({
          success: false,
          error: 'Permission denied',
        });
        return;
      }
    }

    res.status(500).json({
      success: false,
      error: 'Failed to delete message',
    });
  }
}

export default {
  getChatMessages,
  deleteChatMessage,
};
