/**
 * 🧩 SELENE PATIENTS MODULE
 * Integration layer for Patients management under Selene Song Core control
 */
export class SelenePatients {
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
     * Initialize integration with existing systems
     */
    initializeIntegration() {
        this.monitoring.logInfo('Selene Patients module initialized');
        console.log('🧩 Selene Patients integration active');
    }
    /**
     * Search patients with criteria
     */
    async searchPatients(criteria) {
        try {
            // For now, delegate to existing backend API
            // This will be enhanced with direct database access later
            const patients = await this.database.getPatients(criteria);
            return patients;
        }
        catch (error) {
            this.monitoring.logError('Patients search error', error);
            throw error;
        }
    }
    /**
     * Get patient by ID
     */
    async getPatientById(id) {
        try {
            const patient = await this.database.getPatientById(id);
            return patient;
        }
        catch (error) {
            this.monitoring.logError('Patient fetch error', error);
            throw error;
        }
    }
    /**
     * Create new patient
     */
    async createPatient(data) {
        try {
            const patient = await this.database.createPatient(data);
            this.monitoring.logInfo(`Patient created: ${patient.id}`);
            return patient;
        }
        catch (error) {
            this.monitoring.logError('Patient creation error', error);
            throw error;
        }
    }
    /**
     * Update patient
     */
    async updatePatient(id, data) {
        try {
            const patient = await this.database.updatePatient(id, data);
            if (patient) {
                this.monitoring.logInfo(`Patient updated: ${id}`);
            }
            return patient;
        }
        catch (error) {
            this.monitoring.logError('Patient update error', error);
            throw error;
        }
    }
    /**
     * Delete patient
     */
    async deletePatient(id) {
        try {
            const deleted = await this.database.deletePatient(id);
            if (deleted) {
                this.monitoring.logInfo(`Patient deleted: ${id}`);
            }
            return deleted;
        }
        catch (error) {
            this.monitoring.logError('Patient deletion error', error);
            throw error;
        }
    }
    /**
     * Get autocomplete suggestions
     */
    async getAutocompleteSuggestions(query, limit = 10) {
        try {
            if (!query || query.length < 2) {
                return [];
            }
            // For now, use simple search - will be enhanced with proper autocomplete later
            const criteria = {
                name: query,
                limit: limit
            };
            return await this.searchPatients(criteria);
        }
        catch (error) {
            this.monitoring.logError('Autocomplete error', error);
            throw error;
        }
    }
    /**
     * Get module status
     */
    async getStatus() {
        return {
            module: 'patients',
            status: 'operational',
            database: await this.database.getStatus(),
            cache: await this.cache.getStatus(),
            monitoring: await this.monitoring.getStatus()
        };
    }
}
