# PowerShell script to start PostgreSQL Docker container
# This will automatically create the 'property_connect' database

Write-Host "Starting PostgreSQL Docker container..." -ForegroundColor Green

docker-compose up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    Write-Host "PostgreSQL is running!" -ForegroundColor Green
    Write-Host "Database 'property_connect' has been created automatically." -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run:" -ForegroundColor Cyan
    Write-Host "  npm run db:push    # Create tables" -ForegroundColor White
    Write-Host "  npm run dev        # Start the application" -ForegroundColor White
} else {
    Write-Host "Error starting Docker container. Make sure Docker is running." -ForegroundColor Red
}
