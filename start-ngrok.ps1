# Ngrok Helper Script for Lumi AI Tutor
# This script starts ngrok tunnel for port 3000

Write-Host "Starting Ngrok tunnel for port 3000..." -ForegroundColor Cyan
Write-Host ""

# Check if ngrok is installed (check multiple locations)
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
        Write-Host "✗ Ngrok not found. Please install ngrok first." -ForegroundColor Red
        Write-Host ""
        Write-Host "Install options:" -ForegroundColor Yellow
        Write-Host "  1. Chocolatey: choco install ngrok" -ForegroundColor White
        Write-Host "  2. Download from: https://ngrok.com/download" -ForegroundColor White
        Write-Host "  3. Scoop: scoop install ngrok" -ForegroundColor White
        Write-Host ""
        exit 1
    }
}

# Check if port 3000 is in use (dev server should be running)
$portCheck = Test-NetConnection -ComputerName localhost -Port 3000 -InformationLevel Quiet -WarningAction SilentlyContinue
if (-not $portCheck) {
    Write-Host "⚠ Warning: Port 3000 doesn't seem to be in use." -ForegroundColor Yellow
    Write-Host "  Make sure your dev server is running with: npm run dev" -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne 'y') {
        exit 0
    }
}

Write-Host "Starting ngrok tunnel..." -ForegroundColor Cyan
Write-Host "Once started, copy the HTTPS URL and use it on your mobile device" -ForegroundColor Green
Write-Host ""

# Start ngrok
if ($ngrokPath -eq "ngrok") {
    ngrok http 3000
} else {
    & $ngrokPath http 3000
}

