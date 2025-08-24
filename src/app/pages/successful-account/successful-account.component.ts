import { Component } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginService } from '../../Services/login.service';
import { AuthService } from '../../Services/shared/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-successful-account',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './successful-account.component.html',
  styleUrl: './successful-account.component.scss'
})
export class SuccessfulAccountComponent {
  userName: string = '';
  password: string = '';
  systemId: number = 2;

  loginFormErrorMessage: string = '';
  isLoginApiCallPending = false;
  urlParams = new URLSearchParams(window.location.search);
  
  queryString: any = this.urlParams.get('selectedJobType')
  ? this.urlParams.get('selectedJobType')
  : '';

  mode: 'create' | 'edit' = 'create';

  constructor(private router: Router, private route: ActivatedRoute, private loginService: LoginService, private authService: AuthService) {}
  ngOnInit(): void {
    const storedCredentials = this.authService.getCredentials();
    if (storedCredentials.username && storedCredentials.password) {
      this.userName = storedCredentials.username;
      this.password = storedCredentials.password;
    }

    // Determine mode based on route
    if (this.router.url.includes('account-updated-successfully')) {
      this.mode = 'edit';
    } else {
      this.mode = 'create';
    }
  }
  onClickLoginButton() {
    this.loginFormErrorMessage = '';

    if (this.userName === '' && this.password === '') {
      this.loginFormErrorMessage = 'Enter a valid username and password.';
      return;
    } else if (this.userName === '') {
      this.loginFormErrorMessage = 'Enter a valid username.';
      return;
    } else if (this.password === '') {
      this.loginFormErrorMessage = 'Enter a valid password.';
      return;
    }

    this.isLoginApiCallPending = true;

    this.loginService.loginUser(this.userName, this.password, this.systemId).subscribe({
      next: (data) => {
        if (
          data &&
          data.event &&
          data.event.eventType === 1 &&
          Array.isArray(data.event.eventData)
        ) {
          const messageObj = data.event.eventData.find((item: any) => item.key === 'message');
          if (
            messageObj &&
            messageObj.value &&
            messageObj.value.message === 'successfuly login'
          ) {
            this.loginService.setCookies().subscribe({
            next: (data) => {
              
              if (data) {
                console.log(data)
                  if (this.queryString === '') {
                    window.location.href = 'https://recruiter.bdjobs.com/dashboard';
                  } else {
                    setTimeout(() => {
                      const externalUrl = `https://recruiter.bdjobs.com/dashboard?selectedJobType=${encodeURIComponent(this.queryString)}`;
                      window.location.href = externalUrl;
                    }, 2000);
                  }
                }
              },
              error: () => {
                this.loginFormErrorMessage = 'Failed to set authentication cookies.';
                alert('Failed to set authentication cookies.');
                this.isLoginApiCallPending = false;
              }
            });
            return;
          }
        }
        // If not successful, show error
        this.loginFormErrorMessage = 'Login failed. Please check your credentials.';
        alert('Login failed. Please check your credentials.');
        this.isLoginApiCallPending = false;
      },
      error: () => {
        this.loginFormErrorMessage = "Couldn't connect to the server.";
        alert("Couldn't connect to the server.");
        this.isLoginApiCallPending = false;
      },
    });
  }
  
  private handleSuccessfulLogin(redirectUrl: string): void {
    this.loginService.setCookies().subscribe({
      next: () => {
        if (this.authService.hasValidToken()) {
          window.location.href = 'https://recruiter.bdjobs.com/dashboard';
        } else {
          this.handleError('Login failed. Invalid token.');
        }
      },
      error: () => this.handleError('Failed to set authentication cookies.'),
    });
  }
  
  private handleError(message: string): void {
    this.loginFormErrorMessage = message;
    this.isLoginApiCallPending = false;
  }
}





