import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Comment } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useDeleteComment, useLikeComment, useUnlikeComment } from '../../hooks/useComments';
import CommentForm from './CommentForm';
import Button from '../common/Button';

interface CommentItemProps {
  comment: Comment;
  postId: string;
  replies?: Comment[];
  isReply?: boolean;
}

export default function CommentItem({ comment, postId, replies = [], isReply = false }: CommentItemProps) {
  const { user, isAuthenticated } = useAuth();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const { mutate: deleteComment } = useDeleteComment();
  const { mutate: likeComment } = useLikeComment();
  const { mutate: unlikeComment } = useUnlikeComment();

  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  const canEdit = isAuthenticated && user?.id === comment.authorId;
  const canDelete = canEdit || user?.role === 'ADMIN' || user?.role === 'MODERATOR';

  const reactionCount = comment._count?.reactions || 0;

  const handleDelete = () => {
    if (confirm('정말 삭제하시겠습니까?')) {
      deleteComment(comment.id);
    }
  };

  const handleLike = () => {
    if (!isAuthenticated) {
      alert('로그인이 필요합니다.');
      return;
    }

    if (isLiked) {
      unlikeComment(comment.id, {
        onSuccess: () => setIsLiked(false),
      });
    } else {
      likeComment({ commentId: comment.id }, {
        onSuccess: () => setIsLiked(true),
      });
    }
  };

  return (
    <div className={`${isReply ? 'ml-12 mt-3' : ''}`}>
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900">
                {comment.author?.username || '익명'}
              </span>
              <span className="text-xs text-gray-500">{timeAgo}</span>
            </div>

            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>

            <div className="flex items-center gap-3 mt-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-1 text-sm ${
                  isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                }`}
              >
                <svg className="w-4 h-4" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                {reactionCount > 0 && <span>{reactionCount}</span>}
              </button>

              {!isReply && (
                <button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  답글
                </button>
              )}

              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="text-sm text-gray-500 hover:text-red-600"
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {showReplyForm && (
        <div className="ml-12 mt-3">
          <CommentForm
            postId={postId}
            parentId={comment.id}
            onSuccess={() => setShowReplyForm(false)}
          />
        </div>
      )}

      {replies.length > 0 && (
        <div className="space-y-3 mt-3">
          {replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              postId={postId}
              isReply={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
