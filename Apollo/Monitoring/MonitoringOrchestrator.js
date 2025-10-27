/**
 * ☢️ MONITORING ORCHESTRATOR - THE SUPREME CONDUCTOR
 * By PunkClaude & RaulVisionario - September 25, 2025
 *
 * MISSION: Unified monitoring architecture for Selene Song Core
 * PHILOSOPHY: One ring to rule them all - no more phantom intervals
 */
import * as schedule from 'node-schedule';
export class MonitoringOrchestrator {
    static instance;
    tasks = new Map();
    scheduledJobs = new Map();
    circuitBreakers = new Map();
    isActive = false;
    cpuHistory = [];
    cpuCheckInterval = null;
    lastCpuUsage = null; // Track last CPU reading for delta calculation
    // Circuit breaker configuration
    CIRCUIT_BREAKER_CONFIG = {
        failureThreshold: 3, // Trips after 3 failures
        successThreshold: 2, // Closes after 2 successes
        timeoutMs: 30000, // 30 seconds timeout
    };
    constructor() {
        console.log('🎼 Monitoring Orchestrator initialized - the conductor awakens');
    }
    static getInstance() {
        if (!MonitoringOrchestrator.instance) {
            MonitoringOrchestrator.instance = new MonitoringOrchestrator();
        }
        return MonitoringOrchestrator.instance;
    }
    /**
     * 🎼 Start the orchestration
     */
    async start() {
        if (this.isActive)
            return;
        console.log('🎼 Monitoring Orchestrator starting...');
        this.isActive = true;
        // Start CPU monitoring for lazy mode and circuit breakers
        this.startCpuMonitoring();
        // Schedule all registered tasks
        for (const [id, task] of this.tasks) {
            this.scheduleTask(task);
        }
        console.log(`✅ Monitoring Orchestrator active - ${this.tasks.size} tasks orchestrated`);
    }
    /**
     * 🛑 Emergency shutdown - clear ALL intervals and schedules
     */
    async emergencyShutdown() {
        console.log('🚨 EMERGENCY SHUTDOWN INITIATED - Monitoring Orchestrator');
        this.isActive = false;
        // Cancel all scheduled jobs
        for (const [id, job] of this.scheduledJobs) {
            job.cancel();
            console.log(`🛑 Cancelled scheduled job: ${id}`);
        }
        this.scheduledJobs.clear();
        // Clear CPU monitoring
        if (this.cpuCheckInterval) {
            clearInterval(this.cpuCheckInterval);
            this.cpuCheckInterval = null;
        }
        // Reset circuit breakers
        this.circuitBreakers.clear();
        console.log('💀 Monitoring Orchestrator emergency shutdown complete');
    }
    /**
     * 📝 Register a monitoring task
     */
    registerTask(task) {
        if (this.tasks.has(task.id)) {
            console.warn(`⚠️ Task ${task.id} already registered, updating...`);
        }
        this.tasks.set(task.id, task);
        this.circuitBreakers.set(task.id, {
            isOpen: false,
            lastTripTime: new Date(0),
            failureCount: 0,
            successCount: 0,
        });
        console.log(`📝 Task registered: ${task.name} (${task.id})`);
        // If orchestrator is active, schedule immediately
        if (this.isActive) {
            this.scheduleTask(task);
        }
    }
    /**
     * 🚫 Unregister a task
     * FIXED: Delete task BEFORE canceling job to prevent race condition
     */
    unregisterTask(taskId) {
        const task = this.tasks.get(taskId);
        if (!task)
            return;
        // 1. Mark task as deleted FIRST (prevents execution in flight)
        this.tasks.delete(taskId);
        // 2. Cancel scheduled job
        const job = this.scheduledJobs.get(taskId);
        if (job) {
            job.cancel();
            this.scheduledJobs.delete(taskId);
        }
        // 3. Clean up circuit breaker
        this.circuitBreakers.delete(taskId);
        console.log(`🚫 Task unregistered: ${task.name} (${taskId})`);
    }
    /**
     * 📊 Get orchestrator status
     */
    getStatus() {
        const tasks = Array.from(this.tasks.values()).map(task => ({
            id: task.id,
            name: task.name,
            priority: task.priority,
            circuitBreaker: this.circuitBreakers.get(task.id),
            isScheduled: this.scheduledJobs.has(task.id),
        }));
        return {
            isActive: this.isActive,
            totalTasks: this.tasks.size,
            scheduledTasks: this.scheduledJobs.size,
            averageCpu: this.cpuHistory.length > 0 ?
                this.cpuHistory.reduce((a, b) => a + b, 0) / this.cpuHistory.length : 0,
            tasks,
        };
    }
    // ==========================================
    // 🔧 PRIVATE METHODS
    // ==========================================
    /**
     * 📈 Start CPU monitoring for lazy mode and circuit breakers
     * FIXED: Calculate delta between readings instead of cumulative value
     */
    startCpuMonitoring() {
        // Initialize with first reading
        this.lastCpuUsage = process.cpuUsage();
        
        this.cpuCheckInterval = setInterval(() => {
            // Get delta CPU usage since last check
            const deltaCpuUsage = process.cpuUsage(this.lastCpuUsage);
            
            // Convert microseconds to seconds
            const deltaCpuSeconds = (deltaCpuUsage.user + deltaCpuUsage.system) / 1000000;
            
            // Calculate percentage: (CPU time / wall time) × 100
            const intervalSeconds = 5; // 5 second interval
            const cpuPercentage = (deltaCpuSeconds / intervalSeconds) * 100;
            
            // Keep last 10 readings for average
            this.cpuHistory.push(cpuPercentage);
            if (this.cpuHistory.length > 10) {
                this.cpuHistory.shift();
            }
            
            // Update for next iteration
            this.lastCpuUsage = process.cpuUsage();
        }, 5000); // Check every 5 seconds
    }
    /**
     * 📅 Schedule a task with node-schedule
     * FIXED: Guard against deleted tasks during execution
     */
    scheduleTask(task) {
        const job = schedule.scheduleJob(task.schedule, async () => {
            // Guard: Check if task still exists (might have been unregistered)
            if (!this.tasks.has(task.id)) {
                console.log(`⏭️ Task ${task.id} unregistered during execution, skipping`);
                return;
            }
            if (!this.isActive)
                return;
            // Check circuit breaker
            if (this.isCircuitBreakerOpen(task.id)) {
                console.log(`🚫 Circuit breaker open for ${task.name}, skipping execution`);
                return;
            }
            // Check lazy mode
            if (task.lazyMode && !this.shouldExecuteLazy(task)) {
                console.log(`😴 Lazy mode: CPU too high for ${task.name}, skipping`);
                return;
            }
            try {
                console.log(`🎼 Executing orchestrated task: ${task.name}`);
                await task.execute();
                this.recordTaskSuccess(task.id);
            }
            catch (error) {
                console.error(`💥 Task execution failed: ${task.name}`, error);
                this.recordTaskFailure(task.id);
            }
        });
        if (job) {
            this.scheduledJobs.set(task.id, job);
            console.log(`📅 Task scheduled: ${task.name} (${task.schedule})`);
        }
    }
    /**
     * 🔌 Check if circuit breaker is open
     * FIXED: Reset all counters when auto-closing after cooldown
     */
    isCircuitBreakerOpen(taskId) {
        const state = this.circuitBreakers.get(taskId);
        if (!state)
            return false;
        if (state.isOpen) {
            // Check if cooldown period has passed
            const now = Date.now();
            const cooldownEnd = state.lastTripTime.getTime() + this.CIRCUIT_BREAKER_CONFIG.timeoutMs;
            if (now >= cooldownEnd) {
                // Try to close circuit breaker
                state.isOpen = false;
                state.failureCount = 0;
                state.successCount = 0; // Reset success counter too
                console.log(`🔌 Circuit breaker auto-closed after cooldown for ${taskId}`);
            }
        }
        return state.isOpen;
    }
    /**
     * 😴 Check if task should execute in lazy mode
     */
    shouldExecuteLazy(task) {
        if (!task.lazyMode)
            return true;
        const avgCpu = this.cpuHistory.length > 0 ?
            this.cpuHistory.reduce((a, b) => a + b, 0) / this.cpuHistory.length : 0;
        return avgCpu < task.lazyMode.maxCpuUsage;
    }
    /**
     * ✅ Record task success for circuit breaker
     * FIXED: Reset successCount after closing breaker
     */
    recordTaskSuccess(taskId) {
        const state = this.circuitBreakers.get(taskId);
        if (!state)
            return;
        state.successCount++;
        state.failureCount = Math.max(0, state.failureCount - 1); // Decay failures
        // Close circuit breaker if enough successes
        if (state.isOpen && state.successCount >= this.CIRCUIT_BREAKER_CONFIG.successThreshold) {
            state.isOpen = false;
            state.successCount = 0; // Reset counter after closing
            state.failureCount = 0; // Reset failures too
            console.log(`🔌 Circuit breaker closed after recovery for ${taskId}`);
        }
    }
    /**
     * ❌ Record task failure for circuit breaker
     */
    recordTaskFailure(taskId) {
        const state = this.circuitBreakers.get(taskId);
        if (!state)
            return;
        state.failureCount++;
        // Open circuit breaker if too many failures
        if (!state.isOpen && state.failureCount >= this.CIRCUIT_BREAKER_CONFIG.failureThreshold) {
            state.isOpen = true;
            state.lastTripTime = new Date();
            state.successCount = 0;
            console.log(`🔌 Circuit breaker OPENED for ${taskId} after ${state.failureCount} failures`);
        }
    }
}
// Export singleton instance
export const monitoringOrchestrator = MonitoringOrchestrator.getInstance();
