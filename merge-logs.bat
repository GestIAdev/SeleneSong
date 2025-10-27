@echo off
REM Script to merge and tail all SELENE cluster logs in real-time
REM Usage: merge-logs.bat

echo Merging SELENE cluster logs in real-time...
echo Press Ctrl+C to stop
echo.

REM Get the PM2 logs directory
set PM2_LOGS_DIR=%USERPROFILE%\.pm2\logs

REM Use PowerShell to continuously monitor all log files with proper line tracking
powershell -NoProfile -Command "& { $files = Get-ChildItem '%PM2_LOGS_DIR%\selene-node*-out-*.log', '%PM2_LOGS_DIR%\redis-command-listener-out-*.log'; $jobs = @(); foreach($file in $files) { $job = Start-Job -ScriptBlock { param($filePath, $fileName) Get-Content $filePath -Wait -Tail 1 | ForEach-Object { Write-Host ('[' + $fileName + '] ' + $_.Trim()) -ForegroundColor Green } } -ArgumentList $file.FullName, $file.Name; $jobs += $job }; while($true) { Start-Sleep -Seconds 1 } }"