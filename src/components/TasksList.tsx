import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ListTodo, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface TaskItem {
  _id: string;
  title: string;
  description?: string;
  scheduledFor: number;
  status: "pending" | "in_progress" | "completed";
  createdAt: number;
}

export function TasksList() {
  const tasks = useQuery(api.tasks.getTasks, { limit: 100 });
  const createTask = useMutation(api.tasks.createTask);
  const updateTask = useMutation(api.tasks.updateTask);
  const deleteTask = useMutation(api.tasks.deleteTask);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    try {
      await createTask({
        title: newTaskTitle,
        description: newTaskDescription,
        scheduledFor: Date.now() + 24 * 60 * 60 * 1000, // Tomorrow
        status: "pending",
      });
      setNewTaskTitle("");
      setNewTaskDescription("");
    } catch (error) {
      console.error("Failed to create task:", error);
    }
  };

  const handleStatusChange = async (task: TaskItem) => {
    const statuses = ["pending", "in_progress", "completed"] as const;
    const currentIndex = statuses.indexOf(task.status);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    try {
      await updateTask({
        id: task._id,
        status: nextStatus,
      });
    } catch (error) {
      console.error("Failed to update task:", error);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask({ id: taskId });
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[#5EAD5E]/20 text-[#5EAD5E]";
      case "in_progress":
        return "bg-[#5E8FAD]/20 text-[#5E8FAD]";
      default:
        return "bg-[#2A2A2A] text-[#8A8A8A]";
    }
  };

  if (!tasks) {
    return <div className="text-[#8A8A8A]">Loading tasks...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Create Task Form */}
      <div className="p-4 rounded-md bg-[#141414] border border-[#2A2A2A] space-y-2">
        <Input
          placeholder="Task title..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="bg-[#0D0D0D] border-[#2A2A2A] text-white placeholder:text-[#8A8A8A]"
        />
        <Input
          placeholder="Description (optional)..."
          value={newTaskDescription}
          onChange={(e) => setNewTaskDescription(e.target.value)}
          className="bg-[#0D0D0D] border-[#2A2A2A] text-white placeholder:text-[#8A8A8A]"
        />
        <Button
          onClick={handleCreateTask}
          className="bg-[#5E6AD2] hover:bg-[#4A56B8] text-white w-full"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Task
        </Button>
      </div>

      {/* Tasks List */}
      <div className="space-y-1">
        {tasks.length === 0 ? (
          <p className="text-sm text-[#8A8A8A] text-center py-8">
            No tasks yet
          </p>
        ) : (
          tasks.map((task: TaskItem) => (
            <div
              key={task._id}
              className="flex items-center justify-between p-3 rounded-md hover:bg-[#141414] transition-colors"
            >
              <div
                className="flex items-center gap-3 flex-1 cursor-pointer"
                onClick={() => handleStatusChange(task)}
              >
                <ListTodo className="w-4 h-4 text-[#5E6AD2]" />
                <div>
                  <p className="text-sm text-white">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-[#8A8A8A]">
                      {task.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(task.status)}`}>
                  {task.status.replace("_", " ")}
                </span>
                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="text-[#8A8A8A] hover:text-[#E55454] transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
