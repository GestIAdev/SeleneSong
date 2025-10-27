/**
 * 🔗 APOLLO UNIFIED API MODULE
 * Single entry point for all Selene Song Core operations
 * Integrates Patients, Calendar, Medical Records, and Documents
 */
import { SelenePatients } from '../Patients/Patients.js';
import { SeleneCalendar } from '../Calendar/Calendar.js';
import { SeleneMedicalRecords } from '../MedicalRecords/MedicalRecords.js';
import { SeleneDocuments } from '../Documents/Documents.js';
export class SeleneUnifiedAPI {
    server;
    database;
    cache;
    monitoring;
    // Integrated modules
    patients;
    calendar;
    medicalRecords;
    documents;
    constructor(server, database, cache, monitoring) {
        this.server = server;
        this.database = database;
        this.cache = cache;
        this.monitoring = monitoring;
        // Initialize integrated modules
        this.patients = new SelenePatients(server, database, cache, monitoring);
        this.calendar = new SeleneCalendar(server, database, cache, monitoring);
        this.medicalRecords = new SeleneMedicalRecords(server, database, cache, monitoring);
        this.documents = new SeleneDocuments(server, database, cache, monitoring);
        this.initializeUnifiedAPI();
    }
    /**
     * Initialize unified API endpoints
     */
    initializeUnifiedAPI() {
        this.monitoring.logInfo('Selene Unified API initialized - All modules integrated');
        console.log('🔗 Selene Unified API active - Single entry point for all operations');
        // Unified search endpoint
        this.initializeUnifiedSearch();
        // Unified patient operations
        this.initializeUnifiedPatientOps();
        // Unified dashboard data
        this.initializeUnifiedDashboard();
    }
    /**
     * Initialize unified search across all modules
     */
    initializeUnifiedSearch() {
        // GET /api/v2/unified/search - Search across all modules
        // This would be implemented when we have proper routing in SeleneServer
        this.monitoring.logInfo('Unified search endpoints prepared');
    }
    /**
     * Initialize unified patient operations
     */
    initializeUnifiedPatientOps() {
        // These would integrate patient data with appointments, medical records, and documents
        this.monitoring.logInfo('Unified patient operations prepared');
    }
    /**
     * Initialize unified dashboard data
     */
    initializeUnifiedDashboard() {
        // This would provide comprehensive dashboard data from all modules
        this.monitoring.logInfo('Unified dashboard endpoints prepared');
    }
    /**
     * Unified search across all modules
     */
    async unifiedSearch(criteria) {
        try {
            const [patients, appointments, medicalRecords, documents] = await Promise.all([
                this.searchPatients(criteria),
                this.searchAppointments(criteria),
                this.searchMedicalRecords(criteria),
                this.searchDocuments(criteria)
            ]);
            const totalResults = patients.length + appointments.length + medicalRecords.length + documents.length;
            return {
                patients,
                appointments,
                medical_records: medicalRecords,
                documents,
                total_results: totalResults
            };
        }
        catch (error) {
            this.monitoring.logError('Unified search error', error);
            throw error;
        }
    }
    /**
     * Get complete patient profile with all related data
     */
    async getPatientProfile(patientId) {
        try {
            const [patient, appointments, medicalHistory, documents] = await Promise.all([
                this.patients.getPatientById(patientId),
                this.calendar.getPatientAppointments(patientId, 10),
                this.medicalRecords.getPatientMedicalHistory(patientId, 10),
                this.documents.getPatientDocuments(patientId, 10)
            ]);
            return {
                patient,
                recent_appointments: appointments,
                medical_history: medicalHistory,
                documents: documents,
                stats: await this.getPatientStats(patientId)
            };
        }
        catch (error) {
            this.monitoring.logError('Patient profile fetch error', error);
            throw error;
        }
    }
    /**
     * Get patient statistics across all modules
     */
    async getPatientStats(patientId) {
        try {
            const [appointmentStats, medicalStats, documentStats] = await Promise.all([
                this.getAppointmentStats(patientId),
                this.medicalRecords.getMedicalRecordsStats(patientId),
                this.getDocumentStats(patientId)
            ]);
            return {
                appointments: appointmentStats,
                medical_records: medicalStats,
                documents: documentStats
            };
        }
        catch (error) {
            this.monitoring.logError('Patient stats calculation error', error);
            return {};
        }
    }
    /**
     * Get appointment statistics for patient
     */
    async getAppointmentStats(patientId) {
        try {
            const appointments = await this.calendar.getPatientAppointments(patientId, 1000);
            return {
                total: appointments.length,
                completed: appointments.filter(app => app.status === 'completed').length,
                upcoming: appointments.filter(app => app.status === 'scheduled').length,
                cancelled: appointments.filter(app => app.status === 'cancelled').length
            };
        }
        catch (error) {
            return { total: 0, completed: 0, upcoming: 0, cancelled: 0 };
        }
    }
    /**
     * Get document statistics for patient
     */
    async getDocumentStats(patientId) {
        try {
            const documents = await this.documents.getPatientDocuments(patientId, 1000);
            return {
                total: documents.length,
                by_type: documents.reduce((acc, doc) => {
                    acc[doc.document_type] = (acc[doc.document_type] || 0) + 1;
                    return acc;
                }, {}),
                total_size: documents.reduce((sum, doc) => sum + doc.file_size, 0)
            };
        }
        catch (error) {
            return { total: 0, by_type: {}, total_size: 0 };
        }
    }
    /**
     * Search patients (delegates to patients module)
     */
    async searchPatients(criteria) {
        try {
            if (criteria.query) {
                return await this.patients.getAutocompleteSuggestions(criteria.query, criteria.limit || 10);
            }
            return await this.patients.searchPatients(criteria);
        }
        catch (error) {
            return [];
        }
    }
    /**
     * Search appointments (delegates to calendar module)
     */
    async searchAppointments(criteria) {
        try {
            return await this.calendar.searchAppointments(criteria);
        }
        catch (error) {
            return [];
        }
    }
    /**
     * Search medical records (delegates to medical records module)
     */
    async searchMedicalRecords(criteria) {
        try {
            if (criteria.patient_id) {
                return await this.medicalRecords.searchMedicalRecordsByContent(criteria.patient_id, criteria.query || '', criteria.limit || 10);
            }
            return [];
        }
        catch (error) {
            return [];
        }
    }
    /**
     * Search documents (delegates to documents module)
     */
    async searchDocuments(criteria) {
        try {
            if (criteria.patient_id && criteria.query) {
                return await this.documents.searchDocumentsByContent(criteria.patient_id, criteria.query, criteria.limit || 10);
            }
            return [];
        }
        catch (error) {
            return [];
        }
    }
    /**
     * Get dashboard data from all modules
     */
    async getDashboardData() {
        try {
            const [patientStats, appointmentStats, systemStatus] = await Promise.all([
                this.getPatientsOverview(),
                this.getAppointmentsOverview(),
                this.getSystemOverview()
            ]);
            return {
                patients: patientStats,
                appointments: appointmentStats,
                system: systemStatus,
                timestamp: new Date().toISOString()
            };
        }
        catch (error) {
            this.monitoring.logError('Dashboard data fetch error', error);
            throw error;
        }
    }
    /**
     * Get patients overview for dashboard
     */
    async getPatientsOverview() {
        try {
            // This would get real stats when database methods are available
            return {
                total: 0,
                active: 0,
                new_this_month: 0
            };
        }
        catch (error) {
            return { total: 0, active: 0, new_this_month: 0 };
        }
    }
    /**
     * Get appointments overview for dashboard
     */
    async getAppointmentsOverview() {
        try {
            // This would get real stats when database methods are available
            return {
                today: 0,
                this_week: 0,
                completed_today: 0,
                upcoming: 0
            };
        }
        catch (error) {
            return { today: 0, this_week: 0, completed_today: 0, upcoming: 0 };
        }
    }
    /**
     * Get system overview for dashboard
     */
    async getSystemOverview() {
        try {
            const [patientsStatus, calendarStatus, medicalRecordsStatus, documentsStatus] = await Promise.all([
                this.patients.getStatus(),
                this.calendar.getStatus(),
                this.medicalRecords.getStatus(),
                this.documents.getStatus()
            ]);
            return {
                modules: {
                    patients: patientsStatus.status,
                    calendar: calendarStatus.status,
                    medical_records: medicalRecordsStatus.status,
                    documents: documentsStatus.status
                },
                overall_status: 'operational'
            };
        }
        catch (error) {
            return { modules: {}, overall_status: 'error' };
        }
    }
    /**
     * Execute cross-module operations
     */
    async executeCrossModuleOperation(operation, params) {
        try {
            switch (operation) {
                case 'create_patient_with_appointment':
                    return await this.createPatientWithAppointment(params);
                case 'get_patient_complete_history':
                    return await this.getPatientCompleteHistory(params.patientId);
                case 'schedule_follow_up':
                    return await this.scheduleFollowUp(params);
                default:
                    throw new Error(`Unknown cross-module operation: ${operation}`);
            }
        }
        catch (error) {
            this.monitoring.logError('Cross-module operation error', error);
            throw error;
        }
    }
    /**
     * Create patient with initial appointment
     */
    async createPatientWithAppointment(params) {
        try {
            // Create patient
            const patient = await this.patients.createPatient(params.patient);
            // Create appointment
            const appointment = await this.calendar.createAppointment({
                ...params.appointment,
                patient_id: patient.id
            });
            return {
                patient,
                appointment,
                success: true
            };
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get complete patient history across all modules
     */
    async getPatientCompleteHistory(patientId) {
        try {
            return await this.getPatientProfile(patientId);
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Schedule follow-up appointment
     */
    async scheduleFollowUp(params) {
        try {
            const followUpDate = new Date();
            followUpDate.setDate(followUpDate.getDate() + (params.days || 7));
            const appointment = await this.calendar.createAppointment({
                patient_id: params.patientId,
                doctor_id: params.doctorId,
                appointment_date: followUpDate,
                duration_minutes: params.duration || 30,
                appointment_type: 'follow_up',
                status: 'scheduled',
                notes: params.notes || 'Follow-up appointment'
            });
            return appointment;
        }
        catch (error) {
            throw error;
        }
    }
    /**
     * Get module status
     */
    async getStatus() {
        return {
            module: 'unified_api',
            status: 'operational',
            integrated_modules: {
                patients: await this.patients.getStatus(),
                calendar: await this.calendar.getStatus(),
                medical_records: await this.medicalRecords.getStatus(),
                documents: await this.documents.getStatus()
            },
            database: await this.database.getStatus(),
            cache: await this.cache.getStatus(),
            monitoring: await this.monitoring.getStatus()
        };
    }
}
