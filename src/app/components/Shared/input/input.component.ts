import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  input,
  OnInit,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { reinitializePreline } from '../../../utils/reinitializePreline';
import { NgClass } from '@angular/common';
import { NumericOnlyDirective } from '../../../directives/numeric-only.dir';
export type InputType = 'text' | 'password' | 'email' | 'number';

enum InputStype {
  error = 'hs-validation-name-error',
  success = 'hs-validation-name-success',
  normal = '',
}

enum InputTypeStype {
  normal = 'block w-full rounded-md border-0 py-1.5 px-4 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-1 focus:ring-inset focus:ring-[#008A22] sm:text-sm sm:leading-6 ',
  error = 'py-1.5 px-4 block w-full border-red-500 rounded-md text-sm focus:border-red-500 focus:ring-red-500 sm:text-sm sm:leading-6',
  success = 'py-1.5 px-4 block w-full border-teal-500 rounded-md text-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm sm:leading-6',
}

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [ReactiveFormsModule, NgClass],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  hostDirectives: [
    {
      directive: NumericOnlyDirective,
      inputs: ['isDecimalAllowed', 'minValue', 'maxValue', 'isNumericOnly'],
    },
  ],
})
export class InputComponent<T> implements AfterViewInit, OnInit {
  readonly placeholder = input('');
  readonly label = input('');
  readonly type = input<InputType>('text');
  readonly isRequired = input<boolean>(false);
  readonly isDisabled = input<boolean>(false);
  readonly minValue = input<number>(0);
  readonly maxValue = input<number>(99999999999999999999);
  readonly control = input<FormControl<T>>(new FormControl());
  readonly maxLength = input<number>(20);
  readonly classes = input<string>('');
  readonly validationText = input<string>('');
  readonly isExtraAttempt = input<boolean>(false);
  readonly classesForLabel = input<string>('');

  valid = true;

  ngOnInit() {
    this.control().valueChanges.subscribe((value) => {
      this.handleValueChange(value);
    });
  }

  private handleValueChange(value: T): void {
    const numericValue = +value;

    const isRequired = this.isRequired();
    if (
      !isRequired &&
      (value === null || value === undefined || value === '')
    ) {
      this.control().setErrors(null);
      this.styleClass = InputTypeStype.normal;
      this.name = InputStype.normal;
      this.valid = true;
      debugger;
      return;
    }

    if (isRequired && (!value || (value as string).trim() === '')) {
      this.control().setErrors({ required: true });
      this.styleClass = InputTypeStype.error;
      this.name = InputStype.error;
      this.valid = false;
      return;
    }

    if (numericValue > this.maxValue() || numericValue < this.minValue()) {
      this.control().setErrors({ invalid: true });
      this.styleClass = InputTypeStype.error;
      this.name = InputStype.error;
      this.valid = false;
      return;
    }

    this.control().setErrors(null);
    this.styleClass = InputTypeStype.normal;
    this.name = InputStype.normal;
    this.valid = true;
  }

  name = InputStype.normal;
  styleClass: string = InputTypeStype.normal;

  ngAfterViewInit(): void {
    reinitializePreline();
  }
}
