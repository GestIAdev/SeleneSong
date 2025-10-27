/**
 * 🔬 VALIDACIÓN DE ESTABILIDAD DEL NÚCLEO - SUBFASE 4.1
 * Valida estabilidad del sistema renacido bajo carga real
 * Confirma predictibilidad determinista con datos PostgreSQL
 */
declare class StabilityValidator {
    private results;
    private startTime;
    runFullValidation(): Promise<void>;
    private validateDeterminism;
    private validateMemoryStability;
    private validatePerformanceUnderLoad;
    private validatePostgreSQLConnections;
    private validateImmuneSystem;
    private validateSwarmNodes;
    private captureMetrics;
    private printResults;
}
export { StabilityValidator };
//# sourceMappingURL=stability-validation-4.1.d.ts.map
