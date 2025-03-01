import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'truncate'
})
export class TruncatePipe implements PipeTransform {

    transform(value: string | undefined, limit: number, includeEllipsis: boolean = true): string {

        if (!value) {
            return '';
        }

        if (value.length <= limit) {
            return value;
        }

        return includeEllipsis ? value.slice(0, limit) + '...' : value.slice(0, limit);
    }
}