'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, Filter, X, Calendar, Tag, User, FileText, Clock } from 'lucide-react'
import { Note } from '@/types/database'

interface SearchFilters {
  query: string
  tags: string[]
  dateRange: {
    start: string
    end: string
  }
  sortBy: 'title' | 'created_at' | 'updated_at' | 'relevance'
  sortOrder: 'asc' | 'desc'
  showArchived: boolean
}

interface AdvancedSearchProps {
  notes: Note[]
  onSearch: (filteredNotes: Note[]) => void
  isOpen: boolean
  onClose: () => void
}

export function AdvancedSearch({ notes, onSearch, isOpen, onClose }: AdvancedSearchProps) {
  const [filters, setFilters] = useState<SearchFilters>({
    query: '',
    tags: [],
    dateRange: {
      start: '',
      end: ''
    },
    sortBy: 'relevance',
    sortOrder: 'desc',
    showArchived: false
  })

  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [searchResults, setSearchResults] = useState<Note[]>([])
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Extract available tags from all notes
  useEffect(() => {
    const allTags = notes.flatMap(note => note.tags)
    const uniqueTags = Array.from(new Set(allTags)).sort()
    setAvailableTags(uniqueTags)
  }, [notes])

  // Perform search when filters change
  useEffect(() => {
    const filtered = performSearch(notes, filters)
    setSearchResults(filtered)
    onSearch(filtered)
  }, [notes, filters, onSearch])

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  const performSearch = (notes: Note[], filters: SearchFilters): Note[] => {
    let filtered = [...notes]

    // Text search
    if (filters.query) {
      const query = filters.query.toLowerCase()
      filtered = filtered.filter(note =>
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        note.tags.some(tag => tag.toLowerCase().includes(query))
      )
    }

    // Tag filter
    if (filters.tags.length > 0) {
      filtered = filtered.filter(note =>
        filters.tags.some(tag => note.tags.includes(tag))
      )
    }

    // Date range filter
    if (filters.dateRange.start) {
      const startDate = new Date(filters.dateRange.start)
      filtered = filtered.filter(note => new Date(note.created_at) >= startDate)
    }
    if (filters.dateRange.end) {
      const endDate = new Date(filters.dateRange.end)
      endDate.setHours(23, 59, 59, 999) // End of day
      filtered = filtered.filter(note => new Date(note.created_at) <= endDate)
    }

    // Sort results
    filtered.sort((a, b) => {
      let comparison = 0

      switch (filters.sortBy) {
        case 'title':
          comparison = a.title.localeCompare(b.title)
          break
        case 'created_at':
          comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
        case 'updated_at':
          comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
          break
        case 'relevance':
          // Simple relevance scoring based on query matches
          if (filters.query) {
            const scoreA = calculateRelevanceScore(a, filters.query)
            const scoreB = calculateRelevanceScore(b, filters.query)
            comparison = scoreB - scoreA
          } else {
            comparison = new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          }
          break
      }

      return filters.sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }

  const calculateRelevanceScore = (note: Note, query: string): number => {
    const queryLower = query.toLowerCase()
    let score = 0

    // Title matches are worth more
    if (note.title.toLowerCase().includes(queryLower)) {
      score += 10
    }

    // Content matches
    const contentMatches = (note.content.toLowerCase().match(new RegExp(queryLower, 'g')) || []).length
    score += contentMatches * 2

    // Tag matches
    const tagMatches = note.tags.filter(tag => tag.toLowerCase().includes(queryLower)).length
    score += tagMatches * 5

    return score
  }

  const handleTagToggle = (tag: string) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }))
  }

  const clearFilters = () => {
    setFilters({
      query: '',
      tags: [],
      dateRange: {
        start: '',
        end: ''
      },
      sortBy: 'relevance',
      sortOrder: 'desc',
      showArchived: false
    })
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Search className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Advanced Search</h2>
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {searchResults.length} note{searchResults.length !== 1 ? 's' : ''} found
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex h-[60vh]">
          {/* Filters Sidebar */}
          <div className="w-80 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Search Query */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Search Query
                </label>
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search notes..."
                    value={filters.query}
                    onChange={(e) => setFilters(prev => ({ ...prev, query: e.target.value }))}
                    className="w-full px-4 py-2 pl-10 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                </div>
              </div>

              {/* Tags Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Tags
                </label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availableTags.map(tag => (
                    <label key={tag} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={filters.tags.includes(tag)}
                        onChange={() => handleTagToggle(tag)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{tag}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Date Range
                </label>
                <div className="space-y-2">
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">From</label>
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, start: e.target.value }
                      }))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">To</label>
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => setFilters(prev => ({
                        ...prev,
                        dateRange: { ...prev.dateRange, end: e.target.value }
                      }))}
                      className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Sort By
                </label>
                <div className="space-y-2">
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as any }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="relevance">Relevance</option>
                    <option value="title">Title</option>
                    <option value="created_at">Created Date</option>
                    <option value="updated_at">Updated Date</option>
                  </select>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortOrder: e.target.value as any }))}
                    className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="desc">Descending</option>
                    <option value="asc">Ascending</option>
                  </select>
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          </div>

          {/* Search Results */}
          <div className="flex-1 overflow-y-auto p-6">
            {searchResults.length > 0 ? (
              <div className="space-y-4">
                {searchResults.map(note => (
                  <div
                    key={note.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {note.title}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                          {note.content}
                        </p>
                        <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Clock className="h-3 w-3" />
                            <span>Updated {new Date(note.updated_at).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Tag className="h-3 w-3" />
                            <span>{note.tags.length} tags</span>
                          </div>
                        </div>
                        {note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {note.tags.map(tag => (
                              <span
                                key={tag}
                                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <Search className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">No notes found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}