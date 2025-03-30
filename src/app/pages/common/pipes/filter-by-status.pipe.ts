import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByStatus',
})
export class FilterByStatusPipe implements PipeTransform {
  transform(meetings: any[], status: string): any[] {
    if (!meetings || !status) {
      return [];
    }
    return meetings.filter(
      (meeting) => meeting.status.toLowerCase() === status.toLowerCase()
    );
  }
}
