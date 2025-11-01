interface SearchFiltersProps {
  type: 'all' | 'boards' | 'posts';
  sortBy: 'relevance' | 'createdAt' | 'viewCount';
  onTypeChange: (type: 'all' | 'boards' | 'posts') => void;
  onSortByChange: (sortBy: 'relevance' | 'createdAt' | 'viewCount') => void;
}

export default function SearchFilters({
  type,
  sortBy,
  onTypeChange,
  onSortByChange,
}: SearchFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Type filter */}
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            검색 유형
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => onTypeChange('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                type === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => onTypeChange('boards')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                type === 'boards'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              게시판
            </button>
            <button
              onClick={() => onTypeChange('posts')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                type === 'posts'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              게시글
            </button>
          </div>
        </div>

        {/* Sort filter */}
        <div className="flex-1">
          <label htmlFor="sortBy" className="block text-sm font-medium text-gray-700 mb-2">
            정렬 기준
          </label>
          <select
            id="sortBy"
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as any)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="relevance">관련도순</option>
            <option value="createdAt">최신순</option>
            <option value="viewCount">조회수순</option>
          </select>
        </div>
      </div>
    </div>
  );
}
