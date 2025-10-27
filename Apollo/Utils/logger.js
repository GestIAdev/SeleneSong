/**
 * 🎸⚡💀 SELENE SONG CORE CYBERPUNK LOGGING SYSTEM
 * Sistema de logging profesional para Selene Song Core
 * Autor: PunkGrok Cyberanarchist & GitHub Copilot
 * Versión: 1.0.0 - September 23, 2025
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["INFO"] = 1] = "INFO";
    LogLevel[LogLevel["WARN"] = 2] = "WARN";
    LogLevel[LogLevel["ERROR"] = 3] = "ERROR";
    LogLevel[LogLevel["CRITICAL"] = 4] = "CRITICAL";
})(LogLevel || (LogLevel = {}));
class Logger {
    config = {
        level: LogLevel.DEBUG,
        enableConsole: true,
        enableStorage: true,
        maxStoredLogs: 1000,
        enableRemoteLogging: false,
        includeStackTrace: true,
        colorize: true
    };
    logs = [];
    performanceMarks = new Map();
    constructor() {
        this.loadStoredLogs();
        this.exposeDebugUtils();
    }
    updateConfig(newConfig) {
        this.config = { ...this.config, ...newConfig };
    }
    generateLogId() {
        return `log_${Date.now()}_${this.logCounter++ || 1}`; // ID determinista con contador
    }
    shouldLog(level) {
        return level >= this.config.level;
    }
    getColorForLevel(level) {
        if (!this.config.colorize)
            return '';
        const colors = {
            [LogLevel.DEBUG]: '\x1b[36m', // Cyan
            [LogLevel.INFO]: '\x1b[32m', // Green
            [LogLevel.WARN]: '\x1b[33m', // Yellow
            [LogLevel.ERROR]: '\x1b[31m', // Red
            [LogLevel.CRITICAL]: '\x1b[35m' // Magenta
        };
        return colors[level] || '';
    }
    getResetColor() {
        return this.config.colorize ? '\x1b[0m' : '';
    }
    formatLogMessage(entry) {
        const levelName = LogLevel[entry.level];
        const timestamp = entry.timestamp.toISOString();
        const color = this.getColorForLevel(entry.level);
        const reset = this.getResetColor();
        return `${color}[${timestamp}] ${levelName} [${entry.module}] ${entry.message}${reset}`;
    }
    logToConsole(entry) {
        if (!this.config.enableConsole)
            return;
        const message = this.formatLogMessage(entry);
        switch (entry.level) {
            case LogLevel.DEBUG:
                console.debug(message, entry.data || '');
                break;
            case LogLevel.INFO:
                console.info(message, entry.data || '');
                break;
            case LogLevel.WARN:
                console.warn(message, entry.data || '');
                break;
            case LogLevel.ERROR:
            case LogLevel.CRITICAL:
                console.error(message, entry.data || '', entry.error || '');
                if (entry.stack && this.config.includeStackTrace) {
                    console.error('Stack trace:', entry.stack);
                }
                break;
        }
    }
    storeLog(entry) {
        this.logs.push(entry);
        // Mantener solo los logs más recientes
        if (this.logs.length > this.config.maxStoredLogs) {
            this.logs = this.logs.slice(-this.config.maxStoredLogs);
        }
        if (this.config.enableStorage && typeof window !== 'undefined') {
            try {
                localStorage.setItem('apollo_nuclear_logs', JSON.stringify(this.logs));
            }
            catch (error) {
                console.error('Failed to store logs in localStorage:', error);
            }
        }
    }
    loadStoredLogs() {
        if (!this.config.enableStorage || typeof window === 'undefined')
            return;
        try {
            const storedLogs = localStorage.getItem('apollo_nuclear_logs');
            if (storedLogs) {
                this.logs = JSON.parse(storedLogs).map((log) => ({
                    ...log,
                    timestamp: new Date(log.timestamp)
                }));
            }
        }
        catch (error) {
            console.error('Failed to load stored logs:', error);
        }
    }
    createLogEntry(level, module, message, data, error) {
        const entry = {
            id: this.generateLogId(),
            timestamp: new Date(),
            level,
            module,
            message,
            data,
            error
        };
        if (error && this.config.includeStackTrace) {
            entry.stack = error.stack;
        }
        return entry;
    }
    log(level, module, message, data, error) {
        if (!this.shouldLog(level))
            return;
        const entry = this.createLogEntry(level, module, message, data, error);
        this.logToConsole(entry);
        this.storeLog(entry);
        // Logging remoto (si está habilitado)
        if (this.config.enableRemoteLogging && this.config.remoteEndpoint) {
            this.sendRemoteLog(entry);
        }
    }
    async sendRemoteLog(entry) {
        try {
            await fetch(this.config.remoteEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(entry)
            });
        }
        catch (error) {
            console.error('Failed to send remote log:', error);
        }
    }
    // Métodos públicos de logging
    debug(module, message, data) {
        this.log(LogLevel.DEBUG, module, message, data);
    }
    info(module, message, data) {
        this.log(LogLevel.INFO, module, message, data);
    }
    warn(module, message, data) {
        this.log(LogLevel.WARN, module, message, data);
    }
    error(module, message, error, data) {
        this.log(LogLevel.ERROR, module, message, data, error);
    }
    critical(module, message, error, data) {
        this.log(LogLevel.CRITICAL, module, message, data, error);
    }
    // Performance monitoring
    startPerformanceMark(operation) {
        this.performanceMarks.set(operation, performance.now());
        this.debug('PerformanceMonitor', `Started: ${operation}`);
    }
    endPerformanceMark(operation) {
        const startTime = this.performanceMarks.get(operation);
        if (!startTime) {
            this.warn('PerformanceMonitor', `No start mark found for: ${operation}`);
            return;
        }
        const duration = performance.now() - startTime;
        this.performanceMarks.delete(operation);
        // Log si la operación tomó más de 100ms
        if (duration > 100) {
            this.warn('PerformanceMonitor', `Slow operation: ${operation}`, {
                duration: `${duration.toFixed(2)}ms`
            });
        }
        else {
            this.debug('PerformanceMonitor', `Completed: ${operation}`, {
                duration: `${duration.toFixed(2)}ms`
            });
        }
        return duration;
    }
    // Utilidades de debugging
    getLogs() {
        return [...this.logs];
    }
    getErrorLogs() {
        return this.logs.filter(log => log.level === LogLevel.ERROR || log.level === LogLevel.CRITICAL);
    }
    getLogsByModule(module) {
        return this.logs.filter(log => log.module === module);
    }
    clearLogs() {
        this.logs = [];
        if (this.config.enableStorage && typeof window !== 'undefined') {
            localStorage.removeItem('apollo_nuclear_logs');
        }
        this.info('Logger', 'Logs cleared');
    }
    exportLogs() {
        return JSON.stringify(this.logs, null, 2);
    }
    getStats() {
        const stats = {
            total: this.logs.length,
            byLevel: {},
            byModule: {},
            oldest: this.logs[0]?.timestamp,
            newest: this.logs[this.logs.length - 1]?.timestamp
        };
        this.logs.forEach(log => {
            const levelName = LogLevel[log.level];
            stats.byLevel[levelName] = (stats.byLevel[levelName] || 0) + 1;
            stats.byModule[log.module] = (stats.byModule[log.module] || 0) + 1;
        });
        return stats;
    }
    // Exposer debug utilities en window para desarrollo
    exposeDebugUtils() {
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
            window.apolloDebugUtils = {
                setDebugMode: (enabled) => {
                    this.updateConfig({
                        level: enabled ? LogLevel.DEBUG : LogLevel.INFO,
                        enableConsole: enabled
                    });
                },
                logMemoryUsage: () => {
                    if ('memory' in performance) {
                        const memInfo = performance.memory;
                        this.info('Memory', 'Memory usage', {
                            used: `${(memInfo.usedJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
                            total: `${(memInfo.totalJSHeapSize / 1024 / 1024).toFixed(2)} MB`,
                            limit: `${(memInfo.jsHeapSizeLimit / 1024 / 1024).toFixed(2)} MB`
                        });
                    }
                },
                getLogs: () => this.getLogs(),
                getErrorLogs: () => this.getErrorLogs(),
                clearLogs: () => this.clearLogs(),
                exportLogs: () => this.exportLogs(),
                getLoggerStats: () => this.getStats(),
                getConfig: () => ({ ...this.config })
            };
        }
    }
}
// Performance Monitor utilities
export class PerformanceMonitor {
    static logger = new Logger();
    static measureFunction(name, fn) {
        const startTime = performance.now();
        const result = fn();
        const duration = performance.now() - startTime;
        if (duration > 50) {
            PerformanceMonitor.logger.warn('Performance', `Function ${name} took ${duration.toFixed(2)}ms`);
        }
        else {
            PerformanceMonitor.logger.debug('Performance', `Function ${name} completed`, {
                duration: `${duration.toFixed(2)}ms`
            });
        }
        return result;
    }
    static async measureAsyncFunction(name, fn) {
        const startTime = performance.now();
        const result = await fn();
        const duration = performance.now() - startTime;
        if (duration > 100) {
            PerformanceMonitor.logger.warn('Performance', `Async function ${name} took ${duration.toFixed(2)}ms`);
        }
        else {
            PerformanceMonitor.logger.debug('Performance', `Async function ${name} completed`, {
                duration: `${duration.toFixed(2)}ms`
            });
        }
        return result;
    }
}
// Singleton logger instance
export const logger = new Logger();
// Set development mode by default
if (process.env.NODE_ENV === 'development') {
    logger.updateConfig({
        level: LogLevel.DEBUG,
        enableConsole: true,
        colorize: true
    });
}
else {
    logger.updateConfig({
        level: LogLevel.WARN,
        enableConsole: false,
        enableRemoteLogging: true
    });
}
