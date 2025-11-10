/**
 * 🔥 SELENE SONG CORE GRAPHQL TYPES
 * By PunkClaude & RaulVisionario - September 23, 2025
 *
 * MISSION: TypeScript interfaces for GraphQL resolvers
 * TARGET: Type safety for Selene Song Core GraphQL layer
 */

import { SeleneDatabase } from "../core/Database.js";
import { SeleneCache } from "../Cache.js";
import { SeleneMonitoring } from "../Monitoring.js";
import { SeleneReactor } from "../Reactor/Reactor.js";
import { SeleneContainment } from "../Containment/Containment.js";
import { SeleneFusion } from "../Fusion/Fusion.js";
import { SeleneVeritas } from "../Veritas/Veritas.js";
import { SeleneConscious } from "../Conscious/Conscious.js";
import { SeleneHeal } from "../Heal/Heal.js";
import { SelenePredict } from "../Predict/Predict.js";
import { SeleneOffline } from "../Offline/Offline.js";

// 📊 GraphQL Context Interface
export interface GraphQLContext {
  database: SeleneDatabase;
  cache: SeleneCache;
  redis?: any; // Direct Redis client for resolvers (optional for backward compatibility)
  monitoring: SeleneMonitoring;
  reactor: SeleneReactor;
  containment: SeleneContainment;
  fusion: SeleneFusion;
  veritas: SeleneVeritas;
  consciousness: SeleneConscious;
  heal: SeleneHeal;
  predict: SelenePredict;
  offline: SeleneOffline;
  
  // 🔥 PHASE 3: VERIFICATION & AUDIT ENGINES
  verificationEngine?: any; // VerificationEngine instance for field validation
  auditLogger?: any; // AuditLogger instance for audit trail tracking
  
  pubsub?: any; // PubSub for subscriptions (optional for now)
  auth?: {
    isAuthenticated: boolean;
    userId?: string;
    role?: string;
    permissions?: string[];
  }; // Authentication context for WebSocket connections
  
  // 🔐 USER & REQUEST CONTEXT (for PHASE 3 audit logging)
  user?: {
    id?: string;
    email?: string;
    role?: string;
  };
  ip?: string; // Client IP address for audit trail
  
  quantumEngine?: any; // Quantum subscription engine for Phase E
}

// 👥 Patient Types
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  insuranceProvider?: string;
  policyNumber?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientInput {
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  emergencyContact?: string;
  insuranceProvider?: string;
  policyNumber?: string;
}

// 📅 Appointment Types
export interface Appointment {
  id: string;
  patientId: string;
  patient?: Patient;
  practitionerId?: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  type: string;
  status: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentInput {
  patientId: string;
  practitionerId?: string;
  appointmentDate: string;
  appointmentTime: string;
  duration: number;
  type: string;
  status?: string;
  notes?: string;
}

// 🏥 Medical Record Types
export interface MedicalRecord {
  id: string;
  patientId: string;
  patient?: Patient;
  practitionerId: string;
  recordType: string;
  title: string;
  content: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string[];
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecordInput {
  patientId: string;
  practitionerId: string;
  recordType: string;
  title: string;
  content: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string[];
  attachments?: string[];
}

// 🩺 Treatment Types (Selene Song Core Enhanced)
export interface Treatment {
  id: string;
  patientId: string;
  patient?: Patient;
  practitionerId: string;
  treatmentType: string;
  description: string;
  status: string;
  startDate: string;
  endDate?: string;
  cost?: number;
  notes?: string;
  aiRecommendations?: string[];
  veritasScore?: number;
  createdAt: string;
  updatedAt: string;
}

export interface TreatmentInput {
  patientId: string;
  practitionerId: string;
  treatmentType: string;
  description: string;
  startDate: string;
  endDate?: string;
  cost?: number;
  notes?: string;
}

// 🔬 Nuclear System Types
export interface NuclearSystemStatus {
  reactor: string;
  radiation: string;
  fusion: string;
  containment: string;
  veritas: number;
  consciousness: string;
  offline: boolean;
  healing: string;
  prediction: string;
  uptime: number;
  timestamp: string;
}

export interface ComponentHealth {
  name: string;
  status: string;
  lastCheck: string;
  metrics?: string;
}

export interface NuclearHealth {
  overall: string;
  components: ComponentHealth[];
  timestamp: string;
}

// Types are already exported above with 'export interface' declarations


