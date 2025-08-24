import { Routes } from '@angular/router';
import { EditAccountPageComponent } from './pages/edit-account-page/edit-account-page.component';
import { SuccessfulAccountComponent } from './pages/successful-account/successful-account.component';
import { AuthGuard } from './guards/auth.guard';
import { ChangePasswordComponent } from './pages/change-password/change-password.component';
import { SettingsLayoutComponent } from './pages/shared-page/settings-layout/settings-layout.component';
import { NidPageComponent } from './pages/nid-page/nid-page.component';
import { UserMComponent } from './pages/user-m/user-m.component';
import { CreateAccountPageComponent } from './pages/create-account-page/create-account-page.component';
import { authGuardCreateAcc } from './guards/authGuardCreateAcc.guard';
import { CommunicationComponent } from './pages/communication/communication.component';
import { EmailTemplateComponent } from './pages/email-template/email-template.component';
import { TemplateViewerComponent } from './pages/template-viewer/template-viewer.component';
import { TemplateEditorComponent } from './pages/template-editor/template-editor.component';
import { SentEmailsComponent } from './pages/sent-emails/sent-emails.component';
import { ReadEmailsComponent } from './pages/read-emails/read-emails.component';
import { TemplateCreatorComponent } from './pages/template-creator/template-creator.component';
import { SubscribedServicesComponent } from './pages/subscribed-services/subscribed-services.component';
import { ServicePackagesComponent } from './pages/service-packages/service-packages.component';

export const routes: Routes = [
  {
    path: 'communication',
    component: CommunicationComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'email-template',
    component: EmailTemplateComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'template-viewer',
    component: TemplateViewerComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'template-editor',
    component: TemplateEditorComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'sent-emails',
    component: SentEmailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'read-emails',
    component: ReadEmailsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'template-creator',
    component: TemplateCreatorComponent,
    canActivate: [AuthGuard],
  },
   {
        path: "SubscribedServices",
        component: SubscribedServicesComponent,
        canActivate: [AuthGuard]
    },
  {
    path: 'account-updated-successfully',
    component: SuccessfulAccountComponent,

  },
  {
    path: 'service-packages',
    component: ServicePackagesComponent,
  },
  {
    path: 'register',
    component: CreateAccountPageComponent,
  },
  {
    path: 'account-created-successfully',
    component: SuccessfulAccountComponent,
    canActivate: [authGuardCreateAcc]
  },
  {
    path: 'settings',
    component: SettingsLayoutComponent,
    children: [
      {
        path: 'change-password',
        component: ChangePasswordComponent,
      },
      {
        path: 'edit',
        component: EditAccountPageComponent,
        canActivate: [AuthGuard],
      },
      {
        path: 'nid',
        component: NidPageComponent,
      },
      {
        path: 'user-management',
        component: UserMComponent,
      },
    ],
  },
];
