import { CommonModule } from '@angular/common';
import { Component, inject, ChangeDetectorRef } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [RouterModule,CommonModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  router = inject(Router);

  selectedBtnArr = ['Edit Profile', 'Change Password', 'User Management', 'NID Varification'];
  selectedBtn = 'Edit Profile';
  selectedItem: string = 'edit';
  isEditProfileOpen = false;

  toggleEditProfileDropdown() {
    this.isEditProfileOpen = !this.isEditProfileOpen;
  }

  isEditProfileActive(): boolean {
    return this.router.isActive('/settings/edit', { paths: 'exact', queryParams: 'ignored', fragment: 'ignored', matrixParams: 'ignored' });
  }

  isDropdownLinkActive(fragment: string): boolean {
    return this.router.parseUrl(this.router.url).fragment === fragment;
  }
}
