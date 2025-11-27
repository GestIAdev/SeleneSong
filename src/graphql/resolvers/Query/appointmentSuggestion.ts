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
      
      // 🔧 FIX SERIALIZACIÓN: Respetar tipos del Schema GraphQL
      // - reasoning: String → mantener como string
      // - ia_diagnosis: IADiagnosisResponse → parsear a objeto
      // - patient_request: String → mantener como string
      const parseJsonField = (field: any): any => {
        if (field === null || field === undefined) return null;
        if (typeof field === 'string') {
          try { return JSON.parse(field); } catch { return field; }
        }
        return field;
      };
      
      const ensureString = (field: any): string | null => {
        if (field === null || field === undefined) return null;
        if (typeof field === 'string') return field;
        return JSON.stringify(field);
      };
      
      const suggestions = result.rows.map((row: any) => ({
        ...row,
        reasoning: ensureString(row.reasoning),  // String en schema
        ia_diagnosis: parseJsonField(row.ia_diagnosis),  // IADiagnosisResponse (objeto)
        patient_request: ensureString(row.patient_request)  // String en schema
      }));
      
      console.log(`[Query] Found ${suggestions.length} suggestions`);
      
      // Enrich with patient data
      for (const suggestion of suggestions) {
        const patientResult = await context.database.executeQuery(
          'SELECT id, first_name, last_name, email FROM patients WHERE id = $1',
          [suggestion.patient_id]
        );
        
        if (patientResult.rows.length > 0) {
          const p = patientResult.rows[0];
          // 🔧 FIX: Mapear snake_case → camelCase para GraphQL
          suggestion.patient = {
            id: p.id,
            firstName: p.first_name || 'Paciente',
            lastName: p.last_name || 'Desconocido',
            email: p.email
          };
        } else {
          // Fallback si no existe el paciente
          suggestion.patient = {
            id: suggestion.patient_id,
            firstName: 'Paciente',
            lastName: 'No Encontrado',
            email: null
          };
        }
      }
      
      return suggestions;
      
    } catch (error: any) {
      console.error('[Query] appointmentSuggestionsV3 error:', error);
      throw new Error(`Failed to fetch suggestions: ${error.message}`);
    }
  }
};
