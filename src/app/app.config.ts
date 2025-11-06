import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
    provideHttpClient,
    withInterceptorsFromDi
} from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { webpageReducer } from './store/webpage.reducer';
import { WebpageEffects } from './store/webpage.effects';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        importProvidersFrom(
            ReactiveFormsModule,
            FormsModule,
            StoreModule.forRoot({
                webpage: webpageReducer
            }),
            EffectsModule.forRoot([WebpageEffects]),
            StoreDevtoolsModule.instrument({
                maxAge: 25,
                logOnly: false,
                autoPause: true,
                trace: false,
                traceLimit: 75
            })
        )
    ]
};
