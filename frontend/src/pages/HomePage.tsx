import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBoards } from '../hooks/useBoard';
import { usePosts } from '../hooks/usePosts';
import BoardList from '../components/board/BoardList';
import PostList from '../components/post/PostList';
import BoardRequestForm from '../components/board/BoardRequestForm';
import SearchBar from '../components/search/SearchBar';
import Button from '../components/common/Button';

export default function HomePage() {
  const [showBoardRequest, setShowBoardRequest] = useState(false);

  const { data: boardsData, isLoading: isLoadingBoards } = useBoards({
    limit: 6,
    isActive: true,
  });

  const { data: postsData, isLoading: isLoadingPosts } = usePosts({
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-lg shadow-lg p-8 md:p-12">
        <h1 className="text-4xl font-bold mb-4">커뮤니티 포럼에 오신 것을 환영합니다</h1>
        <p className="text-xl mb-6">다양한 주제로 자유롭게 소통하세요</p>

        <div className="max-w-2xl">
          <SearchBar placeholder="게시판이나 게시글을 검색하세요..." className="mb-4" />
        </div>

        <div className="flex gap-4">
          <Link to="/boards">
            <Button variant="primary" size="lg">
              게시판 목록 보기
            </Button>
          </Link>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => setShowBoardRequest(true)}
          >
            게시판 개설 요청
          </Button>
        </div>
      </div>

      {/* Popular Boards */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">인기 게시판</h2>
          <Link
            to="/boards"
            className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1"
          >
            전체 보기
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <BoardList
          boards={boardsData?.data || []}
          isLoading={isLoadingBoards}
          emptyMessage="게시판이 없습니다."
        />
      </section>

      {/* Recent Posts */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">최근 게시글</h2>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <PostList
            posts={postsData?.data || []}
            isLoading={isLoadingPosts}
            showBoard={true}
            emptyMessage="게시글이 없습니다."
          />
        </div>
      </section>

      {/* Board Request Modal */}
      <BoardRequestForm
        isOpen={showBoardRequest}
        onClose={() => setShowBoardRequest(false)}
      />
    </div>
  );
}
