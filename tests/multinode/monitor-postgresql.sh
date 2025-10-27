#!/bin/bash
# 🔍 PostgreSQL Real-time Query Monitor
# Para validar que requests REALMENTE llegan a PostgreSQL durante tests

echo "🔍 ════════════════════════════════════════════════════"
echo "🔍  PostgreSQL Query Monitor - Real-time validation"
echo "🔍  Press Ctrl+C to stop"
echo "🔍 ════════════════════════════════════════════════════"
echo ""

# Database credentials (adjust if needed)
DB_USER="${POSTGRES_USER:-dentiagest_user}"
DB_NAME="${POSTGRES_DB:-dentiagest}"
DB_HOST="${POSTGRES_HOST:-localhost}"
DB_PORT="${POSTGRES_PORT:-5432}"

# Monitoring loop
while true; do
  TIMESTAMP=$(date '+%H:%M:%S')
  
  echo "═══════════════════════════════════════════════════════"
  echo "⏰ $TIMESTAMP - PostgreSQL Activity"
  echo "═══════════════════════════════════════════════════════"
  
  # Active query count
  psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" -c "
    SELECT 
      COUNT(*) as active_queries,
      COUNT(DISTINCT client_addr) as unique_clients,
      ROUND(AVG(EXTRACT(EPOCH FROM (now() - query_start)))::numeric, 3) as avg_duration_sec
    FROM pg_stat_activity 
    WHERE state = 'active' 
      AND query NOT LIKE '%pg_stat_activity%'
      AND query NOT LIKE '%COMMIT%'
      AND query NOT LIKE '%BEGIN%';
  " 2>/dev/null
  
  echo ""
  echo "📊 Top 5 Slowest Active Queries:"
  echo "─────────────────────────────────────────────────────────"
  
  # Top slowest queries
  psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" -c "
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
  " 2>/dev/null
  
  echo ""
  echo "📈 Query Stats (last 1 minute):"
  echo "─────────────────────────────────────────────────────────"
  
  # Query stats by type
  psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" -c "
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
  " 2>/dev/null
  
  echo ""
  echo "💾 Connection Pool Status:"
  echo "─────────────────────────────────────────────────────────"
  
  # Connection stats
  psql -U "$DB_USER" -d "$DB_NAME" -h "$DB_HOST" -p "$DB_PORT" -c "
    SELECT 
      COUNT(*) as total_connections,
      COUNT(CASE WHEN state = 'active' THEN 1 END) as active,
      COUNT(CASE WHEN state = 'idle' THEN 1 END) as idle,
      COUNT(CASE WHEN state = 'idle in transaction' THEN 1 END) as idle_in_transaction
    FROM pg_stat_activity 
    WHERE datname = '$DB_NAME';
  " 2>/dev/null
  
  echo ""
  
  # Wait 5 seconds before next iteration
  sleep 5
done
