# 💻 System Resource Monitor (PowerShell)
# Real-time monitoring during stress tests
# Press Ctrl+C to stop

Write-Host "💻 ═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "💻  System Resource Monitor - Laptop Edition" -ForegroundColor Cyan
Write-Host "💻  Hardware: Ryzen 7 5800 | 16GB RAM" -ForegroundColor Cyan
Write-Host "💻  Press Ctrl+C to stop" -ForegroundColor Cyan
Write-Host "💻 ═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$totalRamGB = 16

while ($true) {
    $timestamp = Get-Date -Format "HH:mm:ss"
    
    # CPU usage
    $cpu = (Get-Counter '\Processor(_Total)\% Processor Time').CounterSamples.CookedValue
    $cpuRounded = [math]::Round($cpu, 1)
    
    # RAM usage
    $ramAvailableMB = (Get-Counter '\Memory\Available MBytes').CounterSamples.CookedValue
    $ramUsedGB = [math]::Round(($totalRamGB * 1024 - $ramAvailableMB) / 1024, 2)
    $ramPercent = [math]::Round(($ramUsedGB / $totalRamGB) * 100, 1)
    
    # Disk usage (C: drive)
    $disk = Get-Counter '\LogicalDisk(C:)\% Disk Time' -ErrorAction SilentlyContinue
    $diskPercent = if ($disk) { [math]::Round($disk.CounterSamples.CookedValue, 1) } else { 0 }
    
    # Network (bytes/sec)
    $netSent = (Get-Counter '\Network Interface(*)\Bytes Sent/sec').CounterSamples | 
               Measure-Object -Property CookedValue -Sum | 
               Select-Object -ExpandProperty Sum
    $netRecv = (Get-Counter '\Network Interface(*)\Bytes Received/sec').CounterSamples | 
               Measure-Object -Property CookedValue -Sum | 
               Select-Object -ExpandProperty Sum
    
    $netSentMBps = [math]::Round($netSent / 1MB, 2)
    $netRecvMBps = [math]::Round($netRecv / 1MB, 2)
    
    # Color coding
    $cpuColor = if ($cpuRounded -lt 70) { "Green" } elseif ($cpuRounded -lt 85) { "Yellow" } else { "Red" }
    $ramColor = if ($ramPercent -lt 70) { "Green" } elseif ($ramPercent -lt 85) { "Yellow" } else { "Red" }
    $diskColor = if ($diskPercent -lt 50) { "Green" } elseif ($diskPercent -lt 80) { "Yellow" } else { "Red" }
    
    # Print status line
    Write-Host "[$timestamp] " -NoNewline -ForegroundColor White
    Write-Host "CPU: $cpuRounded% " -NoNewline -ForegroundColor $cpuColor
    Write-Host "| RAM: $ramPercent% ($ramUsedGB GB) " -NoNewline -ForegroundColor $ramColor
    Write-Host "| Disk: $diskPercent% " -NoNewline -ForegroundColor $diskColor
    Write-Host "| Net: ↑$netSentMBps ↓$netRecvMBps MB/s" -ForegroundColor Cyan
    
    # Warnings
    if ($ramPercent -gt 85) {
        Write-Host "  ⚠️  WARNING: RAM usage high! Risk of swap to disk." -ForegroundColor Red
    }
    
    if ($cpuRounded -gt 90) {
        Write-Host "  ⚠️  WARNING: CPU usage critical! Risk of thermal throttling." -ForegroundColor Red
    }
    
    if ($diskPercent -gt 80) {
        Write-Host "  ⚠️  WARNING: Disk activity high! Possible memory swap." -ForegroundColor Red
    }
    
    # Critical alerts
    if ($ramPercent -gt 90) {
        Write-Host ""
        Write-Host "  🚨 CRITICAL: RAM >90%! CONSIDER STOPPING TEST!" -ForegroundColor Red -BackgroundColor Yellow
        Write-Host ""
    }
    
    Start-Sleep -Seconds 2
}
