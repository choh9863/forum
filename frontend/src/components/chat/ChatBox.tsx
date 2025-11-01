import { useEffect, useRef } from 'react';
import { useChat } from '../../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import Loading from '../common/Loading';

interface ChatBoxProps {
  boardId: string;
  className?: string;
}

export default function ChatBox({ boardId, className = '' }: ChatBoxProps) {
  const { messages, isConnected, sendMessage, typingUsers } = useChat(boardId);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className={`flex flex-col bg-white rounded-lg shadow-md ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">실시간 채팅</h3>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className="text-xs text-gray-500">
              {isConnected ? '연결됨' : '연결 끊김'}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '400px' }}>
        {!isConnected && (
          <div className="flex justify-center py-4">
            <Loading />
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {typingUsers.length > 0 && (
          <div className="text-sm text-gray-500 italic">
            {typingUsers.map(u => u.username).join(', ')}님이 입력 중...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <ChatInput onSend={sendMessage} disabled={!isConnected} />
      </div>
    </div>
  );
}
