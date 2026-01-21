import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TaskForm } from '../../shared/components/task-form/task-form';
import { Task, TaskStatus } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { TaskStore } from '../../stores/task.store';
import { FormatDatePipe } from "../../shared/pipes/format-date-pipe";
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, RouterLink, TaskForm, FormatDatePipe],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit {
  showTaskForm = false;
  editingTask: Task | null = null;
  
  readonly TaskStatus = TaskStatus;
  private readonly destroy$ = new Subject<void>();

  constructor(
    public readonly taskStore: TaskStore,
    private readonly taskService: TaskService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTasks(): void {
    this.taskStore.setLoading(true);
    this.taskStore.setError(null);

    this.taskService
      .loadTasks()
      .pipe(takeUntil(this.destroy$))
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
    this.router.navigate(['/calendar']);
  }


  deleteTask(task: Task, event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const confirmMessage = `Are you sure you want to delete "${task.title}"?`;
    
    if (confirm(confirmMessage)) {
      const success = this.taskStore.deleteTask(task.id);
      
      if (!success) {
        console.error(`Failed to delete task: ${task.id}`);
        alert('Failed to delete task. Please try again.');
      }
    }
  }
  getShortDescription(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }
}