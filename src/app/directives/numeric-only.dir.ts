import { Directive, HostListener, input } from '@angular/core';

@Directive({
  selector: 'input[appNumericOnly]',
  standalone: true
})
export class NumericOnlyDirective {
  isNumericOnly = input(true);
  isDecimalAllowed = input(false);
  minValue = input<number>(0);
  maxValue = input<number>(9999);
  isForInputEvent = input(false);
  showMinValueForValidation = input(0);
  minDigitTobeChecked = input(0);

  private controlKeys: Set<string> = new Set([
    'Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Tab', 'Home', 'End'
  ]);

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (!this.isNumericOnly()) {
      return;
    }
    if (this.controlKeys.has(event.key)) {
      return;
    }
    if (event.ctrlKey || event.metaKey) {
      return;
    }
    const isDigit = /[0-9]/.test(event.key);
    if (!isDigit) {
      event.preventDefault();
    }
  }

  // Sanitize and clamp on input
  @HostListener('input', ['$event'])
  onInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    let sanitized = (inputElement.value || '').replace(/[^0-9]/g, '');
    if (sanitized.length > 1 && sanitized.startsWith('0')) {
      sanitized = String(parseInt(sanitized, 10));
    }
    if (sanitized === '') {
      inputElement.value = '';
      return;
    }
    let numeric = parseInt(sanitized, 10);
    if (isNaN(numeric)) {
      inputElement.value = '';
      return;
    }
    const min = this.minValue();
    const max = this.maxValue();
    if (numeric < min) numeric = min;
    if (numeric > max) numeric = max;
    inputElement.value = String(numeric);
  }

  @HostListener('paste', ['$event'])
  onPaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData || (window as any).clipboardData;
    let pastedText = clipboardData.getData('text') || '';
    pastedText = pastedText.replace(/[^0-9]/g, '');
    if (pastedText === '') {
      event.preventDefault();
      return;
    }
    let numeric = parseInt(pastedText, 10);
    const min = this.minValue();
    const max = this.maxValue();
    if (numeric < min) numeric = min;
    if (numeric > max) numeric = max;
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    input.value = String(numeric);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
