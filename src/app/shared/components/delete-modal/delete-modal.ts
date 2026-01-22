import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-delete-modal',
  imports: [],
  templateUrl: './delete-modal.html',
  styleUrl: './delete-modal.css',
})
export class DeleteModal {
  @Input() showModal: boolean = false;
  @Input() title: string = 'Delete Item?';
  @Input() description: string = 'Are you sure you want to delete this item? This action cannot be undone.';
  @Input() itemName?: string;
  @Input() cancelButtonText: string = 'Cancel';
  @Input() confirmButtonText: string = 'Delete Item';

  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.cancel.emit();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onConfirm(): void {
    this.confirm.emit();
  }
}
