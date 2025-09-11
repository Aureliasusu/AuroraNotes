import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import { Providers } from '@/components/providers/Providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AuroraNotes - AI-Powered Note Taking',
  description: 'Transform your thoughts into organized, actionable knowledge with AI-powered note taking.',
  keywords: ['notes', 'AI', 'productivity', 'organization', 'markdown'],
  authors: [{ name: 'AuroraNotes Team' }],
  creator: 'AuroraNotes',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aurora-notes.com',
    title: 'AuroraNotes - AI-Powered Note Taking',
    description: 'Transform your thoughts into organized, actionable knowledge with AI-powered note taking.',
    siteName: 'AuroraNotes',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AuroraNotes - AI-Powered Note Taking',
    description: 'Transform your thoughts into organized, actionable knowledge with AI-powered note taking.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 dark:bg-gray-900`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  )
}


