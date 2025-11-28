# Ngrok wrapper script - uses the ngrok from Downloads folder
$ngrokPath = "$env:USERPROFILE\Downloads\ngrok-v3-stable-windows-amd64\ngrok.exe"

if (Test-Path $ngrokPath) {
    & $ngrokPath $args
} else {
    Write-Host "Error: ngrok.exe not found at $ngrokPath" -ForegroundColor Red
    Write-Host "Please update the path in this script or add ngrok to your PATH" -ForegroundColor Yellow
    exit 1
}

