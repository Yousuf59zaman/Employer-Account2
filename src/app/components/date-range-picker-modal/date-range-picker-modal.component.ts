import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
export type CalendarDay = { day: number | null, type: 'current' | 'next' | 'prev' };

@Component({
  selector: 'app-date-range-picker-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './date-range-picker-modal.component.html',
  // styleUrls: ['./date-range-picker-modal.component.scss']
})
export class DateRangePickerModalComponent {
  @Input() initialStartDate: Date | null = null;
  @Input() initialEndDate: Date | null = null;
  @Output() apply = new EventEmitter<{ start: Date | null, end: Date | null }>();
  @Output() cancel = new EventEmitter<void>();

  displayYearLeft: number = 0;
  displayMonthLeft: number = 0;
  displayYearRight: number = 0;
  displayMonthRight: number = 0;

  startDate: Date | null = null;
  endDate: Date | null = null;

  startDateInput: string = '';
  endDateInput: string = '';

  months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  years: number[] = [];

  selectionSource: 'left' | 'right' | null = null;

  ngOnInit() {
    document.body.classList.add('overflow-hidden');
    const now = new Date();
    this.displayYearLeft = now.getFullYear();
    this.displayMonthLeft = now.getMonth();
    if (now.getMonth() === 11) {
      this.displayYearRight = now.getFullYear() + 1;
      this.displayMonthRight = 0;
    } else {
      this.displayYearRight = now.getFullYear();
      this.displayMonthRight = now.getMonth() + 1;
    }
    this.startDate = this.initialStartDate;
    this.endDate = this.initialEndDate;
    this.startDateInput = this.startDate ? this.formatDate(this.startDate) : '';
    this.endDateInput = this.endDate ? this.formatDate(this.endDate) : '';
    this.years = [];
    for (let y = 1900; y <= 2100; y++) {
      this.years.push(y);
    }
  }

  public get leftMonthDays() {
    return this.generateCalendarDays(this.displayYearLeft, this.displayMonthLeft);
  }
  public get rightMonthDays() {
    return this.generateCalendarDays(this.displayYearRight, this.displayMonthRight);
  }

  onStartDateInputBlur() {
    this.startDate = this.parseDate(this.startDateInput);
    this.startDateInput = this.startDate ? this.formatDate(this.startDate) : this.startDateInput;
    if (this.startDate) {
      this.displayYearLeft = this.startDate.getFullYear();
      this.displayMonthLeft = this.startDate.getMonth();
    }
  }
  onEndDateInputBlur() {
    this.endDate = this.parseDate(this.endDateInput);
    this.endDateInput = this.endDate ? this.formatDate(this.endDate) : this.endDateInput;
    if (this.endDate) {
      this.displayYearRight = this.endDate.getFullYear();
      this.displayMonthRight = this.endDate.getMonth();
    }
  }

  private parseDate(value: string): Date | null {
    if (!value) return null;
    value = value.replace(/\//g, '-');
    const parts = value.split('-');
    if (parts.length !== 3) return null;
    let y: number | undefined, m: number | undefined, d: number | undefined;
    let yearIdx = parts.findIndex(p => p.length === 4);
    if (yearIdx === -1) return null; 
    y = Number(parts[yearIdx]);
    const idxs = [0, 1, 2].filter(i => i !== yearIdx);
    let first = Number(parts[idxs[0]]);
    let second = Number(parts[idxs[1]]);
    if (first > 12 && second <= 12) {
      d = first;
      m = second;
    } else if (second > 12 && first <= 12) {
      d = second;
      m = first;
    } else {
      m = first;
      d = second;
    }
    if (!isNaN(y) && !isNaN(m) && !isNaN(d)) {
      m = Math.max(1, Math.min(12, m));
      d = Math.max(1, Math.min(31, d));
      const date = new Date(y, m - 1, d);
      if (date && date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d) {
        return date;
      }
    }
    return null;
  }

  generateCalendarDays(year: number, month: number): CalendarDay[] {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: CalendarDay[] = [];
    let startOffset = (firstDay.getDay() + 6) % 7;
    for (let i = 0; i < startOffset; i++) days.push({ day: null, type: 'prev' });
    for (let d = 1; d <= lastDay.getDate(); d++) days.push({ day: d, type: 'current' });
    let nextDay = 1;
    while (days.length < 42) {
      days.push({ day: nextDay++, type: 'next' });
    }
    return days;
  }

  public selectDate(dayObj: CalendarDay, which: 'left' | 'right') {
    if (!dayObj.day || dayObj.type !== 'current') return;
    const year = which === 'left' ? this.displayYearLeft : this.displayYearRight;
    const month = which === 'left' ? this.displayMonthLeft : this.displayMonthRight;
    const date = new Date(year, month, dayObj.day);
    if (!this.startDate || (this.startDate && this.endDate)) {
      this.startDate = date;
      this.startDateInput = this.formatDate(date);
      this.endDate = null;
      this.endDateInput = '';
      this.selectionSource = which;
    } else if (date < this.startDate) {
      this.startDate = date;
      this.startDateInput = this.formatDate(date);
      this.endDate = null;
      this.endDateInput = '';
      this.selectionSource = which;
    } else {
      this.endDate = date;
      this.endDateInput = this.formatDate(date);
   
      const startMonth = this.startDate.getMonth();
      const startYear = this.startDate.getFullYear();
      const endMonth = this.endDate.getMonth();
      const endYear = this.endDate.getFullYear();
      if ((which === this.selectionSource) && (startMonth === endMonth && startYear === endYear)) {
      } else {
        this.selectionSource = null;
      }
    }
  }

  public isSelected(dayObj: CalendarDay, which: 'left' | 'right') {
    if (!dayObj.day || dayObj.type !== 'current') return false;
    
    const isSameMonth = this.displayYearLeft === this.displayYearRight && 
                       this.displayMonthLeft === this.displayMonthRight;
    
    if (isSameMonth && which === 'right') {
      return false;
    }
    
    const year = which === 'left' ? this.displayYearLeft : this.displayYearRight;
    const month = which === 'left' ? this.displayMonthLeft : this.displayMonthRight;
    const date = new Date(year, month, dayObj.day);
    return (this.startDate && this.datesEqual(date, this.startDate)) ||
           (this.endDate && this.datesEqual(date, this.endDate));
  }

  public isInRange(dayObj: CalendarDay, which: 'left' | 'right') {
    if (!dayObj.day || dayObj.type !== 'current' || !this.startDate || !this.endDate) return false;
    
    const isSameMonth = this.displayYearLeft === this.displayYearRight && 
                       this.displayMonthLeft === this.displayMonthRight;
    
    if (isSameMonth && which === 'right') {
      return false;
    }
    
    const year = which === 'left' ? this.displayYearLeft : this.displayYearRight;
    const month = which === 'left' ? this.displayMonthLeft : this.displayMonthRight;
    const date = new Date(year, month, dayObj.day);
    return date > this.startDate && date < this.endDate;
  }

  public isToday(dayObj: CalendarDay, which: 'left' | 'right') {
    if (!dayObj.day || dayObj.type !== 'current') return false;
    const year = which === 'left' ? this.displayYearLeft : this.displayYearRight;
    const month = which === 'left' ? this.displayMonthLeft : this.displayMonthRight;
    const today = new Date();
    return (
      dayObj.day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  }

  datesEqual(a: Date, b: Date) {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  }

  formatDate(date: Date) {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  public prevMonthLeft() {
    if (this.displayMonthLeft === 0) {
      this.displayMonthLeft = 11;
      this.displayYearLeft--;
    } else {
      this.displayMonthLeft--;
    }
  }

  public nextMonthLeft() {
    if (this.displayMonthLeft === 11) {
      this.displayMonthLeft = 0;
      this.displayYearLeft++;
    } else {
      this.displayMonthLeft++;
    }
  }

  public prevMonthRight() {
    if (this.displayMonthRight === 0) {
      this.displayMonthRight = 11;
      this.displayYearRight--;
    } else {
      this.displayMonthRight--;
    }
  }

  public nextMonthRight() {
    if (this.displayMonthRight === 11) {
      this.displayMonthRight = 0;
      this.displayYearRight++;
    } else {
      this.displayMonthRight++;
    }
  }

  public getMonthName(month: number) {
    return [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ][month];
  }

  onMonthChange(which: 'left' | 'right', value: number) {
    if (which === 'left') {
      this.displayMonthLeft = +value;
    } else {
      this.displayMonthRight = +value;
    }
  }

  onYearChange(which: 'left' | 'right', value: number) {
    if (which === 'left') {
      this.displayYearLeft = +value;
    } else {
      this.displayYearRight = +value;
    }
  }

  public onCancel() {
    document.body.classList.remove('overflow-hidden');
    this.cancel.emit();
  }

  public onApply() {
    document.body.classList.remove('overflow-hidden');
    this.startDate = this.parseDate(this.startDateInput);
    this.endDate = this.parseDate(this.endDateInput);
    this.apply.emit({ start: this.startDate, end: this.endDate });
  }

  ngOnDestroy() {
    document.body.classList.remove('overflow-hidden');
  }
} 