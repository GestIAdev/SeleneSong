/**
 * 🗄️ SELENE DATABASE - TOTAL CONTROL MODULE
 * By PunkClaude & RaulVisionario - September 18, 2025
 *
 * MISSION: Complete database control (PostgreSQL + Redis)
 * STRATEGY: Nuclear-powered data management
 */

import { Pool } from "pg";
import { RedisClientType } from "redis";
import { redisManager } from "../RedisConnectionManager.ts";


interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
  ssl: boolean;
  maxConnections: number;
}

interface CacheConfig {
  host: string;
  port: number;
  password?: string;
  db: number;
}

/**
 * 🌟 SELENE DATABASE - THE DATA GOD
 * Complete control over PostgreSQL + Redis
 */
export class SeleneDatabase {
  private pool!: Pool;
  private redis!: RedisClientType | null; // 🔥 SANITACIÓN-QUIRÚRGICA: Allow null for lazy init
  private isConnected: boolean = false;
  private isRedisConnected: boolean = false;
  private lastRedisCheck: number = 0;
  private redisCheckInterval: number = 30000; // Check Redis every 30 seconds
  private dbConfig: DatabaseConfig;
  private cacheConfig: CacheConfig;
  private redisConnectionId: string;

  constructor() {
    console.log("🗄️ Initializing Selene Database...");

    this.dbConfig = {
      host: process.env.DB_HOST || "localhost",
      port: parseInt(process.env.DB_PORT || "5432"),
      database: process.env.DB_NAME || "dentiagest",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "11111111",
      ssl: process.env.DB_SSL === "true",
      maxConnections: parseInt(process.env.DB_MAX_CONNECTIONS || "20"),
    };

    this.cacheConfig = {
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
      password: process.env.REDIS_PASSWORD,
      db: parseInt(process.env.REDIS_DB || "0"),
    };

    // 🔥 SANITACIÓN-QUIRÚRGICA: Lazy init - DON'T create Redis client here (Bug #2 race condition fix)
    // 🔥 SANITACIÓN-QUIRÚRGICA FIX: REUSE client from waitForRedis() with unique node ID
    this.redis = null; // Initialize as null

    this.redisConnectionId = `selene-startup-${"selene-node"}`; // Unique per node: selene-startup-selene-node-1/2/3

    this.initializeConnections();
  }

  /**
   * 🔌 Initialize database connections
   */
  private async initializeConnections(): Promise<void> {
    try {
      // PostgreSQL connection
      this.pool = new Pool({
        host: this.dbConfig.host,
        port: this.dbConfig.port,
        database: this.dbConfig.database,
        user: this.dbConfig.user,
        password: this.dbConfig.password,
        ssl: this.dbConfig.ssl,
        max: this.dbConfig.maxConnections,
      });

      console.log("✅ Database connections initialized");
    } catch (error) {
      console.error("💥 Failed to initialize database connections:", error as Error);
      throw error;
    }
  }

  /**
   * 🚀 Connect to databases
   */
  public async connect(): Promise<void> {
    try {
      console.log("🔌 Connecting to databases...");

      // Test PostgreSQL connection
      const client = await this.pool.connect();
      await client.query("SELECT 1");
      client.release();
      console.log("✅ PostgreSQL connected");

      // 🔥 SANITACIÓN-QUIRÚRGICA FIX v2: REUSE existing client to avoid ECONNRESET
      if (!this.redis) {
        const existingClient = redisManager.getRedisClient(this.redisConnectionId);
        
        if (existingClient) {
          this.redis = existingClient;
          console.log(`🔌 Redis client REUSED from pool: ${this.redisConnectionId}`);
        } else {
          this.redis = redisManager.createRedisClient(this.redisConnectionId);
          console.log(`🔌 Redis client created (lazy init): ${this.redisConnectionId}`);
          
          // Connect explicitly
          try {
            const isConnected = await redisManager.ensureConnection(
              this.redis,
              this.redisConnectionId,
            );
            if (isConnected) {
              console.log("✅ Redis connected via RedisConnectionManager");
            } else {
              console.warn("⚠️ Redis connection failed, continuing without cache");
            }
          } catch (redisError) {
            console.warn(
              "⚠️ Redis connection failed, continuing without cache:",
              redisError instanceof Error ? redisError.message : String(redisError),
            );
          }
        }
      }

      this.isConnected = true;
      console.log("🎯 Selene Database operational (Redis optional)");
    } catch (error) {
      console.error("💥 Database connection failed:", error as Error);
      throw error;
    }
  }

  /**
   * 🔌 Disconnect from databases
   */
  public async disconnect(): Promise<void> {
    try {
      console.log("🔌 Disconnecting from databases...");

      await this.pool.end();
      await redisManager.closeConnection(this.redisConnectionId);

      this.isConnected = false;
      console.log("✅ Databases disconnected");
    } catch (error) {
      console.error("💥 Database disconnection error:", error as Error);
    }
  }

  /**
   * ⚡ Safe Redis operation wrapper
   * 🔥 SANITACIÓN-QUIRÚRGICA: Updated for lazy initialization (Bug #2 fix)
   */
  private async safeRedisOperation(
    _operation: () => Promise<any>,
    fallback: any = null,
  ): Promise<any> {
    try {
      // 🔥 Guard: If Redis not initialized yet, return fallback (cache miss)
      if (!this.redis) {
        console.warn("⚠️ Redis not initialized, skipping cache operation");
        return fallback;
      }
      return await _operation();
    } catch (error) {
      console.warn(
        "⚠️ Redis operation failed, continuing without cache:",
        error instanceof Error ? error.message : String(error),
      );
      return fallback;
    }
  }

  /**
   * 🔥 Get Redis client (helper for null-safety)
   * 🔥 SANITACIÓN-QUIRÚRGICA: Helper method for lazy initialization (Bug #2 fix)
   */
  private getRedis(): RedisClientType {
    if (!this.redis) {
      throw new Error("Redis client not initialized - call connect() first");
    }
    return this.redis;
  }

  /**
   * 👥 Get all patients with nuclear efficiency
   */
  public async getPatients(filters?: any): Promise<any[]> {
    const cacheKey = `patients:${JSON.stringify(filters || {})}`;

    try {
      // Try cache first
      const cached = await this.safeRedisOperation(() =>
        this.getRedis().get(cacheKey),
      );
      if (cached) {
        console.log("⚡ Patients served from cache");
        return JSON.parse(cached);
      }

      // Query database usando APOLLO_PATIENTS VIEW - V169 Schema Bridge
      let query = "SELECT * FROM apollo_patients";
      const params: any[] = [];

      if (filters) {
        if (filters.search) {
          query += " WHERE (name ILIKE $1 OR email ILIKE $1 OR phone ILIKE $1)";
          params.push(`%${filters.search}%`);
        }
        if (filters.status) {
          const whereClause = filters.search ? " AND" : " WHERE";
          query += `${whereClause} is_active = $${params.length + 1}`;
          params.push(filters.status === "active");
        }
      }

      query += " ORDER BY created_at DESC";

      if (filters?.limit) {
        query += ` LIMIT $${params.length + 1}`;
        params.push(filters.limit);
      }

      const result = await this.pool.query(query, params);
      const patients = result.rows;

      // Map database fields to GraphQL format
      const graphqlPatients = patients.map((dbPatient) => ({
        id: dbPatient.id,
        firstName: dbPatient.first_name,
        lastName: dbPatient.last_name,
        name: dbPatient.name || `${dbPatient.first_name || ''} ${dbPatient.last_name || ''}`.trim() || 'Unknown Patient', // 🔥 FIX: Use name from view directly
        fullName: dbPatient.name || `${dbPatient.first_name} ${dbPatient.last_name}`,
        email: dbPatient.email,
        phone: dbPatient.phone_primary,
        phoneSecondary: dbPatient.phone_secondary,
        dateOfBirth: dbPatient.date_of_birth,
        age: null, // Will be calculated if needed
        gender: dbPatient.gender,
        addressStreet: dbPatient.address_street,
        addressCity: dbPatient.address_city,
        addressState: dbPatient.address_state,
        addressPostalCode: dbPatient.address_postal_code,
        addressCountry: dbPatient.address_country,
        fullAddress: null, // Will be computed if needed
        emergencyContactName: dbPatient.emergency_contact_name,
        emergencyContactPhone: dbPatient.emergency_contact_phone,
        emergencyContactRelationship: dbPatient.emergency_contact_relationship,
        medicalConditions: dbPatient.medical_history,
        medicationsCurrent: dbPatient.current_medications,
        allergies: dbPatient.allergies,
        anxietyLevel: dbPatient.anxiety_level,
        specialNeeds: dbPatient.special_needs,
        insuranceProvider: dbPatient.insurance_provider,
        policyNumber: dbPatient.insurance_policy_number, // Corrected field name
        insuranceGroupNumber: dbPatient.insurance_group_number,
        insuranceStatus: dbPatient.insurance_provider
          ? "private"
          : "no_insurance",
        consentToTreatment: dbPatient.consent_to_treatment || false,
        consentToContact: dbPatient.consent_to_contact || true,
        preferredContactMethod: dbPatient.preferred_contact_method,
        notes: dbPatient.notes,
        isActive: dbPatient.is_active,
        createdAt: dbPatient.created_at,
        updatedAt: dbPatient.updated_at,
        hasInsurance: !!dbPatient.insurance_provider,
        requiresSpecialCare: !!(
          dbPatient.special_needs || dbPatient.anxiety_level
        ),
      }));

      // Cache results (don't fail if Redis is down)
      await this.safeRedisOperation(() =>
        this.getRedis().setEx(cacheKey, 300, JSON.stringify(graphqlPatients)),
      );

      return graphqlPatients;
    } catch (error) {
      console.error("💥 Failed to get patients:", error as Error);
      throw error;
    }
  }

  /**
   * 👤 Get patient by ID
   */
  public async getPatientById(id: string): Promise<any> {
    const cacheKey = `patient:${id}`;

    try {
      // Try cache first
      const cached = await this.safeRedisOperation(() =>
        this.getRedis().get(cacheKey),
      );
      if (cached) {
        return JSON.parse(cached);
      }

      const result = await this.pool.query(
        "SELECT * FROM patients WHERE id = $1 AND deleted_at IS NULL",
        [id],
      );

      if (result.rows.length === 0) {
        return null;
      }

      const dbPatient = result.rows[0];

      // Map database fields to GraphQL format
      const patient = {
        id: dbPatient.id,
        firstName: dbPatient.first_name,
        lastName: dbPatient.last_name,
        fullName: `${dbPatient.first_name} ${dbPatient.last_name}`,
        email: dbPatient.email,
        phone: dbPatient.phone_primary,
        phoneSecondary: dbPatient.phone_secondary,
        dateOfBirth: dbPatient.date_of_birth,
        age: null, // Will be calculated if needed
        gender: dbPatient.gender,
        addressStreet: dbPatient.address_street,
        addressCity: dbPatient.address_city,
        addressState: dbPatient.address_state,
        addressPostalCode: dbPatient.address_postal_code,
        addressCountry: dbPatient.address_country,
        fullAddress: null, // Will be computed if needed
        emergencyContactName: dbPatient.emergency_contact_name,
        emergencyContactPhone: dbPatient.emergency_contact_phone,
        emergencyContactRelationship: dbPatient.emergency_contact_relationship,
        medicalConditions: dbPatient.medical_history,
        medicationsCurrent: dbPatient.current_medications,
        allergies: dbPatient.allergies,
        anxietyLevel: dbPatient.anxiety_level,
        specialNeeds: dbPatient.special_needs,
        insuranceProvider: dbPatient.insurance_provider,
        policyNumber: dbPatient.insurance_policy_number, // Corrected field name
        insuranceGroupNumber: dbPatient.insurance_group_number,
        insuranceStatus: dbPatient.insurance_provider
          ? "private"
          : "no_insurance",
        consentToTreatment: dbPatient.consent_to_treatment || false,
        consentToContact: dbPatient.consent_to_contact || true,
        preferredContactMethod: dbPatient.preferred_contact_method,
        notes: dbPatient.notes,
        isActive: dbPatient.is_active,
        createdAt: dbPatient.created_at,
        updatedAt: dbPatient.updated_at,
        hasInsurance: !!dbPatient.insurance_provider,
        requiresSpecialCare: !!(
          dbPatient.special_needs || dbPatient.anxiety_level
        ),
      };

      // Cache result (don't fail if Redis is down)
      await this.safeRedisOperation(() =>
        this.getRedis().setEx(cacheKey, 600, JSON.stringify(patient)),
      );

      return patient;
    } catch (error) {
      console.error("💥 Failed to get patient:", error as Error);
      throw error;
    }
  }

  /**
   * ➕ Create new patient
   */
  public async createPatient(patientData: any): Promise<any> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `
        INSERT INTO patients (
          id, first_name, last_name, email, phone_primary, date_of_birth,
          address_country, medical_history, is_active, created_at, updated_at
        ) VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
        RETURNING *
      `,
        [
          patientData.firstName || patientData.first_name,
          patientData.lastName || patientData.last_name,
          patientData.email,
          patientData.phone,
          patientData.dateOfBirth || patientData.date_of_birth,
          "México", // Default country
          patientData.medicalHistory || patientData.medical_history || "",
          true, // is_active default to true
        ],
      );

      const dbPatient = result.rows[0];

      await client.query("COMMIT");

      // Invalidate cache
      await this.safeRedisOperation(() => this.invalidatePatientCache());

      // Emit real-time update
      await this.emitRealtimeUpdate("patients", "created", dbPatient);

      // Map database fields to GraphQL format
      const graphqlPatient = {
        id: dbPatient.id,
        firstName: dbPatient.first_name,
        lastName: dbPatient.last_name,
        fullName: `${dbPatient.first_name} ${dbPatient.last_name}`,
        email: dbPatient.email,
        phone: dbPatient.phone_primary,
        phoneSecondary: dbPatient.phone_secondary,
        dateOfBirth: dbPatient.date_of_birth,
        age: null, // Will be calculated if needed
        gender: dbPatient.gender,
        addressStreet: dbPatient.address_street,
        addressCity: dbPatient.address_city,
        addressState: dbPatient.address_state,
        addressPostalCode: dbPatient.address_postal_code,
        addressCountry: dbPatient.address_country,
        fullAddress: null, // Will be computed if needed
        emergencyContactName: dbPatient.emergency_contact_name,
        emergencyContactPhone: dbPatient.emergency_contact_phone,
        emergencyContactRelationship: dbPatient.emergency_contact_relationship,
        medicalConditions: dbPatient.medical_history,
        medicationsCurrent: dbPatient.current_medications,
        allergies: dbPatient.allergies,
        anxietyLevel: dbPatient.anxiety_level,
        specialNeeds: dbPatient.special_needs,
        insuranceProvider: dbPatient.insurance_provider,
        policyNumber: dbPatient.insurance_policy_number, // Corrected field name
        insuranceGroupNumber: dbPatient.insurance_group_number,
        insuranceStatus: dbPatient.insurance_provider
          ? "private"
          : "no_insurance",
        consentToTreatment: dbPatient.consent_to_treatment || false,
        consentToContact: dbPatient.consent_to_contact || true,
        preferredContactMethod: dbPatient.preferred_contact_method,
        notes: dbPatient.notes,
        isActive: dbPatient.is_active,
        createdAt: dbPatient.created_at,
        updatedAt: dbPatient.updated_at,
        hasInsurance: !!dbPatient.insurance_provider,
        requiresSpecialCare: !!(
          dbPatient.special_needs || dbPatient.anxiety_level
        ),
      };

      return graphqlPatient;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to create patient:", error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * ✏️ Update patient
   */
  public async updatePatient(id: string, patientData: any): Promise<any> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `
        UPDATE patients SET
          first_name = $1, last_name = $2, email = $3, phone_primary = $4, date_of_birth = $5,
          address_country = $6, medical_history = $7,
          updated_at = NOW()
        WHERE id = $8 AND deleted_at IS NULL
        RETURNING *
      `,
        [
          patientData.firstName || patientData.first_name,
          patientData.lastName || patientData.last_name,
          patientData.email,
          patientData.phone,
          patientData.dateOfBirth || patientData.date_of_birth,
          "México", // Default country
          patientData.medicalHistory || patientData.medical_history,
          id,
        ],
      );

      if (result.rows.length === 0) {
        throw new Error("Patient not found");
      }

      const patient = result.rows[0];

      await client.query("COMMIT");

      // Invalidate cache
      await this.invalidatePatientCache(id);

      // Emit real-time update
      await this.emitRealtimeUpdate("patients", "updated", patient);

      // 🔥 MAP DATABASE FIELDS TO GRAPHQL FORMAT
      return {
        id: patient.id,
        name: patient.name || `${patient.first_name || ''} ${patient.last_name || ''}`.trim() || 'Unknown Patient',
        firstName: patient.first_name,
        lastName: patient.last_name,
        fullName: patient.name || `${patient.first_name} ${patient.last_name}`,
        email: patient.email,
        phone: patient.phone_primary,
        phoneSecondary: patient.phone_secondary,
        dateOfBirth: patient.date_of_birth,
        age: null,
        gender: patient.gender,
        addressStreet: patient.address_street,
        addressCity: patient.address_city,
        addressState: patient.address_state,
        addressPostalCode: patient.address_postal_code,
        addressCountry: patient.address_country,
        fullAddress: null,
        emergencyContactName: patient.emergency_contact_name,
        emergencyContactPhone: patient.emergency_contact_phone,
        emergencyContact: patient.emergency_contact_name && patient.emergency_contact_phone
          ? JSON.stringify({ name: patient.emergency_contact_name, phone: patient.emergency_contact_phone })
          : null,
        medicalConditions: patient.medical_conditions,
        medicationsCurrent: patient.current_medications,
        allergies: patient.allergies,
        anxietyLevel: patient.anxiety_level,
        insuranceProvider: patient.insurance_provider,
        insuranceStatus: patient.insurance_provider ? 'active' : 'no_insurance',
        policyNumber: patient.policy_number,
        medicalHistory: patient.medical_history,
        billingStatus: 'pending',
        consentToTreatment: patient.consent_to_treatment || false,
        consentToContact: patient.consent_to_contact !== false,
        isActive: patient.is_active !== false,
        createdAt: patient.created_at,
        updatedAt: patient.updated_at
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to update patient:", error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 🗑️ Delete patient (soft delete)
   */
  public async deletePatient(id: string): Promise<boolean> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `
        UPDATE patients SET
          deleted_at = NOW(),
          updated_at = NOW()
        WHERE id = $1 AND deleted_at IS NULL
        RETURNING id
      `,
        [id],
      );

      await client.query("COMMIT");

      if (result.rows.length === 0) {
        return false;
      }

      // Invalidate cache
      await this.invalidatePatientCache(id);

      // Emit real-time update
      await this.emitRealtimeUpdate("patients", "deleted", { id });

      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to delete patient:", error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  // ==========================================
  // 📅 APPOINTMENTS OPERATIONS
  // ==========================================

  /**
   * 📅 Get all appointments
   */
  /**
   * � GET APPOINTMENTS - GraphQL Migration v1.0
   * ✅ MAPEO COMPLETO: snake_case DB → camelCase GraphQL
   * ✅ FIELDS: id, patientId, practitionerId, date, time, appointmentDate, appointmentTime, duration, type, status, notes, createdAt, updatedAt
   */
  public async getAppointments(filters?: any): Promise<any[]> {
    try {
      // PUNK FIX: Query usando medical_records en lugar de apollo_appointments (que no existe)
      let query = `
        SELECT 
          id,
          patient_id,
          created_by,
          visit_date,
          procedure_category,
          treatment_status,
          clinical_notes,
          created_at,
          updated_at
        FROM medical_records 
        WHERE is_active = true AND deleted_at IS NULL AND patient_id IS NOT NULL
      `;
      const params: any[] = [];

      if (filters) {
        if (filters.patientId) {
          query += ` AND patient_id = $${params.length + 1}`;
          params.push(filters.patientId);
        }
        if (filters.date) {
          query += ` AND TO_CHAR(visit_date, 'YYYY-MM-DD') = $${params.length + 1}`;
          params.push(filters.date);
        }
        if (filters.status) {
          query += ` AND treatment_status = $${params.length + 1}`;
          params.push(filters.status);
        }
      }

      query += " ORDER BY visit_date DESC";

      const result = await this.pool.query(query, params);
      
      // ✅ MAPEO: Extraer fecha y hora de visit_date timestamp
      return result.rows.map((dbRow) => ({
        id: dbRow.id,
        patientId: dbRow.patient_id,
        practitionerId: dbRow.created_by,
        date: dbRow.visit_date
          ? new Date(dbRow.visit_date).toISOString().split("T")[0]
          : null,
        time: dbRow.visit_date
          ? new Date(dbRow.visit_date).toISOString().split("T")[1].slice(0, 5)
          : null,
        appointmentDate: dbRow.visit_date
          ? new Date(dbRow.visit_date).toISOString().split("T")[0]
          : null,
        appointmentTime: dbRow.visit_date
          ? new Date(dbRow.visit_date).toISOString().split("T")[1].slice(0, 5)
          : null,
        duration: 60, // Default 60 min
        type: dbRow.procedure_category || "regular",
        status:
          dbRow.treatment_status === "COMPLETED"
            ? "completed"
            : dbRow.treatment_status === "IN_PROGRESS"
              ? "in_progress"
              : "scheduled",
        notes: dbRow.clinical_notes || "",
        createdAt: dbRow.created_at,
        updatedAt: dbRow.updated_at,
      }));
    } catch (error) {
      console.error("💥 Failed to get appointments:", error as Error);
      throw error;
    }
  }

  /**
   * ➕ CREATE APPOINTMENT - GraphQL Migration v1.0
   * ✅ MAPEO COMPLETO: camelCase input → snake_case DB → camelCase output
   * ✅ RETURNS: Mapped appointment object with createdAt/updatedAt
   */
  public async createAppointment(appointmentData: any): Promise<any> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `
        INSERT INTO appointments (
          id, patient_id, dentist_id, scheduled_date,
          duration_minutes, appointment_type, status, priority,
          title, notes, created_at, updated_at, created_by
        ) VALUES (
          gen_random_uuid(), 
          $1, 
          COALESCE($2::uuid, (SELECT id FROM users ORDER BY created_at ASC LIMIT 1)), 
          $3, 
          $4, 
          $5::appointmenttype, 
          $6::appointmentstatus,
          $7::appointmentpriority,
          $8,
          $9, 
          NOW(), 
          NOW(),
          COALESCE($2::uuid, (SELECT id FROM users ORDER BY created_at ASC LIMIT 1))
        )
        RETURNING *
      `,
        [
          appointmentData.patientId,
          appointmentData.practitionerId || null,
          `${appointmentData.appointmentDate} ${appointmentData.appointmentTime}`,
          appointmentData.duration || 30,
          appointmentData.type || "CONSULTATION", // ✅ DEFAULT ENUM VALUE
          appointmentData.status || "SCHEDULED", // ✅ DEFAULT ENUM VALUE
          appointmentData.priority || "NORMAL", // ✅ DEFAULT ENUM VALUE (UPPERCASE)
          appointmentData.title || `Appointment on ${appointmentData.appointmentDate}`,
          appointmentData.notes || "",
        ],
      );

      await client.query("COMMIT");

      const dbRow = result.rows[0];

      // ✅ MAPEO: Extraer fecha y hora de scheduled_date timestamp
      const scheduledDate = new Date(dbRow.scheduled_date);
      const appointmentDate = scheduledDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const appointmentTime = scheduledDate.toTimeString().slice(0, 5); // HH:MM

      // ✅ MAPEO COMPLETO snake_case → camelCase
      const appointment = {
        id: dbRow.id,
        patientId: dbRow.patient_id,
        practitionerId: dbRow.dentist_id,
        appointmentDate,
        appointmentTime,
        duration: dbRow.duration_minutes,
        type: dbRow.appointment_type,
        status: dbRow.status,
        notes: dbRow.notes,
        createdAt: dbRow.created_at,
        updatedAt: dbRow.updated_at,
      };

      // Invalidate cache
      await this.invalidateAppointmentCache();

      // Emit real-time update
      await this.emitRealtimeUpdate("appointments", "created", appointment);

      return appointment;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to create appointment:", error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * ✏️ UPDATE APPOINTMENT - GraphQL Migration v1.0
   * ✅ MAPEO COMPLETO: camelCase input → snake_case DB → camelCase output
   * ✅ RETURNS: Mapped appointment with updatedAt (CRITICAL!)
   */
  public async updateAppointment(id: string, data: any): Promise<any> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // Build dynamic UPDATE query
      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      // Handle scheduledDate (timestamp column in DB)
      if (data.scheduledDate !== undefined) {
        fields.push(`scheduled_date = $${paramIndex++}`);
        values.push(data.scheduledDate);
      }
      if (data.duration !== undefined) {
        fields.push(`duration_minutes = $${paramIndex++}`);
        values.push(data.duration);
      }
      if (data.type !== undefined) {
        fields.push(`appointment_type = $${paramIndex++}::appointmenttype`);
        values.push(data.type);
      }
      if (data.status !== undefined) {
        fields.push(`status = $${paramIndex++}::appointmentstatus`);
        values.push(data.status);
      }
      if (data.notes !== undefined) {
        fields.push(`notes = $${paramIndex++}`);
        values.push(data.notes);
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const result = await client.query(
        `UPDATE appointments SET ${fields.join(", ")} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
        values,
      );

      await client.query("COMMIT");

      if (result.rows.length === 0) {
        throw new Error("Appointment not found");
      }

      const dbRow = result.rows[0];

      // ✅ MAPEO COMPLETO snake_case → camelCase
      // Extract date and time from scheduled_date timestamp
      const scheduledDate = new Date(dbRow.scheduled_date);
      const appointmentDate = scheduledDate.toISOString().split("T")[0];
      const appointmentTime = scheduledDate.toTimeString().slice(0, 5);

      const appointment = {
        id: dbRow.id,
        patientId: dbRow.patient_id,
        practitionerId: dbRow.dentist_id,
        appointmentDate: appointmentDate,
        appointmentTime: appointmentTime,
        duration: dbRow.duration_minutes,
        type: dbRow.appointment_type,
        status: dbRow.status,
        notes: dbRow.notes,
        createdAt: dbRow.created_at,
        updatedAt: dbRow.updated_at, // 🔥 CRITICAL - GraphQL espera esto
      };

      console.log("💥 UPDATE APPOINTMENT RETURNING:", JSON.stringify(appointment, null, 2));

      // Invalidate cache
      await this.invalidateAppointmentCache();

      // Emit real-time update
      await this.emitRealtimeUpdate("appointments", "updated", appointment);

      return appointment;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to update appointment:", error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 🗑️ DELETE APPOINTMENT - GraphQL Migration v1.0
   * ✅ Soft delete with deleted_at timestamp
   * ✅ RETURNS: boolean success
   */
  public async deleteAppointment(id: string): Promise<boolean> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `UPDATE appointments SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
        [id],
      );

      await client.query("COMMIT");

      if (result.rows.length === 0) {
        throw new Error("Appointment not found");
      }

      // Invalidate cache
      await this.invalidateAppointmentCache();

      // Emit real-time update
      await this.emitRealtimeUpdate("appointments", "deleted", { id });

      return true;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to delete appointment:", error as Error);
      return false;
    } finally {
      client.release();
    }
  }

  // ==========================================
  // 🩺 TREATMENTS OPERATIONS
  // ==========================================

  /**
   * 🩺 GET TREATMENTS - GraphQL Migration v1.0
   * ✅ MAPEO COMPLETO: snake_case DB → camelCase GraphQL
   * ✅ FIELDS: id, patientId, practitionerId, treatmentType, description, status, startDate, endDate, cost, notes, aiRecommendations, veritasScore, createdAt, updatedAt
   */
  public async getTreatments(filters?: any): Promise<any[]> {
    try {
      // Query treatments from medical_records table
      let query = `
        SELECT
          id,
          patient_id,
          created_by,
          procedure_category,
          diagnosis,
          treatment_status,
          visit_date,
          follow_up_date,
          estimated_cost,
          clinical_notes,
          created_at,
          updated_at
        FROM medical_records
        WHERE is_active = true AND deleted_at IS NULL
      `;
      const params: any[] = [];

      if (filters) {
        if (filters.patientId) {
          query += ` AND patient_id = $${params.length + 1}`;
          params.push(filters.patientId);
        }
        if (filters.status) {
          query += ` AND treatment_status = $${params.length + 1}`;
          params.push(filters.status);
        }
      }

      query += " ORDER BY created_at DESC";

      if (filters?.limit) {
        query += ` LIMIT $${params.length + 1}`;
        params.push(filters.limit);
      }

      const result = await this.pool.query(query, params);

      // ✅ MAPEO COMPLETO snake_case → camelCase con FALLBACKS para non-nullable fields
      return result.rows.map((dbRow) => ({
        id: dbRow.id,
        patientId: dbRow.patient_id,
        practitionerId: dbRow.created_by || "unknown", // Schema: practitionerId: ID!
        treatmentType: dbRow.procedure_category || "general", // Schema: treatmentType: String!
        description: dbRow.diagnosis || "No description", // Schema: description: String!
        status: dbRow.treatment_status || "pending", // Schema: status: String!
        startDate: dbRow.visit_date || new Date().toISOString(), // Schema: startDate: String!
        endDate: dbRow.follow_up_date,
        cost: dbRow.estimated_cost || 0,
        notes: dbRow.clinical_notes || "",
        aiRecommendations: [], // Default empty array
        veritasScore: 0, // Default 0
        createdAt: dbRow.created_at || new Date().toISOString(), // Schema: createdAt: String!
        updatedAt: dbRow.updated_at || new Date().toISOString(), // Schema: updatedAt: String!
      }));
    } catch (error) {
      console.error("💥 Failed to get treatments:", error as Error);
      throw error;
    }
  }

  /**
   * ➕ CREATE TREATMENT - GraphQL Migration v1.0
   * ✅ MAPEO COMPLETO: camelCase input → snake_case DB → camelCase output
   */
  public async createTreatment(data: any): Promise<any> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `
        INSERT INTO medical_records (
          patient_id, created_by, procedure_category,
          diagnosis, treatment_status, visit_date,
          follow_up_date, estimated_cost, clinical_notes,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
        RETURNING *
      `,
        [
          data.patientId,
          data.practitionerId,
          data.treatmentType || "general",
          data.description || "",
          data.status || "pending",
          data.startDate || new Date(),
          data.endDate,
          data.cost || 0,
          data.notes || "",
        ],
      );

      await client.query("COMMIT");

      const dbRow = result.rows[0];

      // ✅ MAPEO COMPLETO
      return {
        id: dbRow.id,
        patientId: dbRow.patient_id,
        practitionerId: dbRow.created_by,
        treatmentType: dbRow.procedure_category,
        description: dbRow.diagnosis,
        status: dbRow.treatment_status,
        startDate: dbRow.visit_date,
        endDate: dbRow.follow_up_date,
        cost: dbRow.estimated_cost,
        notes: dbRow.clinical_notes,
        aiRecommendations: [],
        veritasScore: 0,
        createdAt: dbRow.created_at,
        updatedAt: dbRow.updated_at,
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to create treatment:", error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * ✏️ UPDATE TREATMENT - GraphQL Migration v1.0
   * ✅ MAPEO COMPLETO con updatedAt (CRITICAL!)
   */
  public async updateTreatment(id: string, data: any): Promise<any> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.treatmentType !== undefined) {
        fields.push(`procedure_category = $${paramIndex++}`);
        values.push(data.treatmentType);
      }
      if (data.description !== undefined) {
        fields.push(`diagnosis = $${paramIndex++}`);
        values.push(data.description);
      }
      if (data.status !== undefined) {
        fields.push(`treatment_status = $${paramIndex++}`);
        values.push(data.status);
      }
      if (data.startDate !== undefined) {
        fields.push(`visit_date = $${paramIndex++}`);
        values.push(data.startDate);
      }
      if (data.endDate !== undefined) {
        fields.push(`follow_up_date = $${paramIndex++}`);
        values.push(data.endDate);
      }
      if (data.cost !== undefined) {
        fields.push(`estimated_cost = $${paramIndex++}`);
        values.push(data.cost);
      }
      if (data.notes !== undefined) {
        fields.push(`clinical_notes = $${paramIndex++}`);
        values.push(data.notes);
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const result = await client.query(
        `UPDATE medical_records SET ${fields.join(", ")} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
        values,
      );

      await client.query("COMMIT");

      if (result.rows.length === 0) {
        throw new Error("Treatment not found");
      }

      const dbRow = result.rows[0];

      // ✅ MAPEO COMPLETO
      return {
        id: dbRow.id,
        patientId: dbRow.patient_id,
        practitionerId: dbRow.created_by,
        treatmentType: dbRow.procedure_category,
        description: dbRow.diagnosis,
        status: dbRow.treatment_status,
        startDate: dbRow.visit_date,
        endDate: dbRow.follow_up_date,
        cost: dbRow.estimated_cost,
        notes: dbRow.clinical_notes,
        aiRecommendations: [],
        veritasScore: 0,
        createdAt: dbRow.created_at,
        updatedAt: dbRow.updated_at, // 🔥 CRITICAL
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to update treatment:", error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 🗑️ DELETE TREATMENT - GraphQL Migration v1.0
   * ✅ Soft delete
   */
  public async deleteTreatment(id: string): Promise<boolean> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `UPDATE medical_records SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
        [id],
      );

      await client.query("COMMIT");

      return result.rows.length > 0;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to delete treatment:", error as Error);
      return false;
    } finally {
      client.release();
    }
  }

  // ==========================================
  // 📄 DOCUMENTS OPERATIONS
  // ==========================================

  /**
   * 📄 GET DOCUMENTS - GraphQL Migration v3.0 - FULL SCHEMA
   * ✅ MAPEO COMPLETO: snake_case DB → camelCase GraphQL
   * ✅ FULL FIELDS: Todos los campos de medical_documents incluyendo AI, @veritas, DICOM, embeddings
   */
  public async getDocuments(filters?: any): Promise<any[]> {
    try {
      let query = `
        SELECT
          md.id,
          md.patient_id,
          md.medical_record_id,
          md.appointment_id,
          md.document_type,
          md.title,
          md.description,
          md.file_name,
          md.file_path,
          md.file_size,
          md.mime_type,
          md.file_extension,
          md.image_width,
          md.image_height,
          md.image_quality,
          md.tooth_numbers,
          md.anatomical_region,
          md.clinical_notes,
          md.document_date,
          md.expiry_date,
          md.access_level,
          md.is_confidential,
          md.password_protected,
          md.ai_analyzed,
          md.ai_analysis_results,
          md.ai_confidence_scores,
          md.ocr_extracted_text,
          md.ai_tags,
          md.ai_anomalies_detected,
          md.image_embeddings,
          md.audio_duration_seconds,
          md.audio_transcription,
          md.speaker_id,
          md.dicom_metadata,
          md.version,
          md.parent_document_id,
          md.is_active,
          md.is_archived,
          md.created_at,
          md.updated_at,
          md.created_by,
          md.updated_by,
          md.unified_type,
          md.legal_category,
          p.first_name,
          p.last_name
        FROM medical_documents md
        LEFT JOIN patients p ON md.patient_id = p.id
        WHERE md.deleted_at IS NULL
      `;
      const params: any[] = [];

      if (filters) {
        if (filters.patientId) {
          query += ` AND md.patient_id = $${params.length + 1}`;
          params.push(filters.patientId);
        }
        if (filters.documentType) {
          query += ` AND md.document_type = $${params.length + 1}`;
          params.push(filters.documentType);
        }
        if (filters.unifiedType) {
          query += ` AND md.unified_type = $${params.length + 1}`;
          params.push(filters.unifiedType);
        }
      }

      query += " ORDER BY md.created_at DESC";

      if (filters?.limit) {
        query += ` LIMIT $${params.length + 1}`;
        params.push(filters.limit);
      }
      if (filters?.offset) {
        query += ` OFFSET $${params.length + 1}`;
        params.push(filters.offset);
      }

      const result = await this.pool.query(query, params);

      // ✅ MAPEO COMPLETO snake_case → camelCase con TODOS los campos
      return result.rows.map((dbRow) => ({
        id: dbRow.id,
        patient_id: dbRow.patient_id,
        medical_record_id: dbRow.medical_record_id,
        appointment_id: dbRow.appointment_id,
        document_type: dbRow.document_type,
        title: dbRow.title,
        description: dbRow.description || "",
        file_name: dbRow.file_name,
        file_path: dbRow.file_path,
        file_size: dbRow.file_size,
        file_size_mb: dbRow.file_size ? (dbRow.file_size / (1024 * 1024)).toFixed(2) : 0,
        mime_type: dbRow.mime_type,
        file_extension: dbRow.file_extension,
        is_image: dbRow.mime_type?.startsWith('image/') || false,
        is_xray: dbRow.document_type === 'xray' || dbRow.unified_type === 'xray',
        image_width: dbRow.image_width,
        image_height: dbRow.image_height,
        image_quality: dbRow.image_quality,
        tooth_numbers: Array.isArray(dbRow.tooth_numbers) ? dbRow.tooth_numbers : (dbRow.tooth_numbers ? JSON.parse(dbRow.tooth_numbers) : []),
        anatomical_region: dbRow.anatomical_region,
        clinical_notes: dbRow.clinical_notes,
        document_date: dbRow.document_date,
        expiry_date: dbRow.expiry_date,
        access_level: dbRow.access_level,
        is_confidential: dbRow.is_confidential || false,
        password_protected: dbRow.password_protected || false,
        ai_analyzed: dbRow.ai_analyzed || false,
        ai_analysis_results: typeof dbRow.ai_analysis_results === 'object' ? dbRow.ai_analysis_results : (dbRow.ai_analysis_results ? JSON.parse(dbRow.ai_analysis_results) : null),
        ai_confidence_scores: typeof dbRow.ai_confidence_scores === 'object' ? dbRow.ai_confidence_scores : (dbRow.ai_confidence_scores ? JSON.parse(dbRow.ai_confidence_scores) : null),
        ocr_extracted_text: dbRow.ocr_extracted_text,
        ai_tags: Array.isArray(dbRow.ai_tags) ? dbRow.ai_tags : (dbRow.ai_tags ? JSON.parse(dbRow.ai_tags) : []),
        smart_tags: Array.isArray(dbRow.ai_tags) ? dbRow.ai_tags : (dbRow.ai_tags ? JSON.parse(dbRow.ai_tags) : []), // Alias
        ai_anomalies_detected: dbRow.ai_anomalies_detectadas || false,
        image_embeddings: dbRow.image_embeddings,
        audio_duration_seconds: dbRow.audio_duration_seconds,
        audio_transcription: dbRow.audio_transcription,
        speaker_id: dbRow.speaker_id,
        dicom_metadata: typeof dbRow.dicom_metadata === 'object' ? dbRow.dicom_metadata : (dbRow.dicom_metadata ? JSON.parse(dbRow.dicom_metadata) : null),
        version: dbRow.version || 1,
        parent_document_id: dbRow.parent_document_id,
        is_active: dbRow.is_active !== false,
        is_archived: dbRow.is_archived || false,
        created_at: dbRow.created_at,
        updated_at: dbRow.updated_at,
        created_by: dbRow.created_by,
        updated_by: dbRow.updated_by,
        unified_type: dbRow.unified_type || dbRow.document_type,
        legal_category: dbRow.legal_category,
        download_url: dbRow.file_path ? `/api/documents/${dbRow.id}/download` : '',
        thumbnail_url: dbRow.is_image ? `/api/documents/${dbRow.id}/thumbnail` : null,
        compliance_status: 'compliant', // TODO: Implement compliance check
        patient: dbRow.first_name && dbRow.last_name ? {
          id: dbRow.patient_id,
          first_name: dbRow.first_name,
          last_name: dbRow.last_name
        } : null
      }));
    } catch (error) {
      console.error("💥 Failed to get documents:", error as Error);
      throw error;
    }
  }

  /**
   * ➕ CREATE DOCUMENT - GraphQL Migration v3.0 - FULL SCHEMA
   * ✅ MAPEO COMPLETO: camelCase input → snake_case DB → camelCase output
   * ✅ FULL FIELDS: Todos los campos de medical_documents
   */
  public async createDocument(data: any): Promise<any> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `
        INSERT INTO medical_documents (
          patient_id,
          medical_record_id,
          appointment_id,
          document_type,
          title,
          description,
          file_name,
          file_path,
          file_size,
          mime_type,
          file_extension,
          image_width,
          image_height,
          image_quality,
          tooth_numbers,
          anatomical_region,
          clinical_notes,
          document_date,
          expiry_date,
          access_level,
          is_confidential,
          password_protected,
          ai_analyzed,
          ai_analysis_results,
          ai_confidence_scores,
          ocr_extracted_text,
          ai_tags,
          ai_anomalies_detected,
          created_by,
          unified_type,
          legal_category,
          is_active
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
          $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32
        )
        RETURNING *
      `,
        [
          data.patientId,
          data.medicalRecordId || null,
          data.appointmentId || null,
          data.documentType || "other",
          data.title,
          data.description || "",
          data.fileName,
          data.filePath,
          data.fileSize || 0,
          data.mimeType || "application/octet-stream",
          data.fileExtension || (data.fileName ? data.fileName.split('.').pop() : null),
          data.imageWidth || null,
          data.imageHeight || null,
          data.imageQuality || null,
          data.toothNumbers ? JSON.stringify(data.toothNumbers) : null,
          data.anatomicalRegion || null,
          data.clinicalNotes || "",
          data.documentDate || new Date().toISOString(),
          data.expiryDate || null,
          data.accessLevel || "PRIVATE",
          data.isConfidential !== undefined ? data.isConfidential : false,
          data.passwordProtected !== undefined ? data.passwordProtected : false,
          data.aiAnalyzed !== undefined ? data.aiAnalyzed : false,
          data.aiAnalysisResults ? JSON.stringify(data.aiAnalysisResults) : null,
          data.aiConfidenceScores ? JSON.stringify(data.aiConfidenceScores) : null,
          data.ocrExtractedText || null,
          data.aiTags ? JSON.stringify(data.aiTags) : null,
          data.aiAnomaliesDetected !== undefined ? data.aiAnomaliesDetected : false,
          data.createdBy || data.uploadedBy || "system",
          data.unifiedType || data.documentType || "other",
          data.legalCategory || null,
          data.isActive !== undefined ? data.isActive : true
        ],
      );

      await client.query("COMMIT");

      const dbRow = result.rows[0];

      // ✅ MAPEO COMPLETO snake_case → camelCase
      return {
        id: dbRow.id,
        patient_id: dbRow.patient_id,
        medical_record_id: dbRow.medical_record_id,
        appointment_id: dbRow.appointment_id,
        document_type: dbRow.document_type,
        title: dbRow.title,
        description: dbRow.description,
        file_name: dbRow.file_name,
        file_path: dbRow.file_path,
        file_size: dbRow.file_size,
        file_size_mb: dbRow.file_size ? (dbRow.file_size / (1024 * 1024)).toFixed(2) : 0,
        mime_type: dbRow.mime_type,
        file_extension: dbRow.file_extension,
        is_image: dbRow.mime_type?.startsWith('image/') || false,
        is_xray: dbRow.document_type === 'xray' || dbRow.unified_type === 'xray',
        image_width: dbRow.image_width,
        image_height: dbRow.image_height,
        image_quality: dbRow.image_quality,
        tooth_numbers: typeof dbRow.tooth_numbers === 'string' ? JSON.parse(dbRow.tooth_numbers) : (dbRow.tooth_numbers || []),
        anatomical_region: dbRow.anatomical_region,
        clinical_notes: dbRow.clinical_notes,
        document_date: dbRow.document_date,
        expiry_date: dbRow.expiry_date,
        access_level: dbRow.access_level,
        is_confidential: dbRow.is_confidential,
        password_protected: dbRow.password_protected,
        ai_analyzed: dbRow.ai_analyzed,
        ai_analysis_results: typeof dbRow.ai_analysis_results === 'string' ? JSON.parse(dbRow.ai_analysis_results) : dbRow.ai_analysis_results,
        ai_confidence_scores: typeof dbRow.ai_confidence_scores === 'string' ? JSON.parse(dbRow.ai_confidence_scores) : dbRow.ai_confidence_scores,
        ocr_extracted_text: dbRow.ocr_extracted_text,
        ai_tags: typeof dbRow.ai_tags === 'string' ? JSON.parse(dbRow.ai_tags) : (dbRow.ai_tags || []),
        smart_tags: typeof dbRow.ai_tags === 'string' ? JSON.parse(dbRow.ai_tags) : (dbRow.ai_tags || []),
        ai_anomalies_detected: dbRow.ai_anomalies_detected,
        created_at: dbRow.created_at,
        updated_at: dbRow.updated_at,
        created_by: dbRow.created_by,
        updated_by: dbRow.updated_by,
        unified_type: dbRow.unified_type,
        legal_category: dbRow.legal_category,
        download_url: `/api/documents/${dbRow.id}/download`,
        thumbnail_url: dbRow.mime_type?.startsWith('image/') ? `/api/documents/${dbRow.id}/thumbnail` : null,
        compliance_status: 'compliant',
        is_active: dbRow.is_active
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to create document:", error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * ✏️ UPDATE DOCUMENT - GraphQL Migration v1.0
   * ✅ MAPEO COMPLETO con lastModified (CRITICAL!)
   */
  public async updateDocument(id: string, data: any): Promise<any> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.title !== undefined) {
        fields.push(`title = $${paramIndex++}`);
        values.push(data.title);
      }
      if (data.description !== undefined) {
        fields.push(`description = $${paramIndex++}`);
        values.push(data.description);
      }
      if (data.documentType !== undefined) {
        fields.push(`document_type = $${paramIndex++}`);
        values.push(data.documentType);
      }
      if (data.tags !== undefined) {
        fields.push(`tags = $${paramIndex++}`);
        values.push(JSON.stringify(data.tags));
      }
      if (data.metadata !== undefined) {
        fields.push(`metadata = $${paramIndex++}`);
        values.push(JSON.stringify(data.metadata));
      }

      fields.push(`last_modified = NOW()`);
      values.push(id);

      const result = await client.query(
        `UPDATE medical_documents SET ${fields.join(", ")} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
        values,
      );

      await client.query("COMMIT");

      if (result.rows.length === 0) {
        throw new Error("Document not found");
      }

      const dbRow = result.rows[0];

      // ✅ MAPEO COMPLETO
      return {
        id: dbRow.id,
        patientId: dbRow.patient_id,
        patientName: dbRow.patient_name,
        documentType: dbRow.document_type,
        title: dbRow.title,
        description: dbRow.description,
        fileName: dbRow.file_name,
        filePath: dbRow.file_path,
        fileSize: dbRow.file_size,
        mimeType: dbRow.mime_type,
        tags: Array.isArray(dbRow.tags) ? dbRow.tags : JSON.parse(dbRow.tags || "[]"),
        metadata: typeof dbRow.metadata === "object" ? dbRow.metadata : JSON.parse(dbRow.metadata || "{}"),
        uploadedBy: dbRow.uploaded_by,
        uploadedAt: dbRow.uploaded_at,
        lastModified: dbRow.last_modified, // 🔥 CRITICAL
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to update document:", error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 🗑️ DELETE DOCUMENT - GraphQL Migration v1.0
   * ✅ Soft delete
   */
  public async deleteDocument(id: string): Promise<boolean> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `UPDATE medical_documents SET deleted_at = NOW(), last_modified = NOW() WHERE id = $1 AND deleted_at IS NULL RETURNING id`,
        [id],
      );

      await client.query("COMMIT");

      return result.rows.length > 0;
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to delete document:", error as Error);
      return false;
    } finally {
      client.release();
    }
  }

  /**
   * 📋 Get medical records
   */
  /**
   * 🏥 GET MEDICAL RECORDS - GraphQL Migration v1.0
   * ✅ MAPEO COMPLETO: snake_case DB → camelCase GraphQL
   * ✅ FIELDS: id, patientId, practitionerId, recordType, title, content, diagnosis, treatment, medications, attachments, createdAt, updatedAt
   */
  public async getMedicalRecords(filters?: any): Promise<any[]> {
    try {
      // Query usando medical_records table - COLUMNAS REALES (NO medications/attachments)
      let query = `
        SELECT 
          id,
          patient_id,
          created_by,
          procedure_category,
          diagnosis,
          treatment_plan,
          treatment_performed,
          clinical_notes,
          chief_complaint,
          procedure_codes,
          tooth_numbers,
          surfaces_treated,
          follow_up_notes,
          created_at,
          updated_at
        FROM medical_records
        WHERE deleted_at IS NULL
      `;
      const params: any[] = [];

      if (filters) {
        if (filters.patientId) {
          query += ` AND patient_id = $${params.length + 1}`;
          params.push(filters.patientId);
        }
        if (filters.recordType) {
          query += ` AND procedure_category = $${params.length + 1}`;
          params.push(filters.recordType);
        }
      }

      query += " ORDER BY created_at DESC";

      const result = await this.pool.query(query, params);

      // ✅ MAPEO COMPLETO snake_case → camelCase con FALLBACKS para non-nullable fields
      return result.rows.map((dbRow) => ({
        id: dbRow.id,
        patientId: dbRow.patient_id,
        practitionerId: dbRow.created_by || "unknown", // Schema: practitionerId: ID!
        date: dbRow.created_at || new Date().toISOString(), // Schema: date: String! (from visit_date/created_at)
        recordType: dbRow.procedure_category || "general", // Schema: recordType: String!
        title: dbRow.diagnosis || "Medical Record", // Schema: title: String!
        content: dbRow.clinical_notes || "No content", // Schema: content: String!
        diagnosis: dbRow.diagnosis || "",
        treatment: dbRow.treatment_plan || "",
        // ✅ ARRAYS DESDE JSONB (no existen medications/attachments columns)
        medications: [], // No existe en tabla - devolver vacío
        attachments: [], // No existe en tabla - devolver vacío
        // ✅ CAMPOS ADICIONALES DESDE LA TABLA REAL
        chiefComplaint: dbRow.chief_complaint || "",
        treatmentPerformed: dbRow.treatment_performed || "",
        procedureCodes: Array.isArray(dbRow.procedure_codes)
          ? dbRow.procedure_codes
          : dbRow.procedure_codes
            ? JSON.parse(dbRow.procedure_codes)
            : [],
        toothNumbers: Array.isArray(dbRow.tooth_numbers)
          ? dbRow.tooth_numbers
          : dbRow.tooth_numbers
            ? JSON.parse(dbRow.tooth_numbers)
            : [],
        surfacesTreated: dbRow.surfaces_treated || {},
        followUpNotes: dbRow.follow_up_notes || "",
        createdAt: dbRow.created_at || new Date().toISOString(), // Schema: createdAt: String!
        updatedAt: dbRow.updated_at || new Date().toISOString(), // Schema: updatedAt: String!
      }));
    } catch (error) {
      console.error("💥 Failed to get medical records:", error as Error);
      throw error;
    }
  }

  /**
   * ➕ CREATE MEDICAL RECORD - GraphQL Migration v1.0
   * ✅ MAPEO COMPLETO: camelCase input → snake_case DB → camelCase output
   * ✅ CAMPOS REALES: NO medications/attachments columns
   */
  public async createMedicalRecord(data: any): Promise<any> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const result = await client.query(
        `
        INSERT INTO medical_records (
          patient_id, created_by, procedure_category,
          diagnosis, treatment_plan, treatment_performed,
          clinical_notes, chief_complaint, procedure_codes,
          tooth_numbers, surfaces_treated, follow_up_notes,
          created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW(), NOW())
        RETURNING *
      `,
        [
          data.patientId,
          data.practitionerId,
          data.recordType || "general",
          data.diagnosis || data.title || "",
          data.treatment || "",
          data.treatmentPerformed || "",
          data.content || data.notes || "",
          data.chiefComplaint || "",
          data.procedureCodes ? JSON.stringify(data.procedureCodes) : "[]",
          data.toothNumbers ? JSON.stringify(data.toothNumbers) : "[]",
          data.surfacesTreated ? JSON.stringify(data.surfacesTreated) : "{}",
          data.followUpNotes || "",
        ],
      );

      await client.query("COMMIT");

      const dbRow = result.rows[0];

      // ✅ MAPEO COMPLETO
      return {
        id: dbRow.id,
        patientId: dbRow.patient_id,
        practitionerId: dbRow.created_by || "unknown",
        date: dbRow.created_at || new Date().toISOString(),
        recordType: dbRow.procedure_category || "general",
        title: dbRow.diagnosis || "Medical Record",
        content: dbRow.clinical_notes || "",
        diagnosis: dbRow.diagnosis || "",
        treatment: dbRow.treatment_plan || "",
        medications: [], // No existe en tabla
        attachments: [], // No existe en tabla
        chiefComplaint: dbRow.chief_complaint || "",
        treatmentPerformed: dbRow.treatment_performed || "",
        procedureCodes: Array.isArray(dbRow.procedure_codes)
          ? dbRow.procedure_codes
          : [],
        toothNumbers: Array.isArray(dbRow.tooth_numbers)
          ? dbRow.tooth_numbers
          : [],
        surfacesTreated: dbRow.surfaces_treated || {},
        followUpNotes: dbRow.follow_up_notes || "",
        createdAt: dbRow.created_at || new Date().toISOString(),
        updatedAt: dbRow.updated_at || new Date().toISOString(),
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to create medical record:", error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * ✏️ UPDATE MEDICAL RECORD - GraphQL Migration v1.0
   * ✅ MAPEO COMPLETO con updatedAt (CRITICAL!) - CAMPOS REALES (NO medications/attachments)
   */
  public async updateMedicalRecord(id: string, data: any): Promise<any> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      const fields: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (data.recordType !== undefined) {
        fields.push(`procedure_category = $${paramIndex++}`);
        values.push(data.recordType);
      }
      if (data.diagnosis !== undefined) {
        fields.push(`diagnosis = $${paramIndex++}`);
        values.push(data.diagnosis);
      }
      if (data.treatment !== undefined) {
        fields.push(`treatment_plan = $${paramIndex++}`);
        values.push(data.treatment);
      }
      if (data.treatmentPerformed !== undefined) {
        fields.push(`treatment_performed = $${paramIndex++}`);
        values.push(data.treatmentPerformed);
      }
      if (data.content !== undefined || data.notes !== undefined) {
        fields.push(`clinical_notes = $${paramIndex++}`);
        values.push(data.content || data.notes);
      }
      if (data.chiefComplaint !== undefined) {
        fields.push(`chief_complaint = $${paramIndex++}`);
        values.push(data.chiefComplaint);
      }
      if (data.procedureCodes !== undefined) {
        fields.push(`procedure_codes = $${paramIndex++}`);
        values.push(JSON.stringify(data.procedureCodes));
      }
      if (data.toothNumbers !== undefined) {
        fields.push(`tooth_numbers = $${paramIndex++}`);
        values.push(JSON.stringify(data.toothNumbers));
      }
      if (data.surfacesTreated !== undefined) {
        fields.push(`surfaces_treated = $${paramIndex++}`);
        values.push(JSON.stringify(data.surfacesTreated));
      }
      if (data.followUpNotes !== undefined) {
        fields.push(`follow_up_notes = $${paramIndex++}`);
        values.push(data.followUpNotes);
      }

      fields.push(`updated_at = NOW()`);
      values.push(id);

      const result = await client.query(
        `UPDATE medical_records SET ${fields.join(", ")} WHERE id = $${paramIndex} AND deleted_at IS NULL RETURNING *`,
        values,
      );

      await client.query("COMMIT");

      if (result.rows.length === 0) {
        throw new Error("Medical record not found");
      }

      const dbRow = result.rows[0];

      // ✅ MAPEO COMPLETO
      return {
        id: dbRow.id,
        patientId: dbRow.patient_id,
        practitionerId: dbRow.created_by || "unknown",
        date: dbRow.created_at || new Date().toISOString(),
        recordType: dbRow.procedure_category || "general",
        title: dbRow.diagnosis || "Medical Record",
        content: dbRow.clinical_notes || "",
        diagnosis: dbRow.diagnosis || "",
        treatment: dbRow.treatment_plan || "",
        medications: [], // No existe en tabla
        attachments: [], // No existe en tabla
        chiefComplaint: dbRow.chief_complaint || "",
        treatmentPerformed: dbRow.treatment_performed || "",
        procedureCodes: Array.isArray(dbRow.procedure_codes)
          ? dbRow.procedure_codes
          : [],
        toothNumbers: Array.isArray(dbRow.tooth_numbers)
          ? dbRow.tooth_numbers
          : [],
        surfacesTreated: dbRow.surfaces_treated || {},
        followUpNotes: dbRow.follow_up_notes || "",
        createdAt: dbRow.created_at || new Date().toISOString(),
        updatedAt: dbRow.updated_at || new Date().toISOString(), // 🔥 CRITICAL
      };
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("💥 Failed to update medical record:", error as Error);
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * 🗑️ DELETE MEDICAL RECORD - GraphQL Migration v1.0
   * ✅ Soft delete
   */
  public async deleteMedicalRecord(id: string): Promise<void> {
    await this.pool.query(
      `UPDATE medical_records SET deleted_at = NOW(), updated_at = NOW() WHERE id = $1 AND deleted_at IS NULL`,
      [id]
    );
  }

  // ==========================================
  // 🔧 UTILITY METHODS
  // ==========================================

  /**
   * 🗑️ Invalidate patient cache
   */
  private async invalidatePatientCache(patientId?: string): Promise<void> {
    try {
      const keys = await this.safeRedisOperation(
        () => this.getRedis().keys("patients:*"),
        [],
      );
      if (patientId) {
        keys.push(`patient:${patientId}`);
      }

      if (keys.length > 0) {
        await this.safeRedisOperation(() => this.getRedis().del(keys));
      }
    } catch (error) {
      console.warn(
        "⚠️ Failed to invalidate patient cache:",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  /**
   * 🗑️ Invalidate appointment cache
   */
  private async invalidateAppointmentCache(): Promise<void> {
    try {
      const keys = await this.getRedis().keys("appointments:*");
      if (keys.length > 0) {
        await this.getRedis().del(keys);
      }
    } catch (error) {
      console.error("⚠️ Failed to invalidate appointment cache:", error as Error);
    }
  }

  /**
   * 📡 Emit real-time updates
   */
  private async emitRealtimeUpdate(
    _room: string,
    _event: string,
    _data: any,
  ): Promise<void> {
    try {
      // This will be connected to Socket.IO in the main server
      await this.safeRedisOperation(() =>
        this.getRedis().publish(
          `realtime:${_room}`,
          JSON.stringify({
            _event,
            _data,
            timestamp: new Date().toISOString(),
          }),
        ),
      );
    } catch (error) {
      console.warn(
        "⚠️ Failed to emit realtime update:",
        error instanceof Error ? error.message : String(error),
      );
    }
  }

  /**
   * 📊 Get database status
   */
  public async getStatus(): Promise<any> {
    try {
      // Test PostgreSQL
      const pgClient = await this.pool.connect();
      await pgClient.query("SELECT 1");
      pgClient.release();

      // Test Redis with throttling - don't spam console
      let redisStatus = "disconnected";
      const now = Date.now();

      if (now - this.lastRedisCheck > this.redisCheckInterval) {
        try {
          // 🔥 SANITACIÓN-QUIRÚRGICA: DON'T try ensureConnection if Redis client doesn't exist yet
          if (!this.redis) {
            redisStatus = "initializing";
            this.isRedisConnected = false;
          } else {
            // Ensure Redis connection before ping
            const isConnected = await redisManager.ensureConnection(
              this.redis,
              this.redisConnectionId,
            );
            if (isConnected) {
              await this.getRedis().ping();
              redisStatus = "connected";
              this.isRedisConnected = true;
            } else {
              redisStatus = "disconnected";
              this.isRedisConnected = false;
            }
          }
        } catch (error) {
          this.isRedisConnected = false;
          console.warn(
            "⚠️ Redis ping failed:",
            error instanceof Error ? error.message : String(error),
          );
        }
        this.lastRedisCheck = now;
      } else {
        // Use cached status
        redisStatus = this.isRedisConnected ? "connected" : "disconnected";
      }

      return {
        connected: true,
        postgresql: "connected",
        redis: redisStatus,
        connectionPool: {
          total: this.pool.totalCount,
          idle: this.pool.idleCount,
          waiting: this.pool.waitingCount,
        },
      };
    } catch (error) {
      return {
        connected: false,
        error: error instanceof Error ? error.message : "Unknown error",
        postgresql: "disconnected",
        redis: "disconnected",
      };
    }
  }

  /**
   * 🔧 Execute raw query (for advanced operations)
   */
  public async executeQuery(_query: string, _params?: any[]): Promise<any> {
    try {
      const result = await this.pool.query(_query, _params);
      return { rows: result.rows };
    } catch (error) {
      console.error("💥 Query execution failed:", error as Error);
      throw error;
    }
  }

  /**
   * 📊 Get database statistics
   */
  public async getStatistics(): Promise<any> {
    try {
      const stats = await this.pool.query(`
        SELECT
          schemaname,
          tablename,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes
        FROM pg_stat_user_tables
        ORDER BY schemaname, tablename
      `);

      return {
        tables: stats.rows,
        connectionPool: {
          total: this.pool.totalCount,
          idle: this.pool.idleCount,
          waiting: this.pool.waitingCount,
        },
      };
    } catch (error) {
      console.error("💥 Failed to get statistics:", error as Error);
      throw error;
    }
  }

  /**
   * 🛡️ Get all data for Veritas verification (Merkle Tree building)
   */
  public async getAllDataForVerification(): Promise<any[]> {
    try {
      // Get data from all main tables
      const tables = [
        "patients",
        "appointments",
        "medical_records",
        "documents",
      ];

      const allData: any[] = [];
      const MAX_ALL_RECORDS = 1000; // 🔥 AGRESSIVE LIMIT: Max 1000 records total for verification

      for (const table of tables) {
        try {
          const result = await this.pool.query(
            `SELECT * FROM ${table} LIMIT 100`,
          ); // Reduced from unlimited
          result.rows.forEach((row) => {
            // 🔥 AGRESSIVE MEMORY LIMIT: Check total size
            if (allData.length >= MAX_ALL_RECORDS) {
              return; // Stop adding more records
            }

            allData.push({
              table,
              id: row.id,
              data: row,
              entity: table.slice(0, -1), // Remove 's' from table name
            });
          });
        } catch (error) {
          // Table might not exist, continue
          console.log(`⚠️ Table ${table} not found for verification`);
        }
      }

      return allData;
    } catch (error) {
      console.error("💥 Failed to get data for verification:", error as Error);
      throw error;
    }
  }

  /**
   * 🛡️ Get data sample for continuous integrity monitoring
   */
  public async getDataSampleForVerification(): Promise<any[]> {
    try {
      // Get sample of recent data from all tables (last 100 records each)
      const tables = [
        "patients",
        "appointments",
        "medical_records",
        "documents",
      ];

      const sampleData: any[] = [];
      const MAX_SAMPLE_RECORDS = 200; // 🔥 AGGRESSIVE LIMIT: Max 200 records total for sample

      for (const table of tables) {
        try {
          const result = await this.pool.query(`
            SELECT * FROM ${table}
            ORDER BY COALESCE(updated_at, created_at, now()) DESC
            LIMIT 20
          `);

          result.rows.forEach((row) => {
            // 🔥 AGGRESSIVE MEMORY LIMIT: Check total sample size
            if (sampleData.length >= MAX_SAMPLE_RECORDS) {
              return; // Stop adding more records
            }

            sampleData.push({
              table,
              id: row.id,
              data: row,
              entity: table.slice(0, -1), // Remove 's' from table name
              timestamp: row.created_at || row.updated_at || new Date(),
            });
          });
        } catch (error) {
          // Table might not exist, continue
          console.log(`⚠️ Table ${table} not found for sample verification`);
        }
      }

      return sampleData;
    } catch (error) {
      console.error("💥 Failed to get data sample for verification:", error as Error);
      throw error;
    }
  }

  /**
   * 🛡️ Get data for specific entity (for lazy Veritas loading)
   * 🎯 DIRECTIVA V164: VERITAS GLOBAL ENTITY HANDLER - OPTIMIZED FOR 34 BD TABLES
   */
  public async getDataForEntity(entity: string): Promise<any[]> {
    try {
      // Special handling for 'global' entity - combine data from populated tables only
      if (entity === "global") {
        console.log(
          "🌍 VERITAS GLOBAL REQUEST: Scanning 34 BD tables for data...",
        );

        // Core tables with guaranteed data
        const coreTables = [
          "patients",
          "appointments",
          "medical_records",
          "treatments",
          "users",
          "medical_documents",
          "mouth_scans",
          "odontogramas",
          "odontograma_teeth",
          "tooth_3d_models",
          "treatment_categories",
          "treatment_types",
          "treatment_rooms",
          "dental_equipment",
          "dental_materials",
          "auto_order_rules",
          "suppliers",
          "viewer_sessions",
          "viewer_settings",
          "treatment_materials",
        ];

        let globalData: any[] = [];
        let processedTables = 0;
        const MAX_GLOBAL_RECORDS = 500; // 🔥 AGGRESSIVE LIMIT: Max 500 records total for global entity

        for (const table of coreTables) {
          try {
            const result = await this.pool.query(
              `SELECT * FROM ${table} LIMIT 50`,
            ); // Limit for performance
            if (result.rows.length > 0) {
              const tableData = result.rows.map((row) => ({
                table: table,
                id: row.id,
                data: row,
                entity: this.getEntityNameFromTable(table),
                timestamp: row.created_at || row.updated_at || new Date(),
              }));

              // 🔥 AGGRESSIVE MEMORY LIMIT: Check if adding would exceed total limit
              if (globalData.length + tableData.length > MAX_GLOBAL_RECORDS) {
                const remainingSlots = MAX_GLOBAL_RECORDS - globalData.length;
                if (remainingSlots > 0) {
                  globalData = globalData.concat(
                    tableData.slice(0, remainingSlots),
                  );
                  console.log(
                    `⚠️ ${table}: Limited to ${remainingSlots} records (global limit reached)`,
                  );
                } else {
                  console.log(
                    `🚫 ${table}: Skipped (global limit of ${MAX_GLOBAL_RECORDS} reached)`,
                  );
                }
                break; // Stop processing further tables
              } else {
                globalData = globalData.concat(tableData);
                processedTables++;
                console.log(`✅ ${table}: Added ${tableData.length} records`);
              }
            } else {
              console.log(`⚪ ${table}: Empty, skipped`);
            }
          } catch (tableError) {
            console.log(
              `⚠️ ${table}: Access error, skipped - ${tableError instanceof Error ? tableError.message : String(tableError)}`,
            );
          }
        }

        console.log(
          `🎯 VERITAS GLOBAL: Combined ${globalData.length} records from ${processedTables} tables`,
        );
        return globalData;
      }

      // Map entity names to table names for specific entities
      const tableMap: { [key: string]: string } = {
        patient: "patients",
        appointment: "appointments",
        medical_record: "medical_records",
        document: "documents",
        treatment: "treatments",
        user: "users",
        medical_document: "medical_documents",
        mouth_scan: "mouth_scans",
        tooth_3d_model: "tooth_3d_models",
        odontograma: "odontogramas",
      };

      const tableName = tableMap[entity] || entity;

      const result = await this.pool.query(`SELECT * FROM ${tableName}`);

      return result.rows.map((row) => ({
        table: tableName,
        id: row.id,
        data: row,
        entity: entity,
        timestamp: row.created_at || row.updated_at || new Date(),
      }));
    } catch (error) {
      console.error(`💥 Failed to get data for entity ${entity}:`, error as Error);
      // Return empty array instead of throwing to prevent Veritas failures
      return [];
    }
  }

  /**
   * 🎯 Convert table name to singular entity name
   */
  private getEntityNameFromTable(tableName: string): string {
    const entityMap: { [key: string]: string } = {
      patients: "patient",
      appointments: "appointment",
      medical_records: "medical_record",
      treatments: "treatment",
      users: "user",
      medical_documents: "medical_document",
      mouth_scans: "mouth_scan",
      odontogramas: "odontograma",
      odontograma_teeth: "odontograma_tooth",
      tooth_3d_models: "tooth_3d_model",
      treatment_categories: "treatment_category",
      treatment_types: "treatment_type",
      treatment_rooms: "treatment_room",
      dental_equipment: "dental_equipment",
      dental_materials: "dental_material",
      auto_order_rules: "auto_order_rule",
      suppliers: "supplier",
      viewer_sessions: "viewer_session",
      viewer_settings: "viewer_setting",
      treatment_materials: "treatment_material",
    };

    return entityMap[tableName] || tableName.slice(0, -1); // fallback: remove 's'
  }

  // ============================================================================
  // DOCUMENTS V3 METHODS
  // ============================================================================

  async getDocumentsV3(args: {
    patientId?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { patientId, limit = 50, offset = 0 } = args;
    
    let query = `
      SELECT 
        id, patient_id, file_name, file_path, file_hash,
        file_size, mime_type, document_type, category,
        tags, description, created_at, updated_at
      FROM medical_documents
    `;
    
    const params: any[] = [];
    
    if (patientId) {
      query += ` WHERE patient_id = $1`;
      params.push(patientId);
      query += ` LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      query += ` LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }
    
    query += ` ORDER BY created_at DESC`;
    
    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getDocumentV3ById(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM medical_documents WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async getUnifiedDocumentsV3(args: {
    patientId?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    // Same as getDocumentsV3 but with additional AI fields
    const { patientId, limit = 50, offset = 0 } = args;
    
    let query = `
      SELECT 
        d.*,
        p.first_name || ' ' || p.last_name as patient_name,
        CASE 
          WHEN mime_type LIKE 'image/%' THEN true 
          ELSE false 
        END as is_image,
        false as is_xray,
        false as ai_analyzed,
        '{}' as ai_confidence_scores,
        '' as ocr_extracted_text,
        '[]' as ai_tags,
        '{}' as ai_analysis_results,
        '/api/documents/' || id || '/download' as download_url,
        NULL as thumbnail_url,
        document_type as unified_type,
        category as legal_category,
        tags as smart_tags,
        'compliant' as compliance_status
      FROM medical_documents d
      LEFT JOIN patients p ON d.patient_id = p.id
    `;
    
    const params: any[] = [];
    
    if (patientId) {
      query += ` WHERE d.patient_id = $1`;
      params.push(patientId);
      query += ` LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      query += ` LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }
    
    query += ` ORDER BY d.created_at DESC`;
    
    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getUnifiedDocumentV3ById(id: string): Promise<any> {
    const query = `
      SELECT 
        d.*,
        p.first_name || ' ' || p.last_name as patient_name,
        CASE 
          WHEN mime_type LIKE 'image/%' THEN true 
          ELSE false 
        END as is_image,
        false as is_xray,
        false as ai_analyzed,
        '{}' as ai_confidence_scores,
        '' as ocr_extracted_text,
        '[]' as ai_tags,
        '{}' as ai_analysis_results,
        '/api/documents/' || d.id || '/download' as download_url,
        NULL as thumbnail_url,
        document_type as unified_type,
        category as legal_category,
        tags as smart_tags,
        'compliant' as compliance_status
      FROM medical_documents d
      LEFT JOIN patients p ON d.patient_id = p.id
      WHERE d.id = $1
    `;
    
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async createDocumentV3(input: any): Promise<any> {
    const {
      patientId,
      uploaderId,
      fileName,
      filePath,
      fileHash,
      fileSize,
      mimeType,
      documentType,
      category,
      tags,
      description
    } = input;
    
    const result = await this.pool.query(
      `INSERT INTO medical_documents (
        patient_id, file_name, file_path, file_hash,
        file_size, mime_type, document_type, category,
        tags, description, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *`,
      [patientId, fileName, filePath, fileHash, fileSize, mimeType, documentType, category, tags, description]
    );
    
    return result.rows[0];
  }

  async updateDocumentV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;
    
    if (input.fileName) {
      updates.push(`file_name = $${paramIndex++}`);
      values.push(input.fileName);
    }
    if (input.documentType) {
      updates.push(`document_type = $${paramIndex++}`);
      values.push(input.documentType);
    }
    if (input.category) {
      updates.push(`category = $${paramIndex++}`);
      values.push(input.category);
    }
    if (input.tags) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(input.tags);
    }
    if (input.description) {
      updates.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }
    
    updates.push(`updated_at = NOW()`);
    values.push(id);
    
    const query = `
      UPDATE medical_documents
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    
    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deleteDocumentV3(id: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM medical_documents WHERE id = $1`,
      [id]
    );
  }

  async uploadUnifiedDocumentV3(input: any): Promise<any> {
    // Same as createDocumentV3 but returns unified format
    const document = await this.createDocumentV3(input);
    return this.getUnifiedDocumentV3ById(document.id);
  }

  // ============================================================================
  // BILLING V3 METHODS
  // ============================================================================

  async getBillingDataV3(args: {
    patientId?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { patientId, limit = 50, offset = 0 } = args;

    let query = `
      SELECT
        id, patient_id, amount, billing_date, status,
        description, payment_method, created_at, updated_at
      FROM billing_data
    `;

    const params: any[] = [];

    if (patientId) {
      query += ` WHERE patient_id = $1`;
      params.push(patientId);
      query += ` LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      query += ` LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }

    query += ` ORDER BY billing_date DESC`;

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getBillingDatumV3ById(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM billing_data WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createBillingDataV3(input: any): Promise<any> {
    const {
      patientId,
      amount,
      billingDate,
      status,
      description,
      paymentMethod
    } = input;

    const result = await this.pool.query(
      `INSERT INTO billing_data (
        patient_id, amount, billing_date, status,
        description, payment_method, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *`,
      [patientId, amount, billingDate, status || 'PENDING', description, paymentMethod]
    );

    return result.rows[0];
  }

  async updateBillingDataV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.amount !== undefined) {
      updates.push(`amount = $${paramIndex++}`);
      values.push(input.amount);
    }
    if (input.billingDate !== undefined) {
      updates.push(`billing_date = $${paramIndex++}`);
      values.push(input.billingDate);
    }
    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }
    if (input.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }
    if (input.paymentMethod !== undefined) {
      updates.push(`payment_method = $${paramIndex++}`);
      values.push(input.paymentMethod);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE billing_data
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deleteBillingDataV3(id: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM billing_data WHERE id = $1`,
      [id]
    );
  }

  // ============================================================================
  // COMPLIANCE V3 METHODS
  // ============================================================================

  async getCompliancesV3(args: {
    patientId?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { patientId, limit = 50, offset = 0 } = args;

    let query = `
      SELECT
        id, patient_id, regulation_id, compliance_status,
        description, last_checked, next_check, created_at, updated_at
      FROM compliance_checks
    `;

    const params: any[] = [];

    if (patientId) {
      query += ` WHERE patient_id = $1`;
      params.push(patientId);
      query += ` LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      query += ` LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }

    query += ` ORDER BY last_checked DESC`;

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getComplianceV3ById(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM compliance_checks WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createComplianceV3(input: any): Promise<any> {
    const {
      patientId,
      regulationId,
      complianceStatus,
      description,
      lastChecked,
      nextCheck
    } = input;

    const result = await this.pool.query(
      `INSERT INTO compliance_checks (
        patient_id, regulation_id, compliance_status,
        description, last_checked, next_check, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *`,
      [patientId, regulationId, complianceStatus || 'PENDING', description, lastChecked, nextCheck]
    );

    return result.rows[0];
  }

  async updateComplianceV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.regulationId !== undefined) {
      updates.push(`regulation_id = $${paramIndex++}`);
      values.push(input.regulationId);
    }
    if (input.complianceStatus !== undefined) {
      updates.push(`compliance_status = $${paramIndex++}`);
      values.push(input.complianceStatus);
    }
    if (input.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }
    if (input.lastChecked !== undefined) {
      updates.push(`last_checked = $${paramIndex++}`);
      values.push(input.lastChecked);
    }
    if (input.nextCheck !== undefined) {
      updates.push(`next_check = $${paramIndex++}`);
      values.push(input.nextCheck);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE compliance_checks
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deleteComplianceV3(id: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM compliance_checks WHERE id = $1`,
      [id]
    );
  }

  // ============================================================================
  // MEDICAL RECORDS V3 METHODS
  // ============================================================================

  async getMedicalRecordsV3(args: {
    patientId?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { patientId, limit = 50, offset = 0 } = args;

    let query = `
      SELECT
        id, patient_id, practitioner_id, record_type, title,
        content, diagnosis, treatment, medications, created_at,
        updated_at
      FROM medical_records
    `;

    const params: any[] = [];

    if (patientId) {
      query += ` WHERE patient_id = $1`;
      params.push(patientId);
      query += ` LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      query += ` LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }

    query += ` ORDER BY created_at DESC`;

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getMedicalRecordV3ById(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM medical_records WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createMedicalRecordV3(input: any): Promise<any> {
    const {
      patientId,
      practitionerId,
      recordType,
      title,
      content,
      diagnosis,
      treatment,
      medications
    } = input;

    const result = await this.pool.query(
      `INSERT INTO medical_records (
        patient_id, practitioner_id, record_type, title,
        content, diagnosis, treatment, medications, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [patientId, practitionerId, recordType, title, content, diagnosis, treatment, medications]
    );

    return result.rows[0];
  }

  async updateMedicalRecordV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.recordType !== undefined) {
      updates.push(`record_type = $${paramIndex++}`);
      values.push(input.recordType);
    }
    if (input.title !== undefined) {
      updates.push(`title = $${paramIndex++}`);
      values.push(input.title);
    }
    if (input.content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(input.content);
    }
    if (input.diagnosis !== undefined) {
      updates.push(`diagnosis = $${paramIndex++}`);
      values.push(input.diagnosis);
    }
    if (input.treatment !== undefined) {
      updates.push(`treatment = $${paramIndex++}`);
      values.push(input.treatment);
    }
    if (input.medications !== undefined) {
      updates.push(`medications = $${paramIndex++}`);
      values.push(input.medications);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE medical_records
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deleteMedicalRecordV3(id: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM medical_records WHERE id = $1`,
      [id]
    );
  }

  // ============================================================================
  // INVENTORY V3 METHODS - SUBMODULE 2A (DASHBOARD + MATERIALS)
  // ============================================================================

  async getInventoriesV3(args: {
    limit?: number;
    offset?: number;
    category?: string;
  }): Promise<any[]> {
    const { limit = 50, offset = 0, category } = args;

    let query = `
      SELECT
        id, name, category, current_stock, minimum_stock,
        unit, location, supplier_id, last_restocked, expiry_date,
        created_at, updated_at
      FROM inventory
    `;

    const params: any[] = [];

    if (category) {
      query += ` WHERE category = $1`;
      params.push(category);
      query += ` LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      query += ` LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }

    query += ` ORDER BY name ASC`;

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getInventoryV3ById(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM inventory WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createInventoryV3(input: any): Promise<any> {
    const {
      name,
      category,
      currentStock,
      minimumStock,
      unit,
      location,
      supplierId,
      expiryDate
    } = input;

    const result = await this.pool.query(
      `INSERT INTO inventory (
        name, category, current_stock, minimum_stock,
        unit, location, supplier_id, expiry_date, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [name, category, currentStock, minimumStock, unit, location, supplierId, expiryDate]
    );

    return result.rows[0];
  }

  async updateInventoryV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(input.category);
    }
    if (input.currentStock !== undefined) {
      updates.push(`current_stock = $${paramIndex++}`);
      values.push(input.currentStock);
    }
    if (input.minimumStock !== undefined) {
      updates.push(`minimum_stock = $${paramIndex++}`);
      values.push(input.minimumStock);
    }
    if (input.unit !== undefined) {
      updates.push(`unit = $${paramIndex++}`);
      values.push(input.unit);
    }
    if (input.location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(input.location);
    }
    if (input.supplierId !== undefined) {
      updates.push(`supplier_id = $${paramIndex++}`);
      values.push(input.supplierId);
    }
    if (input.expiryDate !== undefined) {
      updates.push(`expiry_date = $${paramIndex++}`);
      values.push(input.expiryDate);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE inventory
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deleteInventoryV3(id: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM inventory WHERE id = $1`,
      [id]
    );
  }

  async adjustInventoryStockV3(id: string, adjustment: number, reason: string): Promise<any> {
    // First get current stock
    const current = await this.pool.query(
      `SELECT current_stock FROM inventory WHERE id = $1`,
      [id]
    );

    if (current.rows.length === 0) {
      throw new Error(`Inventory item not found: ${id}`);
    }

    const newStock = current.rows[0].current_stock + adjustment;

    // Update stock and record adjustment
    await this.pool.query(
      `UPDATE inventory SET current_stock = $1, last_restocked = NOW(), updated_at = NOW() WHERE id = $2`,
      [newStock, id]
    );

    // Record the adjustment (assuming there's an inventory_adjustments table)
    await this.pool.query(
      `INSERT INTO inventory_adjustments (inventory_id, adjustment, reason, created_at)
       VALUES ($1, $2, $3, NOW())`,
      [id, adjustment, reason]
    );

    // Return updated inventory item
    return this.getInventoryV3ById(id);
  }

  // ============================================================================
  // MATERIALS V3 METHODS
  // ============================================================================

  async getMaterialsV3(args: {
    limit?: number;
    offset?: number;
    category?: string;
    supplierId?: string;
  }): Promise<any[]> {
    const { limit = 50, offset = 0, category, supplierId } = args;

    let query = `
      SELECT
        m.id, m.name, m.description, m.category, m.unit_cost,
        m.unit, m.reorder_point, m.created_at, m.updated_at
      FROM materials m
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (category) {
      conditions.push(`m.category = $${params.length + 1}`);
      params.push(category);
    }

    if (supplierId) {
      query += `
        LEFT JOIN material_suppliers ms ON m.id = ms.material_id
      `;
      conditions.push(`ms.supplier_id = $${params.length + 1}`);
      params.push(supplierId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` GROUP BY m.id`;
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    query += ` ORDER BY m.name ASC`;

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getMaterialV3ById(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM materials WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createMaterialV3(input: any): Promise<any> {
    const {
      name,
      description,
      category,
      unitCost,
      unit,
      reorderPoint
    } = input;

    const result = await this.pool.query(
      `INSERT INTO materials (
        name, description, category, unit_cost,
        unit, reorder_point, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *`,
      [name, description, category, unitCost, unit, reorderPoint]
    );

    return result.rows[0];
  }

  async updateMaterialV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }
    if (input.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(input.category);
    }
    if (input.unitCost !== undefined) {
      updates.push(`unit_cost = $${paramIndex++}`);
      values.push(input.unitCost);
    }
    if (input.unit !== undefined) {
      updates.push(`unit = $${paramIndex++}`);
      values.push(input.unit);
    }
    if (input.reorderPoint !== undefined) {
      updates.push(`reorder_point = $${paramIndex++}`);
      values.push(input.reorderPoint);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE materials
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deleteMaterialV3(id: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM materials WHERE id = $1`,
      [id]
    );
  }

  async reorderMaterialV3(materialId: string, quantity: number, supplierId?: string): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO material_reorders (
        material_id, supplier_id, quantity, status, created_at
      ) VALUES ($1, $2, $3, 'PENDING', NOW())
      RETURNING *`,
      [materialId, supplierId, quantity]
    );

    return result.rows[0];
  }

  // ============================================================================
  // DASHBOARD & ALERTS METHODS
  // ============================================================================

  async getInventoryDashboardV3(): Promise<any> {
    // Get comprehensive dashboard metrics
    const metrics = await this.pool.query(`
      SELECT
        COUNT(*) as total_items,
        COUNT(CASE WHEN current_stock <= minimum_stock THEN 1 END) as low_stock_items,
        COUNT(CASE WHEN current_stock = 0 THEN 1 END) as out_of_stock_items,
        COUNT(CASE WHEN expiry_date <= NOW() + INTERVAL '30 days' THEN 1 END) as expiring_soon_items,
        COALESCE(SUM(current_stock * unit_cost), 0) as total_value
      FROM inventory i
      LEFT JOIN materials m ON i.material_id = m.id
    `);

    return metrics.rows[0];
  }

  async getInventoryAlertsV3(args: { limit?: number }): Promise<any[]> {
    const { limit = 20 } = args;

    const result = await this.pool.query(`
      SELECT
        'low_stock' as alert_type,
        id as inventory_id,
        name as item_name,
        current_stock,
        minimum_stock,
        'Low stock alert' as message,
        created_at as alert_date
      FROM inventory
      WHERE current_stock <= minimum_stock

      UNION ALL

      SELECT
        'out_of_stock' as alert_type,
        id as inventory_id,
        name as item_name,
        current_stock,
        minimum_stock,
        'Out of stock alert' as message,
        created_at as alert_date
      FROM inventory
      WHERE current_stock = 0

      UNION ALL

      SELECT
        'expiring_soon' as alert_type,
        id as inventory_id,
        name as item_name,
        current_stock,
        minimum_stock,
        'Expiring soon alert' as message,
        expiry_date as alert_date
      FROM inventory
      WHERE expiry_date <= NOW() + INTERVAL '30 days'

      ORDER BY alert_date DESC
      LIMIT $1
    `, [limit]);

    return result.rows;
  }

  async acknowledgeInventoryAlertV3(alertId: string): Promise<void> {
    // This would typically update an alerts table
    // For now, we'll just log the acknowledgment
    console.log(`Alert ${alertId} acknowledged`);
  }

  // ============================================================================
  // HELPER METHODS FOR FIELD RESOLVERS
  // ============================================================================

  async getSupplierById(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM suppliers WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async getMaterialSuppliersV3(materialId: string): Promise<any[]> {
    const result = await this.pool.query(`
      SELECT s.*
      FROM suppliers s
      JOIN material_suppliers ms ON s.id = ms.supplier_id
      WHERE ms.material_id = $1
    `, [materialId]);

    return result.rows;
  }

  async getMaterialStockLevelsV3(materialId: string): Promise<any[]> {
    const result = await this.pool.query(`
      SELECT
        i.id,
        i.name,
        i.current_stock,
        i.minimum_stock,
        i.location,
        i.expiry_date
      FROM inventory i
      WHERE i.material_id = $1
    `, [materialId]);

    return result.rows;
  }

  // ============================================================================
  // EQUIPMENT V3 METHODS (2B)
  // ============================================================================

  async getEquipmentsV3(args: {
    limit?: number;
    offset?: number;
    category?: string;
    status?: string;
  }): Promise<any[]> {
    const { limit = 50, offset = 0, category, status } = args;

    let query = `
      SELECT
        id, name, model, serial_number, category, status,
        purchase_date, warranty_expiry, location, created_at, updated_at
      FROM equipment
    `;

    const params: any[] = [];

    if (category || status) {
      query += ` WHERE`;
      const conditions: string[] = [];

      if (category) {
        conditions.push(` category = $${params.length + 1}`);
        params.push(category);
      }
      if (status) {
        conditions.push(` status = $${params.length + 1}`);
        params.push(status);
      }

      query += conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getEquipmentV3ById(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM equipment WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createEquipmentV3(input: any): Promise<any> {
    const {
      name,
      model,
      serialNumber,
      category,
      status,
      purchaseDate,
      warrantyExpiry,
      location
    } = input;

    const result = await this.pool.query(
      `INSERT INTO equipment (
        name, model, serial_number, category, status,
        purchase_date, warranty_expiry, location, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [name, model, serialNumber, category, status || 'ACTIVE', purchaseDate, warrantyExpiry, location]
    );

    return result.rows[0];
  }

  async updateEquipmentV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.model !== undefined) {
      updates.push(`model = $${paramIndex++}`);
      values.push(input.model);
    }
    if (input.serialNumber !== undefined) {
      updates.push(`serial_number = $${paramIndex++}`);
      values.push(input.serialNumber);
    }
    if (input.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(input.category);
    }
    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }
    if (input.purchaseDate !== undefined) {
      updates.push(`purchase_date = $${paramIndex++}`);
      values.push(input.purchaseDate);
    }
    if (input.warrantyExpiry !== undefined) {
      updates.push(`warranty_expiry = $${paramIndex++}`);
      values.push(input.warrantyExpiry);
    }
    if (input.location !== undefined) {
      updates.push(`location = $${paramIndex++}`);
      values.push(input.location);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE equipment
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deleteEquipmentV3(id: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM equipment WHERE id = $1`,
      [id]
    );
  }

  // ============================================================================
  // MAINTENANCE V3 METHODS (2B)
  // ============================================================================

  async getMaintenancesV3(args: {
    equipmentId?: string;
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<any[]> {
    const { equipmentId, limit = 50, offset = 0, status } = args;

    let query = `
      SELECT
        id, equipment_id, maintenance_type, description,
        scheduled_date, completed_date, status, priority,
        cost, technician_id, completion_notes, created_at, updated_at
      FROM maintenance
    `;

    const params: any[] = [];

    if (equipmentId || status) {
      query += ` WHERE`;
      const conditions: string[] = [];

      if (equipmentId) {
        conditions.push(` equipment_id = $${params.length + 1}`);
        params.push(equipmentId);
      }
      if (status) {
        conditions.push(` status = $${params.length + 1}`);
        params.push(status);
      }

      query += conditions.join(' AND ');
    }

    query += ` ORDER BY scheduled_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getMaintenanceV3ById(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM maintenance WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createMaintenanceV3(input: any): Promise<any> {
    const {
      equipmentId,
      maintenanceType,
      description,
      scheduledDate,
      status,
      priority,
      cost,
      technicianId
    } = input;

    const result = await this.pool.query(
      `INSERT INTO maintenance (
        equipment_id, maintenance_type, description, scheduled_date,
        status, priority, cost, technician_id, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [equipmentId, maintenanceType, description, scheduledDate, status || 'SCHEDULED', priority || 'MEDIUM', cost || 0, technicianId]
    );

    return result.rows[0];
  }

  async updateMaintenanceV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.maintenanceType !== undefined) {
      updates.push(`maintenance_type = $${paramIndex++}`);
      values.push(input.maintenanceType);
    }
    if (input.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }
    if (input.scheduledDate !== undefined) {
      updates.push(`scheduled_date = $${paramIndex++}`);
      values.push(input.scheduledDate);
    }
    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }
    if (input.priority !== undefined) {
      updates.push(`priority = $${paramIndex++}`);
      values.push(input.priority);
    }
    if (input.cost !== undefined) {
      updates.push(`cost = $${paramIndex++}`);
      values.push(input.cost);
    }
    if (input.technicianId !== undefined) {
      updates.push(`technician_id = $${paramIndex++}`);
      values.push(input.technicianId);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE maintenance
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async completeMaintenanceV3(id: string, completionNotes?: string): Promise<any> {
    const result = await this.pool.query(
      `UPDATE maintenance
       SET status = 'COMPLETED', completed_date = NOW(), completion_notes = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [completionNotes, id]
    );

    return result.rows[0];
  }

  async scheduleMaintenanceV3(equipmentId: string, scheduledDate: string, maintenanceType: string, description?: string): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO maintenance (
        equipment_id, maintenance_type, description, scheduled_date,
        status, priority, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, 'SCHEDULED', 'MEDIUM', NOW(), NOW())
      RETURNING *`,
      [equipmentId, maintenanceType, description, scheduledDate]
    );

    return result.rows[0];
  }

  async cancelMaintenanceV3(id: string, reason?: string): Promise<void> {
    await this.pool.query(
      `UPDATE maintenance
       SET status = 'CANCELLED', completion_notes = $1, updated_at = NOW()
       WHERE id = $2`,
      [reason, id]
    );
  }

  // ============================================================================
  // EQUIPMENT MAINTENANCE HELPER METHODS (2B)
  // ============================================================================

  async getEquipmentMaintenanceScheduleV3(equipmentId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT
        id, maintenance_type, description, scheduled_date, status, priority
       FROM maintenance
       WHERE equipment_id = $1 AND status IN ('SCHEDULED', 'PENDING')
       ORDER BY scheduled_date ASC`,
      [equipmentId]
    );

    return result.rows;
  }

  async getMaintenanceHistoryV3(args: { equipmentId: string; limit?: number }): Promise<any[]> {
    const { equipmentId, limit = 20 } = args;

    const result = await this.pool.query(
      `SELECT
        id, maintenance_type, description, scheduled_date, completed_date,
        status, cost, technician_id, completion_notes
       FROM maintenance
       WHERE equipment_id = $1 AND status = 'COMPLETED'
       ORDER BY completed_date DESC
       LIMIT $2`,
      [equipmentId, limit]
    );

    return result.rows;
  }

  async getEquipmentCurrentStatusV3(equipmentId: string): Promise<any> {
    // Get the most recent maintenance record for status
    const result = await this.pool.query(
      `SELECT status, completed_date
       FROM maintenance
       WHERE equipment_id = $1
       ORDER BY completed_date DESC
       LIMIT 1`,
      [equipmentId]
    );

    if (result.rows.length === 0) {
      return { status: 'UNKNOWN', lastUpdated: new Date().toISOString() };
    }

    return {
      status: result.rows[0].status,
      lastUpdated: result.rows[0].completed_date || new Date().toISOString()
    };
  }

  async getEquipmentNextMaintenanceDueV3(equipmentId: string): Promise<string | null> {
    const result = await this.pool.query(
      `SELECT scheduled_date
       FROM maintenance
       WHERE equipment_id = $1 AND status IN ('SCHEDULED', 'PENDING')
       ORDER BY scheduled_date ASC
       LIMIT 1`,
      [equipmentId]
    );

    return result.rows.length > 0 ? result.rows[0].scheduled_date : null;
  }

  // ============================================================================
  // USER HELPER METHOD (for technician field resolver)
  // ============================================================================

  async getUserById(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  // ============================================================================
  // SUPPLIERS V3 METHODS (2C)
  // ============================================================================

  async getSuppliersV3(args: {
    limit?: number;
    offset?: number;
    category?: string;
    status?: string;
  }): Promise<any[]> {
    const { limit = 50, offset = 0, category, status } = args;

    let query = `
      SELECT
        id, name, contact_person, email, phone, address,
        category, status, payment_terms, created_at, updated_at
      FROM suppliers
    `;

    const params: any[] = [];

    if (category || status) {
      query += ` WHERE`;
      const conditions: string[] = [];

      if (category) {
        conditions.push(` category = $${params.length + 1}`);
        params.push(category);
      }
      if (status) {
        conditions.push(` status = $${params.length + 1}`);
        params.push(status);
      }

      query += conditions.join(' AND ');
    }

    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getSupplierV3ById(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM suppliers WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createSupplierV3(input: any): Promise<any> {
    const {
      name,
      contactPerson,
      email,
      phone,
      address,
      category,
      status,
      paymentTerms
    } = input;

    const result = await this.pool.query(
      `INSERT INTO suppliers (
        name, contact_person, email, phone, address,
        category, status, payment_terms, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [name, contactPerson, email, phone, address, category, status || 'ACTIVE', paymentTerms]
    );

    return result.rows[0];
  }

  async updateSupplierV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.contactPerson !== undefined) {
      updates.push(`contact_person = $${paramIndex++}`);
      values.push(input.contactPerson);
    }
    if (input.email !== undefined) {
      updates.push(`email = $${paramIndex++}`);
      values.push(input.email);
    }
    if (input.phone !== undefined) {
      updates.push(`phone = $${paramIndex++}`);
      values.push(input.phone);
    }
    if (input.address !== undefined) {
      updates.push(`address = $${paramIndex++}`);
      values.push(input.address);
    }
    if (input.category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(input.category);
    }
    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }
    if (input.paymentTerms !== undefined) {
      updates.push(`payment_terms = $${paramIndex++}`);
      values.push(input.paymentTerms);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE suppliers
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deleteSupplierV3(id: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM suppliers WHERE id = $1`,
      [id]
    );
  }

  // ============================================================================
  // PURCHASE ORDERS V3 METHODS (2C)
  // ============================================================================

  async getPurchaseOrdersV3(args: {
    supplierId?: string;
    limit?: number;
    offset?: number;
    status?: string;
  }): Promise<any[]> {
    const { supplierId, limit = 50, offset = 0, status } = args;

    let query = `
      SELECT
        id, order_number, supplier_id, status, order_date,
        expected_delivery_date, actual_delivery_date, total_amount,
        notes, created_by, approved_by, approved_at,
        cancellation_reason, created_at, updated_at
      FROM purchase_orders
    `;

    const params: any[] = [];

    if (supplierId || status) {
      query += ` WHERE`;
      const conditions: string[] = [];

      if (supplierId) {
        conditions.push(` supplier_id = $${params.length + 1}`);
        params.push(supplierId);
      }
      if (status) {
        conditions.push(` status = $${params.length + 1}`);
        params.push(status);
      }

      query += conditions.join(' AND ');
    }

    query += ` ORDER BY order_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getPurchaseOrderV3ById(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM purchase_orders WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createPurchaseOrderV3(input: any): Promise<any> {
    const {
      supplierId,
      orderDate,
      expectedDeliveryDate,
      notes,
      createdBy,
      items
    } = input;

    // Generate order number
    const orderNumber = `PO-${Date.now()}`;

    // Calculate total amount from items
    let totalAmount = 0;
    if (items && items.length > 0) {
      totalAmount = items.reduce((sum: number, item: any) => sum + (item.quantity * item.unitPrice), 0);
    }

    const result = await this.pool.query(
      `INSERT INTO purchase_orders (
        order_number, supplier_id, status, order_date,
        expected_delivery_date, total_amount, notes, created_by,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
      RETURNING *`,
      [orderNumber, supplierId, 'DRAFT', orderDate, expectedDeliveryDate, totalAmount, notes, createdBy]
    );

    const purchaseOrder = result.rows[0];

    // Add items if provided
    if (items && items.length > 0) {
      for (const item of items) {
        await this.addPurchaseOrderItemV3(purchaseOrder.id, item);
      }
    }

    return purchaseOrder;
  }

  async updatePurchaseOrderV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.expectedDeliveryDate !== undefined) {
      updates.push(`expected_delivery_date = $${paramIndex++}`);
      values.push(input.expectedDeliveryDate);
    }
    if (input.notes !== undefined) {
      updates.push(`notes = $${paramIndex++}`);
      values.push(input.notes);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE purchase_orders
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async approvePurchaseOrderV3(id: string, approverId: string): Promise<any> {
    const result = await this.pool.query(
      `UPDATE purchase_orders
       SET status = 'APPROVED', approved_by = $1, approved_at = NOW(), updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [approverId, id]
    );

    return result.rows[0];
  }

  async cancelPurchaseOrderV3(id: string, reason?: string): Promise<any> {
    const result = await this.pool.query(
      `UPDATE purchase_orders
       SET status = 'CANCELLED', cancellation_reason = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [reason, id]
    );

    return result.rows[0];
  }

  async receivePurchaseOrderV3(id: string, receivedItems: any[]): Promise<any> {
    // Update received quantities for items
    for (const item of receivedItems) {
      await this.pool.query(
        `UPDATE purchase_order_items
         SET received_quantity = received_quantity + $1, updated_at = NOW()
         WHERE id = $2`,
        [item.receivedQuantity, item.id]
      );
    }

    // Check if all items are fully received
    const itemsResult = await this.pool.query(
      `SELECT COUNT(*) as total, COUNT(CASE WHEN quantity <= received_quantity THEN 1 END) as received
       FROM purchase_order_items
       WHERE purchase_order_id = $1`,
      [id]
    );

    const { total, received } = itemsResult.rows[0];
    const status = total === received ? 'RECEIVED' : 'PARTIALLY_RECEIVED';

    const result = await this.pool.query(
      `UPDATE purchase_orders
       SET status = $1, actual_delivery_date = NOW(), updated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [status, id]
    );

    return result.rows[0];
  }

  // ============================================================================
  // PURCHASE ORDER ITEMS V3 METHODS (2C)
  // ============================================================================

  async getPurchaseOrderItemsV3(purchaseOrderId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT
        id, purchase_order_id, material_id, quantity,
        unit_price, total_price, received_quantity, created_at, updated_at
      FROM purchase_order_items
      WHERE purchase_order_id = $1
      ORDER BY created_at ASC`,
      [purchaseOrderId]
    );

    return result.rows;
  }

  async addPurchaseOrderItemV3(purchaseOrderId: string, input: any): Promise<any> {
    const { materialId, quantity, unitPrice } = input;
    const totalPrice = quantity * unitPrice;

    const result = await this.pool.query(
      `INSERT INTO purchase_order_items (
        purchase_order_id, material_id, quantity, unit_price,
        total_price, received_quantity, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      RETURNING *`,
      [purchaseOrderId, materialId, quantity, unitPrice, totalPrice, 0]
    );

    // Update purchase order total
    await this.updatePurchaseOrderTotalV3(purchaseOrderId);

    return result.rows[0];
  }

  async updatePurchaseOrderItemV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.quantity !== undefined) {
      updates.push(`quantity = $${paramIndex++}`);
      values.push(input.quantity);
      // Recalculate total price
      if (input.unitPrice !== undefined) {
        updates.push(`total_price = $${paramIndex++}`);
        values.push(input.quantity * input.unitPrice);
      } else {
        // Get current unit price and recalculate
        const current = await this.pool.query(
          `SELECT unit_price FROM purchase_order_items WHERE id = $1`,
          [id]
        );
        if (current.rows[0]) {
          updates.push(`total_price = $${paramIndex++}`);
          values.push(input.quantity * current.rows[0].unit_price);
        }
      }
    }

    if (input.unitPrice !== undefined) {
      updates.push(`unit_price = $${paramIndex++}`);
      values.push(input.unitPrice);
      // Recalculate total price
      const current = await this.pool.query(
        `SELECT quantity FROM purchase_order_items WHERE id = $1`,
        [id]
      );
      if (current.rows[0]) {
        updates.push(`total_price = $${paramIndex++}`);
        values.push(current.rows[0].quantity * input.unitPrice);
      }
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE purchase_order_items
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);

    // Update purchase order total
    const item = result.rows[0];
    await this.updatePurchaseOrderTotalV3(item.purchase_order_id);

    return item;
  }

  async removePurchaseOrderItemV3(id: string): Promise<void> {
    // Get purchase order ID before deleting
    const itemResult = await this.pool.query(
      `SELECT purchase_order_id FROM purchase_order_items WHERE id = $1`,
      [id]
    );

    if (itemResult.rows[0]) {
      const purchaseOrderId = itemResult.rows[0].purchase_order_id;

      await this.pool.query(
        `DELETE FROM purchase_order_items WHERE id = $1`,
        [id]
      );

      // Update purchase order total
      await this.updatePurchaseOrderTotalV3(purchaseOrderId);
    }
  }

  // ============================================================================
  // PURCHASE ORDER HELPER METHODS (2C)
  // ============================================================================

  async updatePurchaseOrderTotalV3(purchaseOrderId: string): Promise<void> {
    const result = await this.pool.query(
      `SELECT COALESCE(SUM(total_price), 0) as total FROM purchase_order_items
       WHERE purchase_order_id = $1`,
      [purchaseOrderId]
    );

    const total = result.rows[0].total;

    await this.pool.query(
      `UPDATE purchase_orders SET total_amount = $1, updated_at = NOW() WHERE id = $2`,
      [total, purchaseOrderId]
    );
  }

  // ============================================================================
  // SUPPLIER HELPER METHODS (2C)
  // ============================================================================

  async getSupplierPurchaseOrdersV3(args: { supplierId: string; limit?: number }): Promise<any[]> {
    const { supplierId, limit = 20 } = args;

    const result = await this.pool.query(
      `SELECT
        id, order_number, status, order_date, total_amount
      FROM purchase_orders
      WHERE supplier_id = $1
      ORDER BY order_date DESC
      LIMIT $2`,
      [supplierId, limit]
    );

    return result.rows;
  }

  async getSupplierMaterialsV3(supplierId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT DISTINCT
        m.id, m.name, m.description, m.category, m.unit
      FROM materials m
      INNER JOIN purchase_order_items poi ON m.id = poi.material_id
      INNER JOIN purchase_orders po ON poi.purchase_order_id = po.id
      WHERE po.supplier_id = $1`,
      [supplierId]
    );

    return result.rows;
  }

  async getSupplierTotalOrdersV3(supplierId: string): Promise<number> {
    const result = await this.pool.query(
      `SELECT COUNT(*) as total FROM purchase_orders WHERE supplier_id = $1`,
      [supplierId]
    );

    return parseInt(result.rows[0].total) || 0;
  }

  async getSupplierTotalSpentV3(supplierId: string): Promise<number> {
    const result = await this.pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total FROM purchase_orders
       WHERE supplier_id = $1 AND status IN ('RECEIVED', 'PARTIALLY_RECEIVED')`,
      [supplierId]
    );

    return parseFloat(result.rows[0].total) || 0;
  }

  // ============================================================================
  // MARKETPLACE V3 METHODS - B2B DENTAL SUPPLY SYSTEM
  // ============================================================================

  async getMarketplaceProductsV3(args: {
    supplierId?: string;
    category?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { supplierId, category, limit = 50, offset = 0 } = args;

    let query = `
      SELECT
        mp.id, mp.name, mp.description, mp.category, mp.unit_price,
        mp.unit, mp.minimum_order_quantity, mp.lead_time_days,
        mp.supplier_id, mp.is_active, mp.created_at, mp.updated_at,
        s.name as supplier_name, s.contact_email, s.contact_phone
      FROM marketplace_products mp
      LEFT JOIN suppliers s ON mp.supplier_id = s.id
      WHERE mp.is_active = true
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (supplierId) {
      conditions.push(`mp.supplier_id = $${params.length + 1}`);
      params.push(supplierId);
    }

    if (category) {
      conditions.push(`mp.category = $${params.length + 1}`);
      params.push(category);
    }

    if (conditions.length > 0) {
      query += ` AND ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY mp.name ASC`;
    query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getMarketplaceProductV3(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT
        mp.*,
        s.name as supplier_name, s.contact_email, s.contact_phone,
        s.address, s.rating, s.is_verified
      FROM marketplace_products mp
      LEFT JOIN suppliers s ON mp.supplier_id = s.id
      WHERE mp.id = $1 AND mp.is_active = true`,
      [id]
    );
    return result.rows[0] || null;
  }

  async deletePurchaseOrderV3(id: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM purchase_orders WHERE id = $1`,
      [id]
    );
  }

  async addToCartV3(input: any): Promise<any> {
    const {
      marketplaceProductId,
      quantity,
      unitPrice
    } = input;

    // Check if item already exists in cart
    const existing = await this.pool.query(
      `SELECT id, quantity FROM cart_items WHERE marketplace_product_id = $1`,
      [marketplaceProductId]
    );

    if (existing.rows.length > 0) {
      // Update existing item
      const newQuantity = existing.rows[0].quantity + quantity;
      const totalPrice = newQuantity * unitPrice;

      const result = await this.pool.query(
        `UPDATE cart_items
         SET quantity = $1, total_price = $2, updated_at = NOW()
         WHERE id = $3
         RETURNING *`,
        [newQuantity, totalPrice, existing.rows[0].id]
      );

      return result.rows[0];
    } else {
      // Add new item
      const totalPrice = quantity * unitPrice;

      const result = await this.pool.query(
        `INSERT INTO cart_items (
          marketplace_product_id, quantity, unit_price, total_price, added_at
        ) VALUES ($1, $2, $3, $4, NOW())
        RETURNING *`,
        [marketplaceProductId, quantity, unitPrice, totalPrice]
      );

      return result.rows[0];
    }
  }

  async updateCartItemV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.quantity !== undefined) {
      updates.push(`quantity = $${paramIndex++}`);
      values.push(input.quantity);

      // Get current unit price to recalculate total
      const current = await this.pool.query(
        `SELECT unit_price FROM cart_items WHERE id = $1`,
        [id]
      );
      if (current.rows[0]) {
        updates.push(`total_price = $${paramIndex++}`);
        values.push(input.quantity * current.rows[0].unit_price);
      }
    }

    if (input.unitPrice !== undefined) {
      updates.push(`unit_price = $${paramIndex++}`);
      values.push(input.unitPrice);

      // Recalculate total with new unit price
      const current = await this.pool.query(
        `SELECT quantity FROM cart_items WHERE id = $1`,
        [id]
      );
      if (current.rows[0]) {
        updates.push(`total_price = $${paramIndex++}`);
        values.push(current.rows[0].quantity * input.unitPrice);
      }
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE cart_items
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async removeFromCartV3(id: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM cart_items WHERE id = $1`,
      [id]
    );
  }

  async clearCartV3(): Promise<void> {
    await this.pool.query(
      `DELETE FROM cart_items`
    );
  }

  async getCartItemsV3(args: {
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { limit = 50, offset = 0 } = args;

    const result = await this.pool.query(
      `SELECT
        ci.id, ci.marketplace_product_id, ci.quantity, ci.unit_price,
        ci.total_price, ci.added_at,
        mp.name as product_name, mp.unit, mp.supplier_id,
        s.name as supplier_name
      FROM cart_items ci
      LEFT JOIN marketplace_products mp ON ci.marketplace_product_id = mp.id
      LEFT JOIN suppliers s ON mp.supplier_id = s.id
      ORDER BY ci.added_at DESC
      LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    return result.rows;
  }

  // ============================================================================
  // SUBSCRIPTIONS V3 METHODS - NETFLIX-DENTAL SYSTEM
  // ============================================================================

  async getSubscriptionPlansV3(args: { activeOnly?: boolean }): Promise<any[]> {
    const { activeOnly = true } = args;

    let query = `
      SELECT
        id, name, description, tier, price, currency, billing_cycle,
        max_services_per_month, max_services_per_year, popular, recommended,
        active, created_at, updated_at
      FROM subscription_plans
    `;

    const params: any[] = [];

    if (activeOnly) {
      query += ` WHERE active = $1`;
      params.push(true);
    }

    query += ` ORDER BY tier ASC, price ASC`;

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getSubscriptionPlanV3ById(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM subscription_plans WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async getSubscriptionPlanFeaturesV3(planId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM subscription_plan_features WHERE plan_id = $1 ORDER BY name ASC`,
      [planId]
    );
    return result.rows;
  }

  async createSubscriptionPlanV3(input: any): Promise<any> {
    const client = await this.pool.connect();

    try {
      await client.query('BEGIN');

      const {
        name,
        description,
        tier,
        price,
        currency,
        billingCycle,
        maxServicesPerMonth,
        maxServicesPerYear,
        features,
        popular,
        recommended
      } = input;

      // Create the plan
      const planResult = await client.query(
        `INSERT INTO subscription_plans (
          name, description, tier, price, currency, billing_cycle,
          max_services_per_month, max_services_per_year, popular, recommended,
          active, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())
        RETURNING *`,
        [name, description, tier, price, currency, billingCycle, maxServicesPerMonth, maxServicesPerYear, popular || false, recommended || false, true]
      );

      const plan = planResult.rows[0];

      // Add features if provided
      if (features && features.length > 0) {
        for (const feature of features) {
          await client.query(
            `INSERT INTO subscription_plan_features (
              plan_id, name, description, included, limit, unit, created_at
            ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
            [plan.id, feature.name, feature.description, feature.included, feature.limit, feature.unit]
          );
        }
      }

      await client.query('COMMIT');
      return plan;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async updateSubscriptionPlanV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.name !== undefined) {
      updates.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.description !== undefined) {
      updates.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }
    if (input.price !== undefined) {
      updates.push(`price = $${paramIndex++}`);
      values.push(input.price);
    }
    if (input.maxServicesPerMonth !== undefined) {
      updates.push(`max_services_per_month = $${paramIndex++}`);
      values.push(input.maxServicesPerMonth);
    }
    if (input.maxServicesPerYear !== undefined) {
      updates.push(`max_services_per_year = $${paramIndex++}`);
      values.push(input.maxServicesPerYear);
    }
    if (input.popular !== undefined) {
      updates.push(`popular = $${paramIndex++}`);
      values.push(input.popular);
    }
    if (input.recommended !== undefined) {
      updates.push(`recommended = $${paramIndex++}`);
      values.push(input.recommended);
    }
    if (input.active !== undefined) {
      updates.push(`active = $${paramIndex++}`);
      values.push(input.active);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE subscription_plans
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async getSubscriptionsV3(args: {
    patientId?: string;
    status?: string;
    planId?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { patientId, status, planId, limit = 50, offset = 0 } = args;

    let query = `
      SELECT
        s.id, s.patient_id, s.plan_id, s.status, s.start_date, s.end_date,
        s.next_billing_date, s.auto_renew, s.payment_method_id,
        s.usage_this_month, s.usage_this_year, s.remaining_services,
        s.created_at, s.updated_at,
        sp.name as plan_name, sp.tier, sp.price, sp.currency, sp.billing_cycle,
        p.first_name, p.last_name
      FROM subscriptions s
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
      LEFT JOIN patients p ON s.patient_id = p.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (patientId) {
      conditions.push(`s.patient_id = $${params.length + 1}`);
      params.push(patientId);
    }
    if (status) {
      conditions.push(`s.status = $${params.length + 1}`);
      params.push(status);
    }
    if (planId) {
      conditions.push(`s.plan_id = $${params.length + 1}`);
      params.push(planId);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY s.created_at DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getSubscriptionV3ById(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT
        s.*,
        sp.name as plan_name, sp.tier, sp.price, sp.currency, sp.billing_cycle,
        sp.max_services_per_month, sp.max_services_per_year,
        p.first_name, p.last_name
      FROM subscriptions s
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
      LEFT JOIN patients p ON s.patient_id = p.id
      WHERE s.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createSubscriptionV3(input: any): Promise<any> {
    const {
      patientId,
      planId,
      paymentMethodId,
      autoRenew,
      startDate
    } = input;

    // Get plan details for billing cycle calculation
    const plan = await this.getSubscriptionPlanV3ById(planId);
    if (!plan) {
      throw new Error(`Subscription plan not found: ${planId}`);
    }

    // Calculate next billing date based on plan's billing cycle
    const start = startDate ? new Date(startDate) : new Date();
    let nextBillingDate = new Date(start);

    switch (plan.billing_cycle) {
      case 'MONTHLY':
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
        break;
      case 'SEMI_ANNUAL':
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 6);
        break;
      case 'ANNUAL':
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        break;
    }

    const result = await this.pool.query(
      `INSERT INTO subscriptions (
        patient_id, plan_id, status, start_date, next_billing_date,
        auto_renew, payment_method_id, usage_this_month, usage_this_year,
        remaining_services, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *`,
      [patientId, planId, 'ACTIVE', start.toISOString(), nextBillingDate.toISOString(), autoRenew || true, paymentMethodId, 0, 0, plan.max_services_per_month]
    );

    return result.rows[0];
  }

  async updateSubscriptionV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(input.status);
    }
    if (input.autoRenew !== undefined) {
      updates.push(`auto_renew = $${paramIndex++}`);
      values.push(input.autoRenew);
    }
    if (input.paymentMethodId !== undefined) {
      updates.push(`payment_method_id = $${paramIndex++}`);
      values.push(input.paymentMethodId);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE subscriptions
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async cancelSubscriptionV3(id: string, reason?: string): Promise<void> {
    await this.pool.query(
      `UPDATE subscriptions
       SET status = 'CANCELLED', end_date = NOW(), updated_at = NOW()
       WHERE id = $1`,
      [id]
    );

    // Log cancellation reason if provided
    if (reason) {
      console.log(`Subscription ${id} cancelled: ${reason}`);
    }
  }

  async renewSubscriptionV3(id: string): Promise<any> {
    // Get current subscription
    const current = await this.getSubscriptionV3ById(id);
    if (!current) {
      throw new Error(`Subscription not found: ${id}`);
    }

    // Calculate new billing cycle
    const plan = await this.getSubscriptionPlanV3ById(current.plan_id);
    let nextBillingDate = new Date(current.next_billing_date);

    switch (plan.billing_cycle) {
      case 'MONTHLY':
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 1);
        break;
      case 'QUARTERLY':
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 3);
        break;
      case 'SEMI_ANNUAL':
        nextBillingDate.setMonth(nextBillingDate.getMonth() + 6);
        break;
      case 'ANNUAL':
        nextBillingDate.setFullYear(nextBillingDate.getFullYear() + 1);
        break;
    }

    // Reset usage counters and update billing date
    const result = await this.pool.query(
      `UPDATE subscriptions
       SET next_billing_date = $1, usage_this_month = 0, remaining_services = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [nextBillingDate.toISOString(), plan.max_services_per_month, id]
    );

    return result.rows[0];
  }

  async getBillingCyclesV3(args: {
    subscriptionId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { subscriptionId, status, dateFrom, dateTo, limit = 50, offset = 0 } = args;

    let query = `
      SELECT
        bc.*,
        s.patient_id,
        sp.name as plan_name
      FROM billing_cycles bc
      LEFT JOIN subscriptions s ON bc.subscription_id = s.id
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (subscriptionId) {
      conditions.push(`bc.subscription_id = $${params.length + 1}`);
      params.push(subscriptionId);
    }
    if (status) {
      conditions.push(`bc.status = $${params.length + 1}`);
      params.push(status);
    }
    if (dateFrom) {
      conditions.push(`bc.cycle_start_date >= $${params.length + 1}`);
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push(`bc.cycle_end_date <= $${params.length + 1}`);
      params.push(dateTo);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY bc.cycle_start_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async processBillingCycleV3(subscriptionId: string): Promise<any> {
    // Get subscription details
    const subscription = await this.getSubscriptionV3ById(subscriptionId);
    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    // Create billing cycle record
    const cycleStartDate = new Date(subscription.start_date);
    const cycleEndDate = new Date(subscription.next_billing_date);

    const result = await this.pool.query(
      `INSERT INTO billing_cycles (
        subscription_id, cycle_start_date, cycle_end_date, amount,
        currency, status, usage_count, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
      RETURNING *`,
      [subscriptionId, cycleStartDate.toISOString(), cycleEndDate.toISOString(), subscription.price, subscription.currency, 'PAID', subscription.usage_this_month]
    );

    return result.rows[0];
  }

  async getUsageTrackingV3(args: {
    subscriptionId?: string;
    dateFrom?: string;
    dateTo?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const { subscriptionId, dateFrom, dateTo, limit = 50, offset = 0 } = args;

    let query = `
      SELECT
        ut.*,
        s.patient_id,
        sp.name as plan_name
      FROM usage_tracking ut
      LEFT JOIN subscriptions s ON ut.subscription_id = s.id
      LEFT JOIN subscription_plans sp ON s.plan_id = sp.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (subscriptionId) {
      conditions.push(`ut.subscription_id = $${params.length + 1}`);
      params.push(subscriptionId);
    }
    if (dateFrom) {
      conditions.push(`ut.usage_date >= $${params.length + 1}`);
      params.push(dateFrom);
    }
    if (dateTo) {
      conditions.push(`ut.usage_date <= $${params.length + 1}`);
      params.push(dateTo);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY ut.usage_date DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(limit, offset);

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async trackServiceUsageV3(input: any): Promise<any> {
    const {
      subscriptionId,
      serviceType,
      serviceId,
      cost,
      notes
    } = input;

    // Get current subscription to update usage counters
    const subscription = await this.getSubscriptionV3ById(subscriptionId);
    if (!subscription) {
      throw new Error(`Subscription not found: ${subscriptionId}`);
    }

    // Track the usage
    const result = await this.pool.query(
      `INSERT INTO usage_tracking (
        subscription_id, service_type, service_id, usage_date,
        cost, notes, created_at
      ) VALUES ($1, $2, $3, NOW(), $4, $5, NOW())
      RETURNING *`,
      [subscriptionId, serviceType, serviceId, cost || 0, notes]
    );

    // Update subscription usage counters
    await this.pool.query(
      `UPDATE subscriptions
       SET usage_this_month = usage_this_month + 1,
           usage_this_year = usage_this_year + 1,
           remaining_services = GREATEST(remaining_services - 1, 0),
           updated_at = NOW()
       WHERE id = $1`,
      [subscriptionId]
    );

    return result.rows[0];
  }

  // ============================================================================
  // CUSTOM CALENDAR V3 METHODS - AINARKLENDAR SYSTEM
  // ============================================================================

  async getCustomCalendarViewsV3(args: { userId?: string }): Promise<any[]> {
    const { userId } = args;

    let query = `
      SELECT
        ccv.*,
        u.first_name || ' ' || u.last_name as user_name
      FROM custom_calendar_views ccv
      LEFT JOIN users u ON ccv.user_id = u.id
    `;

    const params: any[] = [];

    if (userId) {
      query += ` WHERE ccv.user_id = $1`;
      params.push(userId);
    }

    query += ` ORDER BY ccv.created_at DESC`;

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async getCustomCalendarViewV3ById(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT
        ccv.*,
        u.first_name || ' ' || u.last_name as user_name
       FROM custom_calendar_views ccv
       LEFT JOIN users u ON ccv.user_id = u.id
       WHERE ccv.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async createCustomCalendarViewV3(input: any): Promise<any> {
    const {
      userId,
      name,
      viewType,
      defaultDate,
      filters,
      settings,
      isDefault
    } = input;

    const result = await this.pool.query(
      `INSERT INTO custom_calendar_views (
        user_id, name, view_type, default_date, filters,
        settings, is_default, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
      RETURNING *`,
      [userId, name, viewType, defaultDate, JSON.stringify(filters || {}), JSON.stringify(settings || {}), isDefault || false]
    );

    return result.rows[0];
  }

  async updateCustomCalendarViewV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.viewType) {
      updates.push(`view_type = $${paramIndex++}`);
      values.push(input.viewType);
    }
    if (input.defaultDate) {
      updates.push(`default_date = $${paramIndex++}`);
      values.push(input.defaultDate);
    }
    if (input.filters) {
      updates.push(`filters = $${paramIndex++}`);
      values.push(JSON.stringify(input.filters));
    }
    if (input.settings) {
      updates.push(`settings = $${paramIndex++}`);
      values.push(JSON.stringify(input.settings));
    }
    if (input.isDefault !== undefined) {
      updates.push(`is_default = $${paramIndex++}`);
      values.push(input.isDefault);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE custom_calendar_views
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deleteCustomCalendarViewV3(id: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM custom_calendar_views WHERE id = $1`,
      [id]
    );
  }

  async getCalendarSettingsV3(userId: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM calendar_settings WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  async updateCalendarSettingsV3(userId: string, settings: any): Promise<any> {
    const result = await this.pool.query(
      `INSERT INTO calendar_settings (user_id, settings, updated_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id)
       DO UPDATE SET settings = EXCLUDED.settings, updated_at = NOW()
       RETURNING *`,
      [userId, JSON.stringify(settings)]
    );
    return result.rows[0];
  }

  async getCalendarFiltersV3(userId: string): Promise<any[]> {
    const result = await this.pool.query(
      `SELECT * FROM calendar_filters WHERE user_id = $1 ORDER BY created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async createCalendarFilterV3(input: any): Promise<any> {
    const {
      userId,
      name,
      filterType,
      criteria,
      isActive
    } = input;

    const result = await this.pool.query(
      `INSERT INTO calendar_filters (
        user_id, name, filter_type, criteria, is_active, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      RETURNING *`,
      [userId, name, filterType, JSON.stringify(criteria), isActive || true]
    );

    return result.rows[0];
  }

  async updateCalendarFilterV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.name) {
      updates.push(`name = $${paramIndex++}`);
      values.push(input.name);
    }
    if (input.filterType) {
      updates.push(`filter_type = $${paramIndex++}`);
      values.push(input.filterType);
    }
    if (input.criteria) {
      updates.push(`criteria = $${paramIndex++}`);
      values.push(JSON.stringify(input.criteria));
    }
    if (input.isActive !== undefined) {
      updates.push(`is_active = $${paramIndex++}`);
      values.push(input.isActive);
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE calendar_filters
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deleteCalendarFilterV3(id: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM calendar_filters WHERE id = $1`,
      [id]
    );
  }

  async getCalendarEventsV3(args: {
    userId?: string;
    startDate?: string;
    endDate?: string;
    eventType?: string;
  }): Promise<any[]> {
    const { userId, startDate, endDate, eventType } = args;

    let query = `
      SELECT
        ce.*,
        u.first_name || ' ' || u.last_name as user_name
      FROM calendar_events ce
      LEFT JOIN users u ON ce.user_id = u.id
    `;

    const params: any[] = [];
    const conditions: string[] = [];

    if (userId) {
      conditions.push(`ce.user_id = $${params.length + 1}`);
      params.push(userId);
    }
    if (startDate) {
      conditions.push(`ce.event_date >= $${params.length + 1}`);
      params.push(startDate);
    }
    if (endDate) {
      conditions.push(`ce.event_date <= $${params.length + 1}`);
      params.push(endDate);
    }
    if (eventType) {
      conditions.push(`ce.event_type = $${params.length + 1}`);
      params.push(eventType);
    }

    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(' AND ')}`;
    }

    query += ` ORDER BY ce.event_date ASC, ce.start_time ASC`;

    const result = await this.pool.query(query, params);
    return result.rows;
  }

  async createCalendarEventV3(input: any): Promise<any> {
    const {
      userId,
      title,
      description,
      eventType,
      eventDate,
      startTime,
      endTime,
      location,
      attendees,
      metadata
    } = input;

    const result = await this.pool.query(
      `INSERT INTO calendar_events (
        user_id, title, description, event_type, event_date,
        start_time, end_time, location, attendees, metadata,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *`,
      [userId, title, description, eventType, eventDate, startTime, endTime, location, JSON.stringify(attendees || []), JSON.stringify(metadata || {})]
    );

    return result.rows[0];
  }

  async updateCalendarEventV3(id: string, input: any): Promise<any> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (input.title) {
      updates.push(`title = $${paramIndex++}`);
      values.push(input.title);
    }
    if (input.description) {
      updates.push(`description = $${paramIndex++}`);
      values.push(input.description);
    }
    if (input.eventType) {
      updates.push(`event_type = $${paramIndex++}`);
      values.push(input.eventType);
    }
    if (input.eventDate) {
      updates.push(`event_date = $${paramIndex++}`);
      values.push(input.eventDate);
    }
    if (input.startTime) {
      updates.push(`start_time = $${paramIndex++}`);
      values.push(input.startTime);
    }
    if (input.endTime) {
      updates.push(`end_time = $${paramIndex++}`);
      values.push(input.endTime);
    }
    if (input.location) {
      updates.push(`location = $${paramIndex++}`);
      values.push(input.location);
    }
    if (input.attendees) {
      updates.push(`attendees = $${paramIndex++}`);
      values.push(JSON.stringify(input.attendees));
    }
    if (input.metadata) {
      updates.push(`metadata = $${paramIndex++}`);
      values.push(JSON.stringify(input.metadata));
    }

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const query = `
      UPDATE calendar_events
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async deleteCalendarEventV3(id: string): Promise<void> {
    await this.pool.query(
      `DELETE FROM calendar_events WHERE id = $1`,
      [id]
    );
  }

  // ============================================================================
  // ADDITIONAL CUSTOMCALENDAR METHODS
  // ============================================================================

  async setDefaultCalendarViewV3(userId: string, viewId: string): Promise<void> {
    // First, unset any existing default for this user
    await this.pool.query(
      `UPDATE custom_calendar_views SET is_default = false WHERE user_id = $1`,
      [userId]
    );

    // Then set the new default
    await this.pool.query(
      `UPDATE custom_calendar_views SET is_default = true WHERE id = $1 AND user_id = $2`,
      [viewId, userId]
    );
  }

  async getCalendarFilterV3ById(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT * FROM calendar_filters WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async getCalendarEventV3ById(id: string): Promise<any> {
    const result = await this.pool.query(
      `SELECT
        ce.*,
        u.first_name || ' ' || u.last_name as user_name
      FROM calendar_events ce
      LEFT JOIN users u ON ce.user_id = u.id
      WHERE ce.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  }

  async getCalendarAvailabilityV3(userId: string, date: string): Promise<any[]> {
    // Get all events for the user on the specified date
    const events = await this.pool.query(
      `SELECT
        id, title, start_time, end_time, event_type
      FROM calendar_events
      WHERE user_id = $1 AND event_date = $2
      ORDER BY start_time ASC`,
      [userId, date]
    );

    // Calculate availability slots (assuming 9 AM to 6 PM working hours)
    const workingHours = { start: '09:00', end: '18:00' };
    const availabilitySlots: any[] = [];

    // Simple availability calculation - in a real system this would be more complex
    // For now, just return the events (busy slots)
    return events.rows.map(event => ({
      startTime: event.start_time,
      endTime: event.end_time,
      isAvailable: false,
      eventType: event.event_type,
      eventId: event.id
    }));
  }

  async toggleCalendarFilterV3(filterId: string): Promise<any> {
    // Toggle the active state of a filter
    const result = await this.pool.query(
      `UPDATE calendar_filters
       SET is_active = NOT is_active, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [filterId]
    );
    return result.rows[0];
  }
}

