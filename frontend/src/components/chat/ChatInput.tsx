import { useState } from 'react';
import type { FormEvent } from 'react';
import Button from '../common/Button';

interface ChatInputProps {
  onSend: (message: string, username?: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [message, setMessage] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();

    if (!message.trim() || disabled) return;

    onSend(message);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={disabled ? '연결 중...' : '메시지를 입력하세요...'}
        disabled={disabled}
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
      />
      <Button
        type="submit"
        size="sm"
        disabled={disabled || !message.trim()}
      >
        전송
      </Button>
    </form>
  );
}
