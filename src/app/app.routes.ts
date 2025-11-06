import { Routes } from '@angular/router';
import { WebpageLoaderComponent } from 'src/app/components/webpage-loader/webpage-loader.component';
import { WebpageFormComponent } from 'src/app/components/webpage-form/webpage-form.component';
import { WebpagesListComponent } from 'src/app/components/webpages-list/webpages-list.component';
import { authGuard } from 'src/app/guards/auth.guard';
import { canDeactivateGuard } from 'src/app/guards/can-deactivate.guard';

export const routes: Routes = [
    { path: '', redirectTo: '/webpages-list', pathMatch: 'full' },
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
    {
        path: 'webpages-list',
        component: WebpagesListComponent,
        canActivate: [authGuard]
    },
    { path: '**', redirectTo: '/webpages-list' } // Wildcard route for 404 page
];
