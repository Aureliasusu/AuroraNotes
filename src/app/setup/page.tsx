'use client'

import { useState } from 'react'
import { CheckCircle, XCircle, Copy, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function SetupPage() {
  const [copied, setCopied] = useState(false)

  const envTemplate = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration (Optional)
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(envTemplate)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const steps = [
    {
      title: 'Create Supabase Project',
      description: 'Go to supabase.com and create a new project',
      link: 'https://supabase.com',
      completed: false
    },
    {
      title: 'Get Project Credentials',
      description: 'Copy your project URL and anon key from Settings > API',
      link: null,
      completed: false
    },
    {
      title: 'Create .env.local File',
      description: 'Create environment file in your project root',
      link: null,
      completed: false
    },
    {
      title: 'Run Database Migrations',
      description: 'Execute SQL commands in your Supabase SQL editor',
      link: null,
      completed: false
    },
    {
      title: 'Restart Development Server',
      description: 'Stop and restart npm run dev',
      link: null,
      completed: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 aurora-gradient-text">
            Setup AuroraNotes
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Follow these steps to get your AuroraNotes application running
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Setup Steps */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Setup Steps
            </h2>
            
            {steps.map((step, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.completed 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300'
                }`}>
                  {step.completed ? <CheckCircle className="w-5 h-5" /> : index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 mt-1">
                    {step.description}
                  </p>
                  {step.link && (
                    <a
                      href={step.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-2"
                    >
                      <ExternalLink className="w-4 h-4 mr-1" />
                      Open Link
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Environment Configuration */}
          <div className="space-y-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Environment Variables
            </h2>
            
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  .env.local Template
                </h3>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center space-x-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                  <span>{copied ? 'Copied!' : 'Copy'}</span>
                </button>
              </div>
              
              <pre className="bg-gray-100 dark:bg-gray-900 rounded p-4 text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                <code>{envTemplate}</code>
              </pre>
              
              <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <XCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Important
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      Replace the placeholder values with your actual Supabase credentials. 
                      Never commit this file to version control.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                Database Setup
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Run the following SQL commands in your Supabase SQL editor:
              </p>
              <Link
                href="/setup"
                className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                View SQL Commands
                <ExternalLink className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/"
            className="btn-primary text-lg px-8 py-3"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

