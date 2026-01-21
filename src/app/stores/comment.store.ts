import { Injectable } from '@angular/core';
import { makeAutoObservable, runInAction } from 'mobx';
import { Comment } from '../core/models/comment.model';
import { IdGenerator } from '../shared/utils/id-generator.util';

@Injectable({
  providedIn: 'root'
})
export class CommentStore {
  comments: Comment[] = [];
  isLoading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  setComments(comments: Comment[]) {
    runInAction(() => {
      this.comments = comments;
    });
  }

  addComment(
    taskId: string, 
    content: string, 
    author: string, 
    parentId: string | null = null
  ): Comment {
    const newComment: Comment = {
      id: IdGenerator.generate('comment'),
      taskId,
      author,
      content: content.trim(),
      createdAt: new Date(),
      parentId,
      replies: []
    };

    runInAction(() => {
      if (parentId) {
        this._addReplyToComment(parentId, newComment);
      } else {
        this.comments = [...this.comments, newComment];
      }
    });

    return newComment;
  }

  private _addReplyToComment(parentId: string, reply: Comment): boolean {
    const addReply = (comments: Comment[]): boolean => {
      for (const comment of comments) {
        if (comment.id === parentId) {
          comment.replies = [...comment.replies, reply];
          return true;
        }
        
        if (comment.replies.length > 0 && addReply(comment.replies)) {
          return true;
        }
      }
      return false;
    };

    return addReply(this.comments);
  }

  deleteComment(commentId: string): boolean {
    const deleteFromList = (comments: Comment[]): Comment[] => {
      return comments
        .filter(comment => comment.id !== commentId)
        .map(comment => ({
          ...comment,
          replies: deleteFromList(comment.replies)
        }));
    };

    runInAction(() => {
      this.comments = deleteFromList(this.comments);
    });

    return true;
  }

  getCommentsByTaskId(taskId: string): Comment[] {
    return this.comments.filter(c => 
      c.taskId === taskId && c.parentId === null
    );
  }

  getCommentCountForTask(taskId: string): number {
    const countReplies = (comment: Comment): number => {
      return 1 + comment.replies.reduce((sum, reply) => 
        sum + countReplies(reply), 0
      );
    };

    return this.comments
      .filter(c => c.taskId === taskId)
      .reduce((sum, comment) => sum + countReplies(comment), 0);
  }
}