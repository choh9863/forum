import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useCreatePost, useCreateAnonymousPost } from '../../hooks/usePosts';
import { useAuth } from '../../hooks/useAuth';
import Button from '../common/Button';
import Input from '../common/Input';
import PostEditor from './PostEditor';
import FileUpload from '../file/FileUpload';

const postSchema = z.object({
  title: z.string()
    .min(2, '제목은 최소 2자 이상이어야 합니다')
    .max(200, '제목은 최대 200자까지 가능합니다'),
  content: z.string()
    .min(10, '내용은 최소 10자 이상이어야 합니다'),
});

const anonymousPostSchema = postSchema.extend({
  password: z.string()
    .min(4, '비밀번호는 최소 4자 이상이어야 합니다')
    .max(50, '비밀번호가 너무 깁니다'),
  authorName: z.string()
    .min(2, '이름은 최소 2자 이상이어야 합니다')
    .max(20, '이름은 최대 20자까지 가능합니다')
    .optional(),
});

type PostFormData = z.infer<typeof postSchema>;
type AnonymousPostFormData = z.infer<typeof anonymousPostSchema>;

interface PostFormProps {
  boardId: string;
  boardSlug: string;
  initialData?: Partial<PostFormData>;
  isEdit?: boolean;
  postId?: string;
}

export default function PostForm({ boardId, boardSlug, initialData, isEdit = false, postId }: PostFormProps) {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [isAnonymous, setIsAnonymous] = useState(!isAuthenticated);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);

  const { mutate: createPost, isPending: isCreating } = useCreatePost();
  const { mutate: createAnonymousPost, isPending: isCreatingAnonymous } = useCreateAnonymousPost();

  const schema = isAnonymous ? anonymousPostSchema : postSchema;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
  } = useForm<any>({
    resolver: zodResolver(schema) as any,
    defaultValues: initialData as any,
  });

  const content = watch('content');

  const onSubmit = async (data: AnonymousPostFormData) => {
    const postData = {
      ...data,
      boardId,
      files: uploadedFiles.map(f => f.id),
    };

    const mutation = isAnonymous ? createAnonymousPost : createPost;

    mutation(postData as any, {
      onSuccess: (post) => {
        navigate(`/board/${boardSlug}/post/${post.id}`);
      },
      onError: (error) => {
        console.error('Failed to create post:', error);
        alert('게시글 작성에 실패했습니다. 다시 시도해주세요.');
      },
    });
  };

  const isPending = isCreating || isCreatingAnonymous;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Anonymous toggle */}
      {isAuthenticated && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm text-gray-700">익명으로 작성</span>
          </label>
        </div>
      )}

      {/* Anonymous author name */}
      {isAnonymous && (
        <div>
          <label htmlFor="authorName" className="block text-sm font-medium text-gray-700 mb-1">
            작성자 이름
          </label>
          <Input
            id="authorName"
            type="text"
            placeholder="익명"
            {...register('authorName')}
            error={errors.authorName?.message}
          />
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          제목 *
        </label>
        <Input
          id="title"
          type="text"
          placeholder="제목을 입력하세요"
          {...register('title')}
          error={errors.title?.message}
        />
      </div>

      {/* Content */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          내용 *
        </label>
        <Controller
          name="content"
          control={control}
          render={({ field }) => (
            <PostEditor
              value={field.value || ''}
              onChange={field.onChange}
              placeholder="내용을 입력하세요..."
            />
          )}
        />
        {errors.content && (
          <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
        )}
      </div>

      {/* File upload */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          파일 첨부
        </label>
        <FileUpload
          onUpload={(files) => setUploadedFiles([...uploadedFiles, ...files])}
          onRemove={(fileId) => setUploadedFiles(uploadedFiles.filter(f => f.id !== fileId))}
          uploadedFiles={uploadedFiles}
        />
      </div>

      {/* Anonymous password */}
      {isAnonymous && (
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            비밀번호 * (수정/삭제 시 필요)
          </label>
          <Input
            id="password"
            type="password"
            placeholder="비밀번호 (최소 4자)"
            {...register('password')}
            error={errors.password?.message}
          />
          <p className="mt-1 text-xs text-gray-500">
            게시글을 수정하거나 삭제할 때 필요한 비밀번호입니다.
          </p>
        </div>
      )}

      {/* Preview */}
      {content && (
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">미리보기</h3>
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3">
        <Button
          type="submit"
          className="flex-1"
          disabled={isPending}
        >
          {isPending ? '작성 중...' : isEdit ? '수정하기' : '작성하기'}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate(-1)}
          disabled={isPending}
        >
          취소
        </Button>
      </div>
    </form>
  );
}
