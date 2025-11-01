import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchService } from '../services/searchService';
import { debounce } from '../utils/debounce';

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search query
  const debouncedSetQuery = useCallback(
    debounce((value: string) => {
      setDebouncedQuery(value);
    }, 300),
    []
  );

  useEffect(() => {
    debouncedSetQuery(query);
  }, [query, debouncedSetQuery]);

  // Unified search
  const {
    data: searchResults,
    isLoading: isSearching,
    error: searchError,
  } = useQuery({
    queryKey: ['search', debouncedQuery],
    queryFn: () => searchService.unifiedSearch(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  // Autocomplete
  const {
    data: autocompleteResults,
    isLoading: isAutocompleting,
  } = useQuery({
    queryKey: ['autocomplete', debouncedQuery],
    queryFn: () => searchService.autocomplete(debouncedQuery),
    enabled: debouncedQuery.length > 0,
  });

  return {
    query,
    setQuery,
    searchResults,
    isSearching,
    searchError,
    autocompleteResults,
    isAutocompleting,
  };
};

// Search boards hook
export const useSearchBoards = (query: string, params?: {
  page?: number;
  limit?: number;
  categoryId?: string;
}) => {
  return useQuery({
    queryKey: ['search', 'boards', query, params],
    queryFn: () => searchService.searchBoards(query, params),
    enabled: query.length > 0,
  });
};

// Search posts hook
export const useSearchPosts = (query: string, params?: {
  page?: number;
  limit?: number;
  boardId?: string;
  sortBy?: 'relevance' | 'createdAt' | 'viewCount';
  sortOrder?: 'asc' | 'desc';
}) => {
  return useQuery({
    queryKey: ['search', 'posts', query, params],
    queryFn: () => searchService.searchPosts(query, params),
    enabled: query.length > 0,
  });
};

// Trending searches hook
export const useTrendingSearches = (limit: number = 10) => {
  return useQuery({
    queryKey: ['search', 'trending', limit],
    queryFn: () => searchService.getTrendingSearches(limit),
  });
};

// Search history hook
export const useSearchHistory = (limit: number = 10) => {
  return useQuery({
    queryKey: ['search', 'history', limit],
    queryFn: () => searchService.getSearchHistory(limit),
  });
};
