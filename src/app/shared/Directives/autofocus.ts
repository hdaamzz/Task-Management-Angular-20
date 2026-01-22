import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive({
  selector: '[appAutofocus]'
})
export class Autofocus implements OnChanges {
  @Input() appAutofocus: boolean | string = false;

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appAutofocus'] && this.appAutofocus) {
      setTimeout(() => {
        this.el.nativeElement.focus();
        const len = this.el.nativeElement.value?.length || 0;
        this.el.nativeElement.setSelectionRange(len, len);
      }, 0);
    }
  }
}