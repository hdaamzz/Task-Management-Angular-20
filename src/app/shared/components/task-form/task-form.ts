import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, AbstractControl } from '@angular/forms';
import { QuillModule } from 'ngx-quill';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { TaskStatus, TaskFormData, Task } from '../../../core/models/task.model';
import { TaskStore } from '../../../stores/task.store';
import { Subject, takeUntil } from 'rxjs';
import { CustomValidators } from '../../validators/custom-validators';

@Component({
  selector: 'app-task-form',
  imports: [CommonModule, ReactiveFormsModule, QuillModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css',
})
export class TaskForm implements OnInit, OnDestroy {
  @Input() task: Task | null = null;
  @Output() formSubmit = new EventEmitter<void>();
  @Output() formCancel = new EventEmitter<void>();

  taskForm!: FormGroup;
  readonly taskStatuses = Object.values(TaskStatus);
  readonly quillConfig = {
    toolbar: [
      ['bold', 'italic', 'underline'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['clean']
    ]
  };
  readonly minDate: string;
  readonly maxDate: string;
  private readonly destroy$ = new Subject<void>();

  constructor(
    private readonly fb: FormBuilder,
    private readonly taskStore: TaskStore
  ) {
    const today = new Date();
    this.minDate = this.formatDateForInput(today);
    
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    this.maxDate = this.formatDateForInput(maxDate);
  }

  ngOnInit(): void {
    this.initForm();
    this.setupFormListeners();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initForm(): void {
    this.taskForm = this.fb.group({
      title: [
        this.task?.title || '', 
        [
          Validators.required, 
          Validators.minLength(3),
          Validators.maxLength(100)
        ]
      ],
      description: [
        this.task?.description || '', 
        [
          Validators.required,
          CustomValidators.htmlMinLength(10)
        ]
      ],
      deadline: [
        this.task?.deadline ? this.formatDateForInput(this.task.deadline) : '',
        [
          Validators.required,
          CustomValidators.futureDate() 
        ]
      ],
      status: [
        this.task?.status || TaskStatus.PENDING, 
        Validators.required
      ]
    });

    this.taskForm.markAsPristine();
  }

  private setupFormListeners(): void {
    this.taskForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(values => {
        console.log('Form values changed:', values);
      });
  }

  onSubmit(): void {
    this.markFormGroupTouched(this.taskForm);

    if (this.taskForm.invalid) {
      console.warn('Form is invalid', this.taskForm.errors);
      return;
    }

    const formData: TaskFormData = {
      ...this.taskForm.value,
      deadline: new Date(this.taskForm.value.deadline)
    };

    try {
      if (this.task) {
        const success = this.taskStore.updateTask(this.task.id, formData);
        if (success) {
          console.log('Task updated successfully');
          this.formSubmit.emit();
        } else {
          console.error('Failed to update task');
          alert('Failed to update task. Please try again.');
        }
      } else {
        const newTask = this.taskStore.addTask(formData);
        console.log('Task created successfully', newTask);
        this.formSubmit.emit();
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    }
  }

  onCancel(): void {
    if (this.taskForm.dirty) {
      const confirmCancel = confirm('You have unsaved changes. Are you sure you want to cancel?');
      if (!confirmCancel) {
        return;
      }
    }

    this.formCancel.emit();
  }

  private formatDateForInput(date: Date): string {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  get isEditMode(): boolean {
    return this.task !== null;
  }

  get titleControl(): AbstractControl | null {
    return this.taskForm.get('title');
  }

  get descriptionControl(): AbstractControl | null {
    return this.taskForm.get('description');
  }

  get deadlineControl(): AbstractControl | null {
    return this.taskForm.get('deadline');
  }

  get statusControl(): AbstractControl | null {
    return this.taskForm.get('status');
  }

  hasError(fieldName: string, errorType: string): boolean {
    const control = this.taskForm.get(fieldName);
    return !!(control?.hasError(errorType) && control?.touched);
  }

  getErrorMessage(fieldName: string): string {
    const control = this.taskForm.get(fieldName);
    
    if (!control || !control.errors || !control.touched) {
      return '';
    }

    const errors = control.errors;

    if (errors['required']) {
      return `${this.getFieldLabel(fieldName)} is required`;
    }

    if (errors['minlength']) {
      const minLength = errors['minlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must be at least ${minLength} characters`;
    }

    if (errors['maxlength']) {
      const maxLength = errors['maxlength'].requiredLength;
      return `${this.getFieldLabel(fieldName)} must not exceed ${maxLength} characters`;
    }

    if (errors['futureDate']) {
      return 'Deadline must be a future date';
    }

    if (errors['htmlMinLength']) {
      const minLength = errors['htmlMinLength'].requiredLength;
      return `Description must contain at least ${minLength} characters of text`;
    }

    return 'Invalid value';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: Record<string, string> = {
      'title': 'Title',
      'description': 'Description',
      'deadline': 'Deadline',
      'status': 'Status'
    };

    return labels[fieldName] || fieldName;
  }
}