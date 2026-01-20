import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent:()=>import('./features/home/home').then(c=>c.Home)
  },
  {
    path: 'tasks',
    loadComponent: () => import('./features/task-list/task-list').then(m => m.TaskList)
  },
  {
    path: 'tasks/:id',
    loadComponent: () => import('./features/task-details/task-details').then(m => m.TaskDetails)
  },
  {
    path: 'calendar',
    loadComponent: () => import('./features/calendar-view/calendar-view').then(m => m.CalendarView)
  },
  {
    path: '**',
    redirectTo: 'tasks'
  }
];
