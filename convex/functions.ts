import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Activity mutations
export const createActivity = mutation({
  args: {
    type: v.string(),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    icon: v.optional(v.string()),
    metadata: v.optional(v.object({})),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("activities", {
      type: args.type,
      title: args.title,
      description: args.description,
      status: args.status,
      icon: args.icon,
      timestamp: Date.now(),
      metadata: args.metadata,
    });
  },
});

export const updateActivityStatus = mutation({
  args: {
    id: v.id("activities"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});

// Activity queries
export const getRecentActivities = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("activities")
      .order("desc", (q) => q.field("timestamp"))
      .take(args.limit || 50);
    return activities;
  },
});

export const getActivitiesByStatus = query({
  args: {
    status: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const activities = await ctx.db
      .query("activities")
      .withIndex("by_status", (q) => q.eq("status", args.status))
      .order("desc", (q) => q.field("timestamp"))
      .take(args.limit || 50);
    return activities;
  },
});

// Task mutations
export const createTask = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    priority: v.string(),
    scheduledDate: v.string(),
    scheduledTime: v.optional(v.string()),
    dueDate: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: args.status,
      priority: args.priority,
      scheduledDate: args.scheduledDate,
      scheduledTime: args.scheduledTime,
      dueDate: args.dueDate,
      tags: args.tags,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateTask = mutation({
  args: {
    id: v.id("tasks"),
    status: v.optional(v.string()),
    priority: v.optional(v.string()),
    scheduledDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const updates: any = { updatedAt: Date.now() };
    if (args.status) updates.status = args.status;
    if (args.priority) updates.priority = args.priority;
    if (args.scheduledDate) updates.scheduledDate = args.scheduledDate;
    
    await ctx.db.patch(args.id, updates);
  },
});

// Task queries
export const getUpcomingTasks = query({
  args: {
    fromDate: v.optional(v.string()),
    toDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db.query("tasks").collect();
    
    return tasks
      .filter((task) => {
        if (args.fromDate && task.scheduledDate < args.fromDate) return false;
        if (args.toDate && task.scheduledDate > args.toDate) return false;
        return true;
      })
      .sort((a, b) => {
        const dateCompare = a.scheduledDate.localeCompare(b.scheduledDate);
        if (dateCompare !== 0) return dateCompare;
        return (a.scheduledTime || "").localeCompare(b.scheduledTime || "");
      });
  },
});

export const getTasksByDate = query({
  args: {
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_scheduledDate", (q) => q.eq("scheduledDate", args.date))
      .collect();
    return tasks.sort((a, b) => 
      (a.scheduledTime || "").localeCompare(b.scheduledTime || "")
    );
  },
});

// Document mutations
export const createDocument = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    path: v.string(),
    type: v.string(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("documents", {
      title: args.title,
      content: args.content,
      path: args.path,
      type: args.type,
      tags: args.tags,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Document queries
export const searchDocuments = query({
  args: {
    query: v.string(),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const results = await ctx.db
      .query("documents")
      .filter((q) =>
        q.or(
          q.contains(q.field("title"), args.query),
          q.contains(q.field("content"), args.query),
          q.contains(q.field("path"), args.query)
        )
      )
      .collect();

    if (args.type) {
      return results.filter((doc) => doc.type === args.type);
    }
    return results;
  },
});

export const getDocumentsByType = query({
  args: {
    type: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("documents")
      .withIndex("by_type", (q) => q.eq("type", args.type))
      .collect();
  },
});

// Memory queries
export const searchMemories = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("memories")
      .filter((q) => q.contains(q.field("content"), args.query))
      .collect();
  },
});

export const getMemoriesByDate = query({
  args: {
    date: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("memories")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
  },
});

// Global search
export const globalSearch = query({
  args: {
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .filter((q) =>
        q.or(
          q.contains(q.field("title"), args.query),
          q.contains(q.field("content"), args.query)
        )
      )
      .take(20)
      .collect();

    const memories = await ctx.db
      .query("memories")
      .filter((q) => q.contains(q.field("content"), args.query))
      .take(20)
      .collect();

    const tasks = await ctx.db
      .query("tasks")
      .filter((q) =>
        q.or(
          q.contains(q.field("title"), args.query),
          q.contains(q.field("description"), args.query)
        )
      )
      .take(20)
      .collect();

    return {
      documents,
      memories,
      tasks,
      total: documents.length + memories.length + tasks.length,
    };
  },
});
