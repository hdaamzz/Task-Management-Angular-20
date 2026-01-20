import { Injectable } from '@angular/core';
import { makeAutoObservable } from 'mobx';
import { Task, TaskStatus, TaskFormData } from '../core/models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskStore {
  tasks: Task[] = [];
  selectedTask: Task | null = null;
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setTasks(tasks: Task[]) {
    this.tasks = tasks;
  }

  setSelectedTask(task: Task | null) {
    this.selectedTask = task;
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setError(error: string | null) {
    this.error = error;
  }

  addTask(taskData: TaskFormData) {
    const newTask: Task = {
      id: this.generateId(),
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.tasks.push(newTask);
  }

  updateTask(id: string, taskData: Partial<TaskFormData>) {
    const index = this.tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      this.tasks[index] = {
        ...this.tasks[index],
        ...taskData,
        updatedAt: new Date()
      };
      if (this.selectedTask?.id === id) {
        this.selectedTask = this.tasks[index];
      }
    }
  }

  deleteTask(id: string) {
    this.tasks = this.tasks.filter(t => t.id !== id);
    if (this.selectedTask?.id === id) {
      this.selectedTask = null;
    }
  }

  getTaskById(id: string): Task | undefined {
    return this.tasks.find(t => t.id === id);
  }

  get pendingTasks(): Task[] {
    return this.tasks.filter(t => t.status === TaskStatus.PENDING);
  }

  get inProgressTasks(): Task[] {
    return this.tasks.filter(t => t.status === TaskStatus.IN_PROGRESS);
  }

  get completedTasks(): Task[] {
    return this.tasks.filter(t => t.status === TaskStatus.COMPLETED);
  }

  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}