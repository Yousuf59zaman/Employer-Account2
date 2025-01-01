import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserCredentials } from '../../Models/company';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private credentialsSubject = new BehaviorSubject<UserCredentials>({
    username: '',
    password: '',
  });

  credentials$: Observable<UserCredentials> = this.credentialsSubject.asObservable();

  updateCredentials(credentials: UserCredentials): void {
    this.credentialsSubject.next(credentials);
  }

  clearCredentials(): void {
    this.credentialsSubject.next({ username: '', password: '' });
  }
}
