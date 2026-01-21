import { Injectable } from '@angular/core';
import { makeAutoObservable, runInAction } from 'mobx';
import { Task, TaskStatus, TaskFormData } from '../core/models/task.model';
import { IdGenerator } from '../shared/utils/id-generator.util';

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
    runInAction(() => {
      this.tasks = tasks;
      this.error = null;
    });
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

  addTask(taskData: TaskFormData): Task {
    const newTask: Task = {
      id: IdGenerator.generate('task'),
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    runInAction(() => {
      this.tasks = [...this.tasks, newTask];
    });
    
    return newTask;
  }

  updateTask(id: string, taskData: Partial<TaskFormData>): boolean {
    const index = this.tasks.findIndex(t => t.id === id);
    
    if (index === -1) {
      console.warn(`Task with id ${id} not found`);
      return false;
    }

    runInAction(() => {
      this.tasks = this.tasks.map(task => 
        task.id === id 
          ? { ...task, ...taskData, updatedAt: new Date() }
          : task
      );

      if (this.selectedTask?.id === id) {
        this.selectedTask = this.tasks[index];
      }
    });

    return true;
  }

  deleteTask(id: string): boolean {
    const taskExists = this.tasks.some(t => t.id === id);
    
    if (!taskExists) {
      console.warn(`Task with id ${id} not found`);
      return false;
    }

    runInAction(() => {
      this.tasks = this.tasks.filter(t => t.id !== id);
      
      if (this.selectedTask?.id === id) {
        this.selectedTask = null;
      }
    });

    return true;
  }

  clearTasks() {
    runInAction(() => {
      this.tasks = [];
      this.selectedTask = null;
      this.error = null;
    });
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

  get taskCount(): number {
    return this.tasks.length;
  }

  get tasksByDeadline(): Task[] {
    return [...this.tasks].sort((a, b) => 
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );
  }

  get recentTasks(): Task[] {
    return [...this.tasks].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  get overdueTasks(): Task[] {
    const now = new Date();
    return this.tasks.filter(t => 
      new Date(t.deadline) < now && t.status !== TaskStatus.COMPLETED
    );
  }
}

