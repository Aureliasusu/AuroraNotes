'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageCircle, Plus, X, Send, User } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface Comment {
  id: string
  content: string
  author: {
    id: string
    name: string
    email: string
    avatar_url?: string
  }
  position: {
    start: number
    end: number
  }
  created_at: string
  resolved: boolean
  replies?: Comment[]
}

interface InlineCommentsProps {
  comments: Comment[]
  onAddComment: (content: string, position: { start: number; end: number }) => void
  onReplyToComment: (commentId: string, content: string) => void
  onResolveComment: (commentId: string) => void
  onDeleteComment: (commentId: string) => void
  selectedText: string
  selectionRange: { start: number; end: number } | null
  isOpen: boolean
  onClose: () => void
}

export function InlineComments({
  comments,
  onAddComment,
  onReplyToComment,
  onResolveComment,
  onDeleteComment,
  selectedText,
  selectionRange,
  isOpen,
  onClose
}: InlineCommentsProps) {
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus()
    }
  }, [isOpen])

  const handleSubmitComment = () => {
    if (newComment.trim() && selectionRange) {
      onAddComment(newComment.trim(), selectionRange)
      setNewComment('')
    }
  }

  const handleSubmitReply = (commentId: string) => {
    if (replyContent.trim()) {
      onReplyToComment(commentId, replyContent.trim())
      setReplyContent('')
      setReplyingTo(null)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      action()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Comments
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Selected Text Preview */}
        {selectedText && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Selected text:
            </div>
            <div className="text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 p-2 rounded border">
              "{selectedText}"
            </div>
          </div>
        )}

        {/* Comments List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {comments.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No comments yet</p>
              <p className="text-sm">Add a comment to start the discussion</p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className={`p-3 rounded-lg border ${
                  comment.resolved
                    ? 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-700'
                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                    {comment.author.avatar_url ? (
                      <img
                        src={comment.author.avatar_url}
                        alt={comment.author.name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      comment.author.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {comment.author.name}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                      </span>
                      {comment.resolved && (
                        <span className="px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded">
                          Resolved
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                      {comment.content}
                    </p>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        Reply
                      </button>
                      {!comment.resolved && (
                        <button
                          onClick={() => onResolveComment(comment.id)}
                          className="text-xs text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300"
                        >
                          Resolve
                        </button>
                      )}
                      <button
                        onClick={() => onDeleteComment(comment.id)}
                        className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </div>
                    
                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <div className="flex space-x-2">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={2}
                          />
                          <button
                            onClick={() => handleSubmitReply(comment.id)}
                            disabled={!replyContent.trim()}
                            className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            <Send className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* New Comment Form */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex space-x-2">
            <textarea
              ref={textareaRef}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, handleSubmitComment)}
              placeholder="Add a comment..."
              className="flex-1 px-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
            />
            <button
              onClick={handleSubmitComment}
              disabled={!newComment.trim() || !selectionRange}
              className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add</span>
            </button>
          </div>
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Press Ctrl+Enter to submit
          </div>
        </div>
      </div>
    </div>
  )
}
