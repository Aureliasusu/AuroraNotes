'use client'

import { useState } from 'react'
import { Keyboard, Download, MessageCircle, GitBranch, Bell, MoreVertical } from 'lucide-react'

export default function TestButtonsPage() {
  const [showMoreMenu, setShowMoreMenu] = useState(false)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [showExport, setShowExport] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showChanges, setShowChanges] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)

  const handleTestButton = (buttonName: string) => {
    console.log(`🔘 ${buttonName} button clicked`)
    console.log(`🔘 Current state before:`, {
      showShortcuts,
      showExport,
      showComments,
      showChanges,
      showNotifications,
      showMoreMenu
    })
    
    switch (buttonName) {
      case 'shortcuts':
        setShowShortcuts(true)
        setShowMoreMenu(false)
        break
      case 'export':
        setShowExport(true)
        setShowMoreMenu(false)
        break
      case 'comments':
        setShowComments(true)
        setShowMoreMenu(false)
        break
      case 'changes':
        setShowChanges(true)
        setShowMoreMenu(false)
        break
      case 'notifications':
        setShowNotifications(true)
        setShowMoreMenu(false)
        break
    }
    
    console.log(`🔘 State should change for:`, buttonName)
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Button Test Page</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="text-lg font-semibold mb-2">Current State</h2>
          <pre className="text-sm">
            {JSON.stringify({
              showMoreMenu,
              showShortcuts,
              showExport,
              showComments,
              showChanges,
              showNotifications
            }, null, 2)}
          </pre>
        </div>

        <div className="flex space-x-4">
          {/* More Menu */}
          <div className="relative">
            <button
              onClick={() => {
                console.log('🔘 More menu button clicked, current state:', showMoreMenu)
                setShowMoreMenu(!showMoreMenu)
              }}
              className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors flex items-center space-x-1"
              title="More options"
            >
              <MoreVertical className="h-4 w-4" />
              <span>More</span>
            </button>
            
            {showMoreMenu && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <button
                  onClick={() => handleTestButton('shortcuts')}
                  className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Keyboard className="h-4 w-4" />
                  <span>Shortcuts</span>
                </button>
                <button
                  onClick={() => handleTestButton('export')}
                  className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </button>
                <button
                  onClick={() => handleTestButton('comments')}
                  className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Comments</span>
                </button>
                <button
                  onClick={() => handleTestButton('changes')}
                  className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <GitBranch className="h-4 w-4" />
                  <span>Changes</span>
                </button>
                <button
                  onClick={() => handleTestButton('notifications')}
                  className="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Bell className="h-4 w-4" />
                  <span>Notifications</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Dialog Placeholders */}
        {showShortcuts && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Keyboard Shortcuts</h3>
              <p>Shortcuts dialog opened!</p>
              <button
                onClick={() => setShowShortcuts(false)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showExport && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Export Note</h3>
              <p>Export dialog opened!</p>
              <button
                onClick={() => setShowExport(false)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showComments && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Comments</h3>
              <p>Comments dialog opened!</p>
              <button
                onClick={() => setShowComments(false)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showChanges && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Change History</h3>
              <p>Changes dialog opened!</p>
              <button
                onClick={() => setShowChanges(false)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {showNotifications && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-4">Notifications</h3>
              <p>Notifications dialog opened!</p>
              <button
                onClick={() => setShowNotifications(false)}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

