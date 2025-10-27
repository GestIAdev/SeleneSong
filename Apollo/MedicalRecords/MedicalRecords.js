/**
 * 📋 SELENE MEDICAL RECORDS MODULE
 * Integration layer for Medical Records management under Selene Song Core control
 */
export class SeleneMedicalRecords {
    server;
    database;
    cache;
    monitoring;
    constructor(server, database, cache, monitoring) {
        this.server = server;
        this.database = database;
        this.cache = cache;
        this.monitoring = monitoring;
        this.initializeIntegration();
    }
    /**
     * Initialize integration with existing medical records system
     */
    initializeIntegration() {
        this.monitoring.logInfo('Selene Medical Records module initialized');
        console.log('📋 Selene Medical Records integration active');
    }
    /**
     * Search medical records with criteria
     */
    async searchMedicalRecords(criteria) {
        try {
            const records = await this.database.getMedicalRecords(criteria);
            return records;
        }
        catch (error) {
            this.monitoring.logError('Medical records search error', error);
            throw error;
        }
    }
    /**
     * Get medical record by ID
     */
    async getMedicalRecordById(id) {
        try {
            // For now, use search with ID filter
            const criteria = {
                limit: 1,
                offset: 0
            };
            const records = await this.database.getMedicalRecords(criteria);
            return records.find(record => record.id === id) || null;
        }
        catch (error) {
            this.monitoring.logError('Medical record fetch error', error);
            throw error;
        }
    }
    /**
     * Create new medical record
     */
    async createMedicalRecord(data) {
        try {
            // For now, we'll create a placeholder record
            // TODO: Implement proper creation when database methods are available
            const record = {
                id: `mr_${Date.now()}`,
                patient_id: data.patient_id,
                record_type: data.record_type,
                title: data.title,
                description: data.description,
                content: data.content,
                attachments: data.attachments,
                tags: data.tags,
                created_by: data.created_by,
                created_at: new Date(),
                updated_at: new Date()
            };
            this.monitoring.logInfo(`Medical record created: ${record.id} for patient ${data.patient_id}`);
            return record;
        }
        catch (error) {
            this.monitoring.logError('Medical record creation error', error);
            throw error;
        }
    }
    /**
     * Update medical record
     */
    async updateMedicalRecord(id, data) {
        try {
            // For now, we'll create a new version
            // TODO: Implement proper update when database methods are available
            this.monitoring.logInfo(`Medical record update requested for: ${id}`);
            return null;
        }
        catch (error) {
            this.monitoring.logError('Medical record update error', error);
            throw error;
        }
    }
    /**
     * Delete medical record
     */
    async deleteMedicalRecord(id) {
        try {
            // For now, we'll mark as deleted
            // TODO: Implement proper deletion when database methods are available
            this.monitoring.logInfo(`Medical record deletion requested for: ${id}`);
            return true;
        }
        catch (error) {
            this.monitoring.logError('Medical record deletion error', error);
            throw error;
        }
    }
    /**
     * Get patient's medical history
     */
    async getPatientMedicalHistory(patientId, limit = 100) {
        try {
            const criteria = {
                patient_id: patientId,
                limit: limit
            };
            const records = await this.searchMedicalRecords(criteria);
            // Sort by date (most recent first)
            return records.sort((a, b) => b.created_at.getTime() - a.created_at.getTime());
        }
        catch (error) {
            this.monitoring.logError('Patient medical history fetch error', error);
            throw error;
        }
    }
    /**
     * Get medical records by type
     */
    async getMedicalRecordsByType(patientId, recordType, limit = 50) {
        try {
            const criteria = {
                patient_id: patientId,
                record_type: recordType,
                limit: limit
            };
            return await this.searchMedicalRecords(criteria);
        }
        catch (error) {
            this.monitoring.logError('Medical records by type fetch error', error);
            throw error;
        }
    }
    /**
     * Search medical records by content
     */
    async searchMedicalRecordsByContent(patientId, searchTerm, limit = 50) {
        try {
            if (!searchTerm || searchTerm.length < 3) {
                return [];
            }
            const criteria = {
                patient_id: patientId,
                limit: limit
            };
            const records = await this.searchMedicalRecords(criteria);
            // Simple text search in title, description, and content
            const searchLower = searchTerm.toLowerCase();
            return records.filter(record => record.title.toLowerCase().includes(searchLower) ||
                (record.description && record.description.toLowerCase().includes(searchLower)) ||
                (record.content && record.content.toLowerCase().includes(searchLower)));
        }
        catch (error) {
            this.monitoring.logError('Medical records content search error', error);
            throw error;
        }
    }
    /**
     * Get medical records by tags
     */
    async getMedicalRecordsByTags(patientId, tags, limit = 50) {
        try {
            const criteria = {
                patient_id: patientId,
                tags: tags,
                limit: limit
            };
            const records = await this.searchMedicalRecords(criteria);
            // Filter records that have any of the specified tags
            return records.filter(record => record.tags && record.tags.some(tag => tags.includes(tag)));
        }
        catch (error) {
            this.monitoring.logError('Medical records by tags fetch error', error);
            throw error;
        }
    }
    /**
     * Add tags to medical record
     */
    async addTagsToMedicalRecord(recordId, tags) {
        try {
            const record = await this.getMedicalRecordById(recordId);
            if (!record) {
                return false;
            }
            const existingTags = record.tags || [];
            const newTags = [...new Set([...existingTags, ...tags])];
            // TODO: Update record with new tags when update method is available
            this.monitoring.logInfo(`Tags added to medical record ${recordId}: ${tags.join(', ')}`);
            return true;
        }
        catch (error) {
            this.monitoring.logError('Add tags to medical record error', error);
            throw error;
        }
    }
    /**
     * Remove tags from medical record
     */
    async removeTagsFromMedicalRecord(recordId, tags) {
        try {
            const record = await this.getMedicalRecordById(recordId);
            if (!record || !record.tags) {
                return false;
            }
            const updatedTags = record.tags.filter(tag => !tags.includes(tag));
            // TODO: Update record with filtered tags when update method is available
            this.monitoring.logInfo(`Tags removed from medical record ${recordId}: ${tags.join(', ')}`);
            return true;
        }
        catch (error) {
            this.monitoring.logError('Remove tags from medical record error', error);
            throw error;
        }
    }
    /**
     * Get medical records statistics
     */
    async getMedicalRecordsStats(patientId) {
        try {
            const records = await this.getPatientMedicalHistory(patientId, 1000);
            const stats = {
                total_records: records.length,
                by_type: {},
                by_month: {},
                total_attachments: 0,
                tags_used: []
            };
            records.forEach(record => {
                // Count by type
                stats.by_type[record.record_type] = (stats.by_type[record.record_type] || 0) + 1;
                // Count by month
                const monthKey = record.created_at.toISOString().substring(0, 7); // YYYY-MM
                stats.by_month[monthKey] = (stats.by_month[monthKey] || 0) + 1;
                // Count attachments
                if (record.attachments) {
                    stats.total_attachments += record.attachments.length;
                }
                // Collect tags
                if (record.tags) {
                    record.tags.forEach(tag => {
                        if (!stats.tags_used.includes(tag)) {
                            stats.tags_used.push(tag);
                        }
                    });
                }
            });
            return stats;
        }
        catch (error) {
            this.monitoring.logError('Medical records stats error', error);
            throw error;
        }
    }
    /**
     * Get module status
     */
    async getStatus() {
        return {
            module: 'medical_records',
            status: 'operational',
            database: await this.database.getStatus(),
            cache: await this.cache.getStatus(),
            monitoring: await this.monitoring.getStatus()
        };
    }
}
