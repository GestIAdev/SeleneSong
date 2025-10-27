/**
 * 🧹 SNAPSHOT CLEANUP - THE CORRUPTION PURGER
 * By PunkClaude - October 3, 2025
 *
 * MISSION: Clean corrupted snapshots preventing cluster expansion
 * STRATEGY: Validate JSON integrity and remove corrupt files
 * NEW MISSION: Aggressive cleanup of ALL snapshots causing memory leaks
 */
import { promises as fs } from "fs";
import path from "path";
class SnapshotCleaner {
    constructor(snapshotDir = "./snapshots") {
        this.snapshotDir = snapshotDir;
    }
    /**
     * 🧹 Clean all corrupted snapshots
     */
    async cleanCorruptedSnapshots() {
        console.log("🧹 Starting snapshot cleanup...");
        try {
            const corruptedFiles = await this.findCorruptedSnapshots();
            console.log(`📋 Found ${corruptedFiles.length} corrupted snapshots`);
            for (const filePath of corruptedFiles) {
                await this.removeCorruptedSnapshot(filePath);
            }
            console.log("✅ Snapshot cleanup completed");
        }
        catch (error) {
            console.error("💥 Snapshot cleanup failed:", error);
        }
    }
    /**
     * 🔥 AGGRESSIVE CLEANUP: Remove ALL snapshots to free memory
     */
    async aggressiveCleanup() {
        console.log("🔥 🔥 🔥 STARTING AGGRESSIVE SNAPSHOT CLEANUP 🔥 🔥 🔥");
        console.log("🎯 MISSION: Destroy all snapshots causing memory leaks");
        try {
            const allSnapshotFiles = await this.findAllSnapshots();
            console.log(`💀 Found ${allSnapshotFiles.length} snapshots to destroy`);
            let deletedCount = 0;
            for (const filePath of allSnapshotFiles) {
                try {
                    await fs.unlink(filePath);
                    deletedCount++;
                    if (deletedCount % 10 === 0) {
                        console.log(`🗑️ Destroyed ${deletedCount}/${allSnapshotFiles.length} snapshots`);
                    }
                }
                catch (error) {
                    console.error(`💥 Failed to destroy ${filePath}:`, error);
                }
            }
            console.log(`💀 💀 💀 AGGRESSIVE CLEANUP COMPLETE: ${deletedCount} snapshots destroyed 💀 💀 💀`);
            // Also clean memory timeline if it exists globally
            await this.cleanMemoryTimeline();
        }
        catch (error) {
            console.error("💥 Aggressive cleanup failed:", error);
        }
    }
    /**
     * 🧠 Clean memory timeline from global scope
     */
    async cleanMemoryTimeline() {
        try {
            console.log("🧠 Attempting to clean memory timeline...");
            // This will be called from global context where memoryTimeline exists
            if (typeof global.memoryTimeline !== "undefined") {
                const timeline = global.memoryTimeline;
                if (Array.isArray(timeline)) {
                    const originalLength = timeline.length;
                    timeline.splice(0, timeline.length - 3); // Keep only last 3 entries
                    console.log(`🧠 Memory timeline cleaned: ${originalLength} -> ${timeline.length} entries`);
                }
            }
        }
        catch (error) {
            console.error("💥 Failed to clean memory timeline:", error);
        }
    }
    /**
     * 🔍 Find ALL snapshots (not just corrupted ones)
     */
    async findAllSnapshots() {
        const allFiles = [];
        try {
            const entries = await fs.readdir(this.snapshotDir, {
                withFileTypes: true,
            });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const nodeDir = path.join(this.snapshotDir, entry.name);
                    const nodeFiles = await this.scanNodeDirectoryForAll(nodeDir);
                    allFiles.push(...nodeFiles);
                }
            }
        }
        catch (error) {
            console.error("💥 Error scanning snapshot directory:", error);
        }
        return allFiles;
    }
    /**
     * 📂 Scan node directory for ALL files
     */
    async scanNodeDirectoryForAll(nodeDir) {
        const allFiles = [];
        try {
            const files = await fs.readdir(nodeDir);
            for (const file of files) {
                if (file.endsWith(".json") || file.endsWith(".heapsnapshot")) {
                    const filePath = path.join(nodeDir, file);
                    allFiles.push(filePath);
                }
            }
        }
        catch (error) {
            console.error(`💥 Error scanning node directory ${nodeDir}:`, error);
        }
        return allFiles;
    }
    /**
     * 🔍 Find corrupted snapshots
     */
    async findCorruptedSnapshots() {
        const corruptedFiles = [];
        try {
            const entries = await fs.readdir(this.snapshotDir, {
                withFileTypes: true,
            });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    const nodeDir = path.join(this.snapshotDir, entry.name);
                    const nodeCorrupted = await this.scanNodeDirectory(nodeDir);
                    corruptedFiles.push(...nodeCorrupted);
                }
            }
        }
        catch (error) {
            console.error("💥 Error scanning snapshot directory:", error);
        }
        return corruptedFiles;
    }
    /**
     * 📂 Scan node directory for corrupted files
     */
    async scanNodeDirectory(nodeDir) {
        const corruptedFiles = [];
        try {
            const files = await fs.readdir(nodeDir);
            for (const file of files) {
                if (file.endsWith(".json")) {
                    const filePath = path.join(nodeDir, file);
                    if (await this.isCorrupted(filePath)) {
                        corruptedFiles.push(filePath);
                    }
                }
            }
        }
        catch (error) {
            console.error(`💥 Error scanning node directory ${nodeDir}:`, error);
        }
        return corruptedFiles;
    }
    /**
     * 🔍 Check if snapshot is corrupted
     */
    async isCorrupted(filePath) {
        try {
            const content = await fs.readFile(filePath, "utf-8");
            JSON.parse(content);
            return false; // Valid JSON
        }
        catch (error) {
            if (error instanceof SyntaxError) {
                console.log(`💥 Corrupted snapshot: ${filePath}`);
                return true;
            }
            console.error(`💥 Error reading snapshot ${filePath}:`, error);
            return true; // Consider unreadable files as corrupted
        }
    }
    /**
     * 🗑️ Remove corrupted snapshot
     */
    async removeCorruptedSnapshot(filePath) {
        try {
            await fs.unlink(filePath);
            console.log(`🗑️ Removed corrupted snapshot: ${filePath}`);
        }
        catch (error) {
            console.error(`💥 Failed to remove corrupted snapshot ${filePath}:`, error);
        }
    }
    /**
     * 📊 Get cleanup statistics
     */
    async getCleanupStats() {
        const stats = {
            totalFiles: 0,
            corruptedFiles: 0,
            validFiles: 0,
            directories: 0,
        };
        try {
            const entries = await fs.readdir(this.snapshotDir, {
                withFileTypes: true,
            });
            for (const entry of entries) {
                if (entry.isDirectory()) {
                    stats.directories++;
                    const nodeStats = await this.getNodeStats(path.join(this.snapshotDir, entry.name));
                    stats.totalFiles += nodeStats.totalFiles;
                    stats.corruptedFiles += nodeStats.corruptedFiles;
                    stats.validFiles += nodeStats.validFiles;
                }
            }
        }
        catch (error) {
            console.error("💥 Error getting cleanup stats:", error);
        }
        return stats;
    }
    /**
     * 📊 Get node directory statistics
     */
    async getNodeStats(nodeDir) {
        const stats = {
            totalFiles: 0,
            corruptedFiles: 0,
            validFiles: 0,
        };
        try {
            const files = await fs.readdir(nodeDir);
            for (const file of files) {
                if (file.endsWith(".json")) {
                    stats.totalFiles++;
                    const filePath = path.join(nodeDir, file);
                    if (await this.isCorrupted(filePath)) {
                        stats.corruptedFiles++;
                    }
                    else {
                        stats.validFiles++;
                    }
                }
            }
        }
        catch (error) {
            console.error(`💥 Error getting node stats for ${nodeDir}:`, error);
        }
        return stats;
    }
}
// Execute cleanup if run directly
if (require.main === module) {
    const args = process.argv.slice(2);
    const cleaner = new SnapshotCleaner();
    if (args.includes("--aggressive") || args.includes("-a")) {
        console.log("🔥 🔥 🔥 AGGRESSIVE MODE ACTIVATED 🔥 🔥 🔥");
        cleaner
            .aggressiveCleanup()
            .then(() => {
            console.log("💀 💀 💀 AGGRESSIVE CLEANUP COMPLETED 💀 💀 💀");
        })
            .catch((_error) => {
            console.error("💥 Aggressive cleanup failed:", _error);
            process.exit(1);
        });
    }
    else {
        cleaner
            .cleanCorruptedSnapshots()
            .then(() => {
            console.log("🧹 Snapshot cleanup process completed");
        })
            .catch((_error) => {
            console.error("💥 Snapshot cleanup failed:", _error);
            process.exit(1);
        });
    }
}
export { SnapshotCleaner };
//# sourceMappingURL=snapshot-cleaner.js.map