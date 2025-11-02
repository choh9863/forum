import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../hooks/useAuth';
import { useCreateComment, useCreateAnonymousComment } from '../../hooks/useComments';
import Button from '../common/Button';
import Input from '../common/Input';

const commentSchema = z.object({
  content: z.string()
    .min(1, '댓글을 입력하세요')
    .max(1000, '댓글은 최대 1000자까지 가능합니다'),
});

const anonymousCommentSchema = commentSchema.extend({
  password: z.string()
    .min(4, '비밀번호는 최소 4자 이상이어야 합니다'),
});

type CommentFormData = z.infer<typeof commentSchema>;
type AnonymousCommentFormData = z.infer<typeof anonymousCommentSchema>;

interface CommentFormProps {
  postId: string;
  parentId?: string;
  onSuccess?: () => void;
}

export default function CommentForm({ postId, parentId, onSuccess }: CommentFormProps) {
  const { isAuthenticated } = useAuth();
  const [isAnonymous, setIsAnonymous] = useState(!isAuthenticated);

  const { mutate: createComment, isPending } = useCreateComment();
  const { mutate: createAnonymousComment, isPending: isPendingAnonymous } = useCreateAnonymousComment();

  const schema = isAnonymous ? anonymousCommentSchema : commentSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<any>({
    resolver: zodResolver(schema) as any,
  });

  const onSubmit = async (data: AnonymousCommentFormData) => {
    const commentData = {
      ...data,
      postId,
      parentId,
    };

    const mutation = isAnonymous ? createAnonymousComment : createComment;

    mutation(commentData as any, {
      onSuccess: () => {
        reset();
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      {isAuthenticated && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded"
          />
          <span className="text-gray-700">익명으로 작성</span>
        </label>
      )}

      <div>
        <textarea
          placeholder={parentId ? '답글을 입력하세요...' : '댓글을 입력하세요...'}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          {...register('content')}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      {isAnonymous && (
        <div>
          <Input
            type="password"
            placeholder="비밀번호 (수정/삭제 시 필요)"
            {...register('password')}
            error={errors.password?.message}
          />
        </div>
      )}

      <Button
        type="submit"
        size="sm"
        disabled={isPending || isPendingAnonymous}
      >
        {isPending || isPendingAnonymous ? '작성 중...' : parentId ? '답글 작성' : '댓글 작성'}
      </Button>
    </form>
  );
}
