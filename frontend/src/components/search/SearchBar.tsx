import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../../hooks/useSearch';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ placeholder = '검색...', className = '' }: SearchBarProps) {
  const navigate = useNavigate();
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const { query, setQuery, autocompleteResults } = useSearch();
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowAutocomplete(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    setShowAutocomplete(false);
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setShowAutocomplete(true);
          }}
          onFocus={() => setShowAutocomplete(true)}
          placeholder={placeholder}
          className="w-full px-4 py-2 pl-10 pr-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <svg
          className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </form>

      {/* Autocomplete dropdown */}
      {showAutocomplete && query.length > 0 && autocompleteResults && (
        <div className="absolute z-50 w-full mt-2 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-y-auto">
          {autocompleteResults.suggestions.length > 0 && (
            <div className="p-2">
              <p className="text-xs text-gray-500 px-2 mb-1">추천 검색어</p>
              {autocompleteResults.suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-2"
                >
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="text-sm">{suggestion}</span>
                </button>
              ))}
            </div>
          )}

          {autocompleteResults.boards.length > 0 && (
            <div className="p-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 px-2 mb-1">게시판</p>
              {autocompleteResults.boards.map((board) => (
                <button
                  key={board.id}
                  onClick={() => navigate(`/board/${board.slug}`)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                >
                  <p className="text-sm font-medium">{board.name}</p>
                  {board.description && (
                    <p className="text-xs text-gray-500 truncate">{board.description}</p>
                  )}
                </button>
              ))}
            </div>
          )}

          {autocompleteResults.posts.length > 0 && (
            <div className="p-2 border-t border-gray-200">
              <p className="text-xs text-gray-500 px-2 mb-1">게시글</p>
              {autocompleteResults.posts.map((post) => (
                <button
                  key={post.id}
                  onClick={() => navigate(`/board/${post.board?.slug}/post/${post.id}`)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded"
                >
                  <p className="text-sm font-medium line-clamp-1">{post.title}</p>
                  <p className="text-xs text-gray-500">{post.board?.name}</p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
