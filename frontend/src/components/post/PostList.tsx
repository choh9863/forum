import type { Post } from '../../types';
import PostCard from './PostCard';
import Loading from '../common/Loading';

interface PostListProps {
  posts: Post[];
  isLoading?: boolean;
  showBoard?: boolean;
  emptyMessage?: string;
}

export default function PostList({
  posts,
  isLoading,
  showBoard = false,
  emptyMessage = '게시글이 없습니다.'
}: PostListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading />
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <p className="mt-2 text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  // Separate pinned and regular posts
  const pinnedPosts = posts.filter(post => post.isPinned);
  const regularPosts = posts.filter(post => !post.isPinned);

  return (
    <div className="space-y-3">
      {pinnedPosts.map((post) => (
        <PostCard key={post.id} post={post} showBoard={showBoard} />
      ))}
      {regularPosts.map((post) => (
        <PostCard key={post.id} post={post} showBoard={showBoard} />
      ))}
    </div>
  );
}
