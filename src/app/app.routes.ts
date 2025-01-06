import { Routes } from '@angular/router';
import { CreateAccountPageComponent } from './pages/create-account-page/create-account-page.component';
import { SuccessfulAccountComponent } from './pages/successful-account/successful-account.component';
import { AuthGuard } from './guards/auth.guard';

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
   
];