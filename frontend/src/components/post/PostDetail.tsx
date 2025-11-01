import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Post } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useLikePost, useUnlikePost, useDeletePost } from '../../hooks/usePosts';
import { useState } from 'react';
import Button from '../common/Button';
import { useNavigate } from 'react-router-dom';

interface PostDetailProps {
  post: Post;
}

export default function PostDetail({ post }: PostDetailProps) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { mutate: likePost } = useLikePost();
  const { mutate: unlikePost } = useUnlikePost();
  const { mutate: deletePost } = useDeletePost();
  const [isLiked, setIsLiked] = useState(false);

  const commentCount = post._count?.comments || 0;
  const reactionCount = post._count?.reactions || 0;

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  const canEdit = isAuthenticated && user?.id === post.authorId;
  const canDelete = canEdit || user?.role === 'ADMIN' || user?.role === 'MODERATOR';

  const handleLike = () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (isLiked) {
      unlikePost(post.id, {
        onSuccess: () => setIsLiked(false),
      });
    } else {
      likePost({ postId: post.id }, {
        onSuccess: () => setIsLiked(true),
      });
    }
  };

  const handleDelete = () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deletePost(post.id, {
        onSuccess: () => {
          navigate(`/board/${post.board?.slug}`);
        },
      });
    }
  };

  return (
    <article className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {post.isPinned && (
                <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded">
                  공지
                </span>
              )}
              {post.isLocked && (
                <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded">
                  잠금
                </span>
              )}
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">{post.title}</h1>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="font-medium">{post.author?.username || '익명'}</span>
            </div>
            <span>{timeAgo}</span>
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              조회 {post.viewCount}
            </span>
          </div>

          {(canEdit || canDelete) && (
            <div className="flex gap-2">
              {canEdit && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/board/${post.board?.slug}/post/${post.id}/edit`)}
                >
                  수정
                </Button>
              )}
              {canDelete && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleDelete}
                >
                  삭제
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Files/Images */}
        {post.files && post.files.length > 0 && (
          <div className="mt-6 space-y-4">
            <h3 className="font-semibold text-gray-900">첨부 파일</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {post.files.map((file) => (
                <div key={file.id} className="border border-gray-200 rounded overflow-hidden">
                  {file.mimeType.startsWith('image/') ? (
                    <img
                      src={file.path}
                      alt={file.originalName}
                      className="w-full h-48 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  <div className="p-2 bg-gray-50">
                    <p className="text-xs text-gray-600 truncate">{file.originalName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer - Reactions */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
                isLiked
                  ? 'bg-red-100 text-red-700'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span className="font-medium">{reactionCount}</span>
            </button>

            <div className="flex items-center gap-2 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
              </svg>
              <span className="font-medium">댓글 {commentCount}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button className="p-2 hover:bg-gray-200 rounded transition-colors">
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
