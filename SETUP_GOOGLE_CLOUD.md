# Setting Up Free Audio Transcription with Google Cloud

## ✅ Free Option: Google Cloud Speech-to-Text
- **60 minutes per month** - completely free, forever
- **No credit card required** (but billing must be enabled)
- **125+ languages supported**
- No ongoing costs

## Step-by-Step Setup

### 1. Create Google Cloud Account
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign up with your Google account
3. Create a new project:
   - Click "Select a Project" (top left)
   - Click "NEW PROJECT"
   - Name it: "MeetMate AI"
   - Click "CREATE"

### 2. Enable Speech-to-Text API
1. In the console, go to **APIs & Services** > **Library**
2. Search for **"Speech-to-Text"**
3. Click on **Cloud Speech-to-Text API**
4. Click **ENABLE**

### 3. Create Service Account (Best Method)
1. Go to **APIs & Services** > **Credentials**
2. Click **+ CREATE CREDENTIALS** > **Service Account**
3. Fill in:
   - **Service account name**: `meetmate-ai`
   - **Service account ID**: auto-filled
4. Click **CREATE AND CONTINUE**
5. Click **CONTINUE** (skip optional steps)
6. Click **DONE**

### 4. Create and Download JSON Key
1. Click on the service account you just created
2. Go to **KEYS** tab
3. Click **ADD KEY** > **Create new key**
4. Choose **JSON** format
5. Click **CREATE** - the JSON file downloads automatically
6. **Keep this file safe!**

### 5. Set Environment Variable
In Replit, add your Google Cloud credentials:

**Option A: Using JSON file (Recommended)**
```bash
# Copy the entire JSON file content
# In Replit Secrets, add:
# Name: GOOGLE_APPLICATION_CREDENTIALS_JSON
# Value: <paste entire JSON content>
```

**Option B: Set path to file**
```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/keyfile.json"
```

### 6. Test Your Setup

Upload an MP3 file to MeetMate AI. If setup is correct:
- ✅ Audio will be transcribed using Google Cloud (FREE)
- ✅ You'll see instant results
- ✅ No OpenAI API key needed

## How It Works

Your app now:
1. **Tries Google Cloud first** (free tier)
2. **Falls back to OpenAI** if Google Cloud fails and you have an API key
3. **Shows which provider** was used in the analysis

## Troubleshooting

### "Missing credentials" error
→ Make sure GOOGLE_APPLICATION_CREDENTIALS_JSON is set in your environment

### "Speech detection failed"
→ Try a clearer audio file (MP3/WAV works best)
→ Audio must be in English (currently set to en-US)

### "Quota exceeded"
→ You've used 60+ minutes this month
→ Wait for the reset (next month)
→ Or use OpenAI API as fallback

## Pricing After Free Tier

If you exceed 60 minutes/month:
- **Standard model**: ~$0.006 per 15 seconds
- That's roughly **$0.016 per minute**

## Alternative Free Options

If Google Cloud doesn't work for you:

| Service | Free Tier | Setup |
|---------|-----------|-------|
| **Google Cloud** | 60 min/month | ← Recommended |
| **AssemblyAI** | 1 hour/month | [Link](https://www.assemblyai.com/) |
| **Open Source** | Unlimited* | Vosk (offline) |

*Open source options may have lower accuracy

## Next Steps

1. ✅ Set up Google Cloud credentials
2. ✅ Upload a test audio file
3. ✅ Verify it transcribes correctly
4. ✅ Start analyzing meetings for free!

---

**Questions?** Check Google Cloud documentation: https://cloud.google.com/speech-to-text/docs/quickstart
