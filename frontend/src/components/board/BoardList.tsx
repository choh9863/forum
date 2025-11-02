import type { Board } from '../../types';
import BoardCard from './BoardCard';
import Loading from '../common/Loading';

interface BoardListProps {
  boards: Board[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export default function BoardList({ boards, isLoading, emptyMessage = '게시판이 없습니다.' }: BoardListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading />
      </div>
    );
  }

  if (boards.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {boards.map((board) => (
        <BoardCard key={board.id} board={board} />
      ))}
    </div>
  );
}
