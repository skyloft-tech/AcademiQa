import { createContext, useContext, useState, ReactNode } from "react";

// Define the structure of a task
export interface Task {
  id: string;
  title: string;
  client: string;
  discipline: string;
  status: "Pending" | "In Progress" | "Completed" | "Returned";
  description: string;
  unreadCount: number;
  chat: { sender: "Client" | "Admin"; message: string; time: string }[];
}

// Context type
interface TaskContextType {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const useTasks = () => {
  const context = useContext(TaskContext);
  if (!context) throw new Error("useTasks must be used within TaskProvider");
  return context;
};

export const TaskProvider = ({ children }: { children: ReactNode }) => {
  const [tasks, setTasks] = useState<Task[]>([]); // Start with empty array

  return (
    <TaskContext.Provider value={{ tasks, setTasks }}>
      {children}
    </TaskContext.Provider>
  );
};
