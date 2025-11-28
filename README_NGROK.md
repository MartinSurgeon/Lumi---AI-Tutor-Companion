# Quick Start: Using Ngrok for HTTPS Access

## 🚀 Quick Setup (5 minutes)

### Step 1: Install Ngrok

**Option A - Chocolatey (Easiest):**
```powershell
choco install ngrok
```

**Option B - Download:**
1. Go to https://ngrok.com/download
2. Download Windows version
3. Extract and add to PATH, OR run from extracted folder

**Option C - Scoop:**
```powershell
scoop install ngrok
```

### Step 2: Get Auth Token

1. Sign up: https://dashboard.ngrok.com/signup (free)
2. Get token: https://dashboard.ngrok.com/get-started/your-authtoken
3. Run:
```powershell
ngrok config add-authtoken YOUR_TOKEN_HERE
```

### Step 3: Start Your App with HTTPS

**Method 1 - Using the PowerShell script:**
```powershell
.\start-dev-https.ps1
```

**Method 2 - Manual steps:**
1. Start dev server (Terminal 1):
```powershell
npm run dev
```

2. Start ngrok (Terminal 2):
```powershell
npm run ngrok
```
OR
```powershell
ngrok http 3000
```

### Step 4: Use HTTPS URL on Mobile

1. Look for the HTTPS URL in ngrok output (e.g., `https://abc123.ngrok-free.app`)
2. Copy that URL
3. Open it on your mobile device
4. Grant microphone/camera permissions
5. Start learning! 🎉

## 📱 Mobile Access

Once ngrok is running, you'll see output like:
```
Forwarding   https://abc123.ngrok-free.app -> http://localhost:3000
```

Use the **HTTPS URL** (the one starting with `https://`) on your mobile device.

## ⚠️ Important Notes

- **Free ngrok accounts**: URLs change each time you restart ngrok
- **Mobile testing**: Make sure both devices are on the same network (or use ngrok's paid plan for static URLs)
- **Security**: The HTTPS URL is public - don't share it publicly if you have sensitive data

## 🛠️ Troubleshooting

**"ngrok not found"**
- Install ngrok using one of the methods above
- Make sure it's in your PATH

**"Port 3000 already in use"**
- Kill the existing process: `netstat -ano | findstr :3000`
- Or change the port in `vite.config.ts`

**Connection refused**
- Make sure `npm run dev` is running first
- Check that the dev server is on port 3000

## 📚 More Info

See `NGROK_SETUP.md` for detailed instructions.

