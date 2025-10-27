/**
 * ⚡ SELENE RESOURCE MANAGER - INTELLIGENT RESOURCE ALLOCATION SYSTEM
 * Directiva V156: Acondicionamiento del Núcleo - Fase 1: Refuerzo Estructural
 *
 * MISSION: Intelligent resource allocation and containment for AI processes
 * STRATEGY: Monitor, allocate, and isolate resources to prevent system overload
 */
import * as os from 'os';
import { EventEmitter } from 'events';
/**
 * ⚡ SELENE RESOURCE MANAGER - THE RESOURCE GUARDIAN
 * Intelligent resource allocation and containment system
 */
export class SeleneResourceManager extends EventEmitter {
    isActive = false;
    metrics = [];
    limits;
    processes = new Map();
    containmentProtocols = new Map();
    isolatedProcesses = new Set();
    monitoringInterval = null;
    containmentInterval = null;
    // Resource allocation tracking
    resourceAllocation = new Map();
    aiProcessTracker = new Map();
    constructor(limits) {
        super();
        this.limits = {
            maxCpuUsage: 85,
            maxMemoryUsage: 90,
            maxGpuUsage: 95,
            maxAiProcesses: 5,
            emergencyThreshold: {
                cpu: 95,
                memory: 95,
                gpu: 98
            },
            ...limits
        };
        this.initializeContainmentProtocols();
        console.log('⚡ Selene Resource Manager initialized');
    }
    /**
     * 🚀 Start resource management
     */
    async start() {
        try {
            console.log('🚀 Starting Selene Resource Manager...');
            this.isActive = true;
            // Start monitoring
            this.startResourceMonitoring();
            // Start containment monitoring
            this.startContainmentMonitoring();
            // Initial resource assessment
            await this.assessSystemResources();
            console.log('✅ Selene Resource Manager active');
        }
        catch (error) {
            console.error('💥 Failed to start Resource Manager:', error);
            throw error;
        }
    }
    /**
     * 🛑 Stop resource management
     */
    async stop() {
        console.log('🛑 Stopping Selene Resource Manager...');
        this.isActive = false;
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        if (this.containmentInterval) {
            clearInterval(this.containmentInterval);
            this.containmentInterval = null;
        }
        // Release all isolations
        await this.releaseAllIsolations();
        console.log('✅ Resource Manager stopped');
    }
    // ==========================================
    // 📊 RESOURCE MONITORING
    // ==========================================
    /**
     * 📊 Start resource monitoring
     */
    startResourceMonitoring() {
        this.monitoringInterval = setInterval(async () => {
            if (this.isActive) {
                await this.collectResourceMetrics();
                await this.monitorProcesses();
            }
        }, 5000); // Every 5 seconds
        console.log('📊 Resource monitoring started');
    }
    /**
     * 📊 Collect resource metrics
     */
    async collectResourceMetrics() {
        try {
            const metrics = {
                timestamp: new Date(),
                cpu: {
                    usage: this.getCpuUsage(),
                    cores: os.cpus().length,
                    loadAverage: os.loadavg()
                },
                memory: {
                    used: process.memoryUsage().heapUsed,
                    total: os.totalmem(),
                    usage: (process.memoryUsage().heapUsed / os.totalmem()) * 100,
                    heapUsed: process.memoryUsage().heapUsed,
                    heapTotal: process.memoryUsage().heapTotal
                },
                processes: {
                    total: this.processes.size,
                    aiProcesses: Array.from(this.processes.values()).filter(p => p.type === 'ai').length,
                    highCpuProcesses: Array.from(this.processes.values()).filter(p => p.cpu > 50).length
                }
            };
            this.metrics.push(metrics);
            // Keep only last 100 metrics
            if (this.metrics.length > 100) {
                this.metrics.shift();
            }
            // Emit metrics event
            this.emit('metrics', metrics);
            // Check for resource alerts
            await this.checkResourceAlerts(metrics);
        }
        catch (error) {
            console.error('💥 Resource metrics collection error:', error);
        }
    }
    /**
     * 📊 Get CPU usage
     */
    getCpuUsage() {
        const cpus = os.cpus();
        let totalIdle = 0;
        let totalTick = 0;
        cpus.forEach(cpu => {
            for (const type in cpu.times) {
                totalTick += cpu.times[type];
            }
            totalIdle += cpu.times.idle;
        });
        return 100 - ~~(100 * totalIdle / totalTick);
    }
    /**
     * 📊 Monitor processes
     */
    async monitorProcesses() {
        try {
            // In a real implementation, this would use system APIs to get process info
            // For now, we'll use deterministic mock processes based on system state
            const baseTime = Date.now();
            const timeFactor = (baseTime % 1000) / 1000; // 0-1 determinista
            
            const mockProcesses = [
                {
                    pid: 1234,
                    name: 'node',
                    cpu: 15 + (timeFactor * 20), // 15-35% CPU determinista
                    memory: 200000000 + (timeFactor * 300000000), // 200-500MB determinista
                    type: 'system',
                    isolated: false,
                    priority: 'normal'
                },
                {
                    pid: 5678,
                    name: 'ai_process',
                    cpu: 25 + (timeFactor * 40), // 25-65% CPU determinista
                    memory: 500000000 + (timeFactor * 1500000000), // 500MB-2GB determinista
                    type: 'ai',
                    isolated: false,
                    priority: 'high'
                }
            ];
            // Update process map
            mockProcesses.forEach(proc => {
                this.processes.set(proc.pid, proc);
            });
            // Check for runaway processes
            await this.checkRunawayProcesses();
        }
        catch (error) {
            console.error('💥 Process monitoring error:', error);
        }
    }
    // ==========================================
    // 🛡️ CONTAINMENT PROTOCOLS
    // ==========================================
    /**
     * 🛡️ Initialize containment protocols
     */
    initializeContainmentProtocols() {
        const protocols = [
            {
                id: 'cpu_containment',
                name: 'CPU Usage Containment',
                trigger: {
                    resource: 'cpu',
                    threshold: this.limits.maxCpuUsage,
                    duration: 30 // 30 seconds
                },
                actions: {
                    isolateProcesses: true,
                    reducePriority: true,
                    killProcesses: false,
                    scaleDown: false
                },
                cooldown: 300, // 5 minutes
                lastTriggered: null
            },
            {
                id: 'memory_containment',
                name: 'Memory Usage Containment',
                trigger: {
                    resource: 'memory',
                    threshold: this.limits.maxMemoryUsage,
                    duration: 60 // 1 minute
                },
                actions: {
                    isolateProcesses: true,
                    reducePriority: false,
                    killProcesses: false,
                    scaleDown: true
                },
                cooldown: 600, // 10 minutes
                lastTriggered: null
            },
            {
                id: 'emergency_containment',
                name: 'Emergency Resource Containment',
                trigger: {
                    resource: 'cpu',
                    threshold: this.limits.emergencyThreshold.cpu,
                    duration: 10 // 10 seconds
                },
                actions: {
                    isolateProcesses: true,
                    reducePriority: true,
                    killProcesses: true,
                    scaleDown: true
                },
                cooldown: 1800, // 30 minutes
                lastTriggered: null
            }
        ];
        protocols.forEach(protocol => {
            this.containmentProtocols.set(protocol.id, protocol);
        });
        console.log(`🛡️ Initialized ${protocols.length} containment protocols`);
    }
    /**
     * 🛡️ Start containment monitoring
     */
    startContainmentMonitoring() {
        this.containmentInterval = setInterval(async () => {
            if (this.isActive) {
                await this.monitorContainmentTriggers();
            }
        }, 10000); // Every 10 seconds
        console.log('🛡️ Containment monitoring started');
    }
    /**
     * 🛡️ Monitor containment triggers
     */
    async monitorContainmentTriggers() {
        const latestMetrics = this.getLatestMetrics();
        if (!latestMetrics)
            return;
        for (const [id, protocol] of this.containmentProtocols.entries()) {
            // Check cooldown
            if (protocol.lastTriggered) {
                const timeSinceLastTrigger = Date.now() - protocol.lastTriggered.getTime();
                if (timeSinceLastTrigger < protocol.cooldown * 1000) {
                    continue; // Still in cooldown
                }
            }
            // Check trigger conditions
            const shouldTrigger = this.checkProtocolTrigger(protocol, latestMetrics);
            if (shouldTrigger) {
                await this.triggerContainmentProtocol(protocol);
            }
        }
    }
    /**
     * 🛡️ Check protocol trigger
     */
    checkProtocolTrigger(protocol, metrics) {
        const resourceValue = metrics[protocol.trigger.resource];
        if (typeof resourceValue === 'object' && 'usage' in resourceValue) {
            return resourceValue.usage >= protocol.trigger.threshold;
        }
        else if (typeof resourceValue === 'number') {
            return resourceValue >= protocol.trigger.threshold;
        }
        return false;
    }
    /**
     * 🛡️ Trigger containment protocol
     */
    async triggerContainmentProtocol(protocol) {
        console.warn(`🚨 CONTAINMENT PROTOCOL TRIGGERED: ${protocol.name}`);
        protocol.lastTriggered = new Date();
        // Execute containment actions
        if (protocol.actions.isolateProcesses) {
            await this.isolateHighUsageProcesses();
        }
        if (protocol.actions.reducePriority) {
            await this.reduceProcessPriorities();
        }
        if (protocol.actions.killProcesses) {
            await this.killRunawayProcesses();
        }
        if (protocol.actions.scaleDown) {
            await this.scaleDownResources();
        }
        // Emit containment event
        this.emit('containmentTriggered', {
            protocol: protocol.id,
            timestamp: new Date(),
            actions: protocol.actions
        });
    }
    // ==========================================
    // 🚧 PROCESS ISOLATION
    // ==========================================
    /**
     * 🚧 Isolate high usage processes
     */
    async isolateHighUsageProcesses() {
        console.log('🚧 Isolating high usage processes...');
        const highUsageProcesses = Array.from(this.processes.values())
            .filter(proc => proc.cpu > 80 || proc.memory > 1000000000) // 1GB
            .filter(proc => !proc.isolated);
        for (const proc of highUsageProcesses) {
            await this.isolateProcess(proc.pid);
        }
        console.log(`✅ Isolated ${highUsageProcesses.length} high usage processes`);
    }
    /**
     * 🚧 Isolate specific process
     */
    async isolateProcess(pid) {
        const process = this.processes.get(pid);
        if (!process || process.isolated)
            return;
        console.log(`🚧 Isolating process ${pid} (${process.name})`);
        // In a real implementation, this would use system APIs to isolate the process
        // For now, we'll simulate isolation
        process.isolated = true;
        this.isolatedProcesses.add(pid);
        // Reduce priority
        process.priority = 'low';
        this.emit('processIsolated', { pid, process });
    }
    /**
     * 🚧 Release process isolation
     */
    async releaseIsolation(pid) {
        const process = this.processes.get(pid);
        if (!process || !process.isolated)
            return;
        console.log(`🚧 Releasing isolation for process ${pid} (${process.name})`);
        process.isolated = false;
        this.isolatedProcesses.delete(pid);
        // Restore priority
        process.priority = 'normal';
        this.emit('processReleased', { pid, process });
    }
    /**
     * 🚧 Release all isolations
     */
    async releaseAllIsolations() {
        const isolatedPids = Array.from(this.isolatedProcesses);
        for (const pid of isolatedPids) {
            await this.releaseIsolation(pid);
        }
        console.log(`✅ Released isolation for ${isolatedPids.length} processes`);
    }
    // ==========================================
    // ⚡ RESOURCE ALLOCATION
    // ==========================================
    /**
     * ⚡ Allocate resources for AI process
     */
    async allocateResourcesForAI(processId, requirements) {
        console.log(`⚡ Allocating resources for AI process: ${processId}`);
        // Check current resource availability
        const available = await this.checkResourceAvailability(requirements);
        if (!available) {
            console.warn(`⚠️ Insufficient resources for AI process: ${processId}`);
            return false;
        }
        // Check AI process limits
        const currentAiProcesses = Array.from(this.processes.values()).filter(p => p.type === 'ai').length;
        if (currentAiProcesses >= this.limits.maxAiProcesses) {
            console.warn(`⚠️ Maximum AI processes limit reached: ${this.limits.maxAiProcesses}`);
            return false;
        }
        // Allocate resources
        this.resourceAllocation.set(processId, {
            allocatedAt: new Date(),
            requirements,
            status: 'allocated'
        });
        console.log(`✅ Resources allocated for AI process: ${processId}`);
        return true;
    }
    /**
     * ⚡ Release resources for AI process
     */
    async releaseResourcesForAI(processId) {
        console.log(`⚡ Releasing resources for AI process: ${processId}`);
        this.resourceAllocation.delete(processId);
        console.log(`✅ Resources released for AI process: ${processId}`);
    }
    /**
     * ⚡ Check resource availability
     */
    async checkResourceAvailability(requirements) {
        const latestMetrics = this.getLatestMetrics();
        // If no metrics available yet, assume resources are available (conservative approach)
        if (!latestMetrics) {
            console.log('⚠️ No metrics available yet, assuming resources available for initial allocation');
            return true;
        }
        // Check CPU availability (handle both 'cpu' and 'cpuRequired' properties)
        const cpuRequired = requirements.cpuRequired || requirements.cpu || 0;
        if (cpuRequired && latestMetrics.cpu.usage + cpuRequired > this.limits.maxCpuUsage) {
            return false;
        }
        // Check memory availability (handle both 'memory' and 'memoryRequired' properties)
        const memoryRequired = requirements.memoryRequired || requirements.memory || 0;
        if (memoryRequired && latestMetrics.memory.usage + (memoryRequired / latestMetrics.memory.total) * 100 > this.limits.maxMemoryUsage) {
            return false;
        }
        return true;
    }
    // ==========================================
    // 🚨 ALERTS & MONITORING
    // ==========================================
    /**
     * 🚨 Check resource alerts
     */
    async checkResourceAlerts(metrics) {
        // CPU alerts
        if (metrics.cpu.usage >= this.limits.emergencyThreshold.cpu) {
            this.emit('alert', {
                type: 'emergency',
                resource: 'cpu',
                value: metrics.cpu.usage,
                threshold: this.limits.emergencyThreshold.cpu,
                timestamp: new Date()
            });
        }
        else if (metrics.cpu.usage >= this.limits.maxCpuUsage) {
            this.emit('alert', {
                type: 'warning',
                resource: 'cpu',
                value: metrics.cpu.usage,
                threshold: this.limits.maxCpuUsage,
                timestamp: new Date()
            });
        }
        // Memory alerts
        if (metrics.memory.usage >= this.limits.emergencyThreshold.memory) {
            this.emit('alert', {
                type: 'emergency',
                resource: 'memory',
                value: metrics.memory.usage,
                threshold: this.limits.emergencyThreshold.memory,
                timestamp: new Date()
            });
        }
        else if (metrics.memory.usage >= this.limits.maxMemoryUsage) {
            this.emit('alert', {
                type: 'warning',
                resource: 'memory',
                value: metrics.memory.usage,
                threshold: this.limits.maxMemoryUsage,
                timestamp: new Date()
            });
        }
        // AI process alerts
        if (metrics.processes.aiProcesses >= this.limits.maxAiProcesses) {
            this.emit('alert', {
                type: 'warning',
                resource: 'ai_processes',
                value: metrics.processes.aiProcesses,
                threshold: this.limits.maxAiProcesses,
                timestamp: new Date()
            });
        }
    }
    /**
     * 🚨 Check runaway processes
     */
    async checkRunawayProcesses() {
        const runawayProcesses = Array.from(this.processes.values())
            .filter(proc => proc.cpu > 90 && proc.type === 'ai');
        for (const proc of runawayProcesses) {
            console.error(`🚨 RUNAWAY AI PROCESS DETECTED: ${proc.name} (PID: ${proc.pid}) - CPU: ${proc.cpu}%`);
            this.emit('runawayProcess', {
                process: proc,
                timestamp: new Date()
            });
            // Auto-isolate runaway AI processes
            await this.isolateProcess(proc.pid);
        }
    }
    // ==========================================
    // 🔧 UTILITY METHODS
    // ==========================================
    /**
     * 🔧 Reduce process priorities
     */
    async reduceProcessPriorities() {
        console.log('🔧 Reducing process priorities...');
        // Simulate priority reduction
        const highPriorityProcesses = Array.from(this.processes.values())
            .filter(proc => proc.priority === 'high' || proc.priority === 'critical');
        highPriorityProcesses.forEach(proc => {
            proc.priority = 'low';
        });
        console.log(`✅ Reduced priority for ${highPriorityProcesses.length} processes`);
    }
    /**
     * 🔧 Kill runaway processes
     */
    async killRunawayProcesses() {
        console.log('🔧 Killing runaway processes...');
        // Only kill processes that are isolated and still causing issues
        const processesToKill = Array.from(this.processes.values())
            .filter(proc => proc.isolated && proc.cpu > 95);
        // In a real implementation, this would use system APIs to kill processes
        processesToKill.forEach(proc => {
            console.log(`🔧 Killing runaway process: ${proc.name} (PID: ${proc.pid})`);
            this.processes.delete(proc.pid);
            this.isolatedProcesses.delete(proc.pid);
        });
        console.log(`✅ Killed ${processesToKill.length} runaway processes`);
    }
    /**
     * 🔧 Scale down resources
     */
    async scaleDownResources() {
        console.log('🔧 Scaling down resources...');
        // Emit scale down event for external handling
        this.emit('scaleDown', {
            timestamp: new Date(),
            reason: 'resource_containment'
        });
    }
    /**
     * 🔧 Assess system resources
     */
    async assessSystemResources() {
        console.log('🔧 Assessing system resources...');
        const assessment = {
            cpuCores: os.cpus().length,
            totalMemory: os.totalmem(),
            platform: os.platform(),
            architecture: os.arch(),
            recommendedLimits: {
                maxCpuUsage: Math.min(85, os.cpus().length * 20),
                maxMemoryUsage: 90,
                maxAiProcesses: Math.max(3, Math.floor(os.cpus().length / 2))
            }
        };
        console.log('🔧 System assessment:', assessment);
        this.emit('systemAssessment', assessment);
    }
    // ==========================================
    // 📊 STATUS & REPORTING
    // ==========================================
    /**
     * 📊 Get latest metrics
     */
    getLatestMetrics() {
        return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null;
    }
    /**
     * 📊 Get resource status
     */
    getResourceStatus() {
        const latest = this.getLatestMetrics();
        return {
            active: this.isActive,
            limits: this.limits,
            currentMetrics: latest,
            processes: {
                total: this.processes.size,
                isolated: this.isolatedProcesses.size,
                ai: Array.from(this.processes.values()).filter(p => p.type === 'ai').length
            },
            containment: {
                protocols: this.containmentProtocols.size,
                activeTriggers: Array.from(this.containmentProtocols.values())
                    .filter(p => p.lastTriggered &&
                    (Date.now() - p.lastTriggered.getTime()) < p.cooldown * 1000).length
            },
            allocations: this.resourceAllocation.size
        };
    }
    /**
     * 📊 Get resource report
     */
    getResourceReport() {
        const status = this.getResourceStatus();
        return {
            timestamp: new Date(),
            status,
            alerts: [], // Would be populated with recent alerts
            recommendations: this.generateResourceRecommendations()
        };
    }
    /**
     * 📊 Generate resource recommendations
     */
    generateResourceRecommendations() {
        const recommendations = [];
        const latest = this.getLatestMetrics();
        if (!latest)
            return recommendations;
        if (latest.cpu.usage > 80) {
            recommendations.push('Consider scaling CPU resources or optimizing AI processes');
        }
        if (latest.memory.usage > 85) {
            recommendations.push('Memory usage is high - consider increasing RAM or optimizing memory usage');
        }
        if (latest.processes.aiProcesses >= this.limits.maxAiProcesses) {
            recommendations.push('Maximum AI processes reached - consider scaling infrastructure');
        }
        if (this.isolatedProcesses.size > 0) {
            recommendations.push(`${this.isolatedProcesses.size} processes are isolated - review and optimize`);
        }
        return recommendations;
    }
}
