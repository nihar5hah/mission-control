import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Log a new activity
export const logActivity = mutation({
  args: {
    agent: v.string(),
    action: v.string(),
    description: v.string(),
    status: v.union(
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const activity = await ctx.db.insert("activities", {
      agent: args.agent,
      action: args.action,
      description: args.description,
      status: args.status,
      timestamp: Date.now(),
      metadata: args.metadata || {},
    });
    return activity;
  },
});

// Get all activities with pagination
export const getActivities = query({
  args: {
    limit: v.optional(v.number()),
    status: v.optional(
      v.union(
        v.literal("running"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
  },
  handler: async (ctx, args) => {
    let activities;
    
    if (args.status) {
      activities = await ctx.db
        .query("activities")
        .filter((q) => q.eq(q.field("status"), args.status))
        .take(args.limit || 50);
    } else {
      activities = await ctx.db
        .query("activities")
        .take(args.limit || 50);
    }

    // Sort by timestamp descending in-memory
    return activities.sort((a: any, b: any) => b.timestamp - a.timestamp);
  },
});

// Get activities by agent
export const getActivitiesByAgent = query({
  args: {
    agent: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("activities")
      .filter((q) => q.eq(q.field("agent"), args.agent))
      .take(args.limit || 50);

    // Sort by timestamp descending in-memory
    return activities.sort((a: any, b: any) => b.timestamp - a.timestamp);
  },
});

// Update activity status
export const updateActivityStatus = mutation({
  args: {
    id: v.id("activities"),
    status: v.union(
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const activity = await ctx.db.get(args.id);
    if (!activity) throw new Error("Activity not found");

    await ctx.db.patch(args.id, {
      status: args.status,
      metadata: args.metadata || activity.metadata,
    });

    return { id: args.id, status: args.status };
  },
});
