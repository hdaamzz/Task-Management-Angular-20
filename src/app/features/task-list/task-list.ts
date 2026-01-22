import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TaskForm } from '../../shared/components/task-form/task-form';
import { Task, TaskStatus } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { TaskStore } from '../../stores/task.store';
import { Subject, takeUntil } from 'rxjs';
import { TaskCard } from "../../shared/components/task-card/task-card";

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, RouterLink, TaskForm, TaskCard],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit {
  showTaskForm = false;
  editingTask: Task | null = null;
  showDeleteModal = false;
  taskToDelete: Task | null = null;
  
  readonly TaskStatus = TaskStatus;
  private readonly _destroy$ = new Subject<void>();

  constructor(
    public readonly taskStore: TaskStore,
    private readonly _taskService: TaskService,
    private readonly _router: Router
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  loadTasks(): void {
    this.taskStore.setLoading(true);
    this.taskStore.setError(null);

    this._taskService
      .loadTasks()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (tasks) => {
          this.taskStore.setTasks(tasks);
          this.taskStore.setLoading(false);
        },
        error: (error) => {
          console.error('Error loading tasks:', error);
          this.taskStore.setError('Failed to load tasks. Please try again.');
          this.taskStore.setLoading(false);
        }
      });
  }

  openAddTaskForm(): void {
    this.editingTask = null;
    this.showTaskForm = true;
  }

  openEditTaskForm(task: Task): void {
    this.editingTask = { ...task };
    this.showTaskForm = true;
  }

  closeTaskForm(): void {
    this.showTaskForm = false;
    this.editingTask = null;
  }

  navigateToCalendar(): void {
    this._router.navigate(['/calendar']);
  }


  openDeleteModal(task: Task): void {
    this.taskToDelete = task;
    this.showDeleteModal = true;
    document.body.style.overflow = 'hidden'; 
  }

  closeDeleteModal(event?: MouseEvent): void {
    if (event?.target === event?.currentTarget) {
      this.showDeleteModal = false;
      this.taskToDelete = null;
      document.body.style.overflow = 'unset'; 
    }
  }

  confirmDelete(): void {
    if (!this.taskToDelete) {
      console.error('No task to delete');
      this.closeDeleteModal();
      return;
    }

    const success = this.taskStore.deleteTask(this.taskToDelete.id);
    
    if (success) {
      console.log(`Task "${this.taskToDelete.title}" deleted successfully`);
    } else {
      console.error(`Failed to delete task: ${this.taskToDelete.id}`);
    }
    
    this.closeDeleteModal();
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }
}