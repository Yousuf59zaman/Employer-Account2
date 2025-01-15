import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-footer-bottom',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer-bottom.component.html',
  styleUrl: './footer-bottom.component.scss'
})
export class FooterBottomComponent {
  dropdownOpen: boolean = false;
  dropdownOpenInternational: boolean = false;

  toggleDropdown(): void {
    this.dropdownOpenInternational = false;
    this.dropdownOpen = !this.dropdownOpen;
  }

  toggleDropdown2(): void {
    this.dropdownOpen = false;
    this.dropdownOpenInternational = !this.dropdownOpenInternational;
  }

  @HostListener('document:click', ['$event.target'])
  closeDropdown(targetElement: HTMLElement): void {
    const clickedInside = targetElement.closest('.relative');
    if (!clickedInside) {
      this.dropdownOpen = false;
      this.dropdownOpenInternational = false;
    }
  }
}
