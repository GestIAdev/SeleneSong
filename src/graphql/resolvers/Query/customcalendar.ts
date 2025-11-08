/**
 * 📅 CUSTOM CALENDAR V3 QUERY RESOLVERS - AINARKLENDAR SYSTEM
 * Advanced calendar views, settings, and custom event management
 */

import type { GraphQLContext } from '../../types.js';

// ============================================================================
// CUSTOM CALENDAR V3 QUERY RESOLVERS
// ============================================================================

export const customCalendarViewsV3 = async (
  _: unknown,
  args: { userId?: string },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const { userId } = args;

    const views = await context.database.getCustomCalendarViewsV3({
      userId: userId || context.auth?.userId
    });

    console.log(`✅ customCalendarViewsV3 query returned ${views.length} views`);
    return views;
  } catch (error) {
    console.error("❌ customCalendarViewsV3 query error:", error as Error);
    throw error;
  }
};

export const customCalendarViewV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const view = await context.database.getCustomCalendarViewV3ById(args.id);

    if (!view) {
      throw new Error(`Custom calendar view not found: ${args.id}`);
    }

    console.log(`✅ customCalendarViewV3 query returned view: ${view.name}`);
    return view;
  } catch (error) {
    console.error("❌ customCalendarViewV3 query error:", error as Error);
    throw error;
  }
};

export const calendarSettingsV3 = async (
  _: unknown,
  args: { userId: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const settings = await context.database.getCalendarSettingsV3(args.userId);

    console.log(`✅ calendarSettingsV3 query returned settings for user: ${args.userId}`);
    return settings;
  } catch (error) {
    console.error("❌ calendarSettingsV3 query error:", error as Error);
    throw error;
  }
};

export const calendarFiltersV3 = async (
  _: unknown,
  args: { userId?: string },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const { userId } = args;

    const filters = await context.database.getCalendarFiltersV3(userId || context.auth?.userId);

    console.log(`✅ calendarFiltersV3 query returned ${filters.length} filters`);
    return filters;
  } catch (error) {
    console.error("❌ calendarFiltersV3 query error:", error as Error);
    throw error;
  }
};

export const calendarFilterV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const filter = await context.database.getCalendarFilterV3ById(args.id);

    if (!filter) {
      throw new Error(`Calendar filter not found: ${args.id}`);
    }

    console.log(`✅ calendarFilterV3 query returned filter: ${filter.name}`);
    return filter;
  } catch (error) {
    console.error("❌ calendarFilterV3 query error:", error as Error);
    throw error;
  }
};

export const calendarEventsV3 = async (
  _: unknown,
  args: { userId?: string; startDate?: string; endDate?: string },
  context: GraphQLContext
): Promise<any[]> => {
  try {
    const { userId, startDate, endDate } = args;

    const events = await context.database.getCalendarEventsV3({
      userId: userId || context.auth?.userId,
      startDate,
      endDate
    });

    console.log(`✅ calendarEventsV3 query returned ${events.length} events`);
    return events;
  } catch (error) {
    console.error("❌ calendarEventsV3 query error:", error as Error);
    throw error;
  }
};

export const calendarEventV3 = async (
  _: unknown,
  args: { id: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const event = await context.database.getCalendarEventV3ById(args.id);

    if (!event) {
      throw new Error(`Calendar event not found: ${args.id}`);
    }

    console.log(`✅ calendarEventV3 query returned event: ${event.title}`);
    return event;
  } catch (error) {
    console.error("❌ calendarEventV3 query error:", error as Error);
    throw error;
  }
};

export const calendarAvailabilityV3 = async (
  _: unknown,
  args: { userId: string; date: string },
  context: GraphQLContext
): Promise<any> => {
  try {
    const availability = await context.database.getCalendarAvailabilityV3(args.userId, args.date);

    console.log(`✅ calendarAvailabilityV3 query returned availability for ${args.date}`);
    return availability;
  } catch (error) {
    console.error("❌ calendarAvailabilityV3 query error:", error as Error);
    throw error;
  }
};