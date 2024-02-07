import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';

@Injectable()
export class FileTypeValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const typeFile = 'application/pdf';
    return value.mimetype == typeFile;
  }
}
