# Ngrok Installation Helper Script
# This script helps you install ngrok on Windows

Write-Host "🔧 Ngrok Installation Helper" -ForegroundColor Cyan
Write-Host ""

# Check if Chocolatey is installed
$chocoInstalled = $false
try {
    $null = choco --version 2>&1
    $chocoInstalled = $true
    Write-Host "✓ Chocolatey is installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Chocolatey is not installed" -ForegroundColor Yellow
}

# Check if ngrok is already installed
$ngrokInstalled = $false
try {
    $null = ngrok version 2>&1
    $ngrokInstalled = $true
    Write-Host "✓ Ngrok is already installed!" -ForegroundColor Green
    Write-Host ""
    $ngrokVersion = ngrok version
    Write-Host $ngrokVersion
    Write-Host ""
    Write-Host "You can now run: npm run ngrok" -ForegroundColor Cyan
    exit 0
} catch {
    Write-Host "✗ Ngrok is not installed yet" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Installation Options:" -ForegroundColor Cyan
Write-Host ""

if ($chocoInstalled) {
    Write-Host "Option 1 (Recommended) - Install with Chocolatey:" -ForegroundColor Green
    Write-Host "  choco install ngrok -y" -ForegroundColor White
    Write-Host ""
    $useChoco = Read-Host "Install ngrok using Chocolatey now? (y/n)"
    if ($useChoco -eq 'y') {
        Write-Host ""
        Write-Host "Installing ngrok..." -ForegroundColor Yellow
        choco install ngrok -y
        Write-Host ""
        Write-Host "✓ Installation complete!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Next steps:" -ForegroundColor Cyan
        Write-Host "1. Get your auth token from: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor White
        Write-Host "2. Run: ngrok config add-authtoken YOUR_TOKEN" -ForegroundColor White
        Write-Host "3. Run: npm run ngrok" -ForegroundColor White
        exit 0
    }
}

Write-Host "Option 2 - Manual Installation:" -ForegroundColor Yellow
Write-Host "  1. Visit: https://ngrok.com/download" -ForegroundColor White
Write-Host "  2. Download Windows version" -ForegroundColor White
Write-Host "  3. Extract ngrok.exe to a folder" -ForegroundColor White
Write-Host "  4. Add that folder to your PATH, OR run from that folder" -ForegroundColor White
Write-Host ""
Write-Host "Option 3 - Using Scoop (if installed):" -ForegroundColor Yellow
Write-Host "  scoop install ngrok" -ForegroundColor White
Write-Host ""

Write-Host "After installation:" -ForegroundColor Cyan
Write-Host "1. Get your auth token: https://dashboard.ngrok.com/get-started/your-authtoken" -ForegroundColor White
Write-Host "2. Run: ngrok config add-authtoken YOUR_TOKEN" -ForegroundColor White
Write-Host "3. Start ngrok: npm run ngrok" -ForegroundColor White
Write-Host ""

$openDownload = Read-Host "Open ngrok download page in browser? (y/n)"
if ($openDownload -eq 'y') {
    Start-Process "https://ngrok.com/download"
}

