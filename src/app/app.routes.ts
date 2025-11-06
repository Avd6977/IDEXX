import { Routes } from '@angular/router';
import { WebpageLoaderComponent } from './components/webpage-loader/webpage-loader.component';
import { WebpageFormComponent } from './components/webpage-form/webpage-form.component';
import { authGuard } from './guards/auth.guard';
import { canDeactivateGuard } from './guards/can-deactivate.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/webpage-loader', pathMatch: 'full' },
    {
        path: 'webpage-loader',
        component: WebpageLoaderComponent,
        canActivate: [authGuard]
    },
    {
        path: 'webpage-form',
        component: WebpageFormComponent,
        canActivate: [authGuard],
        canDeactivate: [canDeactivateGuard]
    },
    { path: '**', redirectTo: '/webpage-loader' } // Wildcard route for 404 page
];
