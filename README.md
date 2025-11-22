# MeetMate AI 🎯

A powerful real-time meeting intelligence application that transforms audio from meetings into actionable insights. Record meetings live, upload audio files, or use pre-recorded content to get AI-powered summaries, action items, sentiment analysis, and efficiency scores.

## 🚀 Features

### Core Functionality
- **Live Meeting Recorder** - Record meetings directly from your microphone with real-time waveform visualization
- **Audio Upload** - Upload pre-recorded audio files (MP3, WAV, M4A)
- **AI Analysis** - Get instant insights including:
  - Executive summaries
  - Key discussion points
  - Action items with assignees and deadlines
  - Sentiment analysis (Productive, Tense, Informational, Positive)
  - Efficiency score (0-100%)
- **Email Sharing** - Send meeting reports to team members via email
- **Meeting History** - Browse and search all analyzed meetings
- **Dashboard** - View analytics and meeting statistics
- **Favorites & Notes** - Mark important meetings and add personal notes

### Technology Highlights
- Real-time audio waveform visualization during recording
- Groq AI for fast transcription and analysis
- Gmail integration for email delivery
- Modern dark-themed UI with Tailwind CSS
- Fully responsive design

## 📋 Prerequisites

Before you begin, ensure you have:
- **Node.js** v18+ ([download here](https://nodejs.org))
- **Git** ([download here](https://git-scm.com))
- **yt-dlp** (optional, for YouTube support):
  - Windows: `pip install yt-dlp` (requires Python)
  - Mac: `brew install yt-dlp`
  - Linux: `sudo apt install yt-dlp`

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone <repository-url>
cd meetmate-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
Create a `.env.local` file in the root directory:
```env
GROQ_API_KEY=your_groq_api_key_here
EMAIL_PASSWORD=your_gmail_app_password_here
EMAIL_USER=your_email@gmail.com
YOUTUBE_API_KEY=your_youtube_api_key_here
SESSION_SECRET=your_secret_key_here
```

### 4. Get Required API Keys

**Groq API Key:**
1. Visit [groq.com](https://groq.com)
2. Sign up for a free account
3. Create an API key from your dashboard
4. Add to `.env.local` as `GROQ_API_KEY`

**Gmail App Password:**
1. Enable 2-Factor Authentication on your Gmail account
2. Go to [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Generate a 16-character app password
4. Add to `.env.local` as `EMAIL_PASSWORD` and `EMAIL_USER`

**YouTube API Key (Optional):**
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable YouTube Data API v3
4. Create credentials (API key)
5. Add to `.env.local` as `YOUTUBE_API_KEY`

## 🏃 Running the Application

### Development Mode
```bash
npm run dev
```

The application will start on `http://localhost:5000`

### Build for Production
```bash
npm run build
```

## 📱 Usage Guide

### Recording a Live Meeting
1. Click **"Start Recording"** on the home page
2. Speak or present your meeting
3. Watch the real-time waveform visualization
4. Click **"Stop Recording"** when done
5. Analysis appears instantly

### Uploading Audio Files
1. Click **"Upload Audio"** section
2. Select an audio file (MP3, WAV, M4A)
3. Click **"Analyze Audio"**
4. Wait for transcription and analysis

### Sharing Results
1. After analysis completes
2. Enter recipient email address
3. Click **"Send Email"**
4. Report is delivered via Gmail

### Browsing History
1. Click **"History"** in the navbar
2. Search or filter past meetings
3. Mark favorites with the heart icon
4. View detailed analysis

### Dashboard Analytics
1. Click **"Dashboard"** in the navbar
2. View total meetings analyzed
3. Check average efficiency score
4. See sentiment breakdown chart

## 🏗️ Project Structure

```
meetmate-ai/
├── client/src/
│   ├── pages/
│   │   ├── home.tsx           # Main analysis interface
│   │   ├── history.tsx        # Meeting history page
│   │   └── dashboard.tsx      # Analytics dashboard
│   ├── components/
│   │   ├── navbar.tsx         # Navigation bar
│   │   ├── theme-provider.tsx # Dark mode theme
│   │   └── ui/                # Shadcn UI components
│   └── lib/
│       └── queryClient.ts     # React Query setup
├── server/
│   ├── routes.ts              # API endpoints
│   ├── groq-service.ts        # Groq AI integration
│   ├── email-service.ts       # Gmail integration
│   ├── youtube-service.ts     # YouTube audio download
│   ├── storage.ts             # Data storage interface
│   └── index-dev.ts           # Development server
├── shared/
│   └── schema.ts              # TypeScript types & schemas
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## 🔌 API Endpoints

### Meeting Analysis
- `POST /api/analyze-meeting` - Analyze audio and get insights
- `POST /api/upload-audio` - Upload audio file for analysis
- `POST /api/send-email` - Send analysis report via email

### Meeting History
- `GET /api/meetings` - Get all meeting analyses
- `GET /api/meetings/:id` - Get specific meeting analysis
- `POST /api/meetings/:id/favorite` - Toggle favorite status
- `POST /api/meetings/:id/notes` - Add/update notes

## 🛠️ Technology Stack

### Frontend
- **React** 18+ with TypeScript
- **Vite** - Fast build tool
- **Wouter** - Lightweight routing
- **React Query** - Server state management
- **Tailwind CSS** - Utility-first styling
- **Shadcn UI** - Component library
- **Lucide React** - Icon library

### Backend
- **Express.js** - HTTP server
- **Node.js** - Runtime
- **TypeScript** - Type safety

### AI & Services
- **Groq SDK** - Transcription (Whisper V3) and LLM analysis (Llama 3.3 70B)
- **Nodemailer** - Gmail SMTP email
- **yt-dlp** - YouTube audio downloading

### Data & Storage
- In-memory storage (MemStorage) - Currently using local storage
- PostgreSQL ready (can switch to database mode)
- Drizzle ORM - Type-safe database queries

## 📊 Analysis Output

Each meeting analysis includes:

```json
{
  "id": "uuid",
  "executiveSummary": "2-3 sentence summary",
  "keyPoints": ["Point 1", "Point 2", "Point 3"],
  "actionItems": [
    {
      "assignee": "Person Name",
      "task": "Task description",
      "deadline": "Date or TBD"
    }
  ],
  "sentiment": "Productive|Tense|Informational|Positive",
  "efficiencyScore": 85,
  "transcript": "Full meeting transcript",
  "isFavorite": 0,
  "notes": "User notes"
}
```

## 🔐 Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key for AI services |
| `EMAIL_USER` | Yes | Gmail sender address |
| `EMAIL_PASSWORD` | Yes | Gmail app password (16 chars) |
| `YOUTUBE_API_KEY` | No | YouTube Data API key |
| `SESSION_SECRET` | No | Session encryption secret |

## 🚀 Deployment

### Deploy to Replit
1. Push code to GitHub
2. Import repository in Replit
3. Set environment variables in Secrets
4. Run `npm run dev`
5. Use Replit's publish feature

### Deploy to Other Platforms
The app can be deployed to:
- Vercel (frontend)
- Railway (full stack)
- Render (full stack)
- AWS (full stack)
- DigitalOcean (full stack)

Make sure to set all required environment variables on your hosting platform.

## 🎯 Use Cases

- **Sales Teams** - Record client calls and get action items
- **Development Teams** - Capture sprint planning meetings
- **HR Departments** - Document interviews and feedback sessions
- **Project Managers** - Track meeting decisions and assignments
- **Students** - Record lectures and get key summaries
- **Researchers** - Document interview transcripts

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 🆘 Troubleshooting

### Microphone not working
- Ensure browser has microphone permissions
- Check if other applications are using the microphone
- Try a different browser

### Transcription failing
- Verify GROQ_API_KEY is correct
- Check internet connection
- Ensure audio file is under 25MB

### Email not sending
- Verify EMAIL_USER and EMAIL_PASSWORD
- Check if Gmail 2FA is enabled
- Confirm app password is generated (not regular password)

### Analysis errors
- Check GROQ_API_KEY configuration
- Verify audio quality and format
- Try with a shorter audio file first

## 📞 Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the code documentation
3. Check GROQ and Gmail API documentation
4. Open an issue on GitHub

## 🎉 What's New

### Latest Features
- Live meeting recording with waveform visualization
- Real-time audio analysis
- Email report sharing
- Meeting history and search
- Dashboard with analytics
- Favorite meetings tracking
- Custom notes on meetings

## 🔮 Future Roadmap

- User authentication and accounts
- Database persistence (PostgreSQL)
- Video meeting recording support
- Slack integration
- Calendar integration
- Multi-language support
- Team collaboration features
- Meeting transcripts with timestamps
- Custom analysis templates

---

**Built with ❤️ for better meetings**
