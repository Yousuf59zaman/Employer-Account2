import { Component } from '@angular/core';
import { SettingsComponent } from '../../settings/settings.component';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-settings-layout',
  standalone: true,
  imports: [SettingsComponent, RouterOutlet],
  templateUrl: './settings-layout.component.html',
  styleUrl: './settings-layout.component.scss',
})
export class SettingsLayoutComponent {}
