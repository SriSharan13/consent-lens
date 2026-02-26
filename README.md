# 🛡️ ConsentLens: AI-Powered Privacy Intelligence

ConsentLens is a comprehensive privacy protection suite that empowers users to understand what they are agreeing to when they click "Accept" on digital agreements. Using hybrid AI analysis, it breaks down complex legal jargon into actionable risk scores in real-time.

![Project Banner](https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=2070&auto=format&fit=crop)

## 🚀 Key Features

- **🌐 Browser Extension**: Automatically scans websites for privacy policies and trackers. Provides instant "Safe", "Caution", or "Avoid" prompts.
- **📊 Premium Dashboard**: A central command center to monitor your privacy footprint across the web.
- **🧠 Real-time AI Analysis**: Powered by Google Gemini to parse legal language, data retention policies, and dark patterns.
- **✨ Premium UI**: Built with Next.js, Framer Motion, and Tailwind CSS for a state-of-the-art interactive experience.
- **🔒 Secure & Private**: Direct integration with Supabase for secure user authentication and data storage.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, Tailwind CSS, Framer Motion, Lucide Icons.
- **Backend**: FastAPI (Python), Google Gemini Pro AI.
- **Database**: Supabase (PostgreSQL with Realtime subscriptions).
- **Extension**: Chrome Extension API (v3).

## 📁 Project Structure

```text
├── consent lens/          # Browser Extension source code
├── consent lens ui/       # Next.js Dashboard & Landing Page
└── consentlens-backend/   # FastAPI Python service & AI Engine
```

## ⚙️ Setup Instructions

### Prerequisites
- Node.js & npm
- Python 3.9+
- Supabase Account
- Google AI (Gemini) API Key

### Backend Setup
1. Navigate to `consentlens-backend/`.
2. Create a `.env` file with `GEMINI_API_KEY`, `SUPABASE_URL`, and `SUPABASE_KEY`.
3. Install dependencies: `pip install -r requirements.txt`.
4. Run: `uvicorn main:app --reload`.

### Frontend Setup
1. Navigate to `consent lens ui/`.
2. Create a `.env.local` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
3. Install dependencies: `npm install`.
4. Run: `npm run dev`.

### Extension Setup
1. Open Chrome and go to `chrome://extensions/`.
2. Enable "Developer mode".
3. Click "Load unpacked" and select the `consent lens/` folder.

---
Created with ❤️ by the ConsentLens Team.
