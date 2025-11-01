import { Link } from 'react-router-dom';
import type { Board } from '../../types';

interface BoardCardProps {
  board: Board;
}

export default function BoardCard({ board }: BoardCardProps) {
  const postCount = board._count?.posts || 0;

  return (
    <Link
      to={`/board/${board.slug}`}
      className="block bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 p-6 border border-gray-200 hover:border-blue-400"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900 mb-2">{board.name}</h3>
          {board.description && (
            <p className="text-sm text-gray-600 mb-3 line-clamp-2">{board.description}</p>
          )}

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              게시글 {postCount.toLocaleString()}
            </span>

            {board.category && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                {board.category.name}
              </span>
            )}
          </div>
        </div>

        <div className="ml-4">
          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
