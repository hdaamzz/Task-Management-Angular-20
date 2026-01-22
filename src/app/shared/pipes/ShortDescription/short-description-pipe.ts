import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'shortDescription'
})
export class ShortDescriptionPipe implements PipeTransform {
  transform(html: string, limit = 120): string {
    if (!html) return '';

    const text = html.replace(/<[^>]*>/g, '').trim();
    return text.length > limit
      ? text.slice(0, limit) + '...'
      : text;
  }
}
