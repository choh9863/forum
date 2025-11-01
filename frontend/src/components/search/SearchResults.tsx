import BoardList from '../board/BoardList';
import PostList from '../post/PostList';
import Loading from '../common/Loading';

interface SearchResultsProps {
  results: any;
  isLoading: boolean;
  query: string;
}

export default function SearchResults({ results, isLoading, query }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loading />
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const hasResults = results.boards.length > 0 || results.posts.length > 0;

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          '{query}' 검색 결과
        </h2>
        <p className="text-gray-600">
          총 {results.total}개의 결과를 찾았습니다.
        </p>
      </div>

      {!hasResults && (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="mt-2 text-gray-500">검색 결과가 없습니다.</p>
        </div>
      )}

      {results.boards.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            게시판 ({results.boards.length})
          </h3>
          <BoardList boards={results.boards} />
        </div>
      )}

      {results.posts.length > 0 && (
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            게시글 ({results.posts.length})
          </h3>
          <PostList posts={results.posts} showBoard={true} />
        </div>
      )}
    </div>
  );
}
