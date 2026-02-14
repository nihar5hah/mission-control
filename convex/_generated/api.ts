/* eslint-disable */
/**
 * Generated `api` utility.
 */

// Create mock API functions that will be replaced at runtime
const mockFn = (name: string) => ({
  __name: name,
  __isReference: true,
} as any);

// Create activities API
const activities = {
  logActivity: mockFn("activities.logActivity"),
  getActivities: mockFn("activities.getActivities"),
  getActivitiesByAgent: mockFn("activities.getActivitiesByAgent"),
  updateActivityStatus: mockFn("activities.updateActivityStatus"),
};

// Create tasks API
const tasks = {
  createTask: mockFn("tasks.createTask"),
  getTasks: mockFn("tasks.getTasks"),
  getTasksByDateRange: mockFn("tasks.getTasksByDateRange"),
  updateTask: mockFn("tasks.updateTask"),
  deleteTask: mockFn("tasks.deleteTask"),
};

// Create search API
const search = {
  search: mockFn("search.search"),
  getDocumentsByType: mockFn("search.getDocumentsByType"),
  getMemoriesByDate: mockFn("search.getMemoriesByDate"),
  getAllMemories: mockFn("search.getAllMemories"),
  getRecentActivity: mockFn("search.getRecentActivity"),
};

export const api = {
  activities,
  tasks,
  search,
} as any;

export const internal = {
  activities,
  tasks,
  search,
} as any;
