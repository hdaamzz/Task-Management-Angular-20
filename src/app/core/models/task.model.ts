export enum TaskStatus {
  PENDING = 'Pending',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed'
}

export interface Task {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  status: TaskStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskFormData {
  title: string;
  description: string;
  deadline: Date;
  status: TaskStatus;
}