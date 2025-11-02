import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { ChatMessage as ChatMessageType } from '../../services/chatService';
import { useAuth } from '../../hooks/useAuth';

interface ChatMessageProps {
  message: ChatMessageType;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const { user } = useAuth();
  const isOwnMessage = user?.id === message.userId;

  const timeAgo = formatDistanceToNow(new Date(message.timestamp), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
        <div className="flex items-end gap-2">
          {!isOwnMessage && (
            <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
              </svg>
            </div>
          )}

          <div className="flex-1">
            {!isOwnMessage && (
              <p className="text-xs text-gray-600 mb-1">{message.username}</p>
            )}
            <div
              className={`rounded-lg px-3 py-2 ${
                isOwnMessage
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
            </div>
            <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
