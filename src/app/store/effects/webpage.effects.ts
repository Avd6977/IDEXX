import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import * as WebpageActions from '../actions/webpage.actions';

@Injectable()
export class WebpageEffects {
    loadWebpage$ = createEffect(() =>
        this.actions$.pipe(
            ofType(WebpageActions.loadWebpage),
            map((action) => {
                try {
                    return WebpageActions.loadWebpageSuccess({
                        url: action.url
                    });
                } catch (error) {
                    return WebpageActions.loadWebpageFailure({
                        error: 'Failed to load webpage'
                    });
                }
            }),
            catchError((error) =>
                of(WebpageActions.loadWebpageFailure({ error: error.message }))
            )
        )
    );

    constructor(private actions$: Actions) {}
}
