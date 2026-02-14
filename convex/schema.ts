import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  activities: defineTable({
    type: v.string(), // 'action', 'task_completed', 'event', 'log'
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // 'running', 'completed', 'failed', 'pending'
    icon: v.optional(v.string()),
    timestamp: v.number(),
    metadata: v.optional(v.object({})),
  })
    .index("by_timestamp", ["timestamp"])
    .index("by_status", ["status"]),

  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(), // 'pending', 'in_progress', 'completed'
    priority: v.string(), // 'low', 'medium', 'high', 'critical'
    scheduledDate: v.string(), // ISO date string
    scheduledTime: v.optional(v.string()), // HH:mm format
    dueDate: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_scheduledDate", ["scheduledDate"])
    .index("by_status", ["status"]),

  documents: defineTable({
    title: v.string(),
    content: v.string(),
    path: v.string(),
    type: v.string(), // 'memory', 'note', 'log', 'report'
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_type", ["type"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["type"],
    }),

  memories: defineTable({
    date: v.string(), // YYYY-MM-DD format
    content: v.string(),
    tags: v.optional(v.array(v.string())),
    createdAt: v.number(),
  })
    .index("by_date", ["date"])
    .searchIndex("search_memories", {
      searchField: "content",
      filterFields: ["date"],
    }),
});
