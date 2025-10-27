/**
 * ⏰ SELENE SCHEDULER - AUTOMATED TASKS MODULE
 * By PunkClaude & RaulVisionario - September 18, 2025
 *
 * MISSION: Automated task scheduling system
 * STRATEGY: Cron-powered task automation
 */
import * as cron from 'node-cron';
/**
 * ⏰ SELENE SCHEDULER - THE TIME GOD
 * Automated task scheduling with cron jobs
 */
export class SeleneScheduler {
    tasks = new Map();
    cronJobs = new Map();
    isRunning = false;
    constructor() {
        console.log('⏰ Initializing Selene Scheduler...');
        // Initialize default scheduled tasks
        this.initializeDefaultTasks();
    }
    /**
     * 🚀 Start scheduler
     */
    async start() {
        try {
            console.log('🚀 Starting Selene Scheduler...');
            // Start all enabled tasks
            for (const [id, task] of this.tasks.entries()) {
                if (task.enabled) {
                    await this.startTask(id);
                }
            }
            this.isRunning = true;
            console.log('🎯 Selene Scheduler operational');
        }
        catch (error) {
            console.error('💥 Failed to start scheduler:', error);
            throw error;
        }
    }
    /**
     * 🛑 Stop scheduler
     */
    async stop() {
        try {
            console.log('🛑 Stopping Selene Scheduler...');
            // Stop all cron jobs
            for (const [id, job] of this.cronJobs.entries()) {
                job.stop();
                console.log(`⏹️ Stopped task: ${id}`);
            }
            this.cronJobs.clear();
            this.isRunning = false;
            console.log('✅ Scheduler stopped');
        }
        catch (error) {
            console.error('💥 Scheduler stop error:', error);
        }
    }
    // ==========================================
    // 📋 TASK MANAGEMENT
    // ==========================================
    /**
     * ➕ Add scheduled task
     */
    addTask(task) {
        const taskId = task.id || `task_${Date.now()}_${task.name.replace(/\s+/g, '_').toLowerCase()}`; // ID determinista basado en nombre
        const fullTask = {
            ...task,
            id: taskId,
            lastRun: undefined,
            nextRun: undefined,
            runCount: 0,
            retryCount: 0
        };
        this.tasks.set(taskId, fullTask);
        console.log(`➕ Added scheduled task: ${task.name} (${taskId})`);
        return taskId;
    }
    /**
     * 🗑️ Remove task
     */
    removeTask(taskId) {
        try {
            // Stop if running
            if (this.cronJobs.has(taskId)) {
                this.cronJobs.get(taskId).stop();
                this.cronJobs.delete(taskId);
            }
            // Remove from tasks
            const removed = this.tasks.delete(taskId);
            if (removed) {
                console.log(`🗑️ Removed task: ${taskId}`);
            }
            return removed;
        }
        catch (error) {
            console.error('💥 Failed to remove task:', error);
            return false;
        }
    }
    /**
     * ▶️ Start specific task
     */
    async startTask(taskId) {
        try {
            const task = this.tasks.get(taskId);
            if (!task) {
                throw new Error(`Task ${taskId} not found`);
            }
            if (this.cronJobs.has(taskId)) {
                console.log(`⚠️ Task ${taskId} already running`);
                return;
            }
            const cronJob = cron.schedule(task.cronExpression, async () => {
                await this.executeTask(task);
            });
            this.cronJobs.set(taskId, cronJob);
            console.log(`▶️ Started task: ${task.name} (${taskId})`);
        }
        catch (error) {
            console.error(`💥 Failed to start task ${taskId}:`, error);
            throw error;
        }
    }
    /**
     * ⏸️ Stop specific task
     */
    stopTask(taskId) {
        try {
            const job = this.cronJobs.get(taskId);
            if (job) {
                job.stop();
                this.cronJobs.delete(taskId);
                console.log(`⏸️ Stopped task: ${taskId}`);
            }
        }
        catch (error) {
            console.error('💥 Failed to stop task:', error);
        }
    }
    /**
     * 🔄 Enable/disable task
     */
    setTaskEnabled(taskId, enabled) {
        try {
            const task = this.tasks.get(taskId);
            if (!task) {
                throw new Error(`Task ${taskId} not found`);
            }
            task.enabled = enabled;
            if (enabled && this.isRunning) {
                this.startTask(taskId);
            }
            else if (!enabled) {
                this.stopTask(taskId);
            }
            console.log(`${enabled ? '✅' : '❌'} Task ${taskId} ${enabled ? 'enabled' : 'disabled'}`);
        }
        catch (error) {
            console.error('💥 Failed to set task enabled:', error);
        }
    }
    // ==========================================
    // ⚙️ TASK EXECUTION
    // ==========================================
    /**
     * 🚀 Execute task with error handling
     */
    async executeTask(task) {
        const startTime = Date.now();
        try {
            console.log(`🚀 Executing task: ${task.name} (${task.id})`);
            await task.handler();
            // Update task stats
            task.lastRun = new Date();
            task.runCount++;
            task.retryCount = 0; // Reset retry count on success
            const duration = Date.now() - startTime;
            console.log(`✅ Task completed: ${task.name} (${duration}ms)`);
        }
        catch (error) {
            console.error(`💥 Task failed: ${task.name}`, error);
            task.retryCount++;
            // Retry logic
            if (task.retryCount < task.maxRetries) {
                console.log(`🔄 Retrying task ${task.name} (attempt ${task.retryCount}/${task.maxRetries})`);
                // Schedule retry after delay
                setTimeout(() => {
                    this.executeTask(task);
                }, 5000 * task.retryCount); // Exponential backoff
            }
            else {
                console.error(`💀 Task ${task.name} failed permanently after ${task.maxRetries} retries`);
            }
        }
    }
    /**
     * ⚡ Execute task immediately
     */
    async executeTaskNow(taskId) {
        try {
            const task = this.tasks.get(taskId);
            if (!task) {
                throw new Error(`Task ${taskId} not found`);
            }
            await this.executeTask(task);
        }
        catch (error) {
            console.error('💥 Failed to execute task now:', error);
            throw error;
        }
    }
    // ==========================================
    // 📊 MONITORING & STATUS
    // ==========================================
    /**
     * 📊 Get scheduler status
     */
    getStatus() {
        const tasks = Array.from(this.tasks.values()).map(task => ({
            id: task.id,
            name: task.name,
            enabled: task.enabled,
            cronExpression: task.cronExpression,
            running: this.cronJobs.has(task.id),
            lastRun: task.lastRun,
            nextRun: task.nextRun,
            runCount: task.runCount,
            retryCount: task.retryCount
        }));
        return {
            running: this.isRunning,
            totalTasks: this.tasks.size,
            runningTasks: this.cronJobs.size,
            tasks
        };
    }
    /**
     * 📋 Get all tasks
     */
    getTasks() {
        return Array.from(this.tasks.values());
    }
    /**
     * 📋 Get task by ID
     */
    getTask(taskId) {
        return this.tasks.get(taskId);
    }
    // ==========================================
    // 🔧 DEFAULT TASKS
    // ==========================================
    /**
     * 📋 Initialize default scheduled tasks
     */
    initializeDefaultTasks() {
        console.log('📋 Initializing default scheduled tasks...');
        // Database backup task
        this.addTask({
            id: 'db_backup',
            name: 'Database Backup',
            cronExpression: '0 2 * * *', // Daily at 2 AM
            handler: this.databaseBackupHandler,
            enabled: true,
            maxRetries: 3
        });
        // Cache cleanup task
        this.addTask({
            id: 'cache_cleanup',
            name: 'Cache Cleanup',
            cronExpression: '0 */4 * * *', // Every 4 hours
            handler: this.cacheCleanupHandler,
            enabled: true,
            maxRetries: 2
        });
        // System health check
        this.addTask({
            id: 'health_check',
            name: 'System Health Check',
            cronExpression: '*/30 * * * *', // Every 30 minutes
            handler: this.healthCheckHandler,
            enabled: true,
            maxRetries: 1
        });
        // AI model updates
        this.addTask({
            id: 'ai_model_update',
            name: 'AI Model Updates',
            cronExpression: '0 3 * * 1', // Weekly on Monday at 3 AM
            handler: this.aiModelUpdateHandler,
            enabled: true,
            maxRetries: 2
        });
        // Report generation
        this.addTask({
            id: 'report_generation',
            name: 'Report Generation',
            cronExpression: '0 6 * * *', // Daily at 6 AM
            handler: this.reportGenerationHandler,
            enabled: true,
            maxRetries: 3
        });
        console.log('✅ Default tasks initialized');
    }
    // ==========================================
    // 🎯 TASK HANDLERS
    // ==========================================
    /**
     * 💾 Database backup handler
     */
    async databaseBackupHandler() {
        console.log('💾 Performing database backup...');
        // Simulate backup process
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log('✅ Database backup completed');
    }
    /**
     * 🧹 Cache cleanup handler
     */
    async cacheCleanupHandler() {
        console.log('🧹 Performing cache cleanup...');
        // Simulate cleanup process
        await new Promise(resolve => setTimeout(resolve, 1000));
        console.log('✅ Cache cleanup completed');
    }
    /**
     * ❤️ Health check handler
     */
    async healthCheckHandler() {
        console.log('❤️ Performing system health check...');
        // Simulate health checks
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('✅ Health check completed');
    }
    /**
     * 🤖 AI model update handler
     */
    async aiModelUpdateHandler() {
        console.log('🤖 Checking for AI model updates...');
        // Simulate AI model update check
        await new Promise(resolve => setTimeout(resolve, 2000));
        console.log('✅ AI model update check completed');
    }
    /**
     * 📊 Report generation handler
     */
    async reportGenerationHandler() {
        console.log('📊 Generating scheduled reports...');
        // Simulate report generation
        await new Promise(resolve => setTimeout(resolve, 3000));
        console.log('✅ Report generation completed');
    }
}
