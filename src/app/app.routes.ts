import { Routes } from '@angular/router';
import { CreateAccountPageComponent } from './pages/create-account-page/create-account-page.component';
import {NidVerificationComponent} from './pages/nid-verification/nid-verification.component';
import { BeforeLoginNidComponent } from './pages/before-login-nid/before-login-nid.component';
import { SuccessfulAccountComponent } from './pages/successful-account/successful-account.component';

export const routes: Routes = [
    {
        path:"",
        redirectTo: 'register',
        pathMatch: 'full'
    },
    {
        path:'register',
        component: CreateAccountPageComponent
    },
    {
        path: "account-created-successfully",
        component: SuccessfulAccountComponent,
    },
    {
        path:'register/nidVerify',
        component: NidVerificationComponent
    },
    {
        path:'register/before-login-nid',
        component: BeforeLoginNidComponent
    }
];