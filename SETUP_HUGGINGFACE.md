# Free Audio Transcription with Hugging Face

## ✅ Free Option: Hugging Face API
- **500 API calls/month** with free tier (more than enough for meeting transcription)
- **No credit card required** (optional for higher usage)
- **Whisper model support** (same as OpenAI)
- Uses the same Whisper model as OpenAI, but **completely free**

## Step-by-Step Setup

### 1. Create Hugging Face Account
1. Go to [Hugging Face](https://huggingface.co)
2. Click **Sign Up**
3. Create account with email or GitHub
4. Verify your email

### 2. Get Your API Key
1. Go to **Settings** (click profile → Settings)
2. Click **Access Tokens** in left sidebar
3. Click **New token**
4. Set:
   - **Name**: `meetmate-ai`
   - **Type**: `Read` (minimum required)
5. Click **Generate token**
6. **Copy the token** (starts with `hf_`)
7. Keep it safe!

### 3. Add to Your Replit Project
In Replit, add your Hugging Face API key as an environment variable:

**In Secrets tab:**
- Name: `HUGGING_FACE_API_KEY`
- Value: `hf_xxxxx...` (your token)

### 4. Test Your Setup
1. Open MeetMate AI
2. Upload an MP3 file
3. Click "Transcribe & Analyze"
4. It will use Hugging Face (FREE!)

## How It Works

Your app tries transcription providers in this order:
1. **Google Cloud** (60 min/month FREE) - if credentials available
2. **Hugging Face** (500 calls/month FREE) - if API key available
3. **OpenAI** (paid) - if API key available

## Advantages of Hugging Face

| Feature | Hugging Face | Google Cloud | OpenAI |
|---------|-------------|------------|--------|
| **Free Tier** | 500 calls/month | 60 min/month | Pay per use |
| **Setup Time** | 2 minutes | 10 minutes | 5 minutes |
| **Model** | Whisper (same as OpenAI) | Google's own | Whisper |
| **Quality** | Excellent | Excellent | Excellent |
| **No Credit Card** | Yes | Optional | Required |

## Pricing After Free Tier

If you exceed 500 calls/month with Hugging Face:
- **Standard inference**: ~$0.005 per request
- Much cheaper than OpenAI ($0.006 per 15 seconds)

## Troubleshooting

### "Invalid API key"
→ Make sure token starts with `hf_`
→ Check it's saved correctly in environment variables
→ Try generating a new token

### "API rate limit exceeded"
→ You've used 500+ calls this month
→ Wait for reset (next month)
→ Or upgrade to Pro ($9/month for unlimited)

### "No speech detected"
→ Try a clearer audio file
→ Make sure it's MP3 or WAV format
→ Check file size (max 5MB recommended)

## Quick Comparison

**Best for you?**
- Want completely free → **Hugging Face** (500 calls/month)
- Want easy setup → **Hugging Face** (2 minutes)
- Have Google account → **Google Cloud** (60 min/month)
- Already using OpenAI → **OpenAI** (consistent interface)

## Next Steps

1. ✅ Get your Hugging Face API key
2. ✅ Add to Replit environment variables
3. ✅ Upload a test audio file
4. ✅ Start transcribing for free!

---

**Get started:** https://huggingface.co/join
