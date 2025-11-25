/**
 * 🔔 NOTIFICATION QUERY RESOLVERS V3
 * Mission: Provide notification queries with GDPR-compliant data
 */

import type { GraphQLContext } from '../../types.js';

// ============================================================================
// QUERY RESOLVERS
// ============================================================================

/**
 * Get all notifications for a patient with optional status filter
 */
export const patientNotifications = async (
  _: unknown,
  args: {
    patientId: string;
    status?: string;
    limit?: number;
    offset?: number;
  },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const { patientId, status, limit = 50, offset = 0 } = args;

    // Use NotificationsDatabase to fetch real data
    const notifications = await context.database.notifications.getNotifications({
      patientId,
      status,
      limit,
      offset,
    });

    console.log(
      `✅ patientNotifications query returned ${notifications.length} notifications for patient ${patientId}`
    );
    return notifications;
  } catch (error) {
    console.error('❌ patientNotifications query error:', error as Error);
    throw error;
  }
};

/**
 * Get notification preferences for a patient
 */
export const notificationPreferences = async (
  _: unknown,
  args: { patientId: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const { patientId } = args;

    // Use NotificationsDatabase to fetch preferences (or defaults if none exist)
    const preferences = await context.database.notifications.getPreferences(
      patientId
    );

    console.log(`✅ notificationPreferences query returned for patient ${patientId}`);
    return preferences;
  } catch (error) {
    console.error('❌ notificationPreferences query error:', error as Error);
    throw error;
  }
};
