'use client'

import { useState } from 'react'
import { FileText, Calendar, BookOpen, Briefcase, Heart, Lightbulb, Plus } from 'lucide-react'

interface NoteTemplate {
  id: string
  name: string
  description: string
  icon: any
  content: string
  tags: string[]
}

const templates: NoteTemplate[] = [
  {
    id: 'meeting',
    name: 'Meeting Notes',
    description: 'Structured meeting notes template',
    icon: Calendar,
    content: `# Meeting Notes

**Date:** [Date]
**Time:** [Time]
**Attendees:** [List attendees]

## Agenda
- [ ] Item 1
- [ ] Item 2
- [ ] Item 3

## Discussion Points
### Topic 1
- Key points discussed
- Decisions made
- Action items

### Topic 2
- Key points discussed
- Decisions made
- Action items

## Action Items
- [ ] [Task] - [Assignee] - [Due Date]
- [ ] [Task] - [Assignee] - [Due Date]

## Next Steps
- [Next meeting date]
- [Follow-up items]`,
    tags: ['meeting', 'work', 'collaboration']
  },
  {
    id: 'study',
    name: 'Study Notes',
    description: 'Academic study notes template',
    icon: BookOpen,
    content: `# Study Notes: [Topic]

**Subject:** [Subject]
**Date:** [Date]
**Chapter/Section:** [Chapter/Section]

## Key Concepts
### Concept 1
- Definition
- Examples
- Applications

### Concept 2
- Definition
- Examples
- Applications

## Important Formulas/Equations
- Formula 1: [Formula]
- Formula 2: [Formula]

## Practice Problems
1. [Problem statement]
   - Solution approach
   - Answer

2. [Problem statement]
   - Solution approach
   - Answer

## Summary
- Main takeaways
- Areas to review
- Next study topics`,
    tags: ['study', 'education', 'academic']
  },
  {
    id: 'project',
    name: 'Project Plan',
    description: 'Project planning and tracking template',
    icon: Briefcase,
    content: `# Project: [Project Name]

**Project Manager:** [Name]
**Start Date:** [Date]
**Target End Date:** [Date]
**Status:** [Planning/In Progress/Completed]

## Project Overview
- **Objective:** [Project objective]
- **Scope:** [What's included/excluded]
- **Success Criteria:** [How success is measured]

## Team Members
- [Role]: [Name] - [Contact]
- [Role]: [Name] - [Contact]

## Timeline & Milestones
- [ ] **Milestone 1** - [Date] - [Description]
- [ ] **Milestone 2** - [Date] - [Description]
- [ ] **Milestone 3** - [Date] - [Description]

## Tasks
### Phase 1: [Phase Name]
- [ ] [Task] - [Assignee] - [Due Date]
- [ ] [Task] - [Assignee] - [Due Date]

### Phase 2: [Phase Name]
- [ ] [Task] - [Assignee] - [Due Date]
- [ ] [Task] - [Assignee] - [Due Date]

## Resources & Budget
- **Budget:** [Amount]
- **Resources needed:** [List resources]

## Risks & Mitigation
- **Risk 1:** [Description] - [Mitigation strategy]
- **Risk 2:** [Description] - [Mitigation strategy]

## Notes
- Additional information
- Important considerations`,
    tags: ['project', 'planning', 'management']
  },
  {
    id: 'journal',
    name: 'Daily Journal',
    description: 'Personal daily reflection template',
    icon: Heart,
    content: `# Daily Journal - [Date]

## Today's Highlights
- [Highlight 1]
- [Highlight 2]
- [Highlight 3]

## What I'm Grateful For
- [Gratitude 1]
- [Gratitude 2]
- [Gratitude 3]

## Challenges & How I Overcame Them
- **Challenge:** [Description]
  - **Solution:** [How I handled it]
  - **Learning:** [What I learned]

## Goals Progress
### Today's Goals
- [ ] [Goal 1]
- [ ] [Goal 2]
- [ ] [Goal 3]

### Reflection
- What went well today?
- What could I improve tomorrow?
- How am I feeling overall?

## Tomorrow's Focus
- [Priority 1]
- [Priority 2]
- [Priority 3]

## Mood & Energy
- **Mood:** [1-10]
- **Energy Level:** [1-10]
- **Notes:** [Additional thoughts]`,
    tags: ['journal', 'personal', 'reflection']
  },
  {
    id: 'ideas',
    name: 'Ideas & Brainstorming',
    description: 'Creative ideas and brainstorming template',
    icon: Lightbulb,
    content: `# Ideas: [Topic/Theme]

**Date:** [Date]
**Context:** [What prompted these ideas]

## Initial Ideas
- [Idea 1] - [Brief description]
- [Idea 2] - [Brief description]
- [Idea 3] - [Brief description]

## Expanded Concepts
### Idea 1: [Name]
- **Description:** [Detailed description]
- **Pros:** [Advantages]
- **Cons:** [Disadvantages]
- **Feasibility:** [High/Medium/Low]
- **Next Steps:** [What to do next]

### Idea 2: [Name]
- **Description:** [Detailed description]
- **Pros:** [Advantages]
- **Cons:** [Disadvantages]
- **Feasibility:** [High/Medium/Low]
- **Next Steps:** [What to do next]

## Research & Resources
- [Resource 1] - [Link/Reference]
- [Resource 2] - [Link/Reference]

## Questions to Explore
- [Question 1]
- [Question 2]
- [Question 3]

## Action Items
- [ ] [Action 1]
- [ ] [Action 2]
- [ ] [Action 3]

## Related Ideas
- [Related concept 1]
- [Related concept 2]`,
    tags: ['ideas', 'brainstorming', 'creativity']
  }
]

interface NoteTemplatesProps {
  onSelectTemplate: (template: NoteTemplate) => void
  onClose: () => void
}

export function NoteTemplates({ onSelectTemplate, onClose }: NoteTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'work', name: 'Work', count: templates.filter(t => t.tags.includes('work')).length },
    { id: 'personal', name: 'Personal', count: templates.filter(t => t.tags.includes('personal')).length },
    { id: 'study', name: 'Study', count: templates.filter(t => t.tags.includes('study')).length },
  ]

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.tags.includes(selectedCategory))

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Note Templates</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Choose a template to get started quickly</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Plus className="h-6 w-6 text-gray-500 rotate-45" />
            </button>
          </div>
        </div>

        <div className="flex h-[60vh]">
          {/* Categories Sidebar */}
          <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Categories</h3>
              <div className="space-y-1">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{category.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {category.count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTemplates.map((template) => {
                const IconComponent = template.icon
                return (
                  <div
                    key={template.id}
                    onClick={() => onSelectTemplate(template)}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all cursor-pointer group"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                        <IconComponent className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {template.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {template.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {template.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
                <FileText className="h-12 w-12 mb-4" />
                <p className="text-lg font-medium">No templates found</p>
                <p className="text-sm">Try selecting a different category</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Templates help you get started quickly with structured content
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
