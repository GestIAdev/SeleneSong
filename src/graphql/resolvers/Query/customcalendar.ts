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

    // Use specialized CustomCalendarDatabase class
    const views = await context.database.customCalendar.getCustomCalendarViewsV3({
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
    // Use specialized CustomCalendarDatabase class
    const view = await context.database.customCalendar.getCustomCalendarViewV3ById(args.id);

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
    // Use specialized CustomCalendarDatabase class
    const settings = await context.database.customCalendar.getCalendarSettingsV3(args.userId);

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

    // Use specialized CustomCalendarDatabase class
    const filters = await context.database.customCalendar.getCalendarFiltersV3({
      userId: userId || context.auth?.userId
    });

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
    // Use specialized CustomCalendarDatabase class
    const filter = await context.database.customCalendar.getCalendarFilterV3ById(args.id);

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

    // Use specialized CustomCalendarDatabase class
    const events = await context.database.customCalendar.getCalendarEventsV3({
      userId: userId || context.auth?.userId,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined
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
    // Use specialized CustomCalendarDatabase class
    const event = await context.database.customCalendar.getCalendarEventV3ById(args.id);

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
    // Use specialized CustomCalendarDatabase class
    const availability = await context.database.customCalendar.getCalendarAvailabilityV3(args.userId, args.date);

    console.log(`✅ calendarAvailabilityV3 query returned availability for ${args.date}`);
    return availability;
  } catch (error) {
    console.error("❌ calendarAvailabilityV3 query error:", error as Error);
    throw error;
  }
};