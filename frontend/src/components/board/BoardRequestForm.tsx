import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRequestBoard } from '../../hooks/useBoard';
import Button from '../common/Button';
import Input from '../common/Input';
import Modal from '../common/Modal';

const boardRequestSchema = z.object({
  name: z.string()
    .min(2, '게시판 이름은 최소 2자 이상이어야 합니다')
    .max(50, '게시판 이름은 최대 50자까지 가능합니다'),
  slug: z.string()
    .min(2, 'URL 슬러그는 최소 2자 이상이어야 합니다')
    .max(50, 'URL 슬러그는 최대 50자까지 가능합니다')
    .regex(/^[a-z0-9-]+$/, 'URL 슬러그는 영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다'),
  description: z.string().max(500, '설명은 최대 500자까지 가능합니다').optional(),
});

type BoardRequestFormData = z.infer<typeof boardRequestSchema>;

interface BoardRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BoardRequestForm({ isOpen, onClose }: BoardRequestFormProps) {
  const { mutate: requestBoard, isPending } = useRequestBoard();
  const [successMessage, setSuccessMessage] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<BoardRequestFormData>({
    resolver: zodResolver(boardRequestSchema),
  });

  const name = watch('name');

  // Auto-generate slug from name
  const generateSlug = () => {
    if (name) {
      const slug = name
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, '');
      return slug;
    }
    return '';
  };

  const onSubmit = async (data: BoardRequestFormData) => {
    try {
      await requestBoard(data, {
        onSuccess: () => {
          setSuccessMessage('게시판 개설 요청이 완료되었습니다. 관리자 승인을 기다려주세요.');
          reset();
          setTimeout(() => {
            setSuccessMessage('');
            onClose();
          }, 2000);
        },
      });
    } catch (error) {
      console.error('Board request failed:', error);
    }
  };

  const handleClose = () => {
    reset();
    setSuccessMessage('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="게시판 개설 요청">
      {successMessage && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            게시판 이름 *
          </label>
          <Input
            id="name"
            type="text"
            placeholder="예: 자유게시판"
            {...register('name')}
            error={errors.name?.message}
          />
        </div>

        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
            URL 슬러그 *
          </label>
          <Input
            id="slug"
            type="text"
            placeholder={generateSlug() || '예: free-board'}
            {...register('slug')}
            error={errors.slug?.message}
          />
          <p className="mt-1 text-xs text-gray-500">
            URL에 사용될 고유 식별자 (영문 소문자, 숫자, 하이픈만 사용)
          </p>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            게시판 설명
          </label>
          <textarea
            id="description"
            rows={3}
            placeholder="게시판에 대한 간단한 설명을 입력하세요"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="flex gap-2 pt-4">
          <Button
            type="submit"
            className="flex-1"
            disabled={isPending}
          >
            {isPending ? '요청 중...' : '개설 요청'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isPending}
          >
            취소
          </Button>
        </div>
      </form>
    </Modal>
  );
}
