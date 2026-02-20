export type TaskBoardStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskBoardPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface TaskBoardItem {
  id: string;
  title: string;
  description?: string | null;
  status: TaskBoardStatus;
  owner: string;
  priority: TaskBoardPriority;
  created_at: string;
  updated_at: string;
  completed_at?: string | null;
}

export type TaskBoardInsert = Omit<TaskBoardItem, 'id' | 'created_at' | 'updated_at' | 'completed_at'> & {
  completed_at?: string | null;
};
