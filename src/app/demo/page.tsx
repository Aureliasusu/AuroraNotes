'use client'

import { useState } from 'react'
import { Bot, Sparkles, MessageSquare, Lightbulb, List, TrendingUp, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<'features' | 'ai' | 'demo'>('features')

  const features = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: 'Rich Text Editor',
      description: 'Write with markdown support and real-time preview'
    },
    {
      icon: <Bot className="h-6 w-6" />,
      title: 'AI Assistant',
      description: 'Get insights, summaries, and action items from your notes'
    },
    {
      icon: <Sparkles className="h-6 w-6" />,
      title: 'Smart Organization',
      description: 'Tag, pin, and archive notes for better organization'
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: 'Real-time Sync',
      description: 'Your notes sync across all devices instantly'
    }
  ]

  const aiFeatures = [
    {
      title: 'Note Analysis',
      description: 'Automatically summarize long notes and extract key points'
    },
    {
      title: 'Action Items',
      description: 'Generate to-do lists and action items from your content'
    },
    {
      title: 'Smart Suggestions',
      description: 'Get writing improvements and organization suggestions'
    },
    {
      title: 'Interactive Chat',
      description: 'Ask questions about your notes and get AI-powered answers'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold aurora-gradient-text">
                AuroraNotes
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth/signin"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="btn-primary"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="aurora-gradient-text">AI-Powered</span> Note Taking
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Transform your thoughts into organized, actionable knowledge with intelligent AI assistance
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup"
              className="btn-primary text-lg px-8 py-3 flex items-center justify-center"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <button className="btn-secondary text-lg px-8 py-3">
              Watch Demo
            </button>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center mb-12">
            <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('features')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'features'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Features
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'ai'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                AI Capabilities
              </button>
              <button
                onClick={() => setActiveTab('demo')}
                className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'demo'
                    ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                Live Demo
              </button>
            </div>
          </div>

          {/* Features Tab */}
          {activeTab === 'features' && (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="text-blue-600 mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* AI Capabilities Tab */}
          {activeTab === 'ai' && (
            <div className="grid md:grid-cols-2 gap-8">
              {aiFeatures.map((feature, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Live Demo Tab */}
          {activeTab === 'demo' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm">
              <div className="text-center">
                <Bot className="h-16 w-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
                  Interactive AI Demo
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Experience how AI can analyze your notes and provide intelligent insights
                </p>
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-6 text-left mb-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Sample Note:</h4>
                  <p className="text-gray-600 dark:text-gray-300 mb-4">
                    "Meeting with the development team to discuss the new feature implementation. 
                    We need to prioritize user authentication, database optimization, and mobile responsiveness. 
                    Timeline: 2 weeks for MVP, 4 weeks for full release."
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Lightbulb className="h-4 w-4 text-yellow-600 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Key Points: Development priorities, timeline planning, team collaboration
                      </span>
                    </div>
                    <div className="flex items-start">
                      <List className="h-4 w-4 text-green-600 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Action Items: Implement auth, optimize DB, ensure mobile compatibility
                      </span>
                    </div>
                    <div className="flex items-start">
                      <TrendingUp className="h-4 w-4 text-purple-600 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Sentiment: Positive and focused
                      </span>
                    </div>
                  </div>
                </div>
                <Link
                  href="/auth/signup"
                  className="btn-primary"
                >
                  Try It Yourself
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to Transform Your Note-Taking?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Join thousands of users who are already using AI to organize their thoughts
          </p>
          <Link
            href="/auth/signup"
            className="btn-primary text-lg px-8 py-3"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  )
}

