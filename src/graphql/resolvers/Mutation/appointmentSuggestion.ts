/**
 * Appointment Suggestion Mutations
 * DIRECTIVA #004 - GeminiEnder CEO
 * Fecha: 17-Nov-2025
 */

import { v4 as uuidv4 } from 'uuid';
import { AppointmentSchedulingAI } from '../../../ai/AppointmentSchedulingAI.js';
import type {
  AppointmentSuggestion,
  AppointmentRequestInput,
  AppointmentAdjustmentsInput
} from '../../../types/appointmentSuggestion.js';

export const AppointmentSuggestionMutation = {
  
  /**
   * REQUEST APPOINTMENT - Patient submits appointment request
   */
  requestAppointment: async (
    _: any,
    { input }: { input: AppointmentRequestInput },
    context: any
  ) => {
    console.log('[Mutation] requestAppointment called', input);
    
    // Validation: appointmentType must be 'normal' or 'urgent'
    if (input.appointmentType !== 'normal' && input.appointmentType !== 'urgent') {
      throw new Error(`Invalid appointmentType: '${input.appointmentType}'. Must be 'normal' or 'urgent'.`);
    }
    
    // Validation: If urgent, symptoms are required
    if (input.appointmentType === 'urgent' && !input.symptoms) {
      throw new Error('Urgent appointments require symptoms description');
    }
    
    try {
      // Initialize AI Engine
      const schedulingAI = new AppointmentSchedulingAI(context.database);
      
      // Generate suggestion
      const suggestion = await schedulingAI.generateSuggestion(input);
      
      // Store suggestion in database
      const result = await context.database.executeQuery(
        `INSERT INTO appointment_suggestions (
          patient_id, clinic_id, appointment_type,
          suggested_date, suggested_time, suggested_duration,
          suggested_practitioner_id, confidence_score,
          reasoning, ia_diagnosis, patient_request,
          status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING *`,
        [
          suggestion.patient_id,
          suggestion.clinic_id || null,
          suggestion.appointment_type,
          typeof suggestion.suggested_date === 'string' ? suggestion.suggested_date : suggestion.suggested_date.toISOString().split('T')[0],
          suggestion.suggested_time,
          suggestion.suggested_duration,
          suggestion.suggested_practitioner_id || null,
          suggestion.confidence_score,
          JSON.stringify(suggestion.reasoning),
          suggestion.ia_diagnosis ? JSON.stringify(suggestion.ia_diagnosis) : null,
          JSON.stringify(suggestion.patient_request),
          suggestion.status,
          suggestion.created_at
        ]
      );
      
      console.log('[Mutation] INSERT result:', JSON.stringify(result, null, 2));
      console.log('[Mutation] result.rows:', result.rows);
      console.log('[Mutation] result.rows[0]:', result.rows[0]);
      
      if (!result.rows || result.rows.length === 0) {
        throw new Error('INSERT did not return any rows');
      }
      
      const dbRow = result.rows[0];
      console.log(`[Mutation] Suggestion created with ID: ${dbRow.id}`);
      
      // Return directly - schema expects AppointmentSuggestion!, not wrapped in result
      return {
        id: dbRow.id,
        patient_id: dbRow.patient_id,
        clinic_id: dbRow.clinic_id,
        appointment_type: dbRow.appointment_type,
        suggested_date: dbRow.suggested_date,
        suggested_time: dbRow.suggested_time,
        suggested_duration: dbRow.suggested_duration,
        suggested_practitioner_id: dbRow.suggested_practitioner_id,
        confidence_score: dbRow.confidence_score,
        reasoning: dbRow.reasoning,
        ia_diagnosis: dbRow.ia_diagnosis,
        patient_request: dbRow.patient_request,
        status: dbRow.status,
        reviewed_by: dbRow.reviewed_by,
        reviewed_at: dbRow.reviewed_at,
        created_at: dbRow.created_at,
        updated_at: dbRow.updated_at
      };
      
    } catch (error: any) {
      console.error('[Mutation] requestAppointment error:', error);
      throw new Error(`Failed to create appointment suggestion: ${error.message}`);
    }
  },
  
  /**
   * APPROVE SUGGESTION - Admin approves suggestion → creates appointment
   */
  approveAppointmentSuggestion: async (
    _: any,
    { suggestionId, adjustments }: { 
      suggestionId: string; 
      adjustments?: AppointmentAdjustmentsInput 
    },
    context: any
  ) => {
    console.log('[Mutation] approveAppointmentSuggestion called', suggestionId);
    
    try {
      // Get suggestion
      const suggestionResult = await context.database.executeQuery(
        `SELECT * FROM appointment_suggestions WHERE id = $1`,
        [suggestionId]
      );
      
      if (suggestionResult.rows.length === 0) {
        throw new Error('Suggestion not found');
      }
      
      const suggestion = suggestionResult.rows[0];
      
      if (suggestion.status !== 'pending_approval') {
        throw new Error(`Suggestion already ${suggestion.status}`);
      }
      
      // Apply adjustments if provided
      const finalDate = adjustments?.date || suggestion.suggested_date;
      const finalTime = adjustments?.time || suggestion.suggested_time;
      const finalDuration = adjustments?.duration || suggestion.suggested_duration;
      const finalPractitionerId = adjustments?.practitionerId || suggestion.suggested_practitioner_id;
      
      // Create actual appointment
      const appointmentId = uuidv4();
      
      // Parse date: could be string ('2025-11-20') or Date object
      const dateStr = typeof finalDate === 'string' ? finalDate : new Date(finalDate).toISOString().split('T')[0];
      const timeStr = typeof finalTime === 'string' ? finalTime : finalTime;
      const scheduled_date = new Date(`${dateStr}T${timeStr}`);
      
      await context.database.executeQuery(
        `INSERT INTO appointments (
          id, patient_id, dentist_id,
          scheduled_date, duration_minutes,
          appointment_type, status, priority, notes, created_at, updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
        [
          appointmentId,
          suggestion.patient_id,
          finalPractitionerId,
          scheduled_date,
          finalDuration,
          'CONSULTATION', // Must be UPPERCASE to match enum
          'CONFIRMED',
          suggestion.appointment_type === 'urgent' ? 'URGENT' : 'NORMAL', // Priority enum
          `Aprobada desde sugerencia IA: ${suggestionId}`,
          new Date(),
          new Date()
        ]
      );
      
      // Update suggestion status
      await context.database.executeQuery(
        `UPDATE appointment_suggestions 
         SET status = 'approved',
             reviewed_by = $1,
             reviewed_at = $2,
             updated_at = $3
         WHERE id = $4`,
        [
          context.user?.id || null, // NULL if no user, not 'system' (UUID column)
          new Date(),
          new Date(),
          suggestionId
        ]
      );
      
      // Fetch created appointment
      const appointmentResult = await context.database.executeQuery(
        `SELECT * FROM appointments WHERE id = $1`,
        [appointmentId]
      );
      
      console.log(`[Mutation] Suggestion approved, appointment created: ${appointmentId}`);
      
      // Return appointment mapped to GraphQL schema (AppointmentV3!)
      const apt = appointmentResult.rows[0];
      console.log('[Mutation] apt.scheduled_date:', apt.scheduled_date, typeof apt.scheduled_date);
      
      const scheduledDate = new Date(apt.scheduled_date);
      console.log('[Mutation] scheduledDate:', scheduledDate, 'isValid:', !isNaN(scheduledDate.getTime()));
      
      return {
        id: apt.id,
        patientId: apt.patient_id,
        practitionerId: apt.dentist_id,
        appointmentDate: scheduledDate.toISOString().split('T')[0],
        appointmentTime: scheduledDate.toTimeString().split(' ')[0].substring(0, 5),
        duration: apt.duration_minutes,
        type: apt.appointment_type,
        status: apt.status,
        notes: apt.notes || '',
        createdAt: apt.created_at ? new Date(apt.created_at).toISOString() : new Date().toISOString(),
        updatedAt: apt.updated_at ? new Date(apt.updated_at).toISOString() : new Date().toISOString()
      };
      
    } catch (error: any) {
      console.error('[Mutation] approveAppointmentSuggestion error:', error);
      throw new Error(`Failed to approve suggestion: ${error.message}`);
    }
  },
  
  /**
   * REJECT SUGGESTION - Admin rejects suggestion
   */
  rejectAppointmentSuggestion: async (
    _: any,
    { suggestionId, reason }: { suggestionId: string; reason: string },
    context: any
  ) => {
    console.log('[Mutation] rejectAppointmentSuggestion called', suggestionId);
    
    try {
      // Check suggestion exists
      const suggestionResult = await context.database.executeQuery(
        `SELECT * FROM appointment_suggestions WHERE id = $1`,
        [suggestionId]
      );
      
      if (suggestionResult.rows.length === 0) {
        throw new Error('Suggestion not found');
      }
      
      const suggestion = suggestionResult.rows[0];
      
      if (suggestion.status !== 'pending_approval') {
        throw new Error(`Suggestion already ${suggestion.status}`);
      }
      
      // Update suggestion status
      await context.database.executeQuery(
        `UPDATE appointment_suggestions 
         SET status = 'rejected',
             rejection_reason = $1,
             reviewed_by = $2,
             reviewed_at = $3,
             updated_at = $4
         WHERE id = $5`,
        [
          reason,
          context.user?.id || null, // NULL if no user (UUID column)
          new Date(),
          new Date(),
          suggestionId
        ]
      );
      
      // TODO: Send notification to patient
      
      console.log(`[Mutation] Suggestion rejected: ${suggestionId}`);
      
      // Return string directly (schema expects String!)
      return 'Suggestion rejected successfully';
      
    } catch (error: any) {
      console.error('[Mutation] rejectAppointmentSuggestion error:', error);
      throw new Error(`Failed to reject suggestion: ${error.message}`);
    }
  }
};
