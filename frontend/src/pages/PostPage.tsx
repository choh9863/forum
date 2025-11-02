import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePost, useIncrementViewCount } from '../hooks/usePosts';
import PostDetail from '../components/post/PostDetail';
import CommentList from '../components/comment/CommentList';
import Loading from '../components/common/Loading';

export default function PostPage() {
  const { slug, postId } = useParams<{ slug: string; postId: string }>();
  const { data: post, isLoading } = usePost(postId!);
  const { mutate: incrementViewCount } = useIncrementViewCount();

  // Increment view count on mount
  useEffect(() => {
    if (postId) {
      incrementViewCount(postId);
    }
  }, [postId, incrementViewCount]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">게시글을 찾을 수 없습니다</h1>
        <p className="text-gray-600">존재하지 않거나 삭제된 게시글입니다.</p>
        <Link
          to={`/board/${slug}`}
          className="mt-4 inline-block text-blue-600 hover:text-blue-800"
        >
          게시판으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600">
        <Link to="/" className="hover:text-blue-600">
          홈
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link to="/boards" className="hover:text-blue-600">
          게시판
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <Link to={`/board/${slug}`} className="hover:text-blue-600">
          {post.board?.name}
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-gray-900 font-medium">게시글</span>
      </nav>

      {/* Post Detail */}
      <PostDetail post={post} />

      {/* Comments */}
      <CommentList postId={postId!} />

      {/* Navigation */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <Link
          to={`/board/${slug}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로 돌아가기
        </Link>
      </div>
    </div>
  );
}
