/**
 * 🦷 ODONTOGRAM MUTATIONS - GEMELO DIGITAL
 * ============================================================================
 * File: selene/src/graphql/resolvers/Mutation/odontogram.ts
 * Created: November 27, 2025
 * Author: PunkClaude + Radwulf
 *
 * ARCHITECTURE:
 * - Updates individual tooth status in odontograma_teeth
 * - Creates odontograma record if doesn't exist
 * - Publishes real-time updates via WebSocket
 * ============================================================================
 */

// Map tooth status to display color
const getToothColor = (status: string): string => {
  const colorMap: Record<string, string> = {
    'HEALTHY': 'cyan',
    'CAVITY': 'red',
    'FILLING': 'yellow',
    'CROWN': 'blue',
    'EXTRACTED': 'gray',
    'MISSING': 'gray',
    'IMPLANT': 'purple',
    'ROOT_CANAL': 'orange',
    'CHIPPED': 'amber',
    'CRACKED': 'amber',
  };
  return colorMap[status] || 'cyan';
};

// Get tooth position for 3D visualization
const getToothPosition = (toothNumber: number) => {
  const quadrant = Math.floor(toothNumber / 10);
  const position = toothNumber % 10;
  const x = (position - 4.5) * 0.8;
  const y = (quadrant <= 2) ? 2 : -2;
  const z = -Math.abs(position - 4.5) * 0.1;
  const xFinal = (quadrant === 1 || quadrant === 4) ? -x : x;
  return { x: xFinal, y, z };
};

/**
 * Update a single tooth status
 */
export const updateToothStatusV3 = async (
  _: any,
  { patientId, input }: { patientId: string; input: any },
  context: any
) => {
  console.log(`🦷 [ODONTOGRAM] updateToothStatusV3 - Patient: ${patientId}, Tooth: ${input.toothNumber}`);
  
  try {
    const { toothNumber, status, condition, notes, surfaces } = input;
    
    // Validate tooth number (FDI notation: 11-18, 21-28, 31-38, 41-48)
    const quadrant = Math.floor(toothNumber / 10);
    const position = toothNumber % 10;
    if (quadrant < 1 || quadrant > 4 || position < 1 || position > 8) {
      throw new Error(`Invalid tooth number: ${toothNumber}. Must be FDI notation (11-18, 21-28, 31-38, 41-48)`);
    }

    const pool = context.database?.pool || context.database;
    
    // First, ensure odontograma exists for patient
    let odontogramResult = await pool.query(`
      SELECT id FROM odontogramas 
      WHERE patient_id = $1 AND is_active = TRUE
      LIMIT 1
    `, [patientId]);

    let odontogramId;
    
    if (odontogramResult.rows.length === 0) {
      // Create new odontograma for patient
      console.log(`🦷 [ODONTOGRAM] Creating new odontograma for patient ${patientId}`);
      const insertResult = await pool.query(`
        INSERT INTO odontogramas (patient_id, name, is_active, created_at, updated_at)
        VALUES ($1, 'Odontograma Principal', TRUE, NOW(), NOW())
        RETURNING id
      `, [patientId]);
      odontogramId = insertResult.rows[0].id;
    } else {
      odontogramId = odontogramResult.rows[0].id;
    }

    // Check if tooth record exists
    const existingTooth = await pool.query(`
      SELECT id FROM odontograma_teeth 
      WHERE odontograma_id = $1 AND fdi_code = $2
    `, [odontogramId, toothNumber.toString()]);

    const affectedSurfaces = surfaces?.map((s: any) => s.surface).join(',') || null;

    if (existingTooth.rows.length > 0) {
      // Update existing tooth
      await pool.query(`
        UPDATE odontograma_teeth 
        SET status = $1, notes = $2, affected_surfaces = $3, updated_at = NOW()
        WHERE odontograma_id = $4 AND fdi_code = $5
      `, [status, notes || condition, affectedSurfaces, odontogramId, toothNumber.toString()]);
      
      console.log(`🦷 [ODONTOGRAM] Updated tooth ${toothNumber} to status ${status}`);
    } else {
      // Insert new tooth record
      await pool.query(`
        INSERT INTO odontograma_teeth (odontograma_id, fdi_code, status, notes, affected_surfaces, urgency_level, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      `, [odontogramId, toothNumber.toString(), status, notes || condition, affectedSurfaces, status === 'HEALTHY' ? 0 : 1]);
      
      console.log(`🦷 [ODONTOGRAM] Created tooth ${toothNumber} with status ${status}`);
    }

    // Update odontograma timestamp
    await pool.query(`
      UPDATE odontogramas SET updated_at = NOW() WHERE id = $1
    `, [odontogramId]);

    // Build response
    const tooth = {
      id: `tooth_${patientId}_${toothNumber}`,
      toothNumber,
      status,
      condition: notes || condition,
      surfaces: surfaces || [],
      notes: notes || null,
      lastTreatmentDate: new Date().toISOString(),
      color: getToothColor(status),
      position: getToothPosition(toothNumber),
    };

    // Publish WebSocket event
    if (context.pubsub) {
      context.pubsub.publish('ODONTOGRAM_UPDATED_V3', {
        odontogramUpdatedV3: {
          id: odontogramId.toString(),
          patientId,
          teeth: [tooth],
          lastUpdated: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        }
      });
    }

    // Audit log (non-blocking)
    try {
      if (context.auditLogger) {
        await context.auditLogger.log({
          entityType: 'ToothStatus',
          entityId: `${patientId}_${toothNumber}`,
          operationType: existingTooth.rows.length > 0 ? 'UPDATE' : 'CREATE',
          userId: context.user?.id,
          userEmail: context.user?.email,
          ipAddress: context.ip,
          newValues: { toothNumber, status, notes },
        });
      }
    } catch (auditError) {
      console.warn('⚠️ AuditLogger failed (non-blocking):', auditError);
    }

    return tooth;
    
  } catch (error) {
    console.error('❌ [ODONTOGRAM] updateToothStatusV3 error:', error);
    throw new Error(`Failed to update tooth status: ${(error as Error).message}`);
  }
};

/**
 * Update tooth status when treatment is completed
 * Called by treatment resolvers to sync odontogram
 */
export const syncToothWithTreatment = async (
  pool: any,
  patientId: string,
  treatmentType: string,
  toothNumber: number | null,
  treatmentStatus: string
) => {
  // Only sync when treatment is completed
  if (treatmentStatus !== 'COMPLETED' || !toothNumber) {
    return;
  }
  
  console.log(`🦷 [ODONTOGRAM] Syncing tooth ${toothNumber} with treatment ${treatmentType}`);
  
  // Map treatment type to tooth status
  const treatmentToToothStatus: Record<string, string> = {
    'ORAL_SURGERY': 'EXTRACTED',
    'EXTRACTION': 'EXTRACTED',
    'PROSTHODONTIC': 'CROWN',
    'ENDODONTIC': 'ROOT_CANAL',
    'RESTORATIVE': 'FILLING',
    'COSMETIC': 'CROWN',
    'IMPLANT': 'IMPLANT',
  };
  
  const newStatus = treatmentToToothStatus[treatmentType?.toUpperCase()];
  
  if (!newStatus) {
    console.log(`🦷 [ODONTOGRAM] No tooth status mapping for treatment type: ${treatmentType}`);
    return;
  }
  
  try {
    // Get or create odontograma
    let odontogramResult = await pool.query(`
      SELECT id FROM odontogramas 
      WHERE patient_id = $1 AND is_active = TRUE
      LIMIT 1
    `, [patientId]);

    let odontogramId;
    
    if (odontogramResult.rows.length === 0) {
      const insertResult = await pool.query(`
        INSERT INTO odontogramas (patient_id, name, is_active, created_at, updated_at)
        VALUES ($1, 'Odontograma Principal', TRUE, NOW(), NOW())
        RETURNING id
      `, [patientId]);
      odontogramId = insertResult.rows[0].id;
    } else {
      odontogramId = odontogramResult.rows[0].id;
    }

    // Upsert tooth status
    await pool.query(`
      INSERT INTO odontograma_teeth (odontograma_id, fdi_code, status, notes, urgency_level, created_at, updated_at)
      VALUES ($1, $2, $3, $4, 0, NOW(), NOW())
      ON CONFLICT (odontograma_id, fdi_code) 
      DO UPDATE SET status = $3, notes = $4, updated_at = NOW()
    `, [odontogramId, toothNumber.toString(), newStatus, `Treatment: ${treatmentType}`]);
    
    console.log(`🦷 [ODONTOGRAM] Tooth ${toothNumber} updated to ${newStatus} after ${treatmentType} treatment`);
    
  } catch (error) {
    console.error('❌ [ODONTOGRAM] syncToothWithTreatment error:', error);
    // Non-blocking - don't throw
  }
};
