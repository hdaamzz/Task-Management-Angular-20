import { Injectable } from '@angular/core';
import { makeAutoObservable } from 'mobx';
import { Comment } from '../core/models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentStore {
  comments: Comment[] = [];
  isLoading = false;

  constructor() {
    makeAutoObservable(this);
  }

  // Actions
  setComments(comments: Comment[]) {
    this.comments = comments;
  }

  addComment(taskId: string, content: string, author: string, parentId: string | null = null) {
    const newComment: Comment = {
      id: this.generateId(),
      taskId,
      author,
      content,
      createdAt: new Date(),
      parentId,
      replies: []
    };

    if (parentId) {
      // Add as reply to parent comment
      this.addReplyToComment(parentId, newComment);
    } else {
      // Add as top-level comment
      this.comments.push(newComment);
    }
  }

  private addReplyToComment(parentId: string, reply: Comment) {
    const addReply = (comments: Comment[]): boolean => {
      for (const comment of comments) {
        if (comment.id === parentId) {
          comment.replies.push(reply);
          return true;
        }
        if (comment.replies.length > 0) {
          if (addReply(comment.replies)) {
            return true;
          }
        }
      }
      return false;
    };
    addReply(this.comments);
  }

  deleteComment(commentId: string) {
    const deleteFromList = (comments: Comment[]): Comment[] => {
      return comments.filter(comment => {
        if (comment.id === commentId) {
          return false;
        }
        comment.replies = deleteFromList(comment.replies);
        return true;
      });
    };
    this.comments = deleteFromList(this.comments);
  }

  getCommentsByTaskId(taskId: string): Comment[] {
    return this.comments.filter(c => c.taskId === taskId && c.parentId === null);
  }

  private generateId(): string {
    return `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}