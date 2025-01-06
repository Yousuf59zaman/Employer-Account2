import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private cookieService: CookieService, private router: Router) {}

  canActivate(): boolean {
    const token = this.cookieService.get('AUTHTOKEN');

    if (token) {
      window.location.href = 'https://recruiter.bdjobs.com/dashboard';
      return false; 
    } else {
      return false;
    }
  }
}

