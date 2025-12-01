
# Lumi - AI Tutor Companion

Lumi is a real-time, voice-interactive AI tutor that helps students with homework, teaches topics through conversation and visual aids, and adaptively tracks their progress.

Built with **React**, **Vite**, and the **Google Gemini Live API**.

## Features

- **Real-time Voice Conversation:** Talk to Lumi just like a video call.
- **Visual Intelligence:** Lumi can see your homework or objects via the camera.
- **Visual Aids:** Generates educational images (diagrams, illustrations) on the fly.
- **Adaptive Learning:** Tracks understanding score and adjusts difficulty (Beginner -> Advanced).
- **Teacher Mode:** Simulate student responses via text for testing.
- **Mobile Friendly:** Works on mobile browsers with camera switching support.

## Getting Started

1.  **Clone the repository**
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Set up Environment Variables**:
    Create a `.env` file in the root directory:
    ```env
    VITE_API_KEY=your_gemini_api_key_here
    ```
4.  **Run the development server**:
    ```bash
    npm run dev
    ```

## Technology Stack

- **Frontend:** React, TypeScript, Tailwind CSS
- **AI Model:** Gemini 2.5 Flash (Live API) & Gemini 2.5 Flash Image
- **Audio:** Web Audio API (PCM encoding/decoding)
