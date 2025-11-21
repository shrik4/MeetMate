# MeetMate AI

## Overview

MeetMate AI is a real-time meeting intelligence application that transforms meeting links (Google Meet, Zoom, Teams, YouTube) into actionable insights. The application analyzes meeting content using AI to extract summaries, decisions, action items, sentiment analysis, and generates follow-up emails. Built as a single-page application with a modern SaaS aesthetic featuring dark mode by default.

## Current Status

**Version 2.0 - Groq-Powered Architecture**
- Migrated from Hugging Face + Gemini to Groq unified SDK
- Simplified to meeting links only (no audio upload)
- Email sending integrated with Gmail SMTP
- Clean, modern dark-themed UI with real-time analysis

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Tooling**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- React Query (@tanstack/react-query) for server state management

**UI Component System**
- Shadcn/ui component library with Radix UI primitives
- Tailwind CSS for utility-first styling
- Dark theme by default with gradient backgrounds

**Features**
- URL input for meeting links (YouTube, Google Meet, Zoom, Teams)
- Audio file upload support
- Real-time analysis display with executive summary, key points, action items, sentiment, efficiency score
- Email sharing functionality to send analysis reports

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routing
- Node.js runtime with ES modules
- TypeScript for type safety across the stack

**AI Processing**
- **Groq SDK** for unified transcription (Whisper V3) and analysis (Llama 3.3 70B)
- Structured prompt engineering for meeting analysis
- Output parsing into typed data structures

**Email Service**
- Nodemailer for Gmail SMTP integration
- Sender: l208shrikara@gmail.com
- Sends formatted HTML email reports with meeting analysis

### Data Storage

**Current Implementation: In-Memory Storage**
- MemStorage class implementing IStorage interface
- Map-based storage for meetings and analyses
- UUID generation for record identifiers

**Data Models**
- Meetings: ID, videoUrl, title, transcription, createdAt
- Meeting Analyses: ID, meetingId, executiveSummary, keyPoints[], actionItems[], sentiment, efficiencyScore, createdAt

### External Services

**AI Service**
- Groq API (via groq-sdk package)
- API key: GROQ_API_KEY environment variable
- Models:
  - Transcription: whisper-large-v3
  - Analysis: llama-3.3-70b-versatile

**Email Service**
- Gmail SMTP (via nodemailer)
- Credentials: EMAIL_USER (l208shrikara@gmail.com), EMAIL_PASSWORD (app password)

## Configuration

### Required Environment Variables

**Secrets:**
- `GROQ_API_KEY` - Groq API key for transcription and analysis
- `EMAIL_PASSWORD` - Gmail app password (16-character format, no spaces)

**Environment Variables:**
- `EMAIL_USER` - Sender email (defaults to l208shrikara@gmail.com)

### Setup Instructions

1. Get Groq API Key:
   - Visit https://groq.com/
   - Create account and get API key
   - Set as GROQ_API_KEY secret

2. Gmail App Password:
   - Enable 2FA on Gmail account
   - Visit https://myaccount.google.com/apppasswords
   - Generate 16-character app password
   - Set as EMAIL_PASSWORD secret (format: no spaces, continuous string)

## API Endpoints

- `POST /api/analyze-meeting` - Analyze meeting from video URL
- `POST /api/upload-audio` - Upload and analyze audio file
- `GET /api/meetings` - Get all meeting analyses
- `GET /api/meetings/:id` - Get specific meeting analysis
- `POST /api/send-email` - Send analysis report via email

## Recent Changes

- **Groq Integration**: Unified transcription + analysis in single API
- **Email Service**: Full Gmail SMTP integration with HTML formatting
- **Schema Simplification**: Cleaned up data model to match Python reference
- **UI Overhaul**: Modern dark-themed gradient design with dark slate color scheme
- **Removed Features**: Audio upload handling, demo mode, OpenAI dependency

## Known Issues

- LSP diagnostic: toggleFavorite method references deprecated schema field (not affecting functionality)
- PostCSS warning in dev mode (non-blocking, Vite configuration issue)

## Next Steps (Future)

- Add user authentication for meeting history per user
- Implement database persistence (PostgreSQL ready)
- Add PDF export functionality
- Add favorite/bookmark meetings
- Add meeting notes editing
- Dashboard with statistics and insights
- Integration with calendar services
