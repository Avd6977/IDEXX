import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import {
    provideHttpClient,
    withInterceptorsFromDi,
    HTTP_INTERCEPTORS
} from '@angular/common/http';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { webpageReducer } from 'src/app/store/webpage.reducer';
import { WebpageEffects } from 'src/app/store/webpage.effects';
import { routes } from 'src/app/app.routes';
import { AuthInterceptor } from 'src/app/interceptors/auth.interceptor';
import { ErrorInterceptor } from 'src/app/interceptors/error.interceptor';
import { LoadingInterceptor } from 'src/app/interceptors/loading.interceptor';

export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(routes),
        provideHttpClient(withInterceptorsFromDi()),
        // HTTP Interceptors
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: ErrorInterceptor,
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: LoadingInterceptor,
            multi: true
        },
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
