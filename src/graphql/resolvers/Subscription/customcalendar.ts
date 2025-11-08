/**
 * 📅 CUSTOM CALENDAR V3 SUBSCRIPTION RESOLVERS - AINARKLENDAR SYSTEM
 * Real-time updates for calendar views, settings, and events
 */

import type { GraphQLContext } from '../../types.js';

// ============================================================================
// CUSTOM CALENDAR V3 SUBSCRIPTION RESOLVERS
// ============================================================================

export const customCalendarViewV3Created = {
  subscribe: (_: unknown, __: unknown, context: GraphQLContext) => {
    return context.pubsub.asyncIterator('CUSTOM_CALENDAR_VIEW_V3_CREATED');
  },
};

export const customCalendarViewV3Updated = {
  subscribe: (_: unknown, __: unknown, context: GraphQLContext) => {
    return context.pubsub.asyncIterator('CUSTOM_CALENDAR_VIEW_V3_UPDATED');
  },
};

export const calendarSettingsV3Updated = {
  subscribe: (_: unknown, __: unknown, context: GraphQLContext) => {
    return context.pubsub.asyncIterator('CALENDAR_SETTINGS_V3_UPDATED');
  },
};

export const calendarFilterV3Created = {
  subscribe: (_: unknown, __: unknown, context: GraphQLContext) => {
    return context.pubsub.asyncIterator('CALENDAR_FILTER_V3_CREATED');
  },
};

export const calendarFilterV3Updated = {
  subscribe: (_: unknown, __: unknown, context: GraphQLContext) => {
    return context.pubsub.asyncIterator('CALENDAR_FILTER_V3_UPDATED');
  },
};

export const calendarEventV3Created = {
  subscribe: (_: unknown, __: unknown, context: GraphQLContext) => {
    return context.pubsub.asyncIterator('CALENDAR_EVENT_V3_CREATED');
  },
};

export const calendarEventV3Updated = {
  subscribe: (_: unknown, __: unknown, context: GraphQLContext) => {
    return context.pubsub.asyncIterator('CALENDAR_EVENT_V3_UPDATED');
  },
};

export const calendarAvailabilityV3Changed = {
  subscribe: (_: unknown, args: { userId: string }, context: GraphQLContext) => {
    return context.pubsub.asyncIterator(`CALENDAR_AVAILABILITY_V3_CHANGED_${args.userId}`);
  },
};

// ============================================================================
// EXPORT ALL CUSTOM CALENDAR SUBSCRIPTION RESOLVERS
// ============================================================================

export const customCalendarSubscriptions = {
  customCalendarViewV3Created,
  customCalendarViewV3Updated,
  calendarSettingsV3Updated,
  calendarFilterV3Created,
  calendarFilterV3Updated,
  calendarEventV3Created,
  calendarEventV3Updated,
  calendarAvailabilityV3Changed,
};