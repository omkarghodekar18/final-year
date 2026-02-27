# Interview Feature Setup Guide

## Problem: Transcription Not Working
The interview transcription feature cannot convert your speech to text because FFmpeg is not installed on your system.

## Root Cause
The Faster-Whisper library requires FFmpeg to decode audio files. Without it, the transcription completely fails (no errors shown, just silent failure).

## Solution: Install FFmpeg

### Quick Fix for Windows

#### Option 1: Using Chocolatey (Recommended if you have it)
```bash
choco install ffmpeg
```

#### Option 2: Manual Installation
1. **Download FFmpeg:**
   - Go to: https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.7z
   - Download the 7zip archive

2. **Extract:**
   - Extract to `C:\ffmpeg`
   - You should see `C:\ffmpeg\bin\ffmpeg.exe`

3. **Add to System PATH:**
   - Search "Edit the system environment variables" in Windows Start
   - Click "Environment Variables"
   - Under "System variables", find "Path" and click "Edit"
   - Click "New" and add: `C:\ffmpeg\bin`
   - Click OK on all dialogs

4. **Verify Installation:**
   Close and reopen your terminal, then run:
   ```bash
   ffmpeg -version
   ```
   You should see version information.

5. **Test the Setup:**
   ```bash
   cd Backend
   python diag_interview.py
   ```
   All checks should pass.

### For macOS:
```bash
brew install ffmpeg
```

### For Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install ffmpeg
```

### For Linux (Fedora):
```bash
sudo dnf install ffmpeg
```

## Testing After Installation

Once FFmpeg is installed, verify everything works:

```bash
cd Backend
python diag_interview.py
```

Expected output:
```
============================================================
SkillsBridge Interview Feature Diagnostics
============================================================

[CHECK] Testing FFmpeg installation...
[OK] FFmpeg is installed
   Version: ffmpeg version 6.1.1

[CHECK] Testing module imports...
[OK] Faster-Whisper imported successfully

[CHECK] Testing Faster-Whisper model...
[STT] Initializing Faster-Whisper model: tiny.en
[STT] Model loaded successfully: tiny.en
[OK] Faster-Whisper model loaded successfully

[CHECK] Testing transcription...
[STT] Starting transcription of 32044 bytes (format: .wav)
[STT] No speech detected in audio
[OK] Transcription successful: ''

============================================================
DIAGNOSTICS RESULTS
============================================================
[OK] ALL CHECKS PASSED - Interview feature should work!
```

## Code Changes Made

### Frontend Improvements
✅ Added comprehensive error logging with `[STT]` prefix for debugging
✅ Added toast notifications when transcription fails
✅ Added console logs to track every step
✅ Better error messages for users

### Backend Improvements  
✅ Added detailed logging to STT service
✅ Added ffmpeg installation checks
✅ Better error handling with helpful messages
✅ Model loading status prints to console

## Running the Servers

After installing FFmpeg and all checks pass:

**Terminal 1 (Backend):**
```bash
cd Backend
python app.py
```

**Terminal 2 (Frontend):**
```bash
cd Frontend
npm run dev
```

## How It Works Now

1. You click "Start Interview"
2. Questions are fetched from OpenRouter
3. AI speaks the question using TTS
4. **You click "Next" → This triggers transcription:**
   - MediaRecorder stops
   - Audio chunks are collected
   - FormData with audio blob is sent to `/api/stt/transcribe`
   - Backend receives audio
   - **FFmpeg decodes the audio** ← THIS IS THE FIX
   - Whisper transcribes to text
   - Text is returned to frontend
   - Frontend displays it

## Troubleshooting

### Still not working after FFmpeg install?

1. **Check server logs:** Look for `[STT]` prefixed logs
2. **Verify model is cached:** First transcription downloads the model (~75MB)
3. **Check browser console:** Look for frontend logs with `[STT]`
4. **Clear browser cache:** Sometimes the old JS is cached
5. **Restart both servers:** After installing FFmpeg

### If transcription shows "No speech detected"

This is normal for silent audio. Speak clearly when testing.

### If errors persist

Run diagnostics again:
```bash
cd Backend
python diag_interview.py
```

## Summary

**FFmpeg is required** for Whisper to decode audio files. Without it, transcription fails silently.

Once FFmpeg is installed, transcription will work and user answers will appear in real-time on the interview page.