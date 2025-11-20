/**
 * 🏛️ EMPIRE ARCHITECTURE V2 - CLINIC HELPERS
 * Author: PunkClaude
 * Date: 2025-11-20
 * Purpose: Utilities for multi-tenant clinic filtering
 */

/**
 * 🎯 Extract clinic_id from GraphQL context
 * 
 * Logic:
 * - Owner in lobby mode: clinic_id = null (shouldn't see clinic data)
 * - Owner operating: clinic_id = current_clinic_id
 * - Staff: clinic_id = their assigned clinic
 * - Patient: clinic_id = null (uses patient_clinic_access)
 * 
 * @param context GraphQL context with user data
 * @returns clinic_id UUID or null
 */
export function getClinicIdFromContext(context: any): string | null {
  const user = context?.user || context?.req?.user;

  if (!user) {
    console.warn('⚠️ getClinicIdFromContext: No user in context');
    return null;
  }

  // Extract clinic_id (handles both camelCase and snake_case)
  const clinicId = user.clinic_id || user.clinicId || user.current_clinic_id || user.currentClinicId;

  if (!clinicId) {
    // This is OK for:
    // - Owners in lobby mode
    // - Patients (they use patient_clinic_access)
    console.log(`ℹ️ getClinicIdFromContext: No clinic_id for user ${user.email} (role: ${user.role})`);
    return null;
  }

  return clinicId;
}

/**
 * 🔒 Validate user has clinic access
 * Throws error if:
 * - User is not authenticated
 * - User has no clinic_id (and is not OWNER or PATIENT)
 * 
 * @param context GraphQL context
 * @param allowNullForOwner If true, owners in lobby mode are allowed
 * @returns clinic_id
 */
export function requireClinicAccess(
  context: any,
  allowNullForOwner: boolean = false
): string {
  const user = context?.user || context?.req?.user;

  if (!user) {
    throw new Error('Authentication required');
  }

  const clinicId = getClinicIdFromContext(context);

  // Allow null clinic_id for owners in lobby mode (if explicitly allowed)
  if (!clinicId && allowNullForOwner && user.is_owner) {
    return null as any; // Owner in lobby mode
  }

  if (!clinicId) {
    throw new Error(
      `User ${user.email} has no clinic assigned. ` +
      `Owners must select a clinic first. ` +
      `Staff must be assigned to a clinic by admin.`
    );
  }

  return clinicId;
}

/**
 * 🏥 Check if user is owner (can access lobby)
 */
export function isOwner(context: any): boolean {
  const user = context?.user || context?.req?.user;
  return user?.is_owner === true || user?.isOwner === true;
}

/**
 * 🏛️ Check if owner is in lobby mode (no clinic selected)
 */
export function isOwnerInLobbyMode(context: any): boolean {
  const user = context?.user || context?.req?.user;
  const clinicId = getClinicIdFromContext(context);
  
  return isOwner(context) && !clinicId;
}

/**
 * 🎯 Get organization name from context
 */
export function getOrganizationName(context: any): string | null {
  const user = context?.user || context?.req?.user;
  return user?.organization_name || user?.organizationName || null;
}
