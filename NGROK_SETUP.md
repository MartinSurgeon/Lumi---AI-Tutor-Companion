# Setting up Ngrok for HTTPS Access

## Step 1: Install Ngrok

### Option A: Using Chocolatey (Recommended)
```powershell
choco install ngrok
```

### Option B: Download Manually
1. Go to https://ngrok.com/download
2. Download the Windows version
3. Extract ngrok.exe to a folder (e.g., `C:\ngrok`)
4. Add that folder to your PATH environment variable

### Option C: Using Scoop
```powershell
scoop install ngrok
```

## Step 2: Get Your Ngrok Auth Token

1. Sign up for a free account at https://dashboard.ngrok.com/signup
2. Go to https://dashboard.ngrok.com/get-started/your-authtoken
3. Copy your authtoken
4. Run: `ngrok config add-authtoken YOUR_TOKEN_HERE`

## Step 3: Start Ngrok Tunnel

Once ngrok is installed and configured, you can start a tunnel:

```powershell
ngrok http 3000
```

This will give you an HTTPS URL like: `https://abc123.ngrok-free.app`

## Step 4: Access Your App

1. Make sure your Vite dev server is running: `npm run dev`
2. Start ngrok: `ngrok http 3000`
3. Copy the HTTPS URL from ngrok
4. Access your app on mobile using that HTTPS URL

## Using the Helper Script

You can also use the `start-ngrok.ps1` script I created for you - just run:
```powershell
.\start-ngrok.ps1
```

