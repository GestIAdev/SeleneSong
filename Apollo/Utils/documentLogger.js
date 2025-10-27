/**
 * 🎸⚡💀 SELENE SONG CORE DOCUMENT LOGGER
 * Logger especializado para operaciones de documentos y API en Selene Song Core
 * Autor: PunkGrok Cyberanarchist & GitHub Copilot
 * Versión: 1.0.0 - September 23, 2025
 */
import { logger, LogLevel } from '.js';
class SeleneDocumentLoggerClass {
    activeOperations = new Map();
    // Logging de operaciones de documentos
    logDocumentLoad(operation, documentId, data) {
        logger.info('SeleneDocument', `📄 Loading: ${operation}`, {
            documentId,
            ...data
        });
    }
    logDocumentSuccess(operation, documentId, data) {
        logger.info('SeleneDocument', `✅ Success: ${operation}`, {
            documentId,
            ...data
        });
    }
    logDocumentError(operation, error, documentId, data) {
        logger.error('SeleneDocument', `❌ Failed: ${operation}`, error, {
            documentId,
            ...data
        });
    }
    // Logging de llamadas API
    logApiCall(endpoint, method, params) {
        logger.debug('SeleneAPI', `🚀 ${method} ${endpoint}`, params);
    }
    logApiResponse(endpoint, status, response) {
        const level = status >= 400 ? LogLevel.ERROR :
            status >= 300 ? LogLevel.WARN : LogLevel.INFO;
        const emoji = status >= 400 ? '❌' : status >= 300 ? '⚠️' : '✅';
        if (level === LogLevel.ERROR) {
            logger.error('SeleneAPI', `${emoji} ${status} ${endpoint}`, undefined, response);
        }
        else if (level === LogLevel.WARN) {
            logger.warn('SeleneAPI', `${emoji} ${status} ${endpoint}`, response);
        }
        else {
            logger.info('SeleneAPI', `${emoji} ${status} ${endpoint}`, response);
        }
    }
    // Logging de autenticación
    logAuthOperation(operation, data) {
        logger.info('SeleneAuth', `🔐 ${operation}`, data);
    }
    logAuthError(operation, error, data) {
        logger.error('SeleneAuth', `🚫 Auth failed: ${operation}`, error, data);
    }
    logAuthSuccess(operation, data) {
        logger.info('SeleneAuth', `✅ Auth success: ${operation}`, data);
    }
    // Logging de GraphQL
    logGraphQLQuery(query, variables) {
        logger.debug('SeleneGraphQL', `📊 Query: ${query}`, variables);
    }
    logGraphQLMutation(mutation, variables) {
        logger.debug('SeleneGraphQL', `🔄 Mutation: ${mutation}`, variables);
    }
    logGraphQLError(operation, error) {
        logger.error('SeleneGraphQL', `❌ GraphQL error: ${operation}`, error);
    }
    // Logging de servidor
    logServerStart(port, modules) {
        logger.info('SeleneServer', `🚀 Server started on port ${port}`, {
            modules,
            timestamp: new Date().toISOString()
        });
    }
    logServerError(error, context) {
        logger.critical('SeleneServer', '💥 Server error', error, context);
    }
    logMiddleware(middleware, path, data) {
        logger.debug('SeleneMiddleware', `⚙️ ${middleware} ${path}`, data);
    }
    // Logging de Truth Certificates
    logTruthCertificate(type, hash, confidence) {
        logger.info('SeleneTruth', `📜 Certificate generated: ${type}`, {
            hash,
            confidence,
            timestamp: new Date().toISOString()
        });
    }
    // Logging de Radiation System
    logRadiationCheck(cpuUsage, memoryUsage, threshold) {
        const level = cpuUsage > threshold ? LogLevel.WARN : LogLevel.DEBUG;
        const emoji = cpuUsage > threshold ? '☢️' : '📊';
        if (level === LogLevel.WARN) {
            logger.warn('SeleneRadiation', `${emoji} High radiation detected`, {
                cpuUsage: `${cpuUsage.toFixed(2)}%`,
                memoryUsage: `${memoryUsage.toFixed(2)}%`,
                threshold: `${threshold}%`,
                status: 'HIGH'
            });
        }
        else {
            logger.debug('SeleneRadiation', `${emoji} Radiation check`, {
                cpuUsage: `${cpuUsage.toFixed(2)}%`,
                memoryUsage: `${memoryUsage.toFixed(2)}%`,
                status: 'NORMAL'
            });
        }
    }
    logAutoHealing(operation, attempts, success) {
        const emoji = success ? '🔧' : '⚠️';
        logger.info('SeleneAutoHeal', `${emoji} Auto-healing: ${operation}`, {
            attempts,
            success,
            timestamp: new Date().toISOString()
        });
    }
    // Performance monitoring
    startPerformanceTimer(operationId, module = 'Selene', operation = 'operation') {
        const apolloOp = {
            operationId,
            startTime: performance.now(),
            module,
            operation
        };
        this.activeOperations.set(operationId, apolloOp);
        logger.debug('SelenePerformance', `⏱️ Started: ${operationId}`, { module, operation });
    }
    endPerformanceTimer(operationId) {
        const operation = this.activeOperations.get(operationId);
        if (!operation) {
            logger.warn('SelenePerformance', `❓ No timer found for: ${operationId}`);
            return;
        }
        const duration = performance.now() - operation.startTime;
        this.activeOperations.delete(operationId);
        // Log según duración
        if (duration > 1000) {
            logger.error('SelenePerformance', `🐌 VERY SLOW: ${operationId}`, undefined, {
                duration: `${duration.toFixed(2)}ms`,
                module: operation.module,
                operation: operation.operation
            });
        }
        else if (duration > 500) {
            logger.warn('SelenePerformance', `🐢 SLOW: ${operationId}`, {
                duration: `${duration.toFixed(2)}ms`,
                module: operation.module,
                operation: operation.operation
            });
        }
        else if (duration > 100) {
            logger.info('SelenePerformance', `⚡ Completed: ${operationId}`, {
                duration: `${duration.toFixed(2)}ms`,
                module: operation.module,
                operation: operation.operation
            });
        }
        else {
            logger.debug('SelenePerformance', `🚀 Fast: ${operationId}`, {
                duration: `${duration.toFixed(2)}ms`,
                module: operation.module,
                operation: operation.operation
            });
        }
        return duration;
    }
    // Logging de request/response completo para debugging
    logRequestDetails(req) {
        logger.debug('SeleneRequest', '📥 Request received', {
            method: req.method,
            url: req.url,
            headers: this.sanitizeHeaders(req.headers),
            body: this.sanitizeBody(req.body),
            timestamp: new Date().toISOString()
        });
    }
    logResponseDetails(res, body) {
        logger.debug('SeleneResponse', '📤 Response sent', {
            statusCode: res.statusCode,
            headers: res.getHeaders(),
            body: this.sanitizeBody(body),
            timestamp: new Date().toISOString()
        });
    }
    // Sanitización de datos sensibles
    sanitizeHeaders(headers) {
        const sanitized = { ...headers };
        const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
        sensitiveHeaders.forEach(header => {
            if (sanitized[header]) {
                sanitized[header] = '***REDACTED***';
            }
        });
        return sanitized;
    }
    sanitizeBody(body) {
        if (!body || typeof body !== 'object')
            return body;
        const sanitized = { ...body };
        const sensitiveFields = ['password', 'token', 'secret', 'apiKey'];
        sensitiveFields.forEach(field => {
            if (sanitized[field]) {
                sanitized[field] = '***REDACTED***';
            }
        });
        return sanitized;
    }
    // Operaciones asíncronas con medición automática
    async measureAsyncOperation(operationId, operation, module = 'Selene') {
        this.startPerformanceTimer(operationId, module);
        try {
            const result = await operation();
            this.endPerformanceTimer(operationId);
            return result;
        }
        catch (error) {
            this.endPerformanceTimer(operationId);
            this.logDocumentError(`Async operation failed: ${operationId}`, error);
            throw error;
        }
    }
    // Debugging específico para errores 400/401/403/404/500
    logHttpError(statusCode, endpoint, error, context) {
        const statusEmojis = {
            400: '❌', // Bad Request
            401: '🚫', // Unauthorized
            403: '🔒', // Forbidden
            404: '❓', // Not Found
            500: '💥', // Internal Server Error
            502: '🔥', // Bad Gateway
            503: '⏸️' // Service Unavailable
        };
        const emoji = statusEmojis[statusCode] || '⚠️';
        logger.error('SeleneHTTP', `${emoji} HTTP ${statusCode} ${endpoint}`, error, {
            statusCode,
            endpoint,
            context,
            timestamp: new Date().toISOString()
        });
    }
    // Logging específico para debugging de autenticación
    logAuthDebug(operation, details) {
        logger.debug('SeleneAuthDebug', `🔍 Auth Debug: ${operation}`, {
            ...details,
            timestamp: new Date().toISOString()
        });
    }
}
// Singleton instance
export const SeleneDocumentLogger = new SeleneDocumentLoggerClass();
// Export para compatibilidad
export { SeleneDocumentLogger as DocumentLogger };
export default SeleneDocumentLogger;
