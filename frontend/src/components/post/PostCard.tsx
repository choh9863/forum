import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { Post } from '../../types';

interface PostCardProps {
  post: Post;
  showBoard?: boolean;
}

export default function PostCard({ post, showBoard = false }: PostCardProps) {
  const commentCount = post._count?.comments || 0;
  const reactionCount = post._count?.reactions || 0;
  const hasFiles = post.files && post.files.length > 0;

  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
    locale: ko,
  });

  return (
    <Link
      to={`/board/${post.board?.slug}/post/${post.id}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-4 border border-gray-200 hover:border-blue-400"
    >
      <div className="flex items-start gap-3">
        {/* Thumbnail if files exist */}
        {hasFiles && post.files && post.files[0] && (
          <div className="flex-shrink-0">
            <div className="w-20 h-20 bg-gray-200 rounded overflow-hidden">
              <img
                src={post.files[0].path}
                alt="thumbnail"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Title and badges */}
          <div className="flex items-start gap-2 mb-1">
            {post.isPinned && (
              <span className="flex-shrink-0 px-2 py-0.5 bg-red-100 text-red-700 text-xs font-bold rounded">
                공지
              </span>
            )}
            <h3 className="font-semibold text-gray-900 line-clamp-1 flex-1">
              {post.title}
            </h3>
            {commentCount > 0 && (
              <span className="flex-shrink-0 text-blue-600 text-sm font-medium">
                [{commentCount}]
              </span>
            )}
          </div>

          {/* Content preview */}
          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {post.content.replace(/<[^>]*>/g, '')}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="font-medium text-gray-700">
              {post.author?.username || '익명'}
            </span>
            <span>{timeAgo}</span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              {post.viewCount}
            </span>
            {reactionCount > 0 && (
              <span className="flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
                {reactionCount}
              </span>
            )}
            {showBoard && post.board && (
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                {post.board.name}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
