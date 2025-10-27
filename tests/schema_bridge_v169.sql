-- =========================================================================
-- DIRECTIVA V169 - SCHEMA BRIDGE PROFESIONAL
-- =========================================================================
-- PunkClaude & RaulVisionario - September 28, 2025  
-- MISIÓN: Crear Views BD elegantes que expongan interface limpia para Apollo
-- ESTRATEGIA: BD profesional real + Views Apollo-compatible = Perfección
-- =========================================================================

-- ==============================================
-- 🎯 PATIENTS VIEW - Apollo Compatible Interface
-- ==============================================
CREATE OR REPLACE VIEW apollo_patients AS
SELECT 
    id,
    -- Apollo espera 'name' - combinamos first_name + last_name
    TRIM(CONCAT(first_name, ' ', last_name)) as name,
    email,
    -- Apollo espera 'phone' - usamos phone_primary
    phone_primary as phone,
    date_of_birth,
    gender::text as gender,
    address_street,
    address_city,
    address_state,
    address_country,
    blood_type::text as blood_type,
    allergies,
    medical_history,
    current_medications,
    anxiety_level::text as anxiety_level,
    insurance_provider,
    emergency_contact_name,
    emergency_contact_phone,
    is_active,
    created_at,
    updated_at
FROM patients
WHERE deleted_at IS NULL  -- Solo pacientes activos
ORDER BY created_at DESC;

-- ==============================================
-- 📅 APPOINTMENTS VIEW - Apollo Compatible Interface  
-- ==============================================
CREATE OR REPLACE VIEW apollo_appointments AS
SELECT 
    id,
    patient_id,
    dentist_id,
    -- Apollo espera 'date' - extraemos fecha de scheduled_date
    scheduled_date::date as date,
    -- Apollo espera 'time' - extraemos hora de scheduled_date
    scheduled_date::time as time,
    -- Timestamp completo para queries avanzadas
    scheduled_date,
    duration_minutes,
    appointment_type::text as appointment_type,
    status::text as status,
    priority::text as priority,
    title,
    description,
    notes,
    procedure_codes,
    estimated_cost,
    room_number,
    is_follow_up,
    confirmation_sent,
    reminder_sent,
    checked_in_at,
    started_at,
    completed_at,
    cancelled_at,
    cancellation_reason,
    created_at,
    updated_at
FROM appointments
WHERE cancelled_at IS NULL  -- Solo citas no canceladas
ORDER BY scheduled_date ASC;

-- ==============================================
-- 🏥 MEDICAL_RECORDS VIEW - Apollo Compatible Interface
-- ==============================================
CREATE OR REPLACE VIEW apollo_medical_records AS
SELECT 
    id,
    patient_id,
    appointment_id,
    -- Apollo espera 'date' - usamos visit_date
    visit_date as date,
    chief_complaint,
    diagnosis,
    -- Apollo espera 'treatment' - combinamos treatment_plan + treatment_performed
    CASE 
        WHEN treatment_performed IS NOT NULL 
        THEN treatment_performed 
        ELSE treatment_plan 
    END as treatment,
    treatment_plan,
    treatment_performed,
    clinical_notes,
    procedure_codes,
    procedure_category::text as procedure_category,
    tooth_numbers,
    surfaces_treated,
    treatment_status::text as treatment_status,
    priority::text as priority,
    estimated_cost,
    actual_cost,
    insurance_covered,
    follow_up_required,
    follow_up_date,
    follow_up_notes,
    treatment_outcome,
    patient_feedback,
    voice_note_path,
    ai_transcribed,
    ai_confidence_score,
    ai_metadata,
    is_active,
    created_at,
    updated_at
FROM medical_records
WHERE deleted_at IS NULL  -- Solo registros activos
ORDER BY visit_date DESC;

-- ==============================================
-- 🦷 TREATMENTS VIEW - Apollo Compatible Interface
-- ==============================================
CREATE OR REPLACE VIEW apollo_treatments AS
SELECT 
    id,
    name,
    description,
    category_id,
    type_id,
    -- Apollo espera 'duration' - usamos estimated_duration_minutes
    estimated_duration_minutes as duration,
    -- Apollo espera 'cost' - usamos estimated_cost
    estimated_cost as cost,
    estimated_duration_minutes,
    estimated_cost,
    difficulty_level,
    ai_confidence_score,
    success_rate_percentage,
    average_recovery_days,
    is_active,
    requires_consent,
    is_emergency,
    veritas_certificate_id,
    ethical_score,
    created_at,
    updated_at
FROM treatments
WHERE is_active = true  -- Solo tratamientos activos
ORDER BY name ASC;

-- ==============================================
-- 🔐 APOLLO PERMISSIONS - Views Security
-- ==============================================

-- Grant permissions to Apollo user (assuming 'apollo' user exists)
-- If different user, adjust accordingly
GRANT SELECT ON apollo_patients TO postgres;
GRANT SELECT ON apollo_appointments TO postgres;
GRANT SELECT ON apollo_medical_records TO postgres;
GRANT SELECT ON apollo_treatments TO postgres;

-- ==============================================
-- 📊 APOLLO VIEWS VALIDATION - Test Queries
-- ==============================================

-- Test patients view
-- SELECT COUNT(*), MIN(created_at), MAX(created_at) FROM apollo_patients;

-- Test appointments view  
-- SELECT COUNT(*), MIN(date), MAX(date) FROM apollo_appointments;

-- Test medical records view
-- SELECT COUNT(*), MIN(date), MAX(date) FROM apollo_medical_records;

-- Test treatments view
-- SELECT COUNT(*), MIN(cost), MAX(cost) FROM apollo_treatments;

-- ==============================================
-- 📝 DOCUMENTATION
-- ==============================================

/*
DIRECTIVA V169 - SCHEMA BRIDGE PROFESIONAL
==========================================

OBJETIVO: Crear interface limpia Apollo-compatible sin modificar BD real

VIEWS CREADAS:
• apollo_patients    - BD: first_name+last_name → Apollo: name
• apollo_appointments - BD: scheduled_date → Apollo: date+time  
• apollo_medical_records - BD: visit_date → Apollo: date
• apollo_treatments  - BD: estimated_* → Apollo: duration+cost

BENEFITS:
✅ BD profesional intacta
✅ Apollo obtiene schema simple esperado
✅ Zero breaking changes en BD real
✅ Performance: Views optimizadas con índices originales
✅ Security: Solo datos activos (no deleted)
✅ Maintainability: Cambios centralizados en Views

NEXT STEPS:
1. Aplicar este SQL a BD
2. Modificar Apollo Database.ts para usar apollo_* views
3. Test GraphQL queries
4. Celebrar victoria punk profesional 🔥

*/