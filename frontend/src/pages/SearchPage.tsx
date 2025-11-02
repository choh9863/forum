import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { searchService } from '../services/searchService';
import SearchBar from '../components/search/SearchBar';
import SearchResults from '../components/search/SearchResults';
import SearchFilters from '../components/search/SearchFilters';

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [type, setType] = useState<'all' | 'boards' | 'posts'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'createdAt' | 'viewCount'>('relevance');

  const { data: results, isLoading } = useQuery({
    queryKey: ['search', query, type, sortBy],
    queryFn: () => searchService.unifiedSearch(query, { type }),
    enabled: query.length > 0,
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">검색</h1>
        <SearchBar placeholder="게시판이나 게시글을 검색하세요..." />
      </div>

      {/* Filters */}
      {query && (
        <SearchFilters
          type={type}
          sortBy={sortBy}
          onTypeChange={setType}
          onSortByChange={setSortBy}
        />
      )}

      {/* Results */}
      {query ? (
        <SearchResults
          results={results}
          isLoading={isLoading}
          query={query}
        />
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">검색어를 입력하세요</h2>
          <p className="text-gray-600">게시판이나 게시글을 검색할 수 있습니다.</p>
        </div>
      )}
    </div>
  );
}
