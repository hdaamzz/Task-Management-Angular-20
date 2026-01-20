import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Task } from '../models/task.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly TASKS_URL = 'assets/tasks.json';

  constructor(private http: HttpClient) {}

  loadTasks(): Observable<Task[]> {
    return this.http.get<Task[]>(this.TASKS_URL).pipe(
      map(tasks => tasks.map(task => ({
        ...task,
        deadline: new Date(task.deadline),
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt)
      })))
    );
  }
}