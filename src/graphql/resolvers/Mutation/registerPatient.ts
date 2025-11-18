/**
 * 🔐 PATIENT REGISTRATION MUTATION
 * GDPR Article 9 Compliant - Creates patient account with explicit consent
 * 
 * FOUR-GATE LIGHT PATTERN:
 * 1. Validate → Email unique, password strength, GDPR consent
 * 2. Business Logic → Hash password, create user + patient records
 * 3. Persistence → Atomic transaction (both or neither)
 * 4. Audit → Log registration event
 * 
 * By PunkClaude - November 2025
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { GraphQLContext } from '../../types.js';

const JWT_SECRET = process.env.JWT_SECRET || 'selene-secret-key';
const BCRYPT_ROUNDS = 12; // Secure but not overkill (2^12 = 4096 iterations)

/**
 * Input type para registro de paciente
 */
export interface RegisterPatientInput {
  // Identificación
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  
  // Datos personales
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  
  // GDPR Compliance (CRÍTICO)
  termsAccepted: boolean; // Debe ser true para registrar
}

/**
 * Response type para registro exitoso
 */
export interface RegisterPatientResponse {
  success: boolean;
  message: string;
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    email: string;
    role: string;
  };
  patient: {
    id: number;
    firstName: string;
    lastName: string;
  };
}

/**
 * 🔐 MUTATION: registerPatient
 * 
 * Crea una cuenta de paciente completa (user + patient)
 * 
 * @example GraphQL
 * ```graphql
 * mutation {
 *   registerPatient(input: {
 *     email: "patient@example.com"
 *     password: "SecurePass123!"
 *     firstName: "John"
 *     lastName: "Doe"
 *     phone: "+34600123456"
 *     dateOfBirth: "1990-01-01"
 *     termsAccepted: true
 *   }) {
 *     success
 *     accessToken
 *     user { id email role }
 *     patient { id firstName lastName }
 *   }
 * }
 * ```
 */
export async function registerPatient(
  _parent: unknown,
  { input }: { input: RegisterPatientInput },
  context: GraphQLContext
): Promise<RegisterPatientResponse> {
  const { database } = context;
  const pool = database.getPool();
  const client = await pool.connect();
  
  try {
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // GATE 1: VALIDATION
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // 1.1 - GDPR Consent (CRÍTICO)
    if (!input.termsAccepted) {
      throw new Error(
        'GDPR Compliance: Debes aceptar los términos y condiciones para registrarte'
      );
    }
    
    // 1.2 - Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new Error('Email inválido');
    }
    
    // 1.3 - Password strength (mínimo 8 chars, 1 upper, 1 lower, 1 number)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(input.password)) {
      throw new Error(
        'Contraseña débil: mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número'
      );
    }
    
    // 1.4 - Email único (check en DB)
    await client.query('BEGIN');
    
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1 LIMIT 1',
      [input.email.toLowerCase()]
    );
    
    if (existingUser.rows.length > 0) {
      await client.query('ROLLBACK');
      throw new Error('Este email ya está registrado');
    }
    
    // 1.5 - Nombre y apellido no vacíos
    if (!input.firstName.trim() || !input.lastName.trim()) {
      await client.query('ROLLBACK');
      throw new Error('Nombre y apellido son obligatorios');
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // GATE 2: BUSINESS LOGIC
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // 2.1 - Hash password (bcrypt)
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    
    // 2.2 - Generar username único (first_last_timestamp)
    const username = `${input.firstName.toLowerCase()}_${input.lastName.toLowerCase()}_${Date.now()}`;
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // GATE 3: PERSISTENCE (ATOMIC TRANSACTION)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // 3.1 - Crear registro en users
    const userResult = await client.query(
      `INSERT INTO users (
        email, 
        password_hash, 
        username, 
        first_name, 
        last_name, 
        role,
        is_active,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, true, NOW(), NOW())
      RETURNING id, email, role`,
      [
        input.email.toLowerCase(),
        passwordHash,
        username,
        input.firstName,
        input.lastName,
        'PATIENT', // ← ROL CRÍTICO para RLS
      ]
    );
    
    const newUser = userResult.rows[0];
    
    // 3.2 - Crear registro en patients (linked al user)
    const patientResult = await client.query(
      `INSERT INTO patients (
        user_id,
        first_name,
        last_name,
        email,
        phone,
        date_of_birth,
        address,
        terms_accepted_at,
        created_at,
        updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), NOW())
      RETURNING id, first_name, last_name, email`,
      [
        newUser.id,
        input.firstName,
        input.lastName,
        input.email.toLowerCase(),
        input.phone || null,
        input.dateOfBirth || null,
        input.address || null,
      ]
    );
    
    const newPatient = patientResult.rows[0];
    
    await client.query('COMMIT');
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // GATE 4: AUDIT (NON-BLOCKING)
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    console.log('✅ Patient registered:', {
      userId: newUser.id,
      patientId: newPatient.id,
      email: newUser.email,
      role: newUser.role,
      timestamp: new Date().toISOString(),
    });
    
    // Opcional: Log en audit_logs si existe la tabla
    try {
      await pool.query(
        `INSERT INTO audit_logs (
          user_id,
          action,
          entity_type,
          entity_id,
          details,
          ip_address,
          timestamp
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW())`,
        [
          newUser.id,
          'PATIENT_REGISTRATION',
          'patient',
          newPatient.id,
          JSON.stringify({ email: newUser.email, firstName: input.firstName }),
          context.ip || 'unknown',
        ]
      );
    } catch (auditError) {
      // Audit failure no debe bloquear el registro
      console.warn('⚠️  Audit log failed (non-critical):', auditError);
    }
    
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    // RESPONSE: JWT TOKENS
    // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    
    // Generar Access Token (expires en 24h)
    const accessToken = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
        patientId: newPatient.id,
        type: 'access',
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Generar Refresh Token (expires en 30 días)
    const refreshToken = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
        type: 'refresh',
      },
      JWT_SECRET,
      { expiresIn: '30d' }
    );
    
    return {
      success: true,
      message: 'Cuenta creada exitosamente',
      accessToken,
      refreshToken,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
      },
      patient: {
        id: newPatient.id,
        firstName: newPatient.first_name,
        lastName: newPatient.last_name,
      },
    };
    
  } catch (error: any) {
    // Rollback si algo falló
    await client.query('ROLLBACK');
    
    console.error('❌ Patient registration failed:', error);
    throw new Error(error.message || 'Error al registrar paciente');
    
  } finally {
    client.release();
  }
}
