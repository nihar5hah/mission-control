import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new task
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    scheduledFor: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description || "",
      scheduledFor: args.scheduledFor,
      status: args.status,
      createdAt: Date.now(),
    });
    return task;
  },
});

// Get all tasks
export const getTasks = query({
  args: {
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("in_progress"),
        v.literal("completed")
      )
    ),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    let tasks;

    if (args.status) {
      tasks = await ctx.db
        .query("tasks")
        .filter((q) => q.eq(q.field("status"), args.status))
        .take(args.limit || 100);
    } else {
      tasks = await ctx.db
        .query("tasks")
        .take(args.limit || 100);
    }

    // Sort by scheduledFor ascending in-memory
    return tasks.sort((a: any, b: any) => a.scheduledFor - b.scheduledFor);
  },
});

// Get tasks by date range
export const getTasksByDateRange = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .filter((q) => q.gte(q.field("scheduledFor"), args.startDate))
      .filter((q) => q.lte(q.field("scheduledFor"), args.endDate))
      .collect();

    return tasks.sort((a: any, b: any) => a.scheduledFor - b.scheduledFor);
  },
});

// Update task
export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    status: v.union(
      v.literal("pending"),
      v.literal("in_progress"),
      v.literal("completed")
    ),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    await ctx.db.patch(args.id, {
      status: args.status,
      description: args.description || task.description,
    });

    return { id: args.id, status: args.status };
  },
});

// Delete task
export const deleteTask = mutation({
  args: {
    id: v.id("tasks"),
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");

    await ctx.db.delete(args.id);
    return { id: args.id };
  },
});
