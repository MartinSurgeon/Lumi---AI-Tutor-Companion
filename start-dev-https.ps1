# Combined Script: Start Dev Server + Ngrok
# This script starts both the Vite dev server and ngrok tunnel

Write-Host "🚀 Starting Lumi AI Tutor with HTTPS (Ngrok)..." -ForegroundColor Cyan
Write-Host ""

# Function to check if a port is in use
function Test-Port {
    param($port)
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -InformationLevel Quiet -WarningAction SilentlyContinue
        return $connection
    } catch {
        return $false
    }
}

# Check if port 3000 is already in use
if (Test-Port 3000) {
    Write-Host "✓ Port 3000 is already in use (dev server may be running)" -ForegroundColor Green
} else {
    Write-Host "Starting Vite dev server..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; npm run dev"
    Write-Host "Waiting for dev server to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
}

# Check if ngrok is installed
$ngrokPath = $null

# Check if ngrok is in PATH
try {
    $null = ngrok version 2>&1
    $ngrokPath = "ngrok"
    Write-Host "✓ Ngrok found in PATH" -ForegroundColor Green
} catch {
    # Check Downloads folder
    $downloadsPath = "$env:USERPROFILE\Downloads\ngrok-v3-stable-windows-amd64\ngrok.exe"
    if (Test-Path $downloadsPath) {
        $ngrokPath = $downloadsPath
        Write-Host "✓ Ngrok found in Downloads folder" -ForegroundColor Green
    } else {
        Write-Host "✗ Ngrok not found. Installing instructions:" -ForegroundColor Red
        Write-Host "  Visit: https://ngrok.com/download" -ForegroundColor White
        Write-Host "  Or run: choco install ngrok" -ForegroundColor White
        exit 1
    }
}

Write-Host ""
Write-Host "Starting Ngrok tunnel..." -ForegroundColor Cyan
Write-Host "📱 Use the HTTPS URL shown below on your mobile device" -ForegroundColor Green
Write-Host ""

# Start ngrok in a new window
if ($ngrokPath -eq "ngrok") {
    Start-Process ngrok -ArgumentList "http", "3000"
} else {
    Start-Process $ngrokPath -ArgumentList "http", "3000"
}

Write-Host ""
Write-Host "✓ Dev server and ngrok should now be running" -ForegroundColor Green
Write-Host "  Check the ngrok window for your HTTPS URL" -ForegroundColor Yellow

