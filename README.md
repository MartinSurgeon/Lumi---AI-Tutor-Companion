# 🌟 Lumi - AI Tutor Companion

A beautiful, mobile-first AI tutoring application powered by Google's Gemini Live API. Lumi helps students learn through real-time voice and video conversations.

## ✨ Features

- 🎤 **Real-time Voice Conversations** - Talk naturally with Lumi
- 📹 **Video Analysis** - Lumi can see and help with worksheets, books, and more
- 📱 **Mobile-First Design** - Beautiful UI optimized for mobile devices
- 🎨 **Animated Interface** - Smooth animations and modern design
- 🧠 **Adaptive Learning** - Lumi adjusts to your learning style and pace
- 📊 **Progress Tracking** - Visual progress indicators and confidence scores

## 🚀 Quick Start

### Local Development

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Lumi---AI-Tutor-Companion
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   - Create a `.env.local` file in the root directory
   - Add your Gemini API key:
     ```
     GEMINI_API_KEY=your-api-key-here
     ```
   - Get your API key from [Google AI Studio](https://aistudio.google.com/)

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **For mobile testing (HTTPS required):**
   - See `DEPLOY.md` for Vercel deployment (recommended)
   - Or use ngrok (see `QUICK_START.md`)

## 📱 Mobile Access

For mobile testing, you need HTTPS. The easiest way is to deploy to Vercel (free):

1. Follow the instructions in `DEPLOY.md`
2. Your app will be accessible via HTTPS URL
3. Works perfectly on mobile browsers!

### 📦 Install as a PWA

1. Visit your deployed Lumi app on Chrome, Edge, or Safari
2. Look for the **Install** / **Add to Home Screen** prompt (usually in the address bar or menu)
3. Confirm the install to add Lumi as a standalone app
4. Launch Lumi directly from your home screen with a splash screen and custom theme color

## 🌐 Deploy to Vercel (Free)

See `DEPLOY.md` for detailed deployment instructions.

**Quick steps:**
1. Push code to GitHub
2. Import project in Vercel
3. Add `GEMINI_API_KEY` environment variable
4. Deploy! 🎉

## 🛠️ Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Google Gemini Live API** - AI conversation
- **Lucide Icons** - Beautiful icons

## 📝 Project Structure

```
├── components/          # React components
│   ├── SetupModal.tsx  # User onboarding
│   └── Waveform.tsx    # Audio visualization
├── hooks/               # Custom React hooks
│   └── useGeminiLive.ts # Gemini API integration
├── types.ts            # TypeScript types
├── assets/             # Images and assets
├── App.tsx             # Main application component
└── index.html          # HTML entry point
```

## 🔧 Configuration

### Environment Variables

- `GEMINI_API_KEY` - Your Google Gemini API key (required)

### Vite Configuration

The `vite.config.ts` file handles:
- Environment variable loading
- Build optimization
- Development server settings

## 📖 Documentation

- `DEPLOY.md` - Vercel deployment guide
- `QUICK_START.md` - Local development with ngrok
- `README_NGROK.md` - Ngrok setup instructions

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Google Gemini for the amazing AI API
- Vercel for free hosting
- The open-source community

---

Made with ❤️ for learners everywhere
