
export interface Comment {
  id: string;
  taskId: string;
  author: string;
  content: string;
  createdAt: Date;
  parentId: string | null;
  replies: Comment[];
}