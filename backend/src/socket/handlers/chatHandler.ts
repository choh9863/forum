/**
 * Chat Event Handler
 * Socket.io 채팅 이벤트 핸들러
 */

import { Socket, Namespace } from 'socket.io';
import {
  saveMessage,
  getRecentMessages,
  deleteMessage,
  isUserBanned,
  validateBoard,
} from '../../services/chatService';

/**
 * 채팅 이벤트 핸들러
 * 게시판별 실시간 채팅 기능 제공
 */
export function chatHandler(socket: Socket, namespace: Namespace): void {
  const { isAuthenticated, user } = socket.data;

  /**
   * 게시판 채팅방 입장
   * 이벤트: join:board
   * 파라미터: { boardId: string }
   */
  socket.on('join:board', async (data: { boardId: string }): Promise<void> => {
    try {
      const { boardId } = data;

      // 유효성 검증
      if (!boardId || typeof boardId !== 'string') {
        socket.emit('error', {
          message: 'Invalid boardId',
        });
        return;
      }

      // 게시판 존재 확인
      const board = await validateBoard(boardId);

      // 로그인 사용자의 경우 차단 여부 확인
      if (isAuthenticated && user) {
        const banned = await isUserBanned(boardId, user.id);
        if (banned) {
          socket.emit('error', {
            message: 'You are banned from this board',
          });
          return;
        }
      }

      // room에 입장
      const roomName = `board:${boardId}`;
      await socket.join(roomName);

      console.log(
        `${isAuthenticated ? user?.nickname : 'Anonymous'} joined ${board.name} (${roomName})`
      );

      // 최근 메시지 50개 전송
      const messages = await getRecentMessages(boardId, 50);

      socket.emit('messages:history', {
        messages: messages.map((msg: any) => ({
          id: msg.id,
          boardId: msg.boardId,
          content: msg.content,
          authorName: msg.authorName,
          userId: msg.userId,
          createdAt: msg.createdAt,
        })),
        hasMore: messages.length === 50,
      });
    } catch (error) {
      console.error('Error joining board:', error);
      socket.emit('error', {
        message: error instanceof Error ? error.message : 'Failed to join board',
      });
    }
  });

  /**
   * 게시판 채팅방 퇴장
   * 이벤트: leave:board
   * 파라미터: { boardId: string }
   */
  socket.on('leave:board', async (data: { boardId: string }): Promise<void> => {
    try {
      const { boardId } = data;

      // 유효성 검증
      if (!boardId || typeof boardId !== 'string') {
        socket.emit('error', {
          message: 'Invalid boardId',
        });
        return;
      }

      // room에서 퇴장
      const roomName = `board:${boardId}`;
      await socket.leave(roomName);

      console.log(
        `${isAuthenticated ? user?.nickname : 'Anonymous'} left ${roomName}`
      );
    } catch (error) {
      console.error('Error leaving board:', error);
      socket.emit('error', {
        message: 'Failed to leave board',
      });
    }
  });

  /**
   * 메시지 전송
   * 이벤트: send:message
   * 파라미터: { boardId: string, content: string }
   */
  socket.on(
    'send:message',
    async (data: { boardId: string; content: string }): Promise<void> => {
      try {
        const { boardId, content } = data;

        // 유효성 검증
        if (!boardId || typeof boardId !== 'string') {
          socket.emit('error', {
            message: 'Invalid boardId',
          });
          return;
        }

        if (!content || typeof content !== 'string') {
          socket.emit('error', {
            message: 'Invalid content',
          });
          return;
        }

        // 내용 길이 검증 (1-500자)
        const trimmedContent = content.trim();
        if (trimmedContent.length < 1 || trimmedContent.length > 500) {
          socket.emit('error', {
            message: 'Content must be between 1 and 500 characters',
          });
          return;
        }

        // 게시판 존재 확인
        await validateBoard(boardId);

        // 로그인 사용자의 경우 차단 여부 확인
        if (isAuthenticated && user) {
          const banned = await isUserBanned(boardId, user.id);
          if (banned) {
            socket.emit('error', {
              message: 'You are banned from this board',
            });
            return;
          }
        }

        // IP 주소 추출 (익명 사용자의 경우)
        let ipAddress: string | null = null;
        if (!isAuthenticated) {
          // Socket.io handshake에서 IP 추출
          const socketRequest = socket.request as any;
          ipAddress =
            socketRequest.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            socketRequest.connection?.remoteAddress ||
            socketRequest.socket?.remoteAddress ||
            null;
        }

        // 작성자 이름 설정
        const authorName = isAuthenticated && user ? user.nickname : '익명';

        // 메시지 저장
        const message = await saveMessage(
          boardId,
          isAuthenticated && user ? user.id : null,
          trimmedContent,
          ipAddress,
          authorName
        );

        // room에 브로드캐스트
        const roomName = `board:${boardId}`;
        namespace.to(roomName).emit('message:new', {
          id: message.id,
          boardId: message.boardId,
          content: message.content,
          authorName: message.authorName,
          userId: message.userId,
          createdAt: message.createdAt,
        });

        console.log(
          `Message sent to ${roomName} by ${authorName}: ${trimmedContent.substring(0, 30)}...`
        );
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', {
          message: error instanceof Error ? error.message : 'Failed to send message',
        });
      }
    }
  );

  /**
   * 메시지 삭제
   * 이벤트: delete:message
   * 파라미터: { messageId: string, boardId: string }
   */
  socket.on(
    'delete:message',
    async (data: { messageId: string; boardId: string }): Promise<void> => {
      try {
        const { messageId, boardId } = data;

        // 로그인 필수
        if (!isAuthenticated || !user) {
          socket.emit('error', {
            message: 'Authentication required',
          });
          return;
        }

        // 유효성 검증
        if (!messageId || typeof messageId !== 'string') {
          socket.emit('error', {
            message: 'Invalid messageId',
          });
          return;
        }

        if (!boardId || typeof boardId !== 'string') {
          socket.emit('error', {
            message: 'Invalid boardId',
          });
          return;
        }

        // 메시지 삭제 (권한 확인 포함)
        await deleteMessage(messageId, user.id);

        // room에 브로드캐스트
        const roomName = `board:${boardId}`;
        namespace.to(roomName).emit('message:deleted', {
          messageId,
        });

        console.log(`Message ${messageId} deleted by ${user.nickname}`);
      } catch (error) {
        console.error('Error deleting message:', error);
        socket.emit('error', {
          message: error instanceof Error ? error.message : 'Failed to delete message',
        });
      }
    }
  );

  /**
   * 에러 처리
   */
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
}

export default chatHandler;
