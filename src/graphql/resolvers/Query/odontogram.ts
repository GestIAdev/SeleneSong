/**
 * 🦷 ODONTOGRAM RESOLVERS - GEMELO DIGITAL
 * ============================================================================
 * File: selene/src/graphql/resolvers/Query/odontogram.ts
 * Created: November 27, 2025
 * Author: PunkClaude + Radwulf
 *
 * ARCHITECTURE:
 * - Reads from odontogramas + odontograma_teeth tables
 * - Returns "Default Healthy Mouth" if no data exists
 * - Supports 32 permanent teeth (FDI 11-18, 21-28, 31-38, 41-48)
 * ============================================================================
 */

// FDI Tooth numbering: 11-18 (upper right), 21-28 (upper left), 31-38 (lower left), 41-48 (lower right)
const ALL_TEETH_FDI = [
  11, 12, 13, 14, 15, 16, 17, 18,  // Upper right
  21, 22, 23, 24, 25, 26, 27, 28,  // Upper left
  31, 32, 33, 34, 35, 36, 37, 38,  // Lower left
  41, 42, 43, 44, 45, 46, 47, 48,  // Lower right
];

// Default tooth position generator for 3D visualization
const getToothPosition = (toothNumber: number) => {
  const quadrant = Math.floor(toothNumber / 10);
  const position = toothNumber % 10;
  
  // X: position in arch (1-8)
  const x = (position - 4.5) * 0.8;
  
  // Y: upper (+2) or lower (-2)
  const y = (quadrant <= 2) ? 2 : -2;
  
  // Z: slight curve for arch shape
  const z = -Math.abs(position - 4.5) * 0.1;
  
  // Flip X for right side (quadrants 1 and 4)
  const xFinal = (quadrant === 1 || quadrant === 4) ? -x : x;
  
  return { x: xFinal, y, z };
};

// Generate a default healthy mouth (all teeth present and healthy)
const generateDefaultHealthyMouth = (patientId: string) => {
  return ALL_TEETH_FDI.map((toothNumber, index) => ({
    id: `tooth_${patientId}_${toothNumber}`,
    toothNumber,
    status: 'HEALTHY',
    condition: null,
    surfaces: [],
    notes: null,
    lastTreatmentDate: null,
    color: 'cyan',
    position: getToothPosition(toothNumber),
  }));
};

// Map database status to GraphQL enum (normalize)
const normalizeToothStatus = (dbStatus: string): string => {
  const statusMap: Record<string, string> = {
    'healthy': 'HEALTHY',
    'cavity': 'CAVITY',
    'filling': 'FILLING',
    'crown': 'CROWN',
    'extracted': 'EXTRACTED',
    'missing': 'MISSING',
    'implant': 'IMPLANT',
    'root_canal': 'ROOT_CANAL',
    'chipped': 'CHIPPED',
    'cracked': 'CRACKED',
  };
  
  const normalized = dbStatus?.toUpperCase() || 'HEALTHY';
  return statusMap[dbStatus?.toLowerCase()] || normalized;
};

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

/**
 * Get odontogram data for a patient
 * Returns existing data or generates default healthy mouth
 */
export const odontogramDataV3 = async (
  _: any,
  { patientId }: { patientId: string },
  context: any
) => {
  console.log(`🦷 [ODONTOGRAM] odontogramDataV3 - Loading for patient: ${patientId}`);
  
  try {
    // Try to get existing odontogram for patient
    let odontogramResult;
    
    if (context.database?.pool) {
      // Direct pool access
      odontogramResult = await context.database.pool.query(`
        SELECT * FROM odontogramas 
        WHERE patient_id = $1 AND is_active = TRUE
        ORDER BY created_at DESC
        LIMIT 1
      `, [patientId]);
    } else if (context.database?.query) {
      // Query method
      odontogramResult = await context.database.query(`
        SELECT * FROM odontogramas 
        WHERE patient_id = $1 AND is_active = TRUE
        ORDER BY created_at DESC
        LIMIT 1
      `, [patientId]);
    }

    const odontogram = odontogramResult?.rows?.[0];
    
    if (!odontogram) {
      // No odontogram exists - return default healthy mouth
      console.log(`🦷 [ODONTOGRAM] No odontogram found, returning default healthy mouth`);
      
      return {
        id: `default_${patientId}`,
        patientId,
        teeth: generateDefaultHealthyMouth(patientId),
        lastUpdated: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
    }

    // Get teeth data for this odontogram
    let teethResult;
    if (context.database?.pool) {
      teethResult = await context.database.pool.query(`
        SELECT * FROM odontograma_teeth 
        WHERE odontograma_id = $1
        ORDER BY fdi_code
      `, [odontogram.id]);
    } else if (context.database?.query) {
      teethResult = await context.database.query(`
        SELECT * FROM odontograma_teeth 
        WHERE odontograma_id = $1
        ORDER BY fdi_code
      `, [odontogram.id]);
    }

    const dbTeeth = teethResult?.rows || [];
    
    // Create a map of existing teeth
    const teethMap = new Map(
      dbTeeth.map((t: any) => [parseInt(t.fdi_code), t])
    );

    // Build full teeth array (32 teeth)
    const teeth = ALL_TEETH_FDI.map((toothNumber) => {
      const dbTooth = teethMap.get(toothNumber) as any;
      
      if (dbTooth) {
        const status = normalizeToothStatus(dbTooth.status);
        return {
          id: `tooth_${patientId}_${toothNumber}`,
          toothNumber,
          status,
          condition: dbTooth.notes || null,
          surfaces: dbTooth.affected_surfaces 
            ? dbTooth.affected_surfaces.split(',').map((s: string) => ({
                surface: s.trim(),
                status: status,
                notes: null,
              }))
            : [],
          notes: dbTooth.notes,
          lastTreatmentDate: dbTooth.updated_at?.toISOString() || null,
          color: getToothColor(status),
          position: getToothPosition(toothNumber),
        };
      }
      
      // Tooth not in DB - default to healthy
      return {
        id: `tooth_${patientId}_${toothNumber}`,
        toothNumber,
        status: 'HEALTHY',
        condition: null,
        surfaces: [],
        notes: null,
        lastTreatmentDate: null,
        color: 'cyan',
        position: getToothPosition(toothNumber),
      };
    });

    console.log(`🦷 [ODONTOGRAM] Loaded ${dbTeeth.length} teeth records, returning ${teeth.length} teeth`);

    return {
      id: odontogram.id.toString(),
      patientId,
      teeth,
      lastUpdated: odontogram.updated_at?.toISOString() || new Date().toISOString(),
      createdAt: odontogram.created_at?.toISOString() || new Date().toISOString(),
    };
    
  } catch (error) {
    console.error('❌ [ODONTOGRAM] Error loading odontogram:', error);
    
    // On error, return default healthy mouth instead of crashing
    console.log(`🦷 [ODONTOGRAM] Returning default healthy mouth due to error`);
    return {
      id: `default_${patientId}`,
      patientId,
      teeth: generateDefaultHealthyMouth(patientId),
      lastUpdated: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };
  }
};
