import { Link } from 'react-router-dom';
import type { Board } from '../../types';
import { useAuth } from '../../hooks/useAuth';

interface BoardHeaderProps {
  board: Board;
}

export default function BoardHeader({ board }: BoardHeaderProps) {
  const { isAuthenticated } = useAuth();
  const postCount = board._count?.posts || 0;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{board.name}</h1>
            {board.category && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                {board.category.name}
              </span>
            )}
          </div>

          {board.description && (
            <p className="text-gray-600 mb-4">{board.description}</p>
          )}

          <div className="flex items-center gap-6 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              게시글 {postCount.toLocaleString()}개
            </span>

            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {new Date(board.createdAt).toLocaleDateString('ko-KR')} 개설
            </span>
          </div>
        </div>

        <div className="ml-6">
          <Link
            to={`/board/${board.slug}/post/create`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            글쓰기
          </Link>
        </div>
      </div>
    </div>
  );
}
