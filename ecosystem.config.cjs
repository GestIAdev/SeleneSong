/**
 * 🎯 PM2 ECOSYSTEM CONFIGURATION - SELENE CLUSTER
 * Professional multinode cluster setup for Phase 4 testing
 * 
 * ARCHITECTURE:
 * - 3x Selene nodes (ports 8005-8007)
 * - 1x Load Balancer (port 8000)
 * 
 * APUESTA: <300MB RAM per node 🎰
 */

module.exports = {
  apps: [
    // ════════════════════════════════════════════════════════
    // 🎵 SELENE NODE 1 (Port 8005)
    // ════════════════════════════════════════════════════════
    {
      name: 'selene-node-1',
      script: 'dist/index.js',
      cwd: 'C:\\Users\\Raulacate\\Desktop\\Proyectos programacion\\Dentiagest\\selene',
      instances: 1,
      exec_mode: 'fork',
      node_args: '--max-old-space-size=512', // 512MB heap (conservative for <300MB bet)
      max_memory_restart: '480M', // Restart at 480MB (safety margin)
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        PORT: '8005',
        NODE_ID: 'selene-node-1',
        
        // 🚫 DISABLE RATE LIMITER FOR TESTS
        RATE_LIMIT_ENABLED: 'false',
        
        // PostgreSQL
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'dentiagest_user',
        POSTGRES_PASSWORD: 'your_password',
        POSTGRES_DB: 'dentiagest',
        
        // Redis (swarm coordination)
        REDIS_URL: 'redis://localhost:6379',
        REDIS_HOST: 'localhost',
        REDIS_PORT: '6379',
        
        // Swarm settings
        SWARM_ENABLED: 'true',
        CONSENSUS_TYPE: 'musical_chairs_quantum',
        LEADER_ELECTION_TIMEOUT: '30000',
        HEARTBEAT_INTERVAL: '5000',
        
        // PM2 instance ID
        INSTANCE_ID: '0'
      },
      // MERGE STDOUT AND STDERR FOR THIS PROCESS
      combine_logs: false, // Changed from true
      out_file: 'C:\\Users\\Raulacate\\.pm2\\logs\\selene-node-1-out.log', // Added
      error_file: 'C:\\Users\\Raulacate\\.pm2\\logs\\selene-node-1-error.log', // Added
    },
    
    // ════════════════════════════════════════════════════════
    // 🎵 SELENE NODE 2 (Port 8006)
    // ════════════════════════════════════════════════════════
    {
      name: 'selene-node-2',
      script: 'dist/index.js',
      cwd: 'C:\\Users\\Raulacate\\Desktop\\Proyectos programacion\\Dentiagest\\selene',
      instances: 1,
      exec_mode: 'fork',
      node_args: '--max-old-space-size=512',
      max_memory_restart: '480M',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        PORT: '8006',
        NODE_ID: 'selene-node-2',
        
        RATE_LIMIT_ENABLED: 'false',
        
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'dentiagest_user',
        POSTGRES_PASSWORD: 'your_password',
        POSTGRES_DB: 'dentiagest',
        
        REDIS_URL: 'redis://localhost:6379',
        REDIS_HOST: 'localhost',
        REDIS_PORT: '6379',
        
        SWARM_ENABLED: 'true',
        CONSENSUS_TYPE: 'musical_chairs_quantum',
        LEADER_ELECTION_TIMEOUT: '30000',
        HEARTBEAT_INTERVAL: '5000',
        
        INSTANCE_ID: '1'
      },
      // MERGE STDOUT AND STDERR FOR THIS PROCESS
      combine_logs: false, // Changed from true
      out_file: 'C:\\Users\\Raulacate\\.pm2\\logs\\selene-node-2-out.log', // Added
      error_file: 'C:\\Users\\Raulacate\\.pm2\\logs\\selene-node-2-error.log', // Added
    },
    
    // ════════════════════════════════════════════════════════
    // 🎵 SELENE NODE 3 (Port 8007)
    // ════════════════════════════════════════════════════════
    {
      name: 'selene-node-3',
      script: 'dist/index.js',
      cwd: 'C:\\Users\\Raulacate\\Desktop\\Proyectos programacion\\Dentiagest\\selene',
      instances: 1,
      exec_mode: 'fork',
      node_args: '--max-old-space-size=512',
      max_memory_restart: '480M',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        PORT: '8007',
        NODE_ID: 'selene-node-3',
        
        RATE_LIMIT_ENABLED: 'false',
        
        POSTGRES_HOST: 'localhost',
        POSTGRES_PORT: '5432',
        POSTGRES_USER: 'dentiagest_user',
        POSTGRES_PASSWORD: 'your_password',
        POSTGRES_DB: 'dentiagest',
        
        REDIS_URL: 'redis://localhost:6379',
        REDIS_HOST: 'localhost',
        REDIS_PORT: '6379',
        
        SWARM_ENABLED: 'true',
        CONSENSUS_TYPE: 'musical_chairs_quantum',
        LEADER_ELECTION_TIMEOUT: '30000',
        HEARTBEAT_INTERVAL: '5000',
        
        INSTANCE_ID: '2'
      },
      // MERGE STDOUT AND STDERR FOR THIS PROCESS
      combine_logs: false, // Changed from true
      out_file: 'C:\\Users\\Raulacate\\.pm2\\logs\\selene-node-3-out.log', // Added
      error_file: 'C:\\Users\\Raulacate\\.pm2\\logs\\selene-node-3-error.log', // Added
    },
    
    // ════════════════════════════════════════════════════════
    // 🎯 REDIS COMMAND LISTENER (Isolated Process - DIRECTIVA 11.2)
    // ════════════════════════════════════════════════════════
    {
      name: 'redis-command-listener',
      script: 'redis-listener.js',
      cwd: 'C:\\Users\\Raulacate\\Desktop\\Proyectos programacion\\Dentiagest\\selene',
      instances: 1,
      exec_mode: 'fork',
      node_args: '--max-old-space-size=256', // 256MB heap for listener
      max_memory_restart: '200M',
      autorestart: true,
      watch: false,
      max_restarts: 10,
      min_uptime: '10s',
      env: {
        NODE_ENV: 'production',
        NODE_ID: 'redis-listener',
        
        // Redis connection
        REDIS_URL: 'redis://localhost:6379',
        REDIS_HOST: 'localhost',
        REDIS_PORT: '6379',
        
        // No need for other services
        SWARM_ENABLED: 'false'
      },
      // MERGE STDOUT AND STDERR FOR THIS PROCESS
      combine_logs: false, // Changed from true
      out_file: 'C:\\Users\\Raulacate\\.pm2\\logs\\redis-command-listener-out.log', // Added
      error_file: 'C:\\Users\\Raulacate\\.pm2\\logs\\redis-command-listener-error.log', // Added
    },
    
    // ════════════════════════════════════════════════════════
    // ⚖️ SELENE LOAD BALANCER REMOVED - Not needed for current architecture
    // ════════════════════════════════════════════════════════
    // Load balancer removed to eliminate PM2 startup errors
    // Nodes can be accessed directly on their respective ports (8005-8007)
    
  ]
}