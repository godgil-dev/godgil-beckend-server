import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';
import { validate, ValidationError } from 'class-validator';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    console.log(value, metatype, !this.toValidate(metatype));
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    console.log(object, errors);

    if (errors.length > 0) {
      const validationErrorMessages = this.formatValidationErrors(errors);
      throw new BadRequestException(validationErrorMessages);
    }

    return value;
  }

  // eslint-disable-next-line @typescript-eslint/ban-types
  private toValidate(metatype: Function): boolean {
    // eslint-disable-next-line @typescript-eslint/ban-types
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }

  private formatValidationErrors(errors: ValidationError[]): string[] {
    const validationErrorMessages: string[] = [];
    const isNotEmptyErrorMessage = errors
      .filter((error) => error.constraints && 'isNotEmpty' in error.constraints)
      .map((error) => error.constraints.isNotEmpty)
      .find(Boolean);

    if (isNotEmptyErrorMessage) {
      validationErrorMessages.push(isNotEmptyErrorMessage);
    } else {
      errors.forEach((error) => {
        for (const key in error.constraints) {
          if (key !== 'isNotEmpty') {
            validationErrorMessages.push(error.constraints[key]);
          }
        }
      });
    }

    return validationErrorMessages;
  }
}
