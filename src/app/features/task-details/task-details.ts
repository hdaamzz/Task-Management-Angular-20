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
  showDeleteModal: boolean = false;

  
  private _disposeReaction: IReactionDisposer | null = null;
  private readonly _destroy$ = new Subject<void>();
  

  constructor(
    private readonly _route: ActivatedRoute,
    private readonly _router: Router,
    public readonly taskStore: TaskStore,
    public readonly commentStore: CommentStore
  ) {}

  ngOnInit(): void {
    this._route.paramMap
      .pipe(takeUntil(this._destroy$))
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
    if (this._disposeReaction) {
      this._disposeReaction();
    }
    
    this._destroy$.next();
    this._destroy$.complete();
  }

  private setupReaction(): void {
    this._disposeReaction = reaction(
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
    this._router.navigate(['/tasks']);
  }

  deleteTask(): void {
    this.openDeleteModal();
  }

  navigateToCalendar(): void {
    this._router.navigate(['/calendar']);
  }
  openDeleteModal(): void {
    this.showDeleteModal = true;
    document.body.style.overflow = 'hidden'; 
  }

  closeDeleteModal(event?: MouseEvent): void {
    if (event?.target === event?.currentTarget) {
      this.showDeleteModal = false;
      document.body.style.overflow = 'unset'; 
    }
  }

  confirmDelete(): void {
    if (!this.task) {
      console.error('No task to delete');
      this.closeDeleteModal();
      return;
    }

    this.taskStore.deleteTask(this.task.id);
    this.closeDeleteModal();
    this.navigateToTaskList();
  }

  get comments() {
    return this.commentStore.getCommentsByTaskId(this.taskId);
  }

  get commentCount(): number {
    return this.commentStore.getCommentCountForTask(this.taskId);
  }
}