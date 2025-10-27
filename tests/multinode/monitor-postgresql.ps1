# 🔍 PostgreSQL Real-time Query Monitor (PowerShell)
# Para validar que requests REALMENTE llegan a PostgreSQL durante tests

Write-Host "🔍 ═══════════════════════════════════════════════════=" -ForegroundColor Cyan
Write-Host "🔍  PostgreSQL Query Monitor - Real-time validation" -ForegroundColor Cyan
Write-Host "🔍  Press Ctrl+C to stop" -ForegroundColor Cyan
Write-Host "🔍 ═══════════════════════════════════════════════════=" -ForegroundColor Cyan
Write-Host ""

# Database credentials (adjust if needed)
$DB_USER = if ($env:POSTGRES_USER) { $env:POSTGRES_USER } else { "dentiagest_user" }
$DB_NAME = if ($env:POSTGRES_DB) { $env:POSTGRES_DB } else { "dentiagest" }
$DB_HOST = if ($env:POSTGRES_HOST) { $env:POSTGRES_HOST } else { "localhost" }
$DB_PORT = if ($env:POSTGRES_PORT) { $env:POSTGRES_PORT } else { "5432" }

# Build psql connection string
$PSQL_CMD = "psql -U $DB_USER -d $DB_NAME -h $DB_HOST -p $DB_PORT"

Write-Host "📊 Monitoring database: $DB_NAME @ ${DB_HOST}:${DB_PORT}" -ForegroundColor Green
Write-Host ""

# Monitoring loop
while ($true) {
    $TIMESTAMP = Get-Date -Format "HH:mm:ss"
    
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "⏰ $TIMESTAMP - PostgreSQL Activity" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Yellow
    
    # Active query count
    $query1 = @"
SELECT 
  COUNT(*) as active_queries,
  COUNT(DISTINCT client_addr) as unique_clients,
  ROUND(AVG(EXTRACT(EPOCH FROM (now() - query_start)))::numeric, 3) as avg_duration_sec
FROM pg_stat_activity 
WHERE state = 'active' 
  AND query NOT LIKE '%pg_stat_activity%'
  AND query NOT LIKE '%COMMIT%'
  AND query NOT LIKE '%BEGIN%';
"@
    
    Invoke-Expression "$PSQL_CMD -c `"$query1`"" 2>$null
    
    Write-Host ""
    Write-Host "📊 Top 5 Slowest Active Queries:" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────────────────────"
    
    # Top slowest queries
    $query2 = @"
SELECT 
  LEFT(query, 60) as query_preview,
  ROUND(EXTRACT(EPOCH FROM (now() - query_start))::numeric, 3) as duration_sec,
  state,
  client_addr
FROM pg_stat_activity 
WHERE state = 'active' 
  AND query NOT LIKE '%pg_stat_activity%'
  AND query NOT LIKE '%COMMIT%'
  AND query NOT LIKE '%BEGIN%'
ORDER BY query_start ASC 
LIMIT 5;
"@
    
    Invoke-Expression "$PSQL_CMD -c `"$query2`"" 2>$null
    
    Write-Host ""
    Write-Host "📈 Query Stats (active now):" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────────────────────"
    
    # Query stats by type
    $query3 = @"
SELECT 
  CASE 
    WHEN query LIKE 'SELECT%' THEN 'SELECT'
    WHEN query LIKE 'INSERT%' THEN 'INSERT'
    WHEN query LIKE 'UPDATE%' THEN 'UPDATE'
    WHEN query LIKE 'DELETE%' THEN 'DELETE'
    ELSE 'OTHER'
  END as query_type,
  COUNT(*) as count
FROM pg_stat_activity 
WHERE state = 'active' 
  AND query NOT LIKE '%pg_stat_activity%'
GROUP BY query_type
ORDER BY count DESC;
"@
    
    Invoke-Expression "$PSQL_CMD -c `"$query3`"" 2>$null
    
    Write-Host ""
    Write-Host "💾 Connection Pool Status:" -ForegroundColor Cyan
    Write-Host "─────────────────────────────────────────────────────────"
    
    # Connection stats
    $query4 = @"
SELECT 
  COUNT(*) as total_connections,
  COUNT(CASE WHEN state = 'active' THEN 1 END) as active,
  COUNT(CASE WHEN state = 'idle' THEN 1 END) as idle,
  COUNT(CASE WHEN state = 'idle in transaction' THEN 1 END) as idle_in_txn
FROM pg_stat_activity 
WHERE datname = '$DB_NAME';
"@
    
    Invoke-Expression "$PSQL_CMD -c `"$query4`"" 2>$null
    
    Write-Host ""
    
    # Wait 5 seconds before next iteration
    Start-Sleep -Seconds 5
}
