# 🚀 Deploy Lumi to Vercel (Free)

This guide will help you deploy Lumi to Vercel for free, making it accessible on mobile and web!

## 📋 Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free)
2. A [GitHub account](https://github.com) (free)
3. Your Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

## 🎯 Step-by-Step Deployment

### Step 1: Push to GitHub

1. **Create a new repository on GitHub:**
   - Go to https://github.com/new
   - Name it (e.g., `lumi-ai-tutor`)
   - Make it **Public** or **Private** (both work with Vercel)
   - Click "Create repository"

2. **Push your code to GitHub:**
   ```powershell
   git init
   git add .
   git commit -m "Initial commit - Lumi AI Tutor"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Step 2: Deploy to Vercel

1. **Go to Vercel:**
   - Visit https://vercel.com
   - Click "Sign Up" (or "Log In" if you have an account)
   - Sign in with your GitHub account

2. **Import your project:**
   - Click "Add New..." → "Project"
   - Find and select your repository
   - Click "Import"

3. **Configure your project:**
   - **Framework Preset:** Vite (should auto-detect)
   - **Root Directory:** `./` (default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)

4. **Add Environment Variable:**
   - Click "Environment Variables"
   - Add a new variable:
     - **Name:** `GEMINI_API_KEY`
     - **Value:** Your actual Gemini API key (e.g., `AIzaSyCPSXUaZ__d_6v4ztgTIOTfDdtzej1yBHY`)
   - Click "Add"

5. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for the build to complete
   - 🎉 Your app will be live!

### Step 3: Access Your App

After deployment, Vercel will give you a URL like:
```
https://lumi-ai-tutor.vercel.app
```

This URL is:
- ✅ **HTTPS by default** (required for microphone/camera)
- ✅ **Accessible on mobile**
- ✅ **Free forever** (on Hobby plan)

## 📱 Testing on Mobile

1. Open the Vercel URL on your mobile browser
2. Grant microphone and camera permissions when asked
3. Complete the setup form
4. Start learning! 🎉

## 🔧 Updating Your App

Every time you push to GitHub, Vercel will automatically:
- Build your app
- Deploy the new version
- Keep the same URL

Just run:
```powershell
git add .
git commit -m "Your changes"
git push
```

## 🛠️ Troubleshooting

**Build fails:**
- Check the build logs in Vercel dashboard
- Make sure `GEMINI_API_KEY` environment variable is set
- Ensure all dependencies are in `package.json`

**Mobile not working:**
- Make sure you're using the HTTPS URL from Vercel
- Check browser permissions for microphone/camera
- Try a different mobile browser (Chrome recommended)

**Environment variables not working:**
- Make sure the variable name is exactly `GEMINI_API_KEY`
- Redeploy after adding/updating variables
- Check "Settings" → "Environment Variables" in Vercel

## 💡 Pro Tips

1. **Custom Domain (Optional):**
   - In Vercel, go to your project → "Settings" → "Domains"
   - Add your custom domain (e.g., `lumi.yoursite.com`)
   - Vercel will handle SSL automatically

2. **Preview Deployments:**
   - Every pull request gets its own preview URL
   - Perfect for testing before merging

3. **Analytics (Optional):**
   - Enable Vercel Analytics to track usage
   - Free tier includes basic analytics

## 🎉 You're Done!

Your Lumi AI Tutor is now live and accessible worldwide!

**Next Steps:**
- Share your Vercel URL with friends
- Test on different devices
- Customize and improve your app

---

**Need Help?**
- Vercel Docs: https://vercel.com/docs
- Vercel Discord: https://vercel.com/discord

