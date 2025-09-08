'use client'

import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels'
import { NotesList } from '@/components/notes/NotesList'
import { NoteEditor } from '@/components/notes/NoteEditor'
import { AIAssistant } from '@/components/ai/AIAssistant'

export function ResizableLayout() {
  return (
    <PanelGroup direction="horizontal" className="h-full">
      {/* Notes List Panel */}
      <Panel defaultSize={25} minSize={20} maxSize={40}>
        <div className="h-full border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <NotesList />
        </div>
      </Panel>

      {/* Resize Handle */}
      <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" />

      {/* Main Content Panel */}
      <Panel defaultSize={50} minSize={30}>
        <div className="h-full bg-white dark:bg-gray-800">
          <NoteEditor />
        </div>
      </Panel>

      {/* Resize Handle */}
      <PanelResizeHandle className="w-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" />

      {/* AI Assistant Panel */}
      <Panel defaultSize={25} minSize={20} maxSize={40}>
        <div className="h-full border-l border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <AIAssistant />
        </div>
      </Panel>
    </PanelGroup>
  )
}
