import { useParams, useNavigate } from 'react-router-dom';
import { useBoard } from '../hooks/useBoard';
import PostForm from '../components/post/PostForm';
import Loading from '../components/common/Loading';

export default function CreatePostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: board, isLoading } = useBoard(slug!);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading />
      </div>
    );
  }

  if (!board) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">게시판을 찾을 수 없습니다</h1>
        <p className="text-gray-600">존재하지 않거나 삭제된 게시판입니다.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">게시글 작성</h1>
        <p className="text-gray-600">{board.name} 게시판</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <PostForm
          boardId={board.id}
          boardSlug={board.slug}
        />
      </div>
    </div>
  );
}
