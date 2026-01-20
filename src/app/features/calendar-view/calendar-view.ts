import { CommonModule } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { reaction } from 'mobx';
import { TaskStatus } from '../../core/models/task.model';
import { TaskService } from '../../core/services/task.service';
import { TaskStore } from '../../stores/task.store';

@Component({
  selector: 'app-calendar-view',
  imports: [CommonModule, FullCalendarModule],
  templateUrl: './calendar-view.html',
  styleUrl: './calendar-view.css',
})
export class CalendarView  implements OnInit {
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
    eventTimeFormat: {
      hour: '2-digit',
      minute: '2-digit',
      meridiem: false
    }
  });

  constructor(
    public taskStore: TaskStore,
    private taskService: TaskService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadTasks();

    // React to task changes and update calendar
    reaction(
      () => this.taskStore.tasks.slice(),
      () => {
        this.updateCalendarEvents();
      }
    );
  }

  loadTasks() {
    if (this.taskStore.tasks.length === 0) {
      this.taskStore.setLoading(true);
      this.taskService.loadTasks().subscribe({
        next: (tasks) => {
          this.taskStore.setTasks(tasks);
          this.taskStore.setLoading(false);
          this.updateCalendarEvents();
        },
        error: (error) => {
          this.taskStore.setError('Failed to load tasks');
          this.taskStore.setLoading(false);
          console.error('Error loading tasks:', error);
        }
      });
    } else {
      this.updateCalendarEvents();
    }
  }

  updateCalendarEvents() {
    const events = this.taskStore.tasks.map(task => ({
      id: task.id,
      title: task.title,
      start: task.deadline,
      backgroundColor: this.getEventColor(task.status),
      borderColor: this.getEventColor(task.status),
      textColor: '#ffffff',
      extendedProps: {
        status: task.status,
        description: this.getShortDescription(task.description)
      }
    }));

    this.calendarOptions.update(options => ({
      ...options,
      events: events
    }));
  }

  getEventColor(status: TaskStatus): string {
    switch (status) {
      case TaskStatus.COMPLETED:
        return '#27ae60'; // Green
      case TaskStatus.IN_PROGRESS:
        return '#f39c12'; // Orange
      case TaskStatus.PENDING:
        return '#e74c3c'; // Red
      default:
        return '#95a5a6'; // Gray
    }
  }

  getShortDescription(html: string): string {
    const div = document.createElement('div');
    div.innerHTML = html;
    const text = div.textContent || div.innerText || '';
    return text.length > 100 ? text.substring(0, 100) + '...' : text;
  }

  handleEventClick(clickInfo: EventClickArg) {
    const taskId = clickInfo.event.id;
    this.router.navigate(['/tasks', taskId]);
  }
}
