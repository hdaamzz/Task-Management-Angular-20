import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDateTime'
})
export class FormatDateTimePipe implements PipeTransform {
  transform(date: Date | string): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}
