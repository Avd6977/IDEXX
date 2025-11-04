import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { webpageReducer } from './store/webpage.reducer';
import { WebpageEffects } from './store/webpage.effects';

export const appConfig: ApplicationConfig = {
    providers: [
        importProvidersFrom(
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
