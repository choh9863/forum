import { useEffect, useState, useCallback } from 'react';
import { chatService, type ChatMessage, type TypingUser } from '../services/chatService';
import { useAuth } from './useAuth';

export const useChat = (boardId: string) => {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  // Connect to chat
  useEffect(() => {
    if (!boardId) return;

    // Connect to socket
    chatService.connect(token || undefined);

    // Join board chat room
    chatService.joinBoard(boardId, user?.username);

    // Setup message handler
    const unsubscribeMessage = chatService.onMessage((message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Setup typing handler
    const unsubscribeTyping = chatService.onTyping((users) => {
      setTypingUsers(users);
    });

    // Setup user joined handler
    const unsubscribeUserJoined = chatService.onUserJoined((username) => {
      console.log(`${username} joined the chat`);
    });

    // Setup user left handler
    const unsubscribeUserLeft = chatService.onUserLeft((username) => {
      console.log(`${username} left the chat`);
    });

    // Setup connection handler
    const unsubscribeConnection = chatService.onConnectionChange((connected) => {
      setIsConnected(connected);
    });

    // Cleanup on unmount
    return () => {
      chatService.leaveBoard(boardId);
      unsubscribeMessage();
      unsubscribeTyping();
      unsubscribeUserJoined();
      unsubscribeUserLeft();
      unsubscribeConnection();
    };
  }, [boardId, token, user?.username]);

  // Send message
  const sendMessage = useCallback(
    (content: string, username?: string) => {
      if (!content.trim()) return;

      chatService.sendMessage(boardId, content, username || user?.username);

      // Stop typing indicator
      if (isTyping) {
        chatService.sendTyping(boardId, false);
        setIsTyping(false);
      }
    },
    [boardId, user?.username, isTyping]
  );

  // Delete message
  const deleteMessage = useCallback(
    (messageId: string) => {
      chatService.deleteMessage(messageId, boardId);
    },
    [boardId]
  );

  // Send typing indicator
  const startTyping = useCallback(() => {
    if (!isTyping) {
      chatService.sendTyping(boardId, true);
      setIsTyping(true);
    }
  }, [boardId, isTyping]);

  const stopTyping = useCallback(() => {
    if (isTyping) {
      chatService.sendTyping(boardId, false);
      setIsTyping(false);
    }
  }, [boardId, isTyping]);

  // Clear messages
  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    typingUsers,
    isConnected,
    sendMessage,
    deleteMessage,
    startTyping,
    stopTyping,
    clearMessages,
  };
};
