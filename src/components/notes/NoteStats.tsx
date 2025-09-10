'use client'

import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { Note } from '@/types/database'
import { supabase } from '@/lib/supabase'
import { 
  BarChart3, 
  FileText, 
  Clock, 
  TrendingUp, 
  Calendar,
  Target,
  BookOpen,
  Star
} from 'lucide-react'
import { format, startOfWeek, endOfWeek, eachDayOfInterval, subDays } from 'date-fns'

interface NoteStatsProps {
  onClose: () => void
}

interface StatsData {
  totalNotes: number
  totalWords: number
  totalReadingTime: number
  averageWordsPerNote: number
  averageReadingTime: number
  notesThisWeek: number
  wordsThisWeek: number
  starredNotes: number
  pinnedNotes: number
  weeklyData: Array<{
    date: string
    notes: number
    words: number
  }>
  topTags: Array<{
    tag: string
    count: number
  }>
}

export function NoteStats({ onClose }: NoteStatsProps) {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<StatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')

  useEffect(() => {
    if (user) {
      fetchStats()
    }
  }, [user, timeRange])

  const fetchStats = async () => {
    if (!user) return

    setLoading(true)
    try {
      // Fetch all notes
      const { data: notes, error } = await supabase
        .from('notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      const now = new Date()
      const startDate = timeRange === 'week' 
        ? startOfWeek(now)
        : timeRange === 'month'
        ? new Date(now.getFullYear(), now.getMonth(), 1)
        : new Date(now.getFullYear(), 0, 1)

      // Filter notes by time range
      const filteredNotes = notes?.filter(note => 
        new Date(note.created_at) >= startDate
      ) || []

      // Calculate basic stats
      const totalNotes = notes?.length || 0
      const totalWords = notes?.reduce((sum, note) => sum + (note.word_count || 0), 0) || 0
      const totalReadingTime = notes?.reduce((sum, note) => sum + (note.reading_time || 0), 0) || 0
      const averageWordsPerNote = totalNotes > 0 ? Math.round(totalWords / totalNotes) : 0
      const averageReadingTime = totalNotes > 0 ? Math.round(totalReadingTime / totalNotes) : 0

      // This week stats
      const weekStart = startOfWeek(now)
      const notesThisWeek = notes?.filter(note => 
        new Date(note.created_at) >= weekStart
      ).length || 0
      const wordsThisWeek = notes?.filter(note => 
        new Date(note.created_at) >= weekStart
      ).reduce((sum, note) => sum + (note.word_count || 0), 0) || 0

      // Special notes
      const starredNotes = notes?.filter(note => note.is_starred).length || 0
      const pinnedNotes = notes?.filter(note => note.is_pinned).length || 0

      // Weekly data for chart
      const weeklyData = generateWeeklyData(notes || [], timeRange)

      // Top tags
      const allTags = notes?.flatMap(note => note.tags || []) || []
      const tagCounts = allTags.reduce((acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1
        return acc
      }, {} as Record<string, number>)
      const topTags = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      setStats({
        totalNotes,
        totalWords,
        totalReadingTime,
        averageWordsPerNote,
        averageReadingTime,
        notesThisWeek,
        wordsThisWeek,
        starredNotes,
        pinnedNotes,
        weeklyData,
        topTags,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateWeeklyData = (notes: Note[], range: 'week' | 'month' | 'year') => {
    const now = new Date()
    let start: Date
    let end: Date

    switch (range) {
      case 'week':
        start = startOfWeek(now)
        end = endOfWeek(now)
        break
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'year':
        start = new Date(now.getFullYear(), 0, 1)
        end = new Date(now.getFullYear(), 11, 31)
        break
    }

    const days = eachDayOfInterval({ start, end })
    
    return days.map(day => {
      const dayStr = format(day, 'yyyy-MM-dd')
      const dayNotes = notes.filter(note => 
        format(new Date(note.created_at), 'yyyy-MM-dd') === dayStr
      )
      
      return {
        date: format(day, 'MMM dd'),
        notes: dayNotes.length,
        words: dayNotes.reduce((sum, note) => sum + (note.word_count || 0), 0),
      }
    })
  }

  const formatReadingTime = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-6">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Note Statistics</h3>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as 'week' | 'month' | 'year')}
            className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          >
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </select>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            ×
          </button>
        </div>
      </div>

      <div className="p-4 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-blue-600">Total Notes</p>
                <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{stats.totalNotes}</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-green-600">Total Words</p>
                <p className="text-2xl font-bold text-green-900 dark:text-green-100">{stats.totalWords.toLocaleString()}</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-purple-600">Reading Time</p>
                <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">{formatReadingTime(stats.totalReadingTime)}</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-600">Avg Words/Note</p>
                <p className="text-2xl font-bold text-orange-900 dark:text-orange-100">{stats.averageWordsPerNote}</p>
              </div>
            </div>
          </div>
        </div>

        {/* This Week Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Notes This Week</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.notesThisWeek}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center">
              <Target className="h-6 w-6 text-gray-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Words This Week</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{stats.wordsThisWeek.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Special Notes */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <Star className="h-6 w-6 text-yellow-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-yellow-600">Starred Notes</p>
                <p className="text-xl font-bold text-yellow-900 dark:text-yellow-100">{stats.starredNotes}</p>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-indigo-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-indigo-600">Pinned Notes</p>
                <p className="text-xl font-bold text-indigo-900 dark:text-indigo-100">{stats.pinnedNotes}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Top Tags */}
        {stats.topTags.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Top Tags</h4>
            <div className="space-y-2">
              {stats.topTags.map(({ tag, count }) => (
                <div key={tag} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">#{tag}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{count} notes</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Simple Chart */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Activity Over Time</h4>
          <div className="space-y-2">
            {stats.weeklyData.slice(-7).map(({ date, notes, words }) => (
              <div key={date} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">{date}</span>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-900 dark:text-white">{notes} notes</span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{words} words</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
