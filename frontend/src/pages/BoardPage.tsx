import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useBoard } from '../hooks/useBoard';
import { usePosts } from '../hooks/usePosts';
import BoardHeader from '../components/board/BoardHeader';
import PostList from '../components/post/PostList';
import ChatBox from '../components/chat/ChatBox';
import SearchBar from '../components/search/SearchBar';
import Loading from '../components/common/Loading';

export default function BoardPage() {
  const { slug } = useParams<{ slug: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showChat, setShowChat] = useState(true);

  const { data: board, isLoading: isLoadingBoard } = useBoard(slug!);
  const { data: postsData, isLoading: isLoadingPosts } = usePosts({
    boardId: board?.id,
    page: Number(searchParams.get('page')) || 1,
    limit: 20,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  if (isLoadingBoard) {
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
    <div className="space-y-6">
      {/* Board Header */}
      <BoardHeader board={board} />

      {/* Layout with Posts and Chat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Posts */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search */}
          <div className="bg-white rounded-lg shadow-md p-4">
            <SearchBar placeholder="게시글 검색..." />
          </div>

          {/* Posts */}
          <PostList
            posts={postsData?.data || []}
            isLoading={isLoadingPosts}
            emptyMessage="아직 게시글이 없습니다. 첫 게시글을 작성해보세요!"
          />

          {/* Pagination */}
          {postsData && postsData.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: postsData.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setSearchParams({ page: String(page) })}
                  className={`px-4 py-2 rounded-lg ${
                    page === (postsData.page || 1)
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar - Chat */}
        <div className="lg:col-span-1">
          <div className="sticky top-6">
            <div className="mb-2 flex items-center justify-between">
              <button
                onClick={() => setShowChat(!showChat)}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showChat ? '채팅 숨기기' : '채팅 표시'}
              </button>
            </div>

            {showChat && (
              <ChatBox boardId={board.id} className="h-[600px]" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
