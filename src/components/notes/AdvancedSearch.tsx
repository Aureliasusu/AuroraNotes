'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { Note } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { 
  Search, 
  Filter, 
  Calendar, 
  Tag, 
  X, 
  Clock, 
  FileText,
  Star,
  Pin
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import toast from 'react-hot-toast'

interface AdvancedSearchProps {
  onSearchResults: (notes: Note[]) => void
  onClose: () => void
}

interface SearchFilters {
  query: string
  tags: string[]
  dateFrom: string
  dateTo: string
  isStarred: boolean | null
  isPinned: boolean | null
  isArchived: boolean | null
  folderId: string | null
}

export function AdvancedSearch({ onSearchResults, onClose }: AdvancedSearchProps) {
  const { user } = useAuthStore()
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    tags: [],
    dateFrom: '',
    dateTo: '',
    isStarred: null,
    isPinned: null,
    isArchived: null,
    folderId: null,
  })
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (user) {
      fetchAvailableTags()
      loadSearchHistory()
    }
  }, [user])

  const fetchAvailableTags = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('notes')
        .select('tags')
        .eq('user_id', user.id)
        .not('tags', 'is', null)

      if (error) throw error

      const allTags = data?.flatMap(note => note.tags || []) || []
      const uniqueTags = Array.from(new Set(allTags)).sort()
      setAvailableTags(uniqueTags)
    } catch (error) {
      console.error('Error fetching tags:', error)
    }
  }

  const loadSearchHistory = () => {
    const history = localStorage.getItem('note-search-history')
    if (history) {
      setSearchHistory(JSON.parse(history))
    }
  }

  const saveSearchHistory = (query: string) => {
    if (!query.trim()) return

    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10)
    setSearchHistory(newHistory)
    localStorage.setItem('note-search-history', JSON.stringify(newHistory))
  }

  const performSearch = async () => {
    if (!user) return

    setLoading(true)
    try {
      let query = supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)

      // Text search
      if (filters.query.trim()) {
        query = query.or(`title.ilike.%${filters.query}%,content.ilike.%${filters.query}%`)
        saveSearchHistory(filters.query)
      }

      // Tags filter
      if (filters.tags.length > 0) {
        query = query.contains('tags', filters.tags)
      }

      // Date range filter
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo + 'T23:59:59.999Z')
      }

      // Boolean filters
      if (filters.isStarred !== null) {
        query = query.eq('is_starred', filters.isStarred)
      }
      if (filters.isPinned !== null) {
        query = query.eq('is_pinned', filters.isPinned)
      }
      if (filters.isArchived !== null) {
        query = query.eq('is_archived', filters.isArchived)
      }

      // Folder filter
      if (filters.folderId) {
        if (filters.folderId === 'starred') {
          query = query.eq('is_starred', true)
        } else {
          query = query.eq('folder_id', filters.folderId)
        }
      }

      query = query.order('updated_at', { ascending: false })

      const { data, error } = await query

      if (error) throw error

      onSearchResults(data || [])
      toast.success(`Found ${data?.length || 0} notes`)
    } catch (error) {
      console.error('Search error:', error)
      toast.error('Search failed')
    } finally {
      setLoading(false)
    }
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      tags: [],
      dateFrom: '',
      dateTo: '',
      isStarred: null,
      isPinned: null,
      isArchived: null,
      folderId: null,
    })
  }

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      setFilters(prev => ({ ...prev, tags: [...prev.tags, tag] }))
    }
  }

  const removeTag = (tag: string) => {
    setFilters(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      performSearch()
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Advanced Search</h3>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={filters.query}
            onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
            onKeyPress={handleKeyPress}
            placeholder="Search notes by title or content..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Search History */}
        {searchHistory.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Recent searches:</p>
            <div className="flex flex-wrap gap-1">
              {searchHistory.slice(0, 5).map((term, index) => (
                <button
                  key={index}
                  onClick={() => setFilters(prev => ({ ...prev, query: term }))}
                  className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Filters Toggle */}
      <div className="px-4 pb-2">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          <Filter className="h-4 w-4 mr-1" />
          {showFilters ? 'Hide' : 'Show'} Filters
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Tag className="h-4 w-4 inline mr-1" />
              Tags
            </label>
            <div className="flex flex-wrap gap-1 mb-2">
              {filters.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 hover:text-blue-600"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-1">
              {availableTags
                .filter(tag => !filters.tags.includes(tag))
                .slice(0, 10)
                .map(tag => (
                  <button
                    key={tag}
                    onClick={() => addTag(tag)}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600"
                  >
                    {tag}
                  </button>
                ))}
            </div>
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="h-4 w-4 inline mr-1" />
              Date Range
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            </div>
          </div>

          {/* Boolean Filters */}
          <div className="grid grid-cols-3 gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.isStarred === true}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  isStarred: e.target.checked ? true : null 
                }))}
                className="mr-2"
              />
              <Star className="h-4 w-4 mr-1" />
              <span className="text-sm">Starred</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.isPinned === true}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  isPinned: e.target.checked ? true : null 
                }))}
                className="mr-2"
              />
              <Pin className="h-4 w-4 mr-1" />
              <span className="text-sm">Pinned</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.isArchived === true}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  isArchived: e.target.checked ? true : null 
                }))}
                className="mr-2"
              />
              <FileText className="h-4 w-4 mr-1" />
              <span className="text-sm">Archived</span>
            </label>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between p-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={clearFilters}
          className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        >
          Clear All
        </button>
        <div className="flex space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={performSearch}
            disabled={loading}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>
    </div>
  )
}
