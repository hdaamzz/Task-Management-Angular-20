import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TaskForm } from '../../shared/components/task-form/task-form';
import { Task, TaskStatus } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { TaskStore } from '../../stores/task.store';
import { TruncatePipe } from "../../shared/pipes/truncate-pipe";
import { FormatDatePipe } from "../../shared/pipes/format-date-pipe";

@Component({
  selector: 'app-task-list',
  imports: [CommonModule, RouterLink, TaskForm, TruncatePipe, FormatDatePipe],
  templateUrl: './task-list.html',
  styleUrl: './task-list.css',
})
export class TaskList implements OnInit {
  showTaskForm = false;
  editingTask: Task | null = null;
  TaskStatus = TaskStatus;

  constructor(
    public taskStore: TaskStore,
    private _taskService: TaskService,
    private _router : Router
  ) { }

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.taskStore.setLoading(true);
    this._taskService.loadTasks().subscribe({
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
  openCalendar() {
    this._router.navigate(['/calendar']);
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
}