import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useBoards } from '../hooks/useBoard';
import BoardList from '../components/board/BoardList';
import BoardRequestForm from '../components/board/BoardRequestForm';
import SearchBar from '../components/search/SearchBar';
import Button from '../components/common/Button';

export default function BoardListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showBoardRequest, setShowBoardRequest] = useState(false);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  const { data: boardsData, isLoading } = useBoards({
    search: searchQuery,
    categoryId: searchParams.get('category') || undefined,
    isActive: true,
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query) {
      setSearchParams({ search: query });
    } else {
      setSearchParams({});
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">게시판 목록</h1>
            <p className="text-gray-600">
              총 {boardsData?.total || 0}개의 게시판이 있습니다
            </p>
          </div>

          <Button onClick={() => setShowBoardRequest(true)}>
            게시판 개설 요청
          </Button>
        </div>

        {/* Search */}
        <SearchBar
          placeholder="게시판 검색..."
          className="max-w-xl"
        />
      </div>

      {/* Board List */}
      <BoardList
        boards={boardsData?.data || []}
        isLoading={isLoading}
        emptyMessage="게시판이 없습니다."
      />

      {/* Board Request Modal */}
      <BoardRequestForm
        isOpen={showBoardRequest}
        onClose={() => setShowBoardRequest(false)}
      />
    </div>
  );
}
