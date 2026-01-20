import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TaskForm } from '../../shared/components/task-form/task-form';
import { Task, TaskStatus } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { TaskStore } from '../../stores/task.store';

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, RouterLink, TaskForm],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit {
  showTaskForm = false;
  editingTask: Task | null = null;
  TaskStatus = TaskStatus;

  constructor(
    public taskStore: TaskStore,
    private taskService: TaskService
  ) { }

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskStore.setLoading(true);
    this.taskService.loadTasks().subscribe({
      next: (tasks) => {
        this.taskStore.setTasks(tasks);
        this.taskStore.setLoading(false);
      },
      error: (error) => {
        this.taskStore.setError('Failed to load tasks');
        this.taskStore.setLoading(false);
        console.error('Error loading tasks:', error);
      }
    });
  }

  openAddTaskForm() {
    this.editingTask = null;
    this.showTaskForm = true;
  }

  openEditTaskForm(task: Task) {
    this.editingTask = task;
    this.showTaskForm = true;
  }

  closeTaskForm() {
    this.showTaskForm = false;
    this.editingTask = null;
  }

  deleteTask(task: Task, event: Event) {
    event.stopPropagation();
    if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
      this.taskStore.deleteTask(task.id);
    }
  }

  getStatusClass(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.COMPLETED:
        return 'status-completed';
      case TaskStatus.IN_PROGRESS:
        return 'status-in-progress';
      case TaskStatus.PENDING:
        return 'status-pending';
      default:
        return '';
    }
  }

  getShortDescription(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}