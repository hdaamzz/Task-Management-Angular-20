import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

@Pipe({
  name: 'truncate'
})
export class TruncatePipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}
  
  transform(value: string, limit: number = 100): string {
    const text = this.sanitizer.sanitize(SecurityContext.HTML, value) || '';
    return text.length > limit ? text.slice(0, limit).replace(/[^\s]*$/, '') + '...' : text;
  }
}
