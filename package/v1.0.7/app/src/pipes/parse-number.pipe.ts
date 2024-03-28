import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseNumberPipe implements PipeTransform<string, number> {
  transform(value: string): number {
    const parsedValue = parseInt(value, 10);
    if (isNaN(parsedValue)) {
      throw new Error(`${value} is not a valid number`);
    }
    return parsedValue;
  }
}
