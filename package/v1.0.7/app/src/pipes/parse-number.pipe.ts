import { Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class ParseIntPipe implements PipeTransform<string> {
  //Purpose: transform string to number
  transform(value: string): number {
    const val = parseInt(value, 10);
    if (isNaN(val)) {
      throw new Error(`${value} is not a valid number`);
    }
    return val;
  }
}
