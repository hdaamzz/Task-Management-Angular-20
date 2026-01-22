import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { reaction, IReactionDisposer } from 'mobx';
import { FormsModule } from '@angular/forms';

import { TaskStore } from '../../stores/task.store';
import { CommentStore } from '../../stores/comment.store';

import { CommentThread } from '../../shared/components/comment-thread/comment-thread';
import { DeleteModal } from '../../shared/components/delete-modal/delete-modal';

import { FormatDatePipe } from '../../shared/pipes/FormatDate/format-date-pipe';
import { FormatDateTimePipe } from '../../shared/pipes/FormatDateTime/format-date-time-pipe';
import { SafeHtmlPipe } from "../../shared/pipes/SafeHtml/safe-html-pipe";

@Component({
  selector: 'app-task-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CommentThread,
    DeleteModal,
    FormatDatePipe,
    FormatDateTimePipe,
    SafeHtmlPipe
],
  templateUrl: './task-details.html',
  styleUrl: './task-details.css',
})
export class TaskDetails implements OnInit, OnDestroy {
  taskId = '';
  showDeleteModal = false;

  private disposeReaction?: IReactionDisposer;

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    public readonly taskStore: TaskStore,
    public readonly commentStore: CommentStore
  ) {}

  ngOnInit(): void {
    this.taskId = this._route.snapshot.paramMap.get('id') ?? '';

    if (!this.taskId) {
      this.navigateToTaskList();
      return;
    }

    const task = this.taskStore.getTaskById(this.taskId);

    if (!task) {
      console.warn(`Task ${this.taskId} not found`);
      this.navigateToTaskList();
      return;
    }

    this.taskStore.setSelectedTask(task);

    this.disposeReaction = reaction(
      () => this.taskStore.selectedTask,
      task => {
        if (!task) {
          this.navigateToTaskList();
        }
      }
    );
}

  ngOnDestroy(): void {
    this.disposeReaction?.();
  }

  // ---- Derived State ----

  get task() {
    return this.taskStore.selectedTask;
  }

  get comments() {
    return this.commentStore.getCommentsByTaskId(this.taskId);
  }

  get commentCount(): number {
    return this.commentStore.getCommentCountForTask(this.taskId);
  }

  // ---- Actions ----

  navigateToCalendar(): void {
    this._router.navigate(['/calendar']);
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
  }

  confirmDelete(): void {
    if (!this.task) return;

    this.taskStore.deleteTask(this.task.id);
    this.closeDeleteModal();
    this.navigateToTaskList();
  }

  private navigateToTaskList(): void {
    this._router.navigate(['/tasks']);
  }
}
