/**
 * 🔒 CIRCUIT BREAKER - PROTECCIÓN CONTRA FALLOS EN CASCADA
 * "La belleza del caos controlado"
 */

export class CircuitBreaker {
  private failures: number = 0;
  private lastFailureTime: number = 0;
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold: number = 5,
    private recoveryTimeout: number = 60000, // 1 minuto
    private name: string = 'circuit-breaker'
  ) {}

  /**
   * 📊 VERIFICA SI EL CIRCUITO ESTÁ ABIERTO
   */
  isOpen(): boolean {
    if (this.state === 'open') {
      // Verificar si ya pasó el tiempo de recuperación
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'half-open';
        return false;
      }
      return true;
    }
    return false;
  }

  /**
   * ✅ REGISTRA UNA OPERACIÓN EXITOSA
   */
  recordSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  /**
   * ❌ REGISTRA UNA FALLA
   */
  recordFailure(): void {
    this.failures++;
    this.lastFailureTime = Date.now();

    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
    }
  }

  /**
   * 📈 OBTIENE EL NÚMERO DE FALLAS
   */
  getFailures(): number {
    return this.failures;
  }

  /**
   * 🎯 EJECUTA UNA OPERACIÓN CON PROTECCIÓN DEL CIRCUIT BREAKER
   */
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error(`Circuit breaker ${this.name} is open`);
    }

    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure();
      throw error;
    }
  }

  /**
   * 📊 OBTIENE EL ESTADO ACTUAL
   */
  getState(): string {
    return this.state;
  }
}


