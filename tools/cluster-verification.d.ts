#!/usr/bin/env node
declare class ClusterVerificationSuite {
    redis: any;
    swarm: any;
    memoryOrchestrator: any;
    constructor();
    verifyRedis(): Promise<boolean>;
    verifyMemorySystem(): Promise<boolean>;
    verifySwarmCoordinator(): Promise<boolean>;
    verifyImmortalitySystems(): Promise<boolean>;
    verifyDashboards(): Promise<boolean>;
    runFullDiagnostic(): Promise<boolean>;
    cleanup(): Promise<void>;
}
export { ClusterVerificationSuite };
//# sourceMappingURL=cluster-verification.d.ts.map
