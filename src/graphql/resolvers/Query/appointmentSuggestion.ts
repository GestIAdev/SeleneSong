/**
 * Appointment Suggestion Queries
 * DIRECTIVA #004 - GeminiEnder CEO
 * Fecha: 17-Nov-2025
 */

export const AppointmentSuggestionQuery = {
  
  /**
   * GET PENDING APPOINTMENT SUGGESTIONS
   * Returns suggestions with status = 'pending_approval'
   */
  appointmentSuggestionsV3: async (
    _: any,
    { status, patientId, clinicId }: { 
      status?: string; 
      patientId?: string;
      clinicId?: string;
    },
    context: any
  ) => {
    console.log('[Query] appointmentSuggestionsV3 called', { status, patientId, clinicId });
    
    try {
      let query = 'SELECT * FROM appointment_suggestions WHERE 1=1';
      const params: any[] = [];
      let paramCount = 1;
      
      if (status) {
        query += ` AND status = $${paramCount}`;
        params.push(status);
        paramCount++;
      }
      
      if (patientId) {
        query += ` AND patient_id = $${paramCount}`;
        params.push(patientId);
        paramCount++;
      }
      
      if (clinicId) {
        query += ` AND clinic_id = $${paramCount}`;
        params.push(clinicId);
        paramCount++;
      }
      
      query += ' ORDER BY created_at DESC';
      
      const result = await context.database.executeQuery(query, params);
      
      // Parse JSON fields
      const suggestions = result.rows.map((row: any) => ({
        ...row,
        reasoning: typeof row.reasoning === 'string' ? JSON.parse(row.reasoning) : row.reasoning,
        ia_diagnosis: row.ia_diagnosis && typeof row.ia_diagnosis === 'string' 
          ? JSON.parse(row.ia_diagnosis) 
          : row.ia_diagnosis,
        patient_request: typeof row.patient_request === 'string' 
          ? JSON.parse(row.patient_request) 
          : row.patient_request
      }));
      
      console.log(`[Query] Found ${suggestions.length} suggestions`);
      
      // Enrich with patient data
      for (const suggestion of suggestions) {
        const patientResult = await context.database.executeQuery(
          'SELECT id, first_name, last_name, email FROM patients WHERE id = $1',
          [suggestion.patient_id]
        );
        
        if (patientResult.rows.length > 0) {
          suggestion.patient = patientResult.rows[0];
        }
      }
      
      return suggestions;
      
    } catch (error: any) {
      console.error('[Query] appointmentSuggestionsV3 error:', error);
      throw new Error(`Failed to fetch suggestions: ${error.message}`);
    }
  }
};
