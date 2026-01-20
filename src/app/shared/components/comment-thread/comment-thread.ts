import { Component, Input } from '@angular/core';
import { CommentStore } from '../../../stores/comment.store';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Comment } from '../../../core/models/comment.model';


@Component({
  selector: 'app-comment-thread',
  imports: [CommonModule, FormsModule],
  templateUrl: './comment-thread.html',
  styleUrl: './comment-thread.css',
})
export class CommentThread {
  @Input() comments: Comment[] = [];
  @Input() taskId: string = '';
  @Input() level: number = 0; // Nesting level for indentation

  newCommentText: string = '';
  authorName: string = 'Anonymous User'; // In real app, get from auth service
  replyingTo: string | null = null;
  replyText: { [key: string]: string } = {};

  constructor(private commentStore: CommentStore) {}

  addTopLevelComment() {
    if (this.newCommentText.trim()) {
      this.commentStore.addComment(
        this.taskId,
        this.newCommentText.trim(),
        this.authorName,
        null
      );
      this.newCommentText = '';
    }
  }

  startReply(commentId: string) {
    this.replyingTo = commentId;
    if (!this.replyText[commentId]) {
      this.replyText[commentId] = '';
    }
  }

  cancelReply() {
    this.replyingTo = null;
  }

  addReply(parentId: string) {
    const text = this.replyText[parentId];
    if (text && text.trim()) {
      this.commentStore.addComment(
        this.taskId,
        text.trim(),
        this.authorName,
        parentId
      );
      this.replyText[parentId] = '';
      this.replyingTo = null;
    }
  }

  deleteComment(commentId: string) {
    if (confirm('Are you sure you want to delete this comment and all its replies?')) {
      this.commentStore.deleteComment(commentId);
    }
  }

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

  getIndentClass(): string {
    return `indent-level-${Math.min(this.level, 5)}`;
  }
}
