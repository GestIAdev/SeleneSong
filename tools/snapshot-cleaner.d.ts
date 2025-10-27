/**
 * 🧹 SNAPSHOT CLEANUP - THE CORRUPTION PURGER
 * By PunkClaude - October 3, 2025
 *
 * MISSION: Clean corrupted snapshots preventing cluster expansion
 * STRATEGY: Validate JSON integrity and remove corrupt files
 * NEW MISSION: Aggressive cleanup of ALL snapshots causing memory leaks
 */
declare class SnapshotCleaner {
    private snapshotDir;
    constructor(snapshotDir?: string);
    /**
     * 🧹 Clean all corrupted snapshots
     */
    cleanCorruptedSnapshots(): Promise<void>;
    /**
     * 🔥 AGGRESSIVE CLEANUP: Remove ALL snapshots to free memory
     */
    aggressiveCleanup(): Promise<void>;
    /**
     * 🧠 Clean memory timeline from global scope
     */
    private cleanMemoryTimeline;
    /**
     * 🔍 Find ALL snapshots (not just corrupted ones)
     */
    private findAllSnapshots;
    /**
     * 📂 Scan node directory for ALL files
     */
    private scanNodeDirectoryForAll;
    /**
     * 🔍 Find corrupted snapshots
     */
    private findCorruptedSnapshots;
    /**
     * 📂 Scan node directory for corrupted files
     */
    private scanNodeDirectory;
    /**
     * 🔍 Check if snapshot is corrupted
     */
    private isCorrupted;
    /**
     * 🗑️ Remove corrupted snapshot
     */
    private removeCorruptedSnapshot;
    /**
     * 📊 Get cleanup statistics
     */
    getCleanupStats(): Promise<any>;
    /**
     * 📊 Get node directory statistics
     */
    private getNodeStats;
}
export { SnapshotCleaner };
//# sourceMappingURL=snapshot-cleaner.d.ts.map
