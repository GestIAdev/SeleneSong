/**
 * 🧩 SELENE PATIENTS MODULE
 * Integration layer for Patients management under Selene Song Core control
 */

import { SeleneServer } from "../core/Server.js";
import { SeleneDatabase } from "../core/Database.ts";
import { SeleneCache } from "../Cache.js";
import { SeleneMonitoring } from "../Monitoring.js";


export interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  birth_date?: Date;
  address?: string;
  medical_record_number?: string;
  created_at: Date;
  updated_at: Date;
}

export interface PatientSearchCriteria {
  name?: string;
  email?: string;
  phone?: string;
  medical_record_number?: string;
  limit?: number;
  offset?: number;
}

export class SelenePatients {
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
   * Initialize integration with existing systems
   */
  private initializeIntegration(): void {
    if (process.env.SELENE_VERBOSE === 'true') {
      this.monitoring.logInfo("Selene Patients module initialized");
    }
    console.log("🧩 Selene Patients integration active");
  }

  /**
   * Search patients with criteria
   */
  async searchPatients(_criteria: PatientSearchCriteria): Promise<Patient[]> {
    try {
      // For now, delegate to existing backend API
      // This will be enhanced with direct database access later
      const patients = await this.database.getPatients(_criteria);
      return patients;
    } catch (error) {
      this.monitoring.logError("Patients search error", error);
      throw error;
    }
  }

  /**
   * Get patient by ID
   */
  async getPatientById(_id: string): Promise<Patient | null> {
    try {
      const patient = await this.database.getPatientById(_id);
      return patient;
    } catch (error) {
      this.monitoring.logError("Patient fetch error", error);
      throw error;
    }
  }

  /**
   * Create new patient
   */
  async createPatient(
    _data: Omit<Patient, "id" | "created_at" | "updated_at">,
  ): Promise<Patient> {
    try {
      const patient = await this.database.createPatient(_data);
      this.monitoring.logInfo(`Patient created: ${patient.id}`);
      return patient;
    } catch (error) {
      this.monitoring.logError("Patient creation error", error);
      throw error;
    }
  }

  /**
   * Update patient
   */
  async updatePatient(
    id: string,
    _data: Partial<Patient>,
  ): Promise<Patient | null> {
    try {
      const patient = await this.database.updatePatient(id, _data);
      if (patient) {
        this.monitoring.logInfo(`Patient updated: ${id}`);
      }
      return patient;
    } catch (error) {
      this.monitoring.logError("Patient update error", error);
      throw error;
    }
  }

  /**
   * Delete patient
   */
  async deletePatient(id: string): Promise<boolean> {
    try {
      const deleted = await this.database.deletePatient(id);
      if (deleted) {
        this.monitoring.logInfo(`Patient deleted: ${id}`);
      }
      return deleted;
    } catch (error) {
      this.monitoring.logError("Patient deletion error", error);
      throw error;
    }
  }

  /**
   * Get autocomplete suggestions
   */
  async getAutocompleteSuggestions(
    query: string,
    _limit: number = 10,
  ): Promise<Patient[]> {
    try {
      if (!query || query.length < 2) {
        return [];
      }

      // For now, use simple search - will be enhanced with proper autocomplete later
      const criteria: PatientSearchCriteria = {
        name: query,
        limit: _limit,
      };

      return await this.searchPatients(criteria);
    } catch (error) {
      this.monitoring.logError("Autocomplete error", error);
      throw error;
    }
  }

  /**
   * Get module status
   */
  async getStatus(): Promise<any> {
    return {
      module: "patients",
      status: "operational",
      database: await this.database.getStatus(),
      cache: await this.cache.getStatus(),
      monitoring: await this.monitoring.getStatus(),
    };
  }
}


