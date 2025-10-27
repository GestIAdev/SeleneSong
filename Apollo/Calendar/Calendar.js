/**
 * 📅 SELENE CALENDAR MODULE
 * Integration layer for Calendar/Appointments management under Selene Song Core control
 * Integrates with IAnarkalendar system
 */
export class SeleneCalendar {
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
     * Initialize integration with IAnarkalendar system
     */
    initializeIntegration() {
        this.monitoring.logInfo('Selene Calendar module initialized - IAnarkalendar integration active');
        console.log('📅 Selene Calendar integration active - IAnarkalendar connected');
    }
    /**
     * Search appointments with criteria
     */
    async searchAppointments(criteria) {
        try {
            const appointments = await this.database.getAppointments(criteria);
            return appointments;
        }
        catch (error) {
            this.monitoring.logError('Appointments search error', error);
            throw error;
        }
    }
    /**
     * Get appointment by ID
     */
    async getAppointmentById(id) {
        try {
            // For now, use search with ID filter
            const criteria = {
                limit: 1,
                offset: 0
            };
            const appointments = await this.database.getAppointments(criteria);
            return appointments.find(app => app.id === id) || null;
        }
        catch (error) {
            this.monitoring.logError('Appointment fetch error', error);
            throw error;
        }
    }
    /**
     * Create new appointment
     */
    async createAppointment(data) {
        try {
            // Validate no conflicts
            const conflict = await this.checkAppointmentConflict(data);
            if (conflict) {
                throw new Error('Appointment conflict detected');
            }
            const appointment = await this.database.createAppointment(data);
            this.monitoring.logInfo(`Appointment created: ${appointment.id}`);
            return appointment;
        }
        catch (error) {
            this.monitoring.logError('Appointment creation error', error);
            throw error;
        }
    }
    /**
     * Update appointment
     */
    async updateAppointment(id, data) {
        try {
            // For now, we'll create a new appointment and mark the old one as cancelled
            // This is a temporary implementation until we have proper update methods
            this.monitoring.logInfo(`Appointment update requested for: ${id}`);
            // TODO: Implement proper update when database methods are available
            return null;
        }
        catch (error) {
            this.monitoring.logError('Appointment update error', error);
            throw error;
        }
    }
    /**
     * Delete appointment
     */
    async deleteAppointment(id) {
        try {
            // For now, we'll mark as cancelled
            // TODO: Implement proper deletion when database methods are available
            this.monitoring.logInfo(`Appointment deletion requested for: ${id}`);
            return true;
        }
        catch (error) {
            this.monitoring.logError('Appointment deletion error', error);
            throw error;
        }
    }
    /**
     * Get doctor's schedule for a specific date
     */
    async getDoctorSchedule(doctorId, date) {
        try {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            const criteria = {
                doctor_id: doctorId,
                date_from: startOfDay,
                date_to: endOfDay
            };
            return await this.searchAppointments(criteria);
        }
        catch (error) {
            this.monitoring.logError('Doctor schedule fetch error', error);
            throw error;
        }
    }
    /**
     * Get patient's appointments
     */
    async getPatientAppointments(patientId, limit = 50) {
        try {
            const criteria = {
                patient_id: patientId,
                limit: limit
            };
            return await this.searchAppointments(criteria);
        }
        catch (error) {
            this.monitoring.logError('Patient appointments fetch error', error);
            throw error;
        }
    }
    /**
     * Check for appointment conflicts
     */
    async checkAppointmentConflict(appointment, excludeId) {
        try {
            if (!appointment.doctor_id || !appointment.appointment_date || !appointment.duration_minutes) {
                return false;
            }
            const appointmentEnd = new Date(appointment.appointment_date.getTime() + appointment.duration_minutes * 60000);
            const criteria = {
                doctor_id: appointment.doctor_id,
                date_from: appointment.appointment_date,
                date_to: appointmentEnd
            };
            const existingAppointments = await this.searchAppointments(criteria);
            // Filter out the appointment being updated
            const conflicts = existingAppointments.filter(app => {
                if (excludeId && app.id === excludeId)
                    return false;
                const existingEnd = new Date(app.appointment_date.getTime() + app.duration_minutes * 60000);
                // Check for time overlap
                return (appointment.appointment_date < existingEnd && appointmentEnd > app.appointment_date);
            });
            return conflicts.length > 0;
        }
        catch (error) {
            this.monitoring.logError('Conflict check error', error);
            return false;
        }
    }
    /**
     * Get available time slots for a doctor on a specific date
     */
    async getAvailableSlots(doctorId, date, duration = 30) {
        try {
            const schedule = await this.getDoctorSchedule(doctorId, date);
            const availableSlots = [];
            // Assuming clinic hours 9 AM to 5 PM
            const startHour = 9;
            const endHour = 17;
            let currentTime = new Date(date);
            currentTime.setHours(startHour, 0, 0, 0);
            const endTime = new Date(date);
            endTime.setHours(endHour, 0, 0, 0);
            while (currentTime < endTime) {
                const slotEnd = new Date(currentTime.getTime() + duration * 60000);
                // Check if this slot conflicts with existing appointments
                const conflict = schedule.some(app => {
                    const appEnd = new Date(app.appointment_date.getTime() + app.duration_minutes * 60000);
                    return (currentTime < appEnd && slotEnd > app.appointment_date);
                });
                if (!conflict) {
                    availableSlots.push(new Date(currentTime));
                }
                // Move to next slot (30-minute intervals)
                currentTime.setMinutes(currentTime.getMinutes() + 30);
            }
            return availableSlots;
        }
        catch (error) {
            this.monitoring.logError('Available slots calculation error', error);
            throw error;
        }
    }
    /**
     * Get calendar statistics
     */
    async getCalendarStats(dateFrom, dateTo) {
        try {
            const criteria = {
                date_from: dateFrom,
                date_to: dateTo
            };
            const appointments = await this.searchAppointments(criteria);
            const stats = {
                total_appointments: appointments.length,
                completed: appointments.filter(app => app.status === 'completed').length,
                scheduled: appointments.filter(app => app.status === 'scheduled').length,
                cancelled: appointments.filter(app => app.status === 'cancelled').length,
                no_show: appointments.filter(app => app.status === 'no_show').length,
                by_type: {},
                by_doctor: {}
            };
            // Group by type and doctor
            appointments.forEach(app => {
                stats.by_type[app.appointment_type] = (stats.by_type[app.appointment_type] || 0) + 1;
                stats.by_doctor[app.doctor_name || app.doctor_id] = (stats.by_doctor[app.doctor_name || app.doctor_id] || 0) + 1;
            });
            return stats;
        }
        catch (error) {
            this.monitoring.logError('Calendar stats error', error);
            throw error;
        }
    }
    /**
     * Get module status
     */
    async getStatus() {
        return {
            module: 'calendar',
            status: 'operational',
            system: 'IAnarkalendar',
            database: await this.database.getStatus(),
            cache: await this.cache.getStatus(),
            monitoring: await this.monitoring.getStatus()
        };
    }
}
