import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventInput } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { IReactionDisposer, reaction } from 'mobx';
import { Task, TaskStatus } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { TaskStore } from '../../stores/task.store';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-calendar-view',
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar-view.html',
  styleUrl: './calendar-view.css',
})
export class CalendarView implements OnInit, OnDestroy {
  calendarOptions = signal<CalendarOptions>({
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    weekends: true,
    events: [],
    eventClick: this.handleEventClick.bind(this),
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,dayGridWeek'
    },
    eventDisplay: 'block',
    displayEventTime: false,
    height: 'auto',
    contentHeight: 'auto',
    aspectRatio: 1.8,
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false
    },
    eventClassNames: 'cursor-pointer hover:opacity-90 transition-opacity',
    dayCellClassNames: 'hover:bg-gray-50',
  });

  private readonly _destroy$ = new Subject<void>();
  private _disposeReaction: IReactionDisposer | null = null;

  private readonly _STATUS_COLORS: Record<TaskStatus, string> = {
    [TaskStatus.COMPLETED]: '#27ae60',    // Green
    [TaskStatus.IN_PROGRESS]: '#f39c12',  // Orange
    [TaskStatus.PENDING]: '#e74c3c'       // Red
  };

  private readonly _MAX_DESCRIPTION_LENGTH = 100;

  constructor(
    public readonly taskStore: TaskStore,
    private readonly _taskService: TaskService,
    private readonly _router: Router
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.setupReactiveUpdates();
  }

  ngOnDestroy(): void {
    if (this._disposeReaction) {
      this._disposeReaction();
    }

    this._destroy$.next();
    this._destroy$.complete();
  }

  private setupReactiveUpdates(): void {
    this._disposeReaction = reaction(
      () => this.taskStore.tasks.slice(),
      (tasks) => {
        this.updateCalendarEvents();
      },
      {
        fireImmediately: false,
        delay: 100
      }
    );
  }

  private loadTasks(): void {
    if (this.taskStore.tasks.length > 0) {
      this.updateCalendarEvents();
      return;
    }

    this.taskStore.setLoading(true);
    this.taskStore.setError(null);

    this._taskService
      .loadTasks()
      .pipe(takeUntil(this._destroy$))
      .subscribe({
        next: (tasks) => {
          this.taskStore.setTasks(tasks);
          this.taskStore.setLoading(false);
          this.updateCalendarEvents();
        },
        error: (error) => {
          console.error('Error loading tasks for calendar:', error);
          this.taskStore.setError('Failed to load tasks for calendar');
          this.taskStore.setLoading(false);
        }
      });
  }

  private updateCalendarEvents(): void {
    const events: EventInput[] = this.taskStore.tasks.map(task => 
      this.transformTaskToEvent(task)
    );


    this.calendarOptions.update(options => ({
      ...options,
      events: events
    }));
  }

  private transformTaskToEvent(task: Task): EventInput {
    return {
      id: task.id,
      title: task.title,
      start: task.deadline,
      backgroundColor: this.getEventColor(task.status),
      borderColor: this.getEventColor(task.status),
      textColor: '#ffffff',
      extendedProps: {
        status: task.status,
        description: this.truncateHtml(task.description),
        taskId: task.id
      },
      display: 'block',
      classNames: ['task-event', `task-${task.status.toLowerCase().replace(' ', '-')}`]
    };
  }

  private getEventColor(status: TaskStatus): string {
    return this._STATUS_COLORS[status] || '#95a5a6'; 
  }

  private truncateHtml(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';

    if (text.length <= this._MAX_DESCRIPTION_LENGTH) {
      return text;
    }

    return text.substring(0, this._MAX_DESCRIPTION_LENGTH).trim() + '...';
  }

  private navigateTo(path: string[]): void {
    this._router.navigate(path).catch(error => {
      console.error('Navigation error:', error);
    });
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const taskId = clickInfo.event.id;
    
    if (!taskId) {
      console.error('Event click without task ID');
      return;
    }

    this.navigateTo(['/tasks', taskId]);
  }

  goToHome(): void {
    this.navigateTo(['/']);
  }

  goToTasks(): void {
    this.navigateTo(['/tasks']);
  }

}