import { Component, inject, isDevMode, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { FooterComponent } from './layouts/footer/footer.component';
import { NavComponent } from "./layouts/nav/nav.component";
import { LocalstorageService } from './Services/shared/essentials/localstorage.service';
import { SalesPersonData } from './layouts/nav/class/navbarResponse';
import { Title } from '@angular/platform-browser';
import { ModalService } from './Services/modal/modal.service';
import { SalesContactComponent } from "./components/sales-contact/sales-contact.component";
import { ModalComponent } from "./components/modal/modal.component";
import { CommonModule } from '@angular/common';
import { NavbarComponent } from "./components/navbar/navbar.component";
import { BackToTopComponent } from "./components/Shared/shared/back-to-top/back-to-top.component";
import { filter } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, 
    FooterComponent, 
    NavComponent, 
    SalesContactComponent, 
    ModalComponent, 
    CommonModule, 
    NavbarComponent,
    BackToTopComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  localStorageService = inject(LocalstorageService)

  title = 'recruiter-registration';

  modalService = inject(ModalService);
  salesPersonData: SalesPersonData | null = null;
  isMinimalLayout = false;
  private lastNavState: any = null;

  constructor(private router: Router, private titleService: Title) { 
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const nav = this.router.getCurrentNavigation();
        if (nav && nav.extras && nav.extras.state) {
          this.lastNavState = nav.extras.state;
        }
        if (this.router.url === '/register') {
          this.isMinimalLayout = true;
        } else if (
          (this.router.url === '/account-created-successfully' || this.router.url === '/account-updated-successfully') &&
          this.lastNavState && this.lastNavState.fromRegister
        ) {
          this.isMinimalLayout = true;
        } else {
          this.isMinimalLayout = false;
        }
      }
    });

    this.updateTitle(this.router.url);

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      const route = event.urlAfterRedirects;
      this.updateTitle(route);
    });
  }

  ngOnInit(): void {
    //local env
    // if (isDevMode()) {
    //   window.localStorage.setItem('CompanyId', 'ZxU0PRC=');
    //   window.localStorage.setItem('UserId', 'ZRd9PxCu');
    // }
    if (isDevMode()) {
      window.localStorage.setItem('CompanyId', 'ZRLwPELx');
      window.localStorage.setItem('UserId', 'ZRYuPid0');
    }
  }

  onNavbarDataLoaded(data: SalesPersonData) {
    this.salesPersonData = data;
  }

  private updateTitle(route: string): void {
    let pageTitle = 'Communication';
    
    if (route.startsWith('/sent-emails') || route.startsWith('/read-emails')) {
      pageTitle = 'Message Inbox | Bdjobs.com';
    } else if (route.startsWith('/email-template')) {
      pageTitle = 'Email Template(s) | Bdjobs.com';
    } else if (route.startsWith('/template-viewer')) {
      pageTitle = 'View Template | Bdjobs.com';
    } else if (route.startsWith('/template-editor')) {
      pageTitle = 'Template Editor | Bdjobs.com';
    } else if (route.startsWith('/template-creator')) {
      pageTitle = 'Template Creator | Bdjobs.com';
    } else if (route.startsWith('/settings/change-password')) {  
      pageTitle = 'Change Password | Bdjobs.com';
    } else if (route.startsWith('/register')) {
      pageTitle = 'Employer Account | Bdjobs.com';
    } else if (route.startsWith('/service-packages')) {
      pageTitle = 'Service Packages | Bdjobs.com';
    } else if (route.startsWith('/account-created-successfully')) {
      pageTitle = 'Account Created Successfully | Bdjobs.com';
    } else if (route.startsWith('/SubscribedServices')) {
      pageTitle = 'Service History | Bdjobs.com';
    } else if  (route.startsWith('/settings/edit')) {
      pageTitle = 'Edit employer account in Bdjobs recruitment system | Bdjobs.com';
    } else if (route === '/' || route === '') {
      pageTitle = 'Recruiter Account | Bdjobs.com';
    }
    
    this.titleService.setTitle(pageTitle);
  }
}
