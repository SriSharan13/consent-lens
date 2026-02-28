Write-Host "Starting Consent Lens Project..." -ForegroundColor Green

# Start Backend
Write-Host "Starting Backend API..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd 'consentlens-backend'; uvicorn main:app --reload`""

# Start Frontend
Write-Host "Starting Frontend UI..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `"cd 'consent lens ui'; npm run dev`""

Write-Host "Both services are starting up in new windows!" -ForegroundColor Green
