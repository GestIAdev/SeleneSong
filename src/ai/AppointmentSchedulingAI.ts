/**
 * AI Appointment Scheduling Engine
 * DIRECTIVA #004 - GeminiEnder CEO
 * Fecha: 17-Nov-2025
 * 
 * Genera sugerencias inteligentes de citas basadas en:
 * - Disponibilidad de calendario
 * - Historial del paciente
 * - Urgencia (con mock IA API si no hay keys reales)
 * - Especialización del doctor
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  AppointmentSuggestion,
  AppointmentRequestInput,
  IADiagnosisResponse,
  TimeSlot,
  PractitionerInfo,
  UrgencyLevel
} from '../types/appointmentSuggestion.js';

/**
 * STANDARD APPOINTMENT DURATIONS (minutes)
 * Para citas NORMALES (sin IA API cost)
 * Tiempos predefinidos basados en tipo de consulta
 */
const APPOINTMENT_DURATIONS: Record<string, number> = {
  'limpieza': 30,
  'cleaning': 30,
  'revision': 15,
  'checkup': 15,
  'consulta': 30,
  'consultation': 30,
  'radiografia': 20,
  'xray': 20,
  'blanqueamiento': 60,
  'whitening': 60,
  'extraccion': 45,
  'extraction': 45,
  'endodoncia': 90,
  'root_canal': 90,
  'ortodoncia': 45,
  'orthodontics': 45,
  'implante': 120,
  'implant': 120,
  'default': 30  // Fallback
};

export class AppointmentSchedulingAI {
  private database: any;
  
  constructor(database: any) {
    this.database = database;
  }
  
  /**
   * Genera sugerencia de cita basada en request del paciente
   */
  async generateSuggestion(
    request: AppointmentRequestInput
  ): Promise<AppointmentSuggestion> {
    
    console.log(`[AI Scheduling] Generating suggestion for patient ${request.patientId}, type=${request.appointmentType}`);
    
    // 1. Fetch patient history
    const patientHistory = await this.getPatientHistory(request.patientId);
    
    // 2. MODALIDAD SWITCH: Normal vs Urgent
    let iaDiagnosis: IADiagnosisResponse | undefined;
    let suggestedDuration: number;
    
    if (request.appointmentType === 'urgent') {
      // 🤖 MODALIDAD 2: URGENT (IA API + Selene)
      // - Cuesta dinero (IA API call)
      // - 20% de citas
      // - Requiere síntomas
      console.log('[AI Scheduling] MODALIDAD URGENTE: Llamando IA API (mockeado)...');
      
      iaDiagnosis = await this.getIADiagnosis({
        symptoms: request.symptoms,
        images: request.symptomImages,
        patientHistory
      });
      
      // Override urgency with IA diagnosis
      request.urgency = iaDiagnosis.urgency_level;
      suggestedDuration = iaDiagnosis.suggested_duration || 30;
      
      console.log(`[AI Scheduling] IA Diagnosis: urgency=${iaDiagnosis.urgency_level}, score=${iaDiagnosis.urgency_score}, duration=${suggestedDuration}min`);
    } else {
      // 🧠 MODALIDAD 1: NORMAL (Selene solo)
      // - GRATIS (sin IA API call)
      // - 80% de citas
      // - Tiempos predefinidos
      console.log('[AI Scheduling] MODALIDAD NORMAL: Sin IA API, usando tiempos predefinidos...');
      
      // Get duration from predefined map
      const consultationType = request.consultationType?.toLowerCase() || 'default';
      suggestedDuration = APPOINTMENT_DURATIONS[consultationType] || APPOINTMENT_DURATIONS['default'];
      
      // Default urgency for normal appointments
      request.urgency = request.urgency || 'medium';
      
      console.log(`[AI Scheduling] Tipo=${consultationType}, Duration=${suggestedDuration}min, Urgency=${request.urgency}`);
    }
    
    // 3. Get calendar availability
    // For urgent appointments, preferredDates/Times may be undefined - use defaults
    const preferredDates = request.preferredDates?.map(d => new Date(d)) || [];
    const preferredTimes = request.preferredTimes || [];
    
    const availability = await this.getCalendarAvailability(
      preferredDates,
      preferredTimes,
      request.urgency || 'medium'
    );
    
    console.log(`[AI Scheduling] Found ${availability.length} available slots`);
    
    // 4. Match practitioner
    const practitioner = await this.matchPractitioner(
      request.consultationType,
      availability,
      iaDiagnosis?.recommended_specialist
    );
    
    // 5. Calculate optimal slot
    console.log('[AI] Availability slots:', availability.length);
    console.log('[AI] First 3 slots:', availability.slice(0, 3));
    
    const optimalSlot = this.calculateOptimalSlot({
      patientPreferences: request,
      availability,
      practitioner,
      urgency: request.urgency || 'medium',
      iaDiagnosis
    });
    
    console.log('[AI] Optimal slot:', optimalSlot);
    
    if (!optimalSlot) {
      throw new Error('No available slots found for the requested dates/times');
    }
    
    // 6. Calculate confidence score
    const confidence = this.calculateConfidence({
      slotAvailable: true,
      practitionerMatch: practitioner !== null,
      patientHistoryCompatible: this.checkHistoryCompatibility(patientHistory, optimalSlot),
      iaDiagnosisConfidence: iaDiagnosis?.confidence || 1.0
    });
    
    const suggestion: AppointmentSuggestion = {
      id: uuidv4(),
      patient_id: request.patientId,
      clinic_id: request.clinicId,
      appointment_type: request.appointmentType,
      suggested_date: optimalSlot.date,
      suggested_time: optimalSlot.time,
      suggested_duration: suggestedDuration,  // Ya calculado arriba (IA o predefinido)
      suggested_practitioner_id: practitioner?.id,
      confidence_score: confidence,
      reasoning: {
        calendar_availability: true,
        patient_history_compatible: true,
        practitioner_specialization_match: practitioner !== null,
        urgency_level: request.urgency || 'medium'
      },
      ia_diagnosis: iaDiagnosis,
      patient_request: {
        preferred_dates: request.preferredDates?.map(d => new Date(d)) || [],
        preferred_times: request.preferredTimes || [],
        consultation_type: request.consultationType,
        notes: request.notes,
        symptoms: request.symptoms,
        symptom_images: request.symptomImages
      },
      status: 'pending_approval',
      created_at: new Date()
    };
    
    console.log(`[AI Scheduling] Suggestion generated: confidence=${confidence.toFixed(2)}, date=${optimalSlot.date}, time=${optimalSlot.time}`);
    
    return suggestion;
  }
  
  /**
   * Get IA Diagnosis (Mock if no API keys)
   */
  private async getIADiagnosis(input: {
    symptoms?: string;
    images?: string[];
    patientHistory: any;
  }): Promise<IADiagnosisResponse> {
    
    // Check if real IA API is available
    if (process.env.IA_API_ENDPOINT && process.env.IA_API_KEY) {
      return await this.callRealIAAPI(input);
    }
    
    // Fallback: Mock IA API
    return this.getMockIADiagnosis(input.symptoms);
  }
  
  /**
   * Mock IA API (keyword-based urgency detection)
   */
  private getMockIADiagnosis(symptoms?: string): IADiagnosisResponse {
    console.log('[AI Scheduling] Using Mock IA API (no real API keys configured)');
    
    if (!symptoms) {
      return {
        urgency_score: 4,
        urgency_level: 'medium',
        preliminary_diagnosis: 'No se proporcionaron síntomas específicos',
        requires_immediate_attention: false,
        confidence: 0.5,
        suggested_duration: 30
      };
    }
    
    // Simple keyword analysis
    const urgentKeywords = ['sangre', 'dolor severo', 'hinchazón grave', 'trauma', 'fractura', 'emergencia', 'accidente'];
    const mediumKeywords = ['dolor', 'molestia', 'sensibilidad', 'inflamación'];
    
    const symptomsLower = symptoms.toLowerCase();
    const hasUrgentSymptom = urgentKeywords.some(kw => symptomsLower.includes(kw));
    const hasMediumSymptom = mediumKeywords.some(kw => symptomsLower.includes(kw));
    
    if (hasUrgentSymptom) {
      return {
        urgency_score: 8,
        urgency_level: 'high',
        preliminary_diagnosis: 'Se detectaron síntomas que requieren atención prioritaria',
        requires_immediate_attention: true,
        confidence: 0.7,
        suggested_duration: 45
      };
    }
    
    if (hasMediumSymptom) {
      return {
        urgency_score: 5,
        urgency_level: 'medium',
        preliminary_diagnosis: 'Síntomas moderados detectados, consulta recomendada pronto',
        requires_immediate_attention: false,
        confidence: 0.6,
        suggested_duration: 30
      };
    }
    
    return {
      urgency_score: 3,
      urgency_level: 'low',
      preliminary_diagnosis: 'Consulta de rutina o prevención',
      requires_immediate_attention: false,
      confidence: 0.5,
      suggested_duration: 30
    };
  }
  
  /**
   * Call real IA API (OpenAI, Anthropic, etc.)
   */
  private async callRealIAAPI(input: any): Promise<IADiagnosisResponse> {
    // TODO: Implement real IA API call when keys available
    console.log('[AI Scheduling] Real IA API not implemented yet, using mock');
    return this.getMockIADiagnosis(input.symptoms);
  }
  
  /**
   * Get calendar availability (MVP - Simplified for testing)
   */
  private async getCalendarAvailability(
    preferredDates: Date[],
    preferredTimes: string[],
    urgency: UrgencyLevel
  ): Promise<TimeSlot[]> {
    
    const slots: TimeSlot[] = [];
    
    // MVP: Generate slots for next 14 days (9am-5pm, 30min intervals)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 1); // Tomorrow
    
    for (let i = 0; i < 14; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate slots every 15 minutes (9am-5pm)
      for (let hour = 9; hour < 17; hour++) {
        for (const minutes of ['00', '15', '30', '45']) {
          const time = `${hour.toString().padStart(2, '0')}:${minutes}`;
          slots.push({ 
            date: date, 
            time, 
            available: true 
          });
        }
      }
    }
    
    // If high urgency, prioritize earliest slots
    if (urgency === 'high' || urgency === 'critical') {
      return slots.slice(0, 3);  // Only return first 3 earliest slots
    }
    
    return slots;
  }
  
  /**
   * Match practitioner based on specialization
   */
  private async matchPractitioner(
    consultationType: string,
    availability: TimeSlot[],
    recommendedSpecialist?: string
  ): Promise<PractitionerInfo | null> {
    
    // TODO: Implement proper practitioner matching
    // For now, return first available doctor
    
    const practitioners = await this.database.executeQuery(
      `SELECT id, first_name, last_name 
       FROM users 
       WHERE role = 'professional' 
       LIMIT 1`
    );
    
    if (practitioners.rows.length === 0) {
      return null;
    }
    
    const practitioner = practitioners.rows[0];
    
    return {
      id: practitioner.id,
      name: `${practitioner.first_name} ${practitioner.last_name}`,
      available_slots: availability
    };
  }
  
  /**
   * Calculate optimal slot
   */
  private calculateOptimalSlot(params: {
    patientPreferences: AppointmentRequestInput;
    availability: TimeSlot[];
    practitioner: PractitionerInfo | null;
    urgency: UrgencyLevel;
    iaDiagnosis?: IADiagnosisResponse;
  }): TimeSlot | null {
    
    if (params.availability.length === 0) {
      return null;
    }
    
    // Priority: Urgency > Patient Preferences > General Availability
    if (params.urgency === 'high' || params.urgency === 'critical') {
      // Return earliest available slot
      return params.availability[0];
    }
    
    // Try to match patient preferred times (if provided)
    if (params.patientPreferences.preferredTimes && params.patientPreferences.preferredTimes.length > 0) {
      const preferredSlots = params.availability.filter(slot =>
        params.patientPreferences.preferredTimes.includes(slot.time)
      );
      if (preferredSlots.length > 0) return preferredSlots[0];
    }
    
    // Default: Return first available slot
    return params.availability[0];
  }
  
  /**
   * Calculate confidence score
   */
  private calculateConfidence(factors: {
    slotAvailable: boolean;
    practitionerMatch: boolean;
    patientHistoryCompatible: boolean;
    iaDiagnosisConfidence?: number;
  }): number {
    
    let confidence = 0;
    
    if (factors.slotAvailable) confidence += 0.4;
    if (factors.practitionerMatch) confidence += 0.3;
    if (factors.patientHistoryCompatible) confidence += 0.2;
    if (factors.iaDiagnosisConfidence) confidence += factors.iaDiagnosisConfidence * 0.1;
    
    return Math.min(confidence, 1.0);
  }
  
  /**
   * Get patient history
   */
  private async getPatientHistory(patientId: string): Promise<any> {
    const history = await this.database.executeQuery(
      `SELECT * FROM patients WHERE id = $1`,
      [patientId]
    );
    
    return history.rows[0] || {};
  }
  
  /**
   * Check history compatibility
   */
  private checkHistoryCompatibility(patientHistory: any, slot: TimeSlot): boolean {
    // TODO: Implement actual compatibility check
    // For now, always return true
    return true;
  }
  
  /**
   * Get standard duration for consultation type
   */
  private getStandardDuration(consultationType: string): number {
    const durations: Record<string, number> = {
      'limpieza': 30,
      'revision': 30,
      'extraccion': 45,
      'endodoncia': 60,
      'ortodoncia': 45,
      'implante': 90,
      'emergencia': 30
    };
    
    return durations[consultationType.toLowerCase()] || 30;
  }
}
