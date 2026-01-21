import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { IReactionDisposer, reaction } from 'mobx';
import { Task } from '../../core/models/task.model';
import { CommentStore } from '../../stores/comment.store';
import { TaskStore } from '../../stores/task.store';
import { CommentThread } from '../../shared/components/comment-thread/comment-thread';
import { FormsModule } from '@angular/forms';
import { FormatDatePipe } from "../../shared/pipes/format-date-pipe";
import { FormatDateTimePipe } from "../../shared/pipes/format-date-time-pipe";
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-task-details',
  imports: [CommonModule, FormsModule, RouterLink, CommentThread, FormatDatePipe, FormatDateTimePipe],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css',
})
export class TaskDetails implements OnInit, OnDestroy {
  task: Task | null = null;
  taskId: string = '';
  
  private disposeReaction: IReactionDisposer | null = null;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    public readonly taskStore: TaskStore,
    public readonly commentStore: CommentStore
  ) {}

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        this.taskId = params.get('id') || '';
        if (this.taskId) {
          this.loadTask();
          this.setupReaction();
        } else {
          this.navigateToTaskList();
        }
      });
  }

  ngOnDestroy(): void {
    if (this.disposeReaction) {
      this.disposeReaction();
    }
    
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupReaction(): void {
    this.disposeReaction = reaction(
      () => this.taskStore.tasks.find(t => t.id === this.taskId),
      (foundTask) => {
        this.task = foundTask || null;
        if (!foundTask) {
          console.warn(`Task ${this.taskId} no longer exists`);
          this.navigateToTaskList();
        }
      }
    );
  }

  private loadTask(): void {
    const foundTask = this.taskStore.getTaskById(this.taskId);
    
    if (foundTask) {
      this.task = foundTask;
      this.taskStore.setSelectedTask(foundTask);
    } else {
      console.warn(`Task ${this.taskId} not found`);
      this.navigateToTaskList();
    }
  }

  private navigateToTaskList(): void {
    this.router.navigate(['/tasks']);
  }

  deleteTask(): void {
    if (!this.task) {
      console.error('No task to delete');
      return;
    }

    const confirmMessage = `Are you sure you want to delete "${this.task.title}"?`;
    
    if (confirm(confirmMessage)) {
      const success = this.taskStore.deleteTask(this.task.id);
      
      if (success) {
        this.navigateToTaskList();
      } else {
        console.error('Failed to delete task');
        alert('Failed to delete task. Please try again.');
      }
    }
  }

  navigateToCalendar(): void {
    this.router.navigate(['/calendar']);
  }

  get comments() {
    return this.commentStore.getCommentsByTaskId(this.taskId);
  }

  get commentCount(): number {
    return this.commentStore.getCommentCountForTask(this.taskId);
  }
}