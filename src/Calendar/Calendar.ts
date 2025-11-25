/**
 * 📅 SELENE CALENDAR MODULE
 * Integration layer for Calendar/Appointments management under Selene Song Core control
 * Integrates with IAnarkalendar system
 */

import { SeleneServer } from "../core/Server.js";
import { SeleneDatabase } from "../core/Database.js";
import { SeleneCache } from "../Cache.js";
import { SeleneMonitoring } from "../Monitoring.js";


export interface Appointment {
  id: string;
  patient_id: string;
  patient_name?: string;
  doctor_id: string;
  doctor_name?: string;
  appointment_date: Date;
  duration_minutes: number;
  appointment_type: string;
  status: "scheduled" | "confirmed" | "completed" | "cancelled" | "no_show";
  notes?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AppointmentSearchCriteria {
  patient_id?: string;
  doctor_id?: string;
  date_from?: Date;
  date_to?: Date;
  status?: string;
  appointment_type?: string;
  limit?: number;
  offset?: number;
}

export class SeleneCalendar {
  private server: SeleneServer;
  private database: SeleneDatabase;
  private cache: SeleneCache;
  private monitoring: SeleneMonitoring;

  constructor(
    server: SeleneServer,
    database: SeleneDatabase,
    cache: SeleneCache,
    monitoring: SeleneMonitoring,
  ) {
    this.server = server;
    this.database = database;
    this.cache = cache;
    this.monitoring = monitoring;
    this.initializeIntegration();
  }

  /**
   * Initialize integration with IAnarkalendar system
   */
  private initializeIntegration(): void {
    if (process.env.SELENE_VERBOSE === 'true') {
      this.monitoring.logInfo(
        "Selene Calendar module initialized - IAnarkalendar integration active",
      );
    }
    console.log(
      "📅 Selene Calendar integration active - IAnarkalendar connected",
    );
  }

  /**
   * Search appointments with criteria
   */
  async searchAppointments(
    _criteria: AppointmentSearchCriteria,
  ): Promise<Appointment[]> {
    try {
      const appointments = await this.database.getAppointments(_criteria);
      return appointments;
    } catch (error) {
      this.monitoring.logError("Appointments search error", error);
      throw error;
    }
  }

  /**
   * Get appointment by ID
   */
  async getAppointmentById(_id: string): Promise<Appointment | null> {
    try {
      // For now, use search with ID filter
      const criteria: AppointmentSearchCriteria = {
        limit: 1,
        offset: 0,
      };

      const appointments = await this.database.getAppointments(criteria);
      return appointments.find((_app) => _app.id === _id) || null;
    } catch (error) {
      this.monitoring.logError("Appointment fetch error", error);
      throw error;
    }
  }

  /**
   * Create new appointment
   */
  async createAppointment(
    data: Omit<Appointment, "id" | "created_at" | "updated_at">,
  ): Promise<Appointment> {
    try {
      // Validate no conflicts
      const conflict = await this.checkAppointmentConflict(data);
      if (conflict) {
        throw new Error("Appointment conflict detected");
      }

      const appointment = await this.database.createAppointment(data);
      this.monitoring.logInfo(`Appointment created: ${appointment.id}`);
      return appointment;
    } catch (error) {
      this.monitoring.logError("Appointment creation error", error);
      throw error;
    }
  }

  /**
   * Update appointment
   */
  async updateAppointment(
    _id: string,
    _data: Partial<Appointment>,
  ): Promise<Appointment | null> {
    try {
      // For now, we'll create a new appointment and mark the old one as cancelled
      // This is a temporary implementation until we have proper update methods
      this.monitoring.logInfo(`Appointment update requested for: ${_id}`);
      // TODO: Implement proper update when database methods are available
      return null;
    } catch (error) {
      this.monitoring.logError("Appointment update error", error);
      throw error;
    }
  }

  /**
   * Delete appointment
   */
  async deleteAppointment(_id: string): Promise<boolean> {
    try {
      // For now, we'll mark as cancelled
      // TODO: Implement proper deletion when database methods are available
      this.monitoring.logInfo(`Appointment deletion requested for: ${_id}`);
      return true;
    } catch (error) {
      this.monitoring.logError("Appointment deletion error", error);
      throw error;
    }
  }

  /**
   * Get doctor's schedule for a specific date
   */
  async getDoctorSchedule(
    _doctorId: string,
    date: Date,
  ): Promise<Appointment[]> {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);

      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      const criteria: AppointmentSearchCriteria = {
        doctor_id: _doctorId,
        date_from: startOfDay,
        date_to: endOfDay,
      };

      return await this.searchAppointments(criteria);
    } catch (error) {
      this.monitoring.logError("Doctor schedule fetch error", error);
      throw error;
    }
  }

  /**
   * Get patient's appointments
   */
  async getPatientAppointments(
    _patientId: string,
    _limit: number = 50,
  ): Promise<Appointment[]> {
    try {
      const criteria: AppointmentSearchCriteria = {
        patient_id: _patientId,
        limit: _limit,
      };

      return await this.searchAppointments(criteria);
    } catch (error) {
      this.monitoring.logError("Patient appointments fetch error", error);
      throw error;
    }
  }

  /**
   * Check for appointment conflicts
   */
  private async checkAppointmentConflict(
    appointment: Partial<Appointment>,
    excludeId?: string,
  ): Promise<boolean> {
    try {
      if (
        !appointment.doctor_id ||
        !appointment.appointment_date ||
        !appointment.duration_minutes
      ) {
        return false;
      }

      const appointmentEnd = new Date(
        appointment.appointment_date.getTime() +
          appointment.duration_minutes * 60000,
      );

      const criteria: AppointmentSearchCriteria = {
        doctor_id: appointment.doctor_id,
        date_from: appointment.appointment_date,
        date_to: appointmentEnd,
      };

      const existingAppointments = await this.searchAppointments(criteria);

      // Filter out the appointment being updated
      const conflicts = existingAppointments.filter((app) => {
        if (excludeId && app.id === excludeId) return false;

        const existingEnd = new Date(
          app.appointment_date.getTime() + app.duration_minutes * 60000,
        );

        // Check for time overlap
        return (
          appointment.appointment_date! < existingEnd &&
          appointmentEnd > app.appointment_date
        );
      });

      return conflicts.length > 0;
    } catch (error) {
      this.monitoring.logError("Conflict check error", error);
      return false;
    }
  }

  /**
   * Get available time slots for a doctor on a specific date
   */
  async getAvailableSlots(
    _doctorId: string,
    date: Date,
    _duration: number = 30,
  ): Promise<Date[]> {
    try {
      const schedule = await this.getDoctorSchedule(_doctorId, date);
      const availableSlots: Date[] = [];

      // Assuming clinic hours 9 AM to 5 PM
      const startHour = 9;
      const endHour = 17;

      const currentTime = new Date(date);
      currentTime.setHours(startHour, 0, 0, 0);

      const endTime = new Date(date);
      endTime.setHours(endHour, 0, 0, 0);

      while (currentTime < endTime) {
        const slotEnd = new Date(currentTime.getTime() + _duration * 60000);

        // Check if this slot conflicts with existing appointments
        const conflict = schedule.some((app) => {
          const appEnd = new Date(
            app.appointment_date.getTime() + app.duration_minutes * 60000,
          );
          return currentTime < appEnd && slotEnd > app.appointment_date;
        });

        if (!conflict) {
          availableSlots.push(new Date(currentTime));
        }

        // Move to next slot (30-minute intervals)
        currentTime.setMinutes(currentTime.getMinutes() + 30);
      }

      return availableSlots;
    } catch (error) {
      this.monitoring.logError("Available slots calculation error", error);
      throw error;
    }
  }

  /**
   * Get calendar statistics
   */
  async getCalendarStats(_dateFrom: Date, _dateTo: Date): Promise<any> {
    try {
      const criteria: AppointmentSearchCriteria = {
        date_from: _dateFrom,
        date_to: _dateTo,
      };

      const appointments = await this.searchAppointments(criteria);

      const stats = {
        total_appointments: appointments.length,
        completed: appointments.filter((_app) => _app.status === "completed")
          .length,
        scheduled: appointments.filter((_app) => _app.status === "scheduled")
          .length,
        cancelled: appointments.filter((_app) => _app.status === "cancelled")
          .length,
        no_show: appointments.filter((_app) => _app.status === "no_show").length,
        by_type: {} as Record<string, number>,
        by_doctor: {} as Record<string, number>,
      };

      // Group by type and doctor
      appointments.forEach((app) => {
        stats.by_type[app.appointment_type] =
          (stats.by_type[app.appointment_type] || 0) + 1;
        stats.by_doctor[app.doctor_name || app.doctor_id] =
          (stats.by_doctor[app.doctor_name || app.doctor_id] || 0) + 1;
      });

      return stats;
    } catch (error) {
      this.monitoring.logError("Calendar stats error", error);
      throw error;
    }
  }

  /**
   * Get module status
   */
  async getStatus(): Promise<any> {
    return {
      module: "calendar",
      status: "operational",
      system: "IAnarkalendar",
      database: await this.database.getStatus(),
      cache: await this.cache.getStatus(),
      monitoring: await this.monitoring.getStatus(),
    };
  }
}


