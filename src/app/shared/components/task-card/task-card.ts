import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Task, TaskStatus } from '../../../core/models/task.model';
import { RouterLink } from '@angular/router';
import { FormatDatePipe } from '../../pipes/FormatDate/format-date-pipe';
import { CommonModule } from '@angular/common';
import { ShortDescriptionPipe } from "../../pipes/ShortDescription/short-description-pipe";

@Component({
  selector: 'app-task-card',
  imports: [CommonModule, RouterLink, FormatDatePipe, ShortDescriptionPipe],
  templateUrl: './task-card.html',
  styleUrl: './task-card.css',
})
export class TaskCard {
  @Input({ required: true }) task!: Task;
  @Output() edit = new EventEmitter<Task>();
  @Output() delete = new EventEmitter<Task>();

  readonly TaskStatus = TaskStatus;
}
