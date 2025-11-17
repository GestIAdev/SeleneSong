/**
 * AI-Assisted Appointment Scheduling Types
 * DIRECTIVA #004 - GeminiEnder CEO
 * Fecha: 17-Nov-2025
 */

// Appointment Type Classification
export type AppointmentType = 'normal' | 'urgent';

// Urgency Levels
export type UrgencyLevel = 'low' | 'medium' | 'high' | 'critical';

// Suggestion Status
export type SuggestionStatus = 'pending_approval' | 'approved' | 'rejected';

// IA API Diagnosis Response (for urgent appointments)
export interface IADiagnosisResponse {
  urgency_score: number;        // 1-10 scale
  urgency_level: UrgencyLevel;
  preliminary_diagnosis: string;
  recommended_specialist?: string;
  requires_immediate_attention: boolean;
  confidence: number;           // 0-1
  suggested_duration: number;   // minutes
}

// Appointment Suggestion Reasoning
export interface SuggestionReasoning {
  calendar_availability: boolean;
  patient_history_compatible: boolean;
  practitioner_specialization_match: boolean;
  urgency_level: UrgencyLevel;
}

// Patient Request Data
export interface PatientAppointmentRequest {
  preferred_dates: Date[];
  preferred_times: string[];
  consultation_type: string;
  notes?: string;
  
  // Urgent appointment fields
  symptoms?: string;
  symptom_images?: string[];
}

// Appointment Suggestion (Main Entity)
export interface AppointmentSuggestion {
  id: string;
  patient_id: string;
  clinic_id?: string;
  
  // Type Classification
  appointment_type: AppointmentType;
  
  // AI-Generated Fields
  suggested_date: Date;
  suggested_time: string;
  suggested_duration: number;
  suggested_practitioner_id?: string;
  
  // Reasoning
  confidence_score: number;  // 0-1
  reasoning: SuggestionReasoning;
  
  // IA Diagnosis (only for urgent)
  ia_diagnosis?: IADiagnosisResponse;
  
  // Patient Input
  patient_request: PatientAppointmentRequest;
  
  // Approval Flow
  status: SuggestionStatus;
  reviewed_by?: string;
  reviewed_at?: Date;
  rejection_reason?: string;
  
  // Timestamps
  created_at: Date;
  updated_at?: Date;
}

// GraphQL Input Types
export interface AppointmentRequestInput {
  patientId: string;
  clinicId?: string;
  appointmentType: AppointmentType;
  consultationType: string;
  preferredDates: string[];  // ISO dates
  preferredTimes: string[];
  urgency?: UrgencyLevel;
  notes?: string;
  symptoms?: string;
  symptomImages?: string[];
}

export interface AppointmentAdjustmentsInput {
  date?: string;
  time?: string;
  duration?: number;
  practitionerId?: string;
}

// Calendar Time Slot
export interface TimeSlot {
  date: Date;
  time: string;
  available: boolean;
}

// Practitioner Info (simplified)
export interface PractitionerInfo {
  id: string;
  name: string;
  specialization?: string;
  available_slots: TimeSlot[];
}
