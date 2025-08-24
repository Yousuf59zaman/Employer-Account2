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
    if (year && (!/^\d{4}$/.test(year) || isNaN(year) || year < 1800 || year > currentYear)) {
      return { invalidYear: true };
    }

    return null;
  };
}
export function noBlacklistCharacters(control: AbstractControl): ValidationErrors | null {
  const blacklistPattern = /['"%<>&()\s]/; 
  const value = control.value;

  if (value && blacklistPattern.test(value)) {
    return { invalidCharacters: true }; 
  }
  return null; 
}

export function noWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const isWhitespace = (control.value || '').trim().length === 0;
    return isWhitespace ? { whitespace: true } : null;
  };
}
export function banglaTextValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    const banglaRegex = /^[\u0980-\u09FF\u09E6-\u09EF\s।,।()\[\]\-.]+$/;
    if (value && !banglaRegex.test(value)) {
      return { invalidBanglaText: true };
    }
    return null;
  };
}
export function specialCharacterValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;

    const whitelistRegex = /^[\w\s\/\?\\|\;\:\[\]\{\}\+\-\*\!\^\=]*$/;

    const blacklistRegex = /['"%<>&()\s]/;

    if (value) {
      if (!whitelistRegex.test(value)) {
        return { invalidCharacters: true };
      }

      if (blacklistRegex.test(value)) {
        return { blacklistedCharacters: true };
      }
    }

    return null;
  };
}

export function companyAddressValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null;
    }

    // Check if input contains only dots, numbers, or spaces
    const onlyDotsNumbersSpaces = /^[.\d\s]+$/;
    if (onlyDotsNumbersSpaces.test(value)) {
      return { invalidPattern: true };
    }

    // Check if input is less than 10 characters
    if (value.length < 10) {
      return { minlength: true };
    }

    return null;
  };
}

export function emailValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (!value) {
      return null;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      return { invalidEmail: true };
    }
    return null;
  };
}

export function urlValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    
    if (!value) {
      return null; 
    }

    if (!value.toLowerCase().startsWith('https://') && !value.toLowerCase().startsWith('http://')) {
      return { invalidUrl: true };
    }

    try {
      new URL(value);
    } catch {
      return { invalidUrl: true };
    }

    return null;
  };
}
