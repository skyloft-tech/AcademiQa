// src/hooks/useAdminTasks.ts
import { useState, useEffect } from 'react';
import { adminAPI } from '../services/adminApi';

export const useAdminTasks = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminAPI.getTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const acceptTask = async (taskId: string) => {
    try {
      const updatedTask = await adminAPI.acceptTask(taskId);
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept task');
      throw err;
    }
  };

  const rejectTask = async (taskId: string, reason: string) => {
    try {
      const updatedTask = await adminAPI.rejectTask(taskId, reason);
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject task');
      throw err;
    }
  };

  const proposeBudget = async (taskId: string, amount: number, reason: string) => {
    try {
      const response = await adminAPI.proposeBudget(taskId, amount, reason);
      setTasks(prev => prev.map(task => task.id === taskId ? response.task : task));
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to propose budget');
      throw err;
    }
  };

  const updateProgress = async (taskId: string, progress: number, message?: string) => {
    try {
      const updatedTask = await adminAPI.updateProgress(taskId, progress, message);
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update progress');
      throw err;
    }
  };

  const submitForReview = async (taskId: string) => {
    try {
      const updatedTask = await adminAPI.submitForReview(taskId);
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit for review');
      throw err;
    }
  };

  const markComplete = async (taskId: string) => {
    try {
      const updatedTask = await adminAPI.markComplete(taskId);
      setTasks(prev => prev.map(task => task.id === taskId ? updatedTask : task));
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark complete');
      throw err;
    }
  };

  const uploadSolution = async (taskId: string, file: File) => {
    try {
      const response = await adminAPI.uploadSolution(taskId, file);
      setTasks(prev => prev.map(task => task.id === taskId ? response.task : task));
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload solution');
      throw err;
    }
  };

  return {
    tasks,
    loading,
    error,
    fetchTasks,
    acceptTask,
    rejectTask,
    proposeBudget,
    updateProgress,
    submitForReview,
    markComplete,
    uploadSolution,
  };
};