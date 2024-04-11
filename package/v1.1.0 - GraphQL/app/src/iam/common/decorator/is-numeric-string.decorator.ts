import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsNumericString(validationOptions?: ValidationOptions) {
  return function (object: NonNullable<unknown>, propertyName: string) {
    registerDecorator({
      name: 'isNumericString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return typeof value === 'string' && /^\d+$/.test(value);
        },
        defaultMessage() {
          return 'Code must be numeric.';
        },
      },
    });
  };
}
