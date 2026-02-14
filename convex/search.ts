import { query } from "./_generated/server";
import { v } from "convex/values";

// Search across all documents and memories
export const search = query({
  args: {
    q: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const [documents, memories] = await Promise.all([
      ctx.db.query("documents").collect(),
      ctx.db.query("memories").collect(),
    ]);

    const query_lower = args.q.toLowerCase();

    // Filter in-memory
    const filteredDocs = documents
      .filter((d: any) => 
        d.title?.toLowerCase().includes(query_lower) ||
        d.content?.toLowerCase().includes(query_lower)
      )
      .slice(0, args.limit || 10);

    const filteredMems = memories
      .filter((m: any) => 
        m.date?.toLowerCase().includes(query_lower) ||
        m.content?.toLowerCase().includes(query_lower)
      )
      .slice(0, args.limit || 10);

    return {
      documents: filteredDocs,
      memories: filteredMems,
      total: filteredDocs.length + filteredMems.length,
    };
  },
});

// Get documents by type
export const getDocumentsByType = query({
  args: {
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const documents = await ctx.db
      .query("documents")
      .filter((q) => q.eq(q.field("type"), args.type))
      .collect();

    return documents.sort((a: any, b: any) => b.updatedAt - a.updatedAt);
  },
});

// Get memories by date
export const getMemoriesByDate = query({
  args: {
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const memories = await ctx.db
      .query("memories")
      .filter((q) => q.eq(q.field("date"), args.date))
      .collect();

    return memories.sort((a: any, b: any) => b.createdAt - a.createdAt);
  },
});

// Get all memories with pagination
export const getAllMemories = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const memories = await ctx.db
      .query("memories")
      .take(args.limit || 50);

    return memories.sort((a: any, b: any) => b.createdAt - a.createdAt);
  },
});

// Get recent activities (combined view)
export const getRecentActivity = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;

    const [activities, tasks] = await Promise.all([
      ctx.db
        .query("activities")
        .take(limit),
      ctx.db
        .query("tasks")
        .take(limit),
    ]);

    // Merge and sort by timestamp
    const combined = [
      ...activities.map((a: any) => ({
        type: "activity" as const,
        timestamp: a.timestamp,
        ...a,
      })),
      ...tasks.map((t: any) => ({
        type: "task" as const,
        timestamp: t.createdAt,
        ...t,
      })),
    ].sort((a, b) => b.timestamp - a.timestamp);

    return combined.slice(0, limit);
  },
});
