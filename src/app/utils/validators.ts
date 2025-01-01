import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    return password && confirmPassword && password !== confirmPassword
      ? { passwordsDontMatch: true }
      : null;
  };
}
export function yearValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const year = control.value;

    const currentYear = new Date().getFullYear();

    if (!year || isNaN(year) || year < 1900 || year > currentYear) {
      return { invalidYear: true };
    }

    return null;
  };
}
export function banglaTextValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const banglaRegex = /^[\u0980-\u09FF\s]+$/; // Matches Bangla characters and spaces

    if (value && !banglaRegex.test(value)) {
      return { invalidBanglaText: true };
    }

    return null;
  };
}
