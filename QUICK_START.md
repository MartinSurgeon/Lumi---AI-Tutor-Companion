# 🚀 Quick Start Guide - Lumi with HTTPS (Ngrok)

## ✅ Ngrok is Configured!

Your ngrok auth token has been saved. You're ready to go!

## 📋 Step-by-Step Instructions

### 1. Start the Dev Server

In your terminal, run:
```powershell
npm run dev
```

Wait until you see: `Local: http://localhost:3000/`

### 2. Start Ngrok Tunnel (in a new terminal)

**Option A - Using the helper script:**
```powershell
.\start-ngrok.ps1
```

**Option B - Using npm script:**
```powershell
npm run ngrok
```

**Option C - Run both at once:**
```powershell
.\start-dev-https.ps1
```

### 3. Get Your HTTPS URL

Ngrok will show output like:
```
Session Status                online
Account                       Your Name (Plan: Free)
Version                       3.33.1
Region                        United States (us)
Latency                       45ms
Web Interface                 http://127.0.0.1:4040
Forwarding                    https://abc123.ngrok-free.app -> http://localhost:3000
```

**Copy the HTTPS URL** (the one starting with `https://`)

### 4. Access on Mobile

1. Open the HTTPS URL on your mobile browser
2. Grant microphone and camera permissions when asked
3. Complete the setup form
4. Click "Start Learning"
5. Enjoy! 🎉

## 🔧 Troubleshooting

**"Port 3000 already in use"**
- Make sure you stop any other processes using port 3000
- Or change the port in `vite.config.ts`

**"Connection refused" on mobile**
- Make sure `npm run dev` is running
- Make sure ngrok is running
- Try refreshing the page on mobile

**Ngrok not found**
- The scripts now look in your Downloads folder automatically
- Or add ngrok to your PATH

## 💡 Pro Tips

- **Free ngrok URLs change each time** - you'll get a new URL when you restart ngrok
- **Keep both terminals open** - one for dev server, one for ngrok
- **Use the ngrok web interface** - visit `http://127.0.0.1:4040` to see requests and inspect traffic

## 📱 Ready to Test!

Everything is set up. Run:
```powershell
npm run dev
```

Then in another terminal:
```powershell
.\start-ngrok.ps1
```

Copy the HTTPS URL and test on your mobile! 🚀

