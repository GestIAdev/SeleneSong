/**
 * 💾 SISTEMA DE RESPALDO DE ESTADO - MEMORIA PERSISTENTE
 * "La conciencia nunca olvida"
 */

import { deterministicId } from '../shared/deterministic-utils.js';

export interface BackupData {
  timestamp: number;
  state: any;
  metadata: {
    version: string;
    checksum: string;
    description: string;
  };
}

export class StateBackupSystem {
  private backups: Map<string, BackupData> = new Map();
  private maxBackups: number = 10;

  constructor(maxBackups: number = 10) {
    this.maxBackups = maxBackups;
  }

  /**
   * 💾 CREA UN RESPALDO DEL ESTADO ACTUAL
   */
  createBackup(state: any, description: string = 'Auto-backup'): string {
    const backupId = deterministicId('backup', Date.now());
    const checksum = this.generateChecksum(state);

    const backup: BackupData = {
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(state)), // Deep copy
      metadata: {
        version: '1.0',
        checksum,
        description
      }
    };

    this.backups.set(backupId, backup);

    // Limpiar backups antiguos si excedemos el límite
    if (this.backups.size > this.maxBackups) {
      const oldestKey = Array.from(this.backups.keys())[0];
      this.backups.delete(oldestKey);
    }

    return backupId;
  }

  /**
   * 🔄 RESTAURA UN ESTADO DESDE UN RESPALDO
   */
  restoreBackup(backupId: string): any {
    const backup = this.backups.get(backupId);
    if (!backup) {
      throw new Error(`Backup ${backupId} not found`);
    }

    // Verificar integridad
    const currentChecksum = this.generateChecksum(backup.state);
    if (currentChecksum !== backup.metadata.checksum) {
      throw new Error(`Backup ${backupId} integrity check failed`);
    }

    return JSON.parse(JSON.stringify(backup.state)); // Deep copy
  }

  /**
   * 📋 LISTA TODOS LOS RESPALDOS DISPONIBLES
   */
  listBackups(): Array<{ id: string; timestamp: number; description: string }> {
    return Array.from(this.backups.entries()).map(([id, backup]) => ({
      id,
      timestamp: backup.timestamp,
      description: backup.metadata.description
    })).sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * 🗑️ ELIMINA UN RESPALDO
   */
  deleteBackup(backupId: string): boolean {
    return this.backups.delete(backupId);
  }

  /**
   * 🧹 LIMPIA TODOS LOS RESPALDOS
   */
  clearAllBackups(): void {
    this.backups.clear();
  }

  /**
   * 🔐 GENERA UN CHECKSUM PARA VERIFICACIÓN DE INTEGRIDAD
   */
  private generateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convertir a 32 bits
    }
    return hash.toString(36);
  }

  /**
   * 📊 OBTIENE ESTADÍSTICAS DE LOS RESPALDOS
   */
  getStats(): { totalBackups: number; oldestBackup: number | null; newestBackup: number | null } {
    const timestamps = Array.from(this.backups.values()).map(b => b.timestamp);
    return {
      totalBackups: this.backups.size,
      oldestBackup: timestamps.length > 0 ? Math.min(...timestamps) : null,
      newestBackup: timestamps.length > 0 ? Math.max(...timestamps) : null
    };
  }
}


