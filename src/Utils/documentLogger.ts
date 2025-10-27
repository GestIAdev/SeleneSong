/**
 * 🎸⚡💀 SELENE SONG CORE DOCUMENT LOGGER
 * Logger especializado para operaciones de documentos y API en Selene Song Core
 * Autor: PunkGrok Cyberanarchist & GitHub Copilot
 * Versión: 1.0.0 - September 23, 2025
 * NOTA TIERRA QUEMADA: Logger eliminado, usando console directamente
 */

export interface SeleneOperation {
  operationId: string;
  startTime: number;
  module: string;
  operation: string;
}

class SeleneDocumentLoggerClass {
  private activeOperations: Map<string, SeleneOperation> = new Map();

  // Logging de operaciones de documentos
  logDocumentLoad(_operation: string, _documentId?: string, _data?: any) {
    console.log("SeleneDocument", `📄 Loading: ${_operation}`, {
      _documentId,
      ..._data,
    });
  }

  logDocumentSuccess(_operation: string, _documentId?: string, _data?: any) {
    console.log("SeleneDocument", `✅ Success: ${_operation}`, {
      _documentId,
      ..._data,
    });
  }

  logDocumentError(
    _operation: string,
    _error: Error | any,
    _documentId?: string,
    _data?: any,
  ) {
    console.error("SeleneDocument", `❌ Failed: ${_operation}`, _error, {
      _documentId,
      ..._data,
    });
  }

  // Logging de llamadas API
  logApiCall(_endpoint: string, _method: string, _params?: any) {
    console.log("SeleneAPI", `🚀 ${_method} ${_endpoint}`, _params);
  }

  logApiResponse(endpoint: string, status: number, response?: any) {
    const level =
      status >= 400
        ? "error"
        : status >= 300
          ? "warn"
          : "info";

    const emoji = status >= 400 ? "❌" : status >= 300 ? "⚠️" : "✅";

    if (status >= 500) {
      console.error(
        "SeleneAPI",
        `${emoji} ${status} ${endpoint}`,
        undefined,
        response,
      );
    } else if (status >= 400) {
      console.warn("SeleneAPI", `${emoji} ${status} ${endpoint}`, response);
    } else {
      console.log("SeleneAPI", `${emoji} ${status} ${endpoint}`, response);
    }
  }

  // Logging de autenticación
  logAuthOperation(_operation: string, _data?: any) {
    console.log("SeleneAuth", `🔐 ${_operation}`, _data);
  }

  logAuthError(_operation: string, _error: Error | any, _data?: any) {
    console.error("SeleneAuth", `🚫 Auth failed: ${_operation}`, _error, _data);
  }

  logAuthSuccess(_operation: string, _data?: any) {
    console.log("SeleneAuth", `✅ Auth success: ${_operation}`, _data);
  }

  // Logging de GraphQL
  logGraphQLQuery(_query: string, _variables?: any) {
    console.log("SeleneGraphQL", `📊 Query: ${_query}`, _variables);
  }

  logGraphQLMutation(_mutation: string, _variables?: any) {
    console.log("SeleneGraphQL", `🔄 Mutation: ${_mutation}`, _variables);
  }

  logGraphQLError(_operation: string, _error: Error | any) {
    console.error("SeleneGraphQL", `❌ GraphQL error: ${_operation}`, _error);
  }

  // Logging de servidor
  logServerStart(_port: number, _modules?: string[]) {
    console.log("SeleneServer", `🚀 Server started on port ${_port}`, {
      _modules,
      timestamp: new Date().toISOString(),
    });
  }

  logServerError(_error: Error | any, _context?: any) {
    console.error("SeleneServer", "💥 Server error", _error, _context);
  }

  logMiddleware(_middleware: string, _path: string, _data?: any) {
    console.log("SeleneMiddleware", `⚙️ ${_middleware} ${_path}`, _data);
  }

  // Logging de Truth Certificates
  logTruthCertificate(_type: string, _hash: string, _confidence: number) {
    console.log("SeleneTruth", `📜 Certificate generated: ${_type}`, {
      _hash,
      _confidence,
      timestamp: new Date().toISOString(),
    });
  }

  // Logging de Radiation System
  logRadiationCheck(cpuUsage: number, memoryUsage: number, threshold: number) {
    const level = cpuUsage > threshold ? "warn" : "debug";
    const emoji = cpuUsage > threshold ? "☢️" : "📊";

    if (cpuUsage > threshold) {
      console.warn(`[SeleneRadiation] ${emoji} High radiation detected`, {
        cpuUsage: `${cpuUsage.toFixed(2)}%`,
        memoryUsage: `${memoryUsage.toFixed(2)}%`,
        threshold: `${threshold}%`,
        status: "HIGH",
      });
    } else {
      console.log(`[SeleneRadiation] ${emoji} Radiation check`, {
        cpuUsage: `${cpuUsage.toFixed(2)}%`,
        memoryUsage: `${memoryUsage.toFixed(2)}%`,
        status: "NORMAL",
      });
    }
  }

  logAutoHealing(_operation: string, _attempts: number, success: boolean) {
    const emoji = success ? "🔧" : "⚠️";
    console.log("SeleneAutoHeal", `${emoji} Auto-healing: ${_operation}`, {
      _attempts,
      success,
      timestamp: new Date().toISOString(),
    });
  }

  // Performance monitoring
  startPerformanceTimer(
    operationId: string,
    module: string = "Selene",
    operation: string = "operation",
  ) {
    const apolloOp: SeleneOperation = {
      operationId,
      startTime: performance.now(),
      module,
      operation,
    };

    this.activeOperations.set(operationId, apolloOp);
    console.log("SelenePerformance", `⏱️ Started: ${operationId}`, {
      module,
      operation,
    });
  }

  endPerformanceTimer(operationId: string): number | undefined {
    const operation = this.activeOperations.get(operationId);
    if (!operation) {
      console.warn("SelenePerformance", `❓ No timer found for: ${operationId}`);
      return;
    }

    const duration = performance.now() - operation.startTime;
    this.activeOperations.delete(operationId);

    // Log según duración
    if (duration > 1000) {
      console.error(
        "SelenePerformance",
        `🐌 VERY SLOW: ${operationId}`,
        undefined,
        {
          duration: `${duration.toFixed(2)}ms`,
          module: operation.module,
          operation: operation.operation,
        },
      );
    } else if (duration > 500) {
      console.warn("SelenePerformance", `🐢 SLOW: ${operationId}`, {
        duration: `${duration.toFixed(2)}ms`,
        module: operation.module,
        operation: operation.operation,
      });
    } else if (duration > 100) {
      console.log("SelenePerformance", `⚡ Completed: ${operationId}`, {
        duration: `${duration.toFixed(2)}ms`,
        module: operation.module,
        operation: operation.operation,
      });
    } else {
      console.log("SelenePerformance", `🚀 Fast: ${operationId}`, {
        duration: `${duration.toFixed(2)}ms`,
        module: operation.module,
        operation: operation.operation,
      });
    }

    return duration;
  }

  // Logging de request/response completo para debugging
  logRequestDetails(req: any) {
    console.log("SeleneRequest", "📥 Request received", {
      method: req.method,
      url: req.url,
      headers: this.sanitizeHeaders(req.headers),
      body: this.sanitizeBody(req.body),
      timestamp: new Date().toISOString(),
    });
  }

  logResponseDetails(res: any, _body?: any) {
    console.log("SeleneResponse", "📤 Response sent", {
      statusCode: res.statusCode,
      headers: res.getHeaders(),
      body: this.sanitizeBody(_body),
      timestamp: new Date().toISOString(),
    });
  }

  // Sanitización de datos sensibles
  private sanitizeHeaders(_headers: any) {
    const sanitized = { ..._headers };
    const sensitiveHeaders = ["authorization", "cookie", "x-api-key"];

    sensitiveHeaders.forEach((header) => {
      if (sanitized[header]) {
        sanitized[header] = "***REDACTED***";
      }
    });

    return sanitized;
  }

  private sanitizeBody(body: any) {
    if (!body || typeof body !== "object") return body;

    const sanitized = { ...body };
    const sensitiveFields = ["password", "token", "secret", "apiKey"];

    sensitiveFields.forEach((field) => {
      if (sanitized[field]) {
        sanitized[field] = "***REDACTED***";
      }
    });

    return sanitized;
  }

  // Operaciones asíncronas con medición automática
  async measureAsyncOperation<T>(
    operationId: string,
    _operation: () => Promise<T>,
    _module: string = "Selene",
  ): Promise<T> {
    this.startPerformanceTimer(operationId, _module);

    try {
      const result = await _operation();
      this.endPerformanceTimer(operationId);
      return result;
    } catch (error) {
      this.endPerformanceTimer(operationId);
      this.logDocumentError(`Async operation failed: ${operationId}`, error);
      throw error;
    }
  }

  // Debugging específico para errores 400/401/403/404/500
  logHttpError(
    statusCode: number,
    endpoint: string,
    _error?: any,
    _context?: any,
  ) {
    const statusEmojis: Record<number, string> = {
      400: "❌", // Bad Request
      401: "🚫", // Unauthorized
      403: "🔒", // Forbidden
      404: "❓", // Not Found
      500: "💥", // Internal Server Error
      502: "🔥", // Bad Gateway
      503: "⏸️", // Service Unavailable
    };

    const emoji = statusEmojis[statusCode] || "⚠️";

    console.error(
      "SeleneHTTP",
      `${emoji} HTTP ${statusCode} ${endpoint}`,
      _error,
      {
        statusCode,
        endpoint,
        _context,
        timestamp: new Date().toISOString(),
      },
    );
  }

  // Logging específico para debugging de autenticación
  logAuthDebug(_operation: string, _details: any) {
    console.log("SeleneAuthDebug", `🔍 Auth Debug: ${_operation}`, {
      ..._details,
      timestamp: new Date().toISOString(),
    });
  }
}

// Singleton instance
export const SeleneDocumentLogger = new SeleneDocumentLoggerClass();

// Export para compatibilidad
export { SeleneDocumentLogger as DocumentLogger };
export default SeleneDocumentLogger;


