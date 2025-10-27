/**
 * ⏱️ WRAPPER DE TIMEOUT - CONTROL DE TIEMPO DE EJECUCIÓN
 * "El tiempo es el lujo más precioso"
 */

export interface TimeoutResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  duration: number;
}

export class TimeoutWrapper {
  private activeTimeouts: Map<string, NodeJS.Timeout> = new Map();

  constructor(private defaultTimeout: number = 30000) {} // 30 segundos por defecto

  /**
   * ⏱️ EJECUTA UNA OPERACIÓN CON TIMEOUT
   */
  async execute<T>(
    operation: () => Promise<T>,
    timeoutMs: number = this.defaultTimeout,
    operationId: string = 'operation'
  ): Promise<TimeoutResult<T>> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      // Crear timeout
      const timeout = setTimeout(() => {
        this.activeTimeouts.delete(operationId);
        resolve({
          success: false,
          error: new Error(`Operation ${operationId} timed out after ${timeoutMs}ms`),
          duration: Date.now() - startTime
        });
      }, timeoutMs);

      // Registrar timeout activo
      this.activeTimeouts.set(operationId, timeout);

      // Ejecutar operación
      operation()
        .then((data) => {
          // Limpiar timeout
          clearTimeout(timeout);
          this.activeTimeouts.delete(operationId);

          resolve({
            success: true,
            data,
            duration: Date.now() - startTime
          });
        })
        .catch((error) => {
          // Limpiar timeout
          clearTimeout(timeout);
          this.activeTimeouts.delete(operationId);

          resolve({
            success: false,
            error: error instanceof Error ? error : new Error(String(error)),
            duration: Date.now() - startTime
          });
        });
    });
  }

  /**
   * 🛑 CANCELA UNA OPERACIÓN POR ID
   */
  cancelOperation(operationId: string): boolean {
    const timeout = this.activeTimeouts.get(operationId);
    if (timeout) {
      clearTimeout(timeout);
      this.activeTimeouts.delete(operationId);
      return true;
    }
    return false;
  }

  /**
   * 🧹 CANCELA TODAS LAS OPERACIONES ACTIVAS
   */
  cancelAllOperations(): void {
    for (const [id, timeout] of this.activeTimeouts) {
      clearTimeout(timeout);
    }
    this.activeTimeouts.clear();
  }

  /**
   * 📊 OBTIENE ESTADO DE OPERACIONES ACTIVAS
   */
  getActiveOperations(): string[] {
    return Array.from(this.activeTimeouts.keys());
  }

  /**
   * 📈 OBTIENE ESTADÍSTICAS DE TIMEOUT
   */
  getStats(): { activeOperations: number; totalOperations: number } {
    return {
      activeOperations: this.activeTimeouts.size,
      totalOperations: this.activeTimeouts.size // Simplificado por ahora
    };
  }
}


