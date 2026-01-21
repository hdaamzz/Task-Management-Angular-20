import { Component, Input, OnDestroy } from '@angular/core';
import { CommentStore } from '../../../stores/comment.store';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comment } from '../../../core/models/comment.model';
import { Subject } from 'rxjs';


@Component({
  selector: 'app-comment-thread',
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-thread.html',
  styleUrl: './comment-thread.css',
})
export class CommentThread implements OnDestroy {
  @Input() comments: Comment[] = [];
  @Input() taskId: string = '';
  @Input() level: number = 0;

  newCommentText: string = '';
  authorName: string = 'Anonymous User';
  replyingTo: string | null = null;
  replyText: Record<string, string> = {};
  showDeleteModal = false;
  commentToDelete: string | null = null;
  expandedReplies: Set<string> = new Set();

  private readonly _MAX_NESTING_LEVEL = 5;
  private readonly _destroy$ = new Subject<void>();

  constructor(private readonly _commentStore: CommentStore) { }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  addTopLevelComment(): void {
    const trimmedText = this.newCommentText.trim();

    if (!trimmedText) {
      console.warn('Cannot add empty comment');
      return;
    }

    if (trimmedText.length < 3) {
      alert('Comment must be at least 3 characters');
      return;
    }

    try {
      this._commentStore.addComment(
        this.taskId,
        trimmedText,
        this.authorName,
        null
      );

      this.newCommentText = '';
      console.log('Top-level comment added');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    }
  }

  startReply(commentId: string): void {
    if (this.replyingTo !== commentId) {
      this.replyingTo = commentId;

      if (!this.replyText[commentId]) {
        this.replyText[commentId] = '';
      }

      setTimeout(() => {
        const textarea = document.querySelector(`textarea[placeholder="Write a reply..."]`) as HTMLTextAreaElement;
        textarea?.focus();
      }, 150);
    }
  }


  cancelReply(): void {
    this.replyingTo = null;
  }

  addReply(parentId: string): void {
    const text = this.replyText[parentId];
    const trimmedText = text?.trim();

    if (!trimmedText) {
      console.warn('Cannot add empty reply');
      return;
    }

    if (trimmedText.length < 3) {
      alert('Reply must be at least 3 characters');
      return;
    }

    try {
      this._commentStore.addComment(
        this.taskId,
        trimmedText,
        this.authorName,
        parentId
      );

      this.replyText[parentId] = '';
      this.replyingTo = null;
      console.log('Reply added to comment:', parentId);
    } catch (error) {
      console.error('Error adding reply:', error);
      alert('Failed to add reply. Please try again.');
    }
  }

  deleteComment(commentId: string): void {
    this.openDeleteModal(commentId);
  }
  openDeleteModal(commentId: string): void {
    this.commentToDelete = commentId;
    this.showDeleteModal = true;
    document.body.style.overflow = 'hidden';
  }

  closeDeleteModal(event?: MouseEvent): void {
    if (event?.target === event?.currentTarget) {
      this.showDeleteModal = false;
      this.commentToDelete = null;
      document.body.style.overflow = 'unset';
    }
  }

  confirmDeleteComment(): void {
    if (!this.commentToDelete) return;

    try {
      const success = this._commentStore.deleteComment(this.commentToDelete);

      if (success) {
        console.log('Comment deleted:', this.commentToDelete);
      } else {
        console.error('Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }

    this.closeDeleteModal();
  }
  toggleReplies(commentId: string): void {
    if (this.isExpanded(commentId)) {
      this.expandedReplies.delete(commentId);
    } else {
      this.expandedReplies.add(commentId);
    }
  }

  isExpanded(commentId: string): boolean {
    return this.expandedReplies.has(commentId);
  }

  // HELPER METHODS


  formatDate(date: Date): string {
    const now = new Date();
    const commentDate = new Date(date);
    const diffMs = now.getTime() - commentDate.getTime();

    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return commentDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getPaddingClass(): string {
    if (this.level === 0) return 'pl-0';
    if (this.level === 1) return 'pl-4';
    if (this.level === 2) return 'pl-8';
    if (this.level >= 3) return 'pl-12';
    return 'pl-0';
  }

  getIndentClass(): string {
    const level = Math.min(this.level, this._MAX_NESTING_LEVEL);
    return `indent-level-${level}`;
  }

  get isMaxNestingReached(): boolean {
    return this.level >= this._MAX_NESTING_LEVEL;
  }

  getTotalCommentCount(comments: Comment[]): number {
    let count = comments.length;

    comments.forEach(comment => {
      if (comment.replies && comment.replies.length > 0) {
        count += this.getTotalCommentCount(comment.replies);
      }
    });

    return count;
  }
}