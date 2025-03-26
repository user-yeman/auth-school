import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'addMinutes',
  standalone: true,
})
export class AddMinutesPipe implements PipeTransform {
  transform(date: string, minutes: number): Date {
    const d = new Date(date);
    d.setMinutes(d.getMinutes() + minutes);
    return d;
  }
}
