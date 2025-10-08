<p align="center">
  <img src="https://peaceful-chimera-883c79.netlify.app/logo.png" alt="Notiva Logo" width="100">
</p>

<h1 align="center">Notiva</h1>

<p align="center">
  <i>Modern markdown note-taking platform with AI enhancement and professional publishing features.</i>
</p>

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](LICENSE)
[![Powered by Lunos](https://img.shields.io/badge/AI-Lunos-purple)](https://lunos.tech)
[![Supabase](https://img.shields.io/badge/Backend-Supabase-green)](https://supabase.com)

---

Notiva is a modern markdown note-taking platform that transforms how you capture, organize, and share your ideas. Built with Next.js 15 and Supabase, it combines the simplicity of markdown editing with hierarchical organization, content enhancement tools, and professional publishing capabilities.

## ✨ Features

### **Core Features**

-  **📝 Markdown Note-Taking** - Write and edit notes with full markdown support
-  **📁 Hierarchical Organization** - Create nested folders with color-coded labels
-  **🔍 Advanced Search** - Find notes instantly with powerful search capabilities
-  **📄 PDF Export** - Export your notes as professional PDF documents
-  **🌐 Publish & Share** - Publish notes as SEO-optimized web pages
-  **🤖 AI Enhancement** - Improve writing with grammar correction, summarization, rewriting, and idea generation.
-  **🌙 Dark/Light Mode** - Beautiful themes that adapt to your preference
-  **📱 Mobile-First Design** - Seamless experience across all your devices

### **Upcoming Features**

-  **📥 Import Documents** - Import markdown files and various document types (PDF, Word, etc.)
-  **🔍 Semantic Search** - Intelligent note discovery and content search
-  **🔌 REST API** - Designed for seamless integration with MCP systems and automation workflows
-  **☁️ Google Drive Sync** - Automatic backup and cross-platform sync

---

## 🚀 Quick Start

### Prerequisites

-  Node.js (v20 or higher)
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

   > **Note**: The AI Enhancement feature requires a valid Lunos API key. Without it, the AI Enhance button will be disabled. You can get your API key from the [Lunos dashboard](https://lunos.tech/dashboard/api-keys).

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

## 🛠️ Tech Stack

-  **🎨 Frontend**: Next.js 15, React, TypeScript
-  **💅 Styling**: Tailwind CSS, shadcn/ui
-  **🔐 Authentication**: Supabase Auth
-  **🗄️ Database**: Supabase PostgreSQL with Row Level Security (RLS)
-  **🤖 AI**: Lunos AI
-  **📦 Package Manager**: pnpm

## 📊 User Limitations & Database Activity

Notiva enforces usage limits and security policies to ensure fair usage and data protection.

### **Usage Limits Per User**

| Resource            | Limit                   | Purpose                                         |
| ------------------- | ----------------------- | ----------------------------------------------- |
| **Notes**           | 1,000 notes             | Prevents database bloat and ensures performance |
| **Folders**         | 50 folders              | Maintains organizational structure efficiency   |
| **Labels**          | 100 labels              | Keeps labeling system manageable                |
| **AI Enhancements** | Tracked (no hard limit) | Monitor AI usage for potential future limits    |

### **Database Security**

-  **User Data Isolation**: Each user can only access their own content
-  **Published Content**: Users can view any published notes, but only edit their own
-  **Automatic Enforcement**: Database-level security prevents unauthorized access
-  **Usage Tracking**: Real-time monitoring of resource usage with automatic limits

### **Key Features**

-  **Creation Limits**: Database prevents creation when limits are reached
-  **Performance**: Optimized queries with proper database indexes
-  **Data Integrity**: Automatic cleanup and timestamp tracking
-  **AI Integration**: Requires Lunos API key, graceful degradation when unavailable

## 📁 Project Structure

```
app/
├── (auth)/          # Authentication pages
├── auth/            # Auth API routes
├── components/      # Reusable UI components
├── lib/            # Utilities and helpers
└── utils/supabase/ # Supabase configuration
```

## 💻 Development

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

## 🐳 Docker Deployment

### Environment Setup

First, create your environment file:

```bash
# Create environment file
cp .env.production .env.local
```

Edit `.env.local` with your values:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=https://your-domain.com
# Get your API key from: https://lunos.tech/dashboard/api-keys
LUNOS_API_KEY=your_lunos_api_key
```

> **Note**: The AI Enhancement feature requires a valid Lunos API key. Without it, the AI Enhance button will be disabled. You can get your API key from the [Lunos dashboard](https://lunos.tech/dashboard/api-keys).

### Deployment Options

#### Option 1: Use Pre-built Image (Recommended)

```bash
# Pull the latest image
docker pull frdblock/notiva:latest

# Run the container
docker run -d \
  --name notiva-app \
  -p 3000:3000 \
  --env-file .env.local \
  frdblock/notiva:latest
```

#### Option 2: Build from Source

```bash
# Build and run with Docker Compose
docker-compose up -d
```

#### Option 3: Manual Build

```bash
# Build image
docker build -t notiva .

# Run container
docker run -d --name notiva-app -p 3000:3000 --env-file .env.local notiva
```

### Access Your App

Open http://localhost:3000 in your browser.

### Production Management

```bash
# View logs
docker-compose logs -f notiva

# Update application
docker-compose down && git pull && docker-compose up -d --build

# Stop application
docker-compose down
```

### Requirements

-  Docker & Docker Compose
-  Configured Supabase project
-  Domain name (recommended for production)

> **💡 Pro Tip**: Use the pre-built Docker image from [Docker Hub](https://hub.docker.com/r/frdblock/notiva) for faster deployment without building from source.

## ☁️ Cloudflare Workers Deployment

Deploy Notiva to Cloudflare Workers for global edge performance and automatic scaling.

### Prerequisites

-  Cloudflare account
-  Wrangler CLI installed (`npm install -g wrangler`)
-  Configured Supabase project

### Setup

1. **Install Wrangler CLI**

   ```bash
   npm install -g wrangler
   ```

2. **Login to Cloudflare**

   ```bash
   wrangler login
   ```

3. **Configure environment variables**

   Create `.env.local` in the project root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   NEXT_PUBLIC_SITE_URL=https://your-worker.your-subdomain.workers.dev

   # Lunos API Key (for AI Enhancement feature)
   LUNOS_API_KEY=your_lunos_api_key
   ```

   > **Note**: The AI Enhancement feature requires a valid Lunos API key. Without it, the AI Enhance button will be disabled. You can get your API key from the [Lunos dashboard](https://lunos.tech/dashboard/api-keys).

4. **Deploy to Cloudflare Workers**

   ```bash
   # Build and deploy
   pnpm deploy
   ```

   Or deploy manually:

   ```bash
   # Build the application
   pnpm build

   # Deploy to Cloudflare Workers
   opennextjs-cloudflare build && opennextjs-cloudflare deploy
   ```

5. **Preview deployment**

   ```bash
   # Preview locally before deploying
   pnpm preview
   ```

### Custom Domain (Optional)

1. **Add custom domain in Cloudflare dashboard**

   -  Go to Workers & Pages > Your Worker > Settings > Triggers
   -  Add custom domain

2. **Update environment variables**

   ```env
   NEXT_PUBLIC_SITE_URL=https://your-custom-domain.com
   ```

3. **Redeploy**
   ```bash
   pnpm deploy
   ```

### Management Commands

```bash
# View deployment logs
wrangler tail

# Update application
git pull && pnpm deploy

# Delete deployment
wrangler delete notiva
```

### Benefits of Cloudflare Workers

-  **🌍 Global Edge Network** - Your app runs close to users worldwide
-  **⚡ Lightning Fast** - Sub-100ms response times
-  **💰 Cost Effective** - Pay only for requests, not idle time
-  **🔒 Built-in Security** - DDoS protection and security features
-  **📈 Auto Scaling** - Handles traffic spikes automatically

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

GNU GPLv3 License - see LICENSE file for details.
