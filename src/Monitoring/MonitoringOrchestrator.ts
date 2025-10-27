/**
 * ☢️ MONITORING ORCHESTRATOR - THE SUPREME CONDUCTOR
 * By PunkClaude & RaulVisionario - September 25, 2025
 *
 * MISSION: Unified monitoring architecture for Selene Song Core
 * PHILOSOPHY: One ring to rule them all - no more phantom intervals
 */

import * as schedule from "node-schedule";
export interface MonitoringTask {
  id: string;
  name: string;
  schedule: string; // Cron expression
  execute: () => Promise<void>;
  priority: "critical" | "high" | "medium" | "low";
  circuitBreaker?: {
    threshold: number; // CPU threshold to trip
    cooldownMs: number; // Time to wait before retry
  };
  lazyMode?: {
    maxCpuUsage: number; // Only run if CPU < this
    checkIntervalMs: number; // How often to check CPU
  };
}

export interface CircuitBreakerState {
  isOpen: boolean;
  lastTripTime: Date;
  failureCount: number;
  successCount: number;
}

export class MonitoringOrchestrator {
  private static instance: MonitoringOrchestrator;
  private tasks: Map<string, MonitoringTask> = new Map();
  private scheduledJobs: Map<string, schedule.Job> = new Map();
  private circuitBreakers: Map<string, CircuitBreakerState> = new Map();
  private isActive: boolean = false;
  private cpuHistory: number[] = [];
  private cpuCheckInterval: NodeJS.Timeout | null = null;
  
  // Circuit breaker configuration
  private readonly CIRCUIT_BREAKER_CONFIG = {
    failureThreshold: 3, // Trips after 3 failures
    successThreshold: 2, // Closes after 2 successes
    timeoutMs: 30000, // 30 seconds timeout
  };

  private constructor() {
    console.log("Monitoring Orchestrator initialized - the conductor awakens", { component: 'MONITORING' });
  }

  public static getInstance(): MonitoringOrchestrator {
    if (!MonitoringOrchestrator.instance) {
      MonitoringOrchestrator.instance = new MonitoringOrchestrator();
    }
    return MonitoringOrchestrator.instance;
  }

  /**
   * 🎼 Start the orchestration
   */
  public async start(): Promise<void> {
    if (this.isActive) return;

    console.log("Monitoring Orchestrator starting...", { component: 'MONITORING' });
    this.isActive = true;

    // Start CPU monitoring for lazy mode and circuit breakers
    this.startCpuMonitoring();

    // Schedule all registered tasks
    for (const [id, task] of this.tasks) {
      this.scheduleTask(task);
    }

    console.log(`Monitoring Orchestrator active - ${this.tasks.size} tasks orchestrated`, { component: 'MONITORING' });
  }

  /**
   * 🛑 Emergency shutdown - clear ALL intervals and schedules
   */
  public async emergencyShutdown(): Promise<void> {
    console.warn("EMERGENCY SHUTDOWN INITIATED - Monitoring Orchestrator", { component: 'MONITORING' });

    this.isActive = false;

    // Cancel all scheduled jobs
    for (const [id, job] of this.scheduledJobs) {
      job.cancel();
      console.log(`Cancelled scheduled job: ${id}`);
    }
    this.scheduledJobs.clear();

    // Clear CPU monitoring
    if (this.cpuCheckInterval) {
      clearInterval(this.cpuCheckInterval);
      this.cpuCheckInterval = null;
    }

    // Reset circuit breakers
    this.circuitBreakers.clear();

    console.log("Monitoring Orchestrator emergency shutdown complete");
  }

  /**
   * 📝 Register a monitoring task
   */
  public registerTask(task: MonitoringTask): void {
    if (this.tasks.has(task.id)) {
      console.warn(`Task ${task.id} already registered, updating...`);
    }

    this.tasks.set(task.id, task);
    this.circuitBreakers.set(task.id, {
      isOpen: false,
      lastTripTime: new Date(0),
      failureCount: 0,
      successCount: 0,
    });

    console.log(`Task registered: ${task.name} (${task.id})`);

    // If orchestrator is active, schedule immediately
    if (this.isActive) {
      this.scheduleTask(task);
    }
  }

  /**
   * 🚫 Unregister a task
   */
  public unregisterTask(taskId: string): void {
    const task = this.tasks.get(taskId);
    if (!task) return;

    // Cancel scheduled job
    const job = this.scheduledJobs.get(taskId);
    if (job) {
      job.cancel();
      this.scheduledJobs.delete(taskId);
    }

    this.tasks.delete(taskId);
    this.circuitBreakers.delete(taskId);

    console.log(`Task unregistered: ${task.name} (${taskId})`);
  }

  /**
   * 📊 Get orchestrator status
   */
  public getStatus(): any {
    const tasks = Array.from(this.tasks.values()).map((task) => ({
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
      averageCpu:
        this.cpuHistory.length > 0
          ? this.cpuHistory.reduce((_a, _b) => _a + _b, 0) / this.cpuHistory.length
          : 0,
      tasks,
    };
  }

  // ==========================================
  // 🔧 PRIVATE METHODS
  // ==========================================

  /**
   * 📈 Start CPU monitoring for lazy mode and circuit breakers
   */
  private startCpuMonitoring(): void {
    this.cpuCheckInterval = setInterval(() => {
      const cpuUsage = process.cpuUsage();
      const currentCpu = (cpuUsage.user + cpuUsage.system) / 1000000; // Convert to seconds

      // Keep last 10 readings for average
      this.cpuHistory.push(currentCpu);
      if (this.cpuHistory.length > 10) {
        this.cpuHistory.shift();
      }
    }, 5000); // Check every 5 seconds
  }

  /**
   * 📅 Schedule a task with node-schedule
   */
  private scheduleTask(task: MonitoringTask): void {
    const job = schedule.scheduleJob(task.schedule, async () => {
      if (!this.isActive) return;

      // Check circuit breaker
      if (this.isCircuitBreakerOpen(task.id)) {
        console.warn(`Circuit breaker open for ${task.name}, skipping execution`);
        return;
      }

      // Check lazy mode
      if (task.lazyMode && !this.shouldExecuteLazy(task)) {
        console.log(`Lazy mode: CPU too high for ${task.name}, skipping`);
        return;
      }

      try {
        console.log(`Executing orchestrated task: ${task.name}`);
        await task.execute();
        this.recordTaskSuccess(task.id);
      } catch (error) {
        console.error(`Task execution failed: ${task.name}`, JSON.stringify(error));
        this.recordTaskFailure(task.id);
      }
    });

    if (job) {
      this.scheduledJobs.set(task.id, job);
      console.log(`Task scheduled: ${task.name} (${task.schedule})`);
    }
  }

  /**
   * 🔌 Check if circuit breaker is open
   */
  private isCircuitBreakerOpen(taskId: string): boolean {
    const state = this.circuitBreakers.get(taskId);
    if (!state) return false;

    if (state.isOpen) {
      // Check if cooldown period has passed
      const now = Date.now();
      const cooldownEnd =
        state.lastTripTime.getTime() + this.CIRCUIT_BREAKER_CONFIG.timeoutMs;

      if (now >= cooldownEnd) {
        // Try to close circuit breaker
        state.isOpen = false;
        state.failureCount = 0;
        console.log(`Circuit breaker closed for ${taskId}`);
      }
    }

    return state.isOpen;
  }

  /**
   * 😴 Check if task should execute in lazy mode
   */
  private shouldExecuteLazy(task: MonitoringTask): boolean {
    if (!task.lazyMode) return true;

    const avgCpu =
      this.cpuHistory.length > 0
        ? this.cpuHistory.reduce((_a, _b) => _a + _b, 0) / this.cpuHistory.length
        : 0;

    return avgCpu < task.lazyMode.maxCpuUsage;
  }

  /**
   * ✅ Record task success for circuit breaker
   */
  private recordTaskSuccess(taskId: string): void {
    const state = this.circuitBreakers.get(taskId);
    if (!state) return;

    state.successCount++;
    state.failureCount = Math.max(0, state.failureCount - 1); // Decay failures

    // Close circuit breaker if enough successes
    if (
      state.isOpen &&
      state.successCount >= this.CIRCUIT_BREAKER_CONFIG.successThreshold
    ) {
      state.isOpen = false;
      console.log(`Circuit breaker closed after ${state.successCount} successes for ${taskId}`);
    }
  }

  /**
   * ❌ Record task failure for circuit breaker
   */
  private recordTaskFailure(taskId: string): void {
    const state = this.circuitBreakers.get(taskId);
    if (!state) return;

    state.failureCount++;

    // Open circuit breaker if too many failures
    if (
      !state.isOpen &&
      state.failureCount >= this.CIRCUIT_BREAKER_CONFIG.failureThreshold
    ) {
      state.isOpen = true;
      state.lastTripTime = new Date();
      state.successCount = 0;
      console.warn(`Circuit breaker OPENED for ${taskId} after ${state.failureCount} failures`);
    }
  }
}

// Export singleton instance
export const monitoringOrchestrator = MonitoringOrchestrator.getInstance();



