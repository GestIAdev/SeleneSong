/**
 * 🔔 NOTIFICATION MUTATION RESOLVERS V3
 * Mission: Provide notification mutations with GDPR audit trail (Four-Gate Pattern)
 */

import type { GraphQLContext } from '../../types.js';

// ============================================================================
// MUTATION RESOLVERS
// ============================================================================

/**
 * Mark notification as read
 */
export const markNotificationAsRead = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    console.log(`📝 MARK_NOTIFICATION_AS_READ mutation called with id: ${args.id}`);

    // Use NotificationsDatabase to update
    const updated = await context.database.notifications.markAsRead(args.id);

    console.log(`✅ Notification marked as read: ${args.id}`);

    // Publish subscription event
    if (context.pubsub) {
      context.pubsub.publish('NOTIFICATION_V3_READ', {
        notificationV3Read: updated,
      });
    }

    return updated;
  } catch (error) {
    console.error('❌ markNotificationAsRead mutation error:', error as Error);
    throw error;
  }
};

/**
 * Update notification preferences with GDPR audit trail (Four-Gate Pattern)
 * Gate 1: Verify patient owns these preferences
 * Gate 2: Validate input data
 * Gate 3: Update preferences
 * Gate 4: Create GDPR audit trail
 */
export const updateNotificationPreferences = async (
  _: unknown,
  args: {
    patientId: string;
    input: {
      smsEnabled?: boolean;
      emailEnabled?: boolean;
      pushEnabled?: boolean;
      appointmentReminders?: boolean;
      billingAlerts?: boolean;
      treatmentUpdates?: boolean;
      marketingEmails?: boolean;
    };
  },
  context: GraphQLContext
): Promise<any> => {
  try {
    console.log(
      `📝 UPDATE_NOTIFICATION_PREFERENCES mutation called with patientId: ${args.patientId}`
    );

    const { patientId, input } = args;

    // 🎯 GATE 1: Verify patient owns these preferences (authentication/authorization)
    // Check if the requesting user is the patient or an authorized admin
    if (context.auth?.userId !== patientId && context.auth?.role !== 'ADMIN') {
      throw new Error(
        `🚨 GDPR Authorization Failed: User ${context.auth?.userId} cannot modify preferences for patient ${patientId}`
      );
    }

    // 🎯 GATE 2 + 3 + 4: Update preferences with audit trail
    // The NotificationsDatabase.updatePreferences() handles all gates internally
    const auditContext = {
      userId: context.auth?.userId || 'unknown',
      ipAddress: (context as any).req?.ip || 'unknown',
      userAgent: (context as any).req?.get?.('user-agent') || (context as any).req?.headers?.['user-agent'] || 'unknown',
    };

    const updated = await context.database.notifications.updatePreferences(
      patientId,
      input,
      auditContext
    );

    console.log(`✅ Notification preferences updated for patient ${patientId}`);
    console.log(
      `✅ GDPR Audit Trail: Preference changes logged (Gate 4 - Compliance)`
    );

    // Publish subscription event
    if (context.pubsub) {
      context.pubsub.publish('NOTIFICATION_PREFERENCES_V3_UPDATED', {
        notificationPreferencesV3Updated: updated,
      });
    }

    return updated;
  } catch (error) {
    console.error(
      '❌ updateNotificationPreferences mutation error:',
      error as Error
    );
    throw error;
  }
};
