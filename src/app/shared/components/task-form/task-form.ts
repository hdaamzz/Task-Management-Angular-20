import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TaskStatus, TaskFormData, Task } from '../../../core/models/task.model';
import { TaskStore } from '../../../stores/task.store';

@Component({
  selector: 'app-task-form',
  imports: [CommonModule, ReactiveFormsModule, QuillModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
})
export class TaskForm implements OnInit {
  @Input() task: Task | null = null;
  @Output() formSubmit = new EventEmitter<void>();
  @Output() formCancel = new EventEmitter<void>();

  taskForm!: FormGroup;
  taskStatuses = Object.values(TaskStatus);

  quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ]
  };

  constructor(
    private fb: FormBuilder,
    private taskStore: TaskStore
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.taskForm = this.fb.group({
      title: [this.task?.title || '', [Validators.required, Validators.minLength(3)]],
      description: [this.task?.description || '', Validators.required],
      deadline: [
        this.task?.deadline ? this.formatDateForInput(this.task.deadline) : '',
        Validators.required
      ],
      status: [this.task?.status || TaskStatus.PENDING, Validators.required]
    });
  }

  formatDateForInput(date: Date): string {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  }

  onSubmit() {
    if (this.taskForm.valid) {
      const formData: TaskFormData = {
        ...this.taskForm.value,
        deadline: new Date(this.taskForm.value.deadline)
      };

      if (this.task) {
        this.taskStore.updateTask(this.task.id, formData);
      } else {
        this.taskStore.addTask(formData);
      }

      this.formSubmit.emit();
    }
  }

  onCancel() {
    this.formCancel.emit();
  }

  get isEditMode(): boolean {
    return this.task !== null;
  }
}