import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export interface ChatMessage {
  id: string;
  content: string;
  userId?: string;
  username: string;
  boardId: string;
  timestamp: string;
  isAnonymous?: boolean;
}

export interface TypingUser {
  userId?: string;
  username: string;
}

class ChatService {
  private socket: Socket | null = null;
  private messageHandlers: ((message: ChatMessage) => void)[] = [];
  private typingHandlers: ((users: TypingUser[]) => void)[] = [];
  private userJoinedHandlers: ((username: string) => void)[] = [];
  private userLeftHandlers: ((username: string) => void)[] = [];
  private connectionHandlers: ((connected: boolean) => void)[] = [];

  // Connect to socket server
  connect(token?: string): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const auth: any = {};
    if (token) {
      auth.token = token;
    }

    this.socket = io(SOCKET_URL, {
      auth,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.setupEventListeners();

    return this.socket;
  }

  // Disconnect from socket server
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // Setup event listeners
  private setupEventListeners(): void {
    if (!this.socket) return;

    // Connection events
    this.socket.on('connect', () => {
      console.log('Socket connected');
      this.connectionHandlers.forEach(handler => handler(true));
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
      this.connectionHandlers.forEach(handler => handler(false));
    });

    // Message events
    this.socket.on('chat:message', (message: ChatMessage) => {
      this.messageHandlers.forEach(handler => handler(message));
    });

    // Typing events
    this.socket.on('chat:typing', (users: TypingUser[]) => {
      this.typingHandlers.forEach(handler => handler(users));
    });

    // User events
    this.socket.on('chat:user-joined', (username: string) => {
      this.userJoinedHandlers.forEach(handler => handler(username));
    });

    this.socket.on('chat:user-left', (username: string) => {
      this.userLeftHandlers.forEach(handler => handler(username));
    });

    // Error events
    this.socket.on('error', (error: any) => {
      console.error('Socket error:', error);
    });
  }

  // Join a board's chat room
  joinBoard(boardId: string, username?: string): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('chat:join-board', { boardId, username });
  }

  // Leave a board's chat room
  leaveBoard(boardId: string): void {
    if (!this.socket) return;

    this.socket.emit('chat:leave-board', { boardId });
  }

  // Send a message
  sendMessage(boardId: string, content: string, username?: string): void {
    if (!this.socket) {
      console.error('Socket not connected');
      return;
    }

    this.socket.emit('chat:send-message', {
      boardId,
      content,
      username,
    });
  }

  // Delete a message (moderator/admin only)
  deleteMessage(messageId: string, boardId: string): void {
    if (!this.socket) return;

    this.socket.emit('chat:delete-message', {
      messageId,
      boardId,
    });
  }

  // Send typing indicator
  sendTyping(boardId: string, isTyping: boolean): void {
    if (!this.socket) return;

    this.socket.emit('chat:typing', {
      boardId,
      isTyping,
    });
  }

  // Event handler registration
  onMessage(handler: (message: ChatMessage) => void): () => void {
    this.messageHandlers.push(handler);
    return () => {
      this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
    };
  }

  onTyping(handler: (users: TypingUser[]) => void): () => void {
    this.typingHandlers.push(handler);
    return () => {
      this.typingHandlers = this.typingHandlers.filter(h => h !== handler);
    };
  }

  onUserJoined(handler: (username: string) => void): () => void {
    this.userJoinedHandlers.push(handler);
    return () => {
      this.userJoinedHandlers = this.userJoinedHandlers.filter(h => h !== handler);
    };
  }

  onUserLeft(handler: (username: string) => void): () => void {
    this.userLeftHandlers.push(handler);
    return () => {
      this.userLeftHandlers = this.userLeftHandlers.filter(h => h !== handler);
    };
  }

  onConnectionChange(handler: (connected: boolean) => void): () => void {
    this.connectionHandlers.push(handler);
    return () => {
      this.connectionHandlers = this.connectionHandlers.filter(h => h !== handler);
    };
  }

  // Check if socket is connected
  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  // Get socket instance
  getSocket(): Socket | null {
    return this.socket;
  }
}

// Export singleton instance
export const chatService = new ChatService();
