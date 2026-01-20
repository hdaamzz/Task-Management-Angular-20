import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { reaction } from 'mobx';
import { QuillModule } from 'ngx-quill';
import { Task, TaskStatus } from '../../core/models/task.model';
import { CommentStore } from '../../stores/comment.store';
import { TaskStore } from '../../stores/task.store';
import { CommentThread } from '../../shared/components/comment-thread/comment-thread';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-task-details',
  imports: [CommonModule,FormsModule, RouterLink, QuillModule, CommentThread],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css',
})
export class TaskDetails implements OnInit, OnDestroy {
  task: Task | null = null;
  taskId: string = '';
  private disposeReaction: (() => void) | null = null;

  quillModules = {
    toolbar: false // Read-only mode
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public taskStore: TaskStore,
    public commentStore: CommentStore
  ) { }

  ngOnInit() {
    this.taskId = this.route.snapshot.paramMap.get('id') || '';
    this.loadTask();

    // React to changes in the task store
    this.disposeReaction = reaction(
      () => this.taskStore.tasks.find(t => t.id === this.taskId),
      (foundTask) => {
        this.task = foundTask || null;
      }
    );
  }

  ngOnDestroy() {
    if (this.disposeReaction) {
      this.disposeReaction();
    }
  }

  loadTask() {
    const foundTask = this.taskStore.getTaskById(this.taskId);
    if (foundTask) {
      this.task = foundTask;
      this.taskStore.setSelectedTask(foundTask);
    } else {
      // Task not found, redirect to list
      this.router.navigate(['/tasks']);
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

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(date: Date): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  deleteTask() {
    if (this.task && confirm(`Are you sure you want to delete "${this.task.title}"?`)) {
      this.taskStore.deleteTask(this.task.id);
      this.router.navigate(['/tasks']);
    }
  }

  get comments() {
    return this.commentStore.getCommentsByTaskId(this.taskId);
  }
}