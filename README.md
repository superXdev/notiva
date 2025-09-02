# Notiva

A modern note-taking application built with Next.js and Supabase.

## Quick Start

### Prerequisites

-  Node.js (v18 or higher)
-  pnpm
-  Supabase account

### Setup

1. **Clone and install dependencies**

   ```bash
   git clone <repository-url>
   cd notiva
   pnpm install
   ```

2. **Create Supabase project**

   -  Go to [supabase.com](https://supabase.com) and create a new project
   -  Get your Project URL and anon key from Settings > API

3. **Configure environment variables**
   Create `.env.local` in the project root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

   # Lunos API Key (for AI Enhancement feature)
   LUNOS_API_KEY=your_lunos_api_key
   ```

4. **Set up database tables**

   -  In Supabase dashboard: Go to SQL Editor
   -  Copy and paste the contents of `database-setup.sql`
   -  Run the SQL to create tables, indexes, and RLS policies

5. **Configure email templates**

   -  In Supabase dashboard: Authentication > Email Templates
   -  Set "Confirm signup" URL to: `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email`

6. **Configure Google OAuth (Optional)**

   -  In Supabase dashboard: Authentication > Providers
   -  Enable Google provider
   -  Add your Google OAuth credentials (Client ID and Client Secret)
   -  Set the authorized redirect URI to: `https://your-project-ref.supabase.co/auth/v1/callback`

7. **Run the application**
   ```bash
   pnpm dev
   ```

## Features

-  ✅ User authentication (login/register)
-  ✅ Google OAuth sign-in
-  ✅ Protected routes
-  ✅ Dark/light theme
-  ✅ Responsive design
-  ✅ Server-side rendering
-  ✅ AI-powered note enhancement
-  ✅ Client-side CRUD operations with Supabase RLS

### Upcoming Features

-  🔄 Semantic search for intelligent note discovery
-  🔄 REST API for third-party integrations
-  🔄 Google Drive backup and sync

## Tech Stack

-  **Frontend**: Next.js 15, React, TypeScript
-  **Styling**: Tailwind CSS, shadcn/ui
-  **Authentication**: Supabase Auth
-  **Database**: Supabase PostgreSQL with Row Level Security (RLS)
-  **AI**: Lunos AI
-  **Package Manager**: pnpm

## Project Structure

```
app/
├── (auth)/          # Authentication pages
├── auth/            # Auth API routes
├── components/      # Reusable UI components
├── lib/            # Utilities and helpers
└── utils/supabase/ # Supabase configuration
```

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

GNU GPLv3 License - see LICENSE file for details.
