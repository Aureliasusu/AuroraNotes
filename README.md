# AuroraNotes - AI-Powered Cross-Platform Note App

AuroraNotes is an AI-powered note-taking application designed for seamless productivity across Web and iOS. It combines intuitive design, real-time synchronization, and intelligent AI assistance to help users capture, organize, and act on their ideas more efficiently.

![AuroraNotes](https://img.shields.io/badge/AuroraNotes-AI%20Powered-blue?style=for-the-badge&logo=react)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase)

## ✨ Features

### 📝 Smart Note Editor
- Rich text editor with markdown support
- Real-time collaboration capabilities
- Syntax highlighting for code blocks
- Auto-save functionality

### ☁️ Real-Time Sync
- Instant synchronization across all devices
- Offline support with conflict resolution
- Secure cloud storage with Supabase

### 🔑 User Management
- Secure authentication with Supabase Auth
- Role-based access control
- Email verification and password reset

### 🤖 AI Assistant
- **Note Analysis**: Summarize notes, extract key points
- **Smart Suggestions**: Auto-generate to-do lists and action items
- **Content Enhancement**: Improve writing and organization
- **Chat Interface**: Interactive AI conversations about your notes

### 📱 Cross-Platform
- **Web App**: Beautiful, responsive Next.js application
- **iOS App**: Native SwiftUI app (coming soon)
- **Seamless Sync**: Real-time updates across all platforms

### 🌐 Scalable Backend
- **Supabase**: PostgreSQL database with real-time subscriptions
- **Edge Functions**: Serverless TypeScript functions
- **Storage**: File uploads and media management

## 🚀 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide React** - Beautiful icons
- **React Hot Toast** - Toast notifications
- **Zustand** - State management

### Backend
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Real-time subscriptions
  - Authentication
  - Storage
  - Edge Functions

### AI Integration
- **OpenAI API** - GPT models for text analysis
- **Hugging Face** - Alternative AI models (optional)

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Static type checking

## 🛠️ Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key (optional for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aurora-notes.git
   cd aurora-notes
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Edit `.env.local` with your configuration:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   OPENAI_API_KEY=your_openai_api_key
   ```

4. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL migrations (see Database Setup below)
   - Copy your project URL and anon key to `.env.local`

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Database Setup

Create the following tables in your Supabase database:

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

## 📱 Features in Detail

### Authentication
- Email/password authentication
- Social login (Google, GitHub) - coming soon
- Password reset functionality
- Email verification

### Note Management
- Create, edit, and delete notes
- Rich text editing with markdown support
- Tag organization system
- Pin important notes
- Archive old notes
- Search and filter functionality

### AI Features
- **Smart Summarization**: Automatically summarize long notes
- **Key Point Extraction**: Identify important information
- **Action Item Generation**: Create to-do lists from notes
- **Content Suggestions**: Improve writing and organization
- **Sentiment Analysis**: Understand the tone of your notes

### Real-time Features
- Live collaboration (coming soon)
- Real-time sync across devices
- Offline support with conflict resolution
- Push notifications (coming soon)

## 🎨 Design System

AuroraNotes uses a custom design system built with Tailwind CSS:

### Colors
- **Primary**: Aurora blue gradient (#0ea5e9 to #3b82f6)
- **Dark Mode**: Custom dark theme with proper contrast
- **Semantic Colors**: Success, warning, error states

### Components
- **Cards**: Note cards with hover effects
- **Buttons**: Primary and secondary button styles
- **Forms**: Consistent input styling
- **Modals**: Overlay dialogs for actions
- **Icons**: Lucide React icon set

## 🔧 Development

### Project Structure
```
src/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx      # Root layout (wraps all pages)
│   ├── page.tsx        # Homepage (landing page)
│   ├── globals.css     # Global styles
│   ├── auth/           # Authentication pages
│   │   ├── signin/     # Sign in page
│   │   │   └── page.tsx
│   │   └── signup/     # Sign up page
│   │       └── page.tsx
│   ├── dashboard/      # Main app dashboard
│   │   └── page.tsx    # Dashboard page
│   ├── demo/           # Demo mode
│   │   └── page.tsx    # Demo page
│   └── api/            # API routes
│       ├── notes/      # Note management API
│       │   └── route.ts # GET/POST notes
│       └── ai/         # AI features API
│           └── analyze/ # AI analysis
│               └── route.ts # POST analyze notes
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

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Code Style
- TypeScript for type safety
- ESLint for code quality
- Prettier for formatting
- Component-based architecture
- Custom hooks for reusable logic

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Similar to Vercel setup
- **Railway**: Full-stack deployment
- **AWS**: Manual deployment with Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write meaningful commit messages
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Supabase** for the amazing backend platform
- **Next.js** team for the excellent React framework
- **Tailwind CSS** for the utility-first CSS framework
- **OpenAI** for the AI capabilities
- **Lucide** for the beautiful icons

## 📞 Support

- **Documentation**: [docs.aurora-notes.com](https://docs.aurora-notes.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/aurora-notes/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/aurora-notes/discussions)
- **Email**: support@aurora-notes.com

---

**Made with ❤️ by the AuroraNotes Team**

Just like the aurora lights that spark inspiration, AuroraNotes helps users transform fleeting thoughts into organized, actionable knowledge—powered by the latest AI technology.
