import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { reaction } from 'mobx';
import { Task, TaskStatus } from '../../core/models/task.model';
import { CommentStore } from '../../stores/comment.store';
import { TaskStore } from '../../stores/task.store';
import { CommentThread } from '../../shared/components/comment-thread/comment-thread';
import { FormsModule } from '@angular/forms';
import { FormatDatePipe } from "../../shared/pipes/format-date-pipe";
import { FormatDateTimePipe } from "../../shared/pipes/format-date-time-pipe";

@Component({
  selector: 'app-task-details',
  imports: [CommonModule, FormsModule, RouterLink, CommentThread, FormatDatePipe, FormatDateTimePipe],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css',
})
export class TaskDetails implements OnInit, OnDestroy {
  task: Task | null = null;
  taskId: string = '';
  private disposeReaction: (() => void) | null = null;



  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    public taskStore: TaskStore,
    public commentStore: CommentStore
  ) { }

  ngOnInit() {
    this.taskId = this._route.snapshot.paramMap.get('id') || '';
    this.loadTask();

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
      this._router.navigate(['/tasks']);
    }
  }



  deleteTask() {
    if (this.task && confirm(`Are you sure you want to delete "${this.task.title}"?`)) {
      this.taskStore.deleteTask(this.task.id);
      this._router.navigate(['/tasks']);
    }
  }

  get comments() {
    return this.commentStore.getCommentsByTaskId(this.taskId);
  }
  getStatusLabel(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.COMPLETED: return 'COMPLETED';
      case TaskStatus.IN_PROGRESS: return 'IN_PROGRESS';
      case TaskStatus.PENDING: return 'PENDING';
      default: return 'UNKNOWN';
    }
  }
  openCalendar() {
    this._router.navigate(['/calendar']);
  }
}