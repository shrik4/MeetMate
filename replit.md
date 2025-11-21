# MeetMate AI

## Overview

MeetMate AI is a real-time meeting intelligence application that transforms meeting links (Google Meet, Zoom, Teams, YouTube) into actionable insights. The application analyzes meeting content using AI to extract summaries, decisions, action items, blockers, sentiment analysis, and generates follow-up emails. Built as a single-page application with a modern SaaS aesthetic featuring dark mode by default with light mode toggle support.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server for fast HMR (Hot Module Replacement)
- Wouter for lightweight client-side routing (single-page app pattern)
- React Query (@tanstack/react-query) for server state management and API request caching

**UI Component System**
- Shadcn/ui component library with Radix UI primitives for accessible, customizable components
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variant management
- Custom theme system supporting dark/light modes with CSS variables

**Design Philosophy**
- Modern SaaS aesthetic inspired by Linear, Notion, and Vercel
- Default dark theme with optional light mode toggle
- Card-based layouts with shadows, rounded corners, and elevation effects
- Responsive design with mobile-first approach (two-column desktop, stacked mobile)

**State Management**
- React Query for asynchronous server state
- React Context for theme management (ThemeProvider)
- Local component state with React hooks (useState, useEffect)
- Form state managed through react-hook-form with Zod validation

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- Node.js runtime with ES modules (type: "module")
- TypeScript for type safety across the stack
- Separate development (index-dev.ts) and production (index-prod.ts) entry points

**Development vs Production**
- Development: Vite middleware integration for live reloading and HMR
- Production: Static file serving from pre-built dist directory
- Environment-based configuration through NODE_ENV

**API Design**
- RESTful endpoint: POST /api/analyze-meeting
- JSON request/response format with Zod schema validation
- Error handling with try-catch blocks and appropriate HTTP status codes
- Request logging middleware for debugging and monitoring

**AI Processing**
- Google Gemini AI integration via @google/genai SDK
- Structured prompt engineering for meeting analysis
- Output parsing into typed data structures (ActionItem, SentimentPoint)
- Demo mode support for testing without actual video processing

### Data Storage Solutions

**Current Implementation: In-Memory Storage**
- MemStorage class implementing IStorage interface
- Map-based storage for meetings and analyses
- UUID generation for record identifiers
- Suitable for development and demo purposes

**Database Schema (Drizzle ORM)**
- PostgreSQL schema defined but not actively used in current implementation
- Drizzle Kit for schema management and migrations
- Two main tables:
  - `meetings`: Stores meeting metadata (link, type, language)
  - `meeting_analyses`: Stores AI-generated analysis results with JSONB columns for complex data
- Neon Database serverless driver configured for production readiness

**Data Models**
- Meetings: ID, meeting link, type, language, created timestamp
- Meeting Analyses: Summary text, decisions array, action items (task, owner, deadline, priority), blockers array, sentiment timeline, email draft, metadata (duration, participants, mood)
- Type safety enforced through Drizzle-Zod schema generation

### Authentication and Authorization

**Current State**: No authentication implemented
- Application operates in open/public mode
- All endpoints are publicly accessible
- No user accounts or session management

**Potential Future Implementation**
- Session-based authentication ready (connect-pg-simple dependency present)
- Could implement user accounts to save meeting history
- Role-based access control for team collaboration features

### External Dependencies

**AI Service**
- Google Gemini API (via @google/genai package)
- API key required via GEMINI_API_KEY environment variable
- Used for meeting content analysis and structured data extraction
- Fallback to demo/sample data when isDemo flag is set

**Database Provider**
- Neon Database (PostgreSQL serverless)
- Connection via @neondatabase/serverless driver
- DATABASE_URL environment variable required for connection
- Drizzle ORM for type-safe database operations

**UI Component Libraries**
- Radix UI primitives (30+ component packages)
- Recharts for data visualization (sentiment timeline charts)
- Lucide React for icon system
- date-fns for date manipulation

**Development Tools**
- Replit-specific plugins for enhanced development experience:
  - @replit/vite-plugin-runtime-error-modal
  - @replit/vite-plugin-cartographer
  - @replit/vite-plugin-dev-banner
- ESBuild for production bundling
- TSX for TypeScript execution in development

**Build & Deployment**
- Vite for frontend bundling
- ESBuild for backend bundling (server/index-prod.ts)
- Output: dist/public (frontend), dist/index.js (backend)
- Environment variable management for API keys and database URLs