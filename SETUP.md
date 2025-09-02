# AuroraNotes Setup Guide

## Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

3. **Set up Supabase Database**
   
   Create a new project at [supabase.com](https://supabase.com) and run this SQL in the SQL editor:

   ```sql
   -- Enable Row Level Security
   ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

   -- Create profiles table
   CREATE TABLE profiles (
     id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
     email TEXT UNIQUE NOT NULL,
     full_name TEXT,
     avatar_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create notes table
   CREATE TABLE notes (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
     title TEXT NOT NULL,
     content TEXT NOT NULL,
     tags TEXT[] DEFAULT '{}',
     is_archived BOOLEAN DEFAULT FALSE,
     is_pinned BOOLEAN DEFAULT FALSE,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
     updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Create AI analysis table
   CREATE TABLE ai_analysis (
     id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
     note_id UUID REFERENCES notes(id) ON DELETE CASCADE NOT NULL,
     summary TEXT NOT NULL,
     key_points TEXT[] NOT NULL,
     todo_items TEXT[] NOT NULL,
     sentiment TEXT NOT NULL,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );

   -- Set up Row Level Security policies
   CREATE POLICY "Users can view own profile" ON profiles
     FOR SELECT USING (auth.uid() = id);

   CREATE POLICY "Users can update own profile" ON profiles
     FOR UPDATE USING (auth.uid() = id);

   CREATE POLICY "Users can view own notes" ON notes
     FOR SELECT USING (auth.uid() = user_id);

   CREATE POLICY "Users can insert own notes" ON notes
     FOR INSERT WITH CHECK (auth.uid() = user_id);

   CREATE POLICY "Users can update own notes" ON notes
     FOR UPDATE USING (auth.uid() = user_id);

   CREATE POLICY "Users can delete own notes" ON notes
     FOR DELETE USING (auth.uid() = user_id);

   CREATE POLICY "Users can view own AI analysis" ON ai_analysis
     FOR SELECT USING (
       EXISTS (
         SELECT 1 FROM notes 
         WHERE notes.id = ai_analysis.note_id 
         AND notes.user_id = auth.uid()
       )
     );

   CREATE POLICY "Users can insert own AI analysis" ON ai_analysis
     FOR INSERT WITH CHECK (
       EXISTS (
         SELECT 1 FROM notes 
         WHERE notes.id = ai_analysis.note_id 
         AND notes.user_id = auth.uid()
       )
     );
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Features Implemented

✅ **Authentication System**
- Sign up/Sign in with email and password
- User profile management
- Secure session handling

✅ **Note Management**
- Create, edit, and delete notes
- Rich text editor with markdown support
- Auto-save functionality
- Tag system
- Pin and archive notes
- Search and filter notes

✅ **AI Assistant (Mock Implementation)**
- Note analysis and summarization
- Key points extraction
- Action items generation
- Sentiment analysis
- Interactive chat interface

✅ **Modern UI/UX**
- Responsive design
- Dark mode support
- Beautiful Aurora theme
- Real-time updates
- Toast notifications

✅ **Real-time Features**
- Live note synchronization
- Real-time updates across components

## Next Steps

1. **Connect OpenAI API** - Replace mock AI responses with real OpenAI API calls
2. **Add File Uploads** - Implement image and file attachment support
3. **Collaboration** - Add real-time collaboration features
4. **Mobile App** - Build the iOS companion app
5. **Advanced AI** - Implement more sophisticated AI features

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **State Management**: Zustand
- **Icons**: Lucide React
- **Markdown**: React Markdown
- **Notifications**: React Hot Toast

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── dashboard/      # Main dashboard
│   ├── globals.css     # Global styles
│   ├── layout.tsx      # Root layout
│   └── page.tsx        # Landing page
├── components/         # React components
│   ├── ai/            # AI-related components
│   ├── auth/          # Authentication components
│   ├── dashboard/     # Dashboard layout
│   ├── notes/         # Note management components
│   └── providers/     # Context providers
├── lib/               # Utility functions
│   └── supabase.ts    # Supabase client
├── store/             # Zustand stores
│   ├── useAuthStore.ts
│   └── useNotesStore.ts
└── types/             # TypeScript types
    └── database.ts    # Database types
```

## Troubleshooting

**TypeScript Errors**: If you see TypeScript errors, try:
```bash
npm run type-check
```

**Supabase Connection**: Make sure your environment variables are correctly set and your Supabase project is properly configured.

**Database Issues**: Ensure you've run the SQL migrations in your Supabase project.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

**AuroraNotes** - Transform your thoughts into organized, actionable knowledge with AI-powered note taking.

