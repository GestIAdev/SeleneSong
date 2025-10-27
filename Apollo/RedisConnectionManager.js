/**
 * 🔴 REDIS CONNECTION MANAGER - THE ANCHOR BREAKER
 * By PunkClaude - October 3, 2025
 *
 * MISSION: Break the cursed anchor causing memory leaks
 * STRATEGY: Singleton Redis connection management with proper cleanup
 */
import { createClient as createRedisClient } from 'redis';
import Redis from 'ioredis';
/**
 * 🔴 REDIS CONNECTION MANAGER
 * The anchor breaker - prevents memory leaks from open Redis connections
 */
export class RedisConnectionManager {
    static instance;
    config;
    connections = new Map();
    connectionCounter = 0;
    cleanupInterval = null;
    constructor() {
        console.log('🔴 Initializing Redis Connection Manager...');
        this.config = {
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            password: process.env.REDIS_PASSWORD,
            db: parseInt(process.env.REDIS_DB || '0'),
            maxRetriesPerRequest: 3,
            lazyConnect: true
        };
        // Start cleanup interval (every 5 minutes)
        this.startCleanupInterval();
    }
    /**
     * 🚀 Get singleton instance
     */
    static getInstance() {
        if (!RedisConnectionManager.instance) {
            RedisConnectionManager.instance = new RedisConnectionManager();
        }
        return RedisConnectionManager.instance;
    }
    /**
     * 🔌 Create new Redis client (redis package)
     */
    createRedisClient(context = 'unknown') {
        const connectionId = `${context}_${++this.connectionCounter}_${Date.now()}`;
        console.log(`🔌 Creating Redis client: ${connectionId}`);
        const client = createRedisClient({
            url: `redis://${this.config.host}:${this.config.port}`,
            password: this.config.password,
            database: this.config.db
        });
        // Track connection
        this.connections.set(connectionId, {
            id: connectionId,
            client,
            type: 'redis',
            created: new Date(),
            lastUsed: new Date(),
            isConnected: false
        });
        // Handle events
        client.on('connect', () => {
            console.log(`✅ Redis client connected: ${connectionId}`);
            this.updateConnectionStatus(connectionId, true);
        });
        client.on('error', (error) => {
            console.error(`💥 Redis client error ${connectionId}:`, error.message);
            this.updateConnectionStatus(connectionId, false);
        });
        client.on('disconnect', () => {
            console.log(`🔌 Redis client disconnected: ${connectionId}`);
            this.updateConnectionStatus(connectionId, false);
        });
        return client;
    }
    /**
     * 🔌 Create new IORedis client (ioredis package)
     */
    createIORedisClient(context = 'unknown') {
        const connectionId = `${context}_${++this.connectionCounter}_${Date.now()}`;
        console.log(`🔌 Creating IORedis client: ${connectionId}`);
        const client = new Redis({
            host: this.config.host,
            port: this.config.port,
            password: this.config.password,
            db: this.config.db,
            lazyConnect: this.config.lazyConnect,
            maxRetriesPerRequest: this.config.maxRetriesPerRequest
        });
        // Track connection
        this.connections.set(connectionId, {
            id: connectionId,
            client,
            type: 'ioredis',
            created: new Date(),
            lastUsed: new Date(),
            isConnected: false
        });
        // Handle events
        client.on('connect', () => {
            console.log(`✅ IORedis client connected: ${connectionId}`);
            this.updateConnectionStatus(connectionId, true);
        });
        client.on('error', (error) => {
            console.error(`💥 IORedis client error ${connectionId}:`, error.message);
            this.updateConnectionStatus(connectionId, false);
        });
        client.on('close', () => {
            console.log(`🔌 IORedis client closed: ${connectionId}`);
            this.updateConnectionStatus(connectionId, false);
        });
        return client;
    }
    /**
     * 🔌 Get existing client by context (reuse if possible)
     */
    getRedisClient(context) {
        // Find existing client for this context
        for (const [id, info] of this.connections.entries()) {
            if (id.startsWith(`${context}_`) && info.type === 'redis' && info.isConnected) {
                info.lastUsed = new Date();
                return info.client;
            }
        }
        return null;
    }
    /**
     * 🔌 Get existing IORedis client by context (reuse if possible)
     */
    getIORedisClient(context) {
        // Find existing client for this context
        for (const [id, info] of this.connections.entries()) {
            if (id.startsWith(`${context}_`) && info.type === 'ioredis' && info.isConnected) {
                info.lastUsed = new Date();
                return info.client;
            }
        }
        return null;
    }
    /**
     * 🔌 Ensure connection is active
     */
    async ensureConnection(client, connectionId) {
        try {
            if (client instanceof Redis) {
                // IORedis
                if (!client.status || client.status === 'close') {
                    await client.connect();
                }
                await client.ping();
            }
            else {
                // Redis client
                if (!client.isReady) {
                    await client.connect();
                }
                await client.ping();
            }
            if (connectionId) {
                this.updateConnectionStatus(connectionId, true);
            }
            return true;
        }
        catch (error) {
            console.error('💥 Connection ensure failed:', error);
            if (connectionId) {
                this.updateConnectionStatus(connectionId, false);
            }
            return false;
        }
    }
    /**
     * 🔌 Close specific connection
     */
    async closeConnection(connectionId) {
        const info = this.connections.get(connectionId);
        if (!info)
            return;
        try {
            if (info.type === 'redis') {
                await info.client.disconnect();
            }
            else {
                await info.client.disconnect();
            }
            console.log(`✅ Connection closed: ${connectionId}`);
        }
        catch (error) {
            console.error(`💥 Error closing connection ${connectionId}:`, error);
        }
        finally {
            this.connections.delete(connectionId);
        }
    }
    /**
     * 🧹 Close all connections
     */
    async closeAllConnections() {
        console.log('🧹 Closing all Redis connections...');
        const closePromises = Array.from(this.connections.keys()).map(id => this.closeConnection(id));
        await Promise.allSettled(closePromises);
        console.log('✅ All Redis connections closed');
    }
    /**
     * 📊 Get connection statistics
     */
    getConnectionStats() {
        const stats = {
            total: this.connections.size,
            connected: 0,
            disconnected: 0,
            byType: { redis: 0, ioredis: 0 },
            byContext: {}
        };
        for (const [id, info] of this.connections.entries()) {
            if (info.isConnected)
                stats.connected++;
            else
                stats.disconnected++;
            stats.byType[info.type]++;
            const context = id.split('_')[0];
            stats.byContext[context] = (stats.byContext[context] || 0) + 1;
        }
        return stats;
    }
    /**
     * 🔄 Update connection status
     */
    updateConnectionStatus(connectionId, isConnected) {
        const info = this.connections.get(connectionId);
        if (info) {
            info.isConnected = isConnected;
            info.lastUsed = new Date();
        }
    }
    /**
     * 🧹 Start cleanup interval
     */
    startCleanupInterval() {
        this.cleanupInterval = setInterval(async () => {
            await this.performCleanup();
        }, 5 * 60 * 1000); // Every 5 minutes
    }
    /**
     * 🧹 Perform cleanup of old connections
     */
    async performCleanup() {
        const now = Date.now();
        const maxAge = 30 * 60 * 1000; // 30 minutes
        const toClose = [];
        for (const [id, info] of this.connections.entries()) {
            const age = now - info.lastUsed.getTime();
            if (age > maxAge && !info.isConnected) {
                toClose.push(id);
            }
        }
        if (toClose.length > 0) {
            console.log(`🧹 Cleaning up ${toClose.length} old connections`);
            for (const id of toClose) {
                await this.closeConnection(id);
            }
        }
    }
    /**
     * 🛑 Shutdown manager
     */
    async shutdown() {
        console.log('🛑 Shutting down Redis Connection Manager...');
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        await this.closeAllConnections();
    }
}
// Export singleton instance
export const redisManager = RedisConnectionManager.getInstance();
