import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, catchError, delay } from 'rxjs/operators';
import * as AddWebpageActions from '../actions/webpage-list.actions';

@Injectable()
export class AddWebpageEffects {
    addWebpage$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AddWebpageActions.editWebpage),
            map((action) => {
                try {
                    return AddWebpageActions.editWebpageSuccess({
                        webpage: action.webpage
                    });
                } catch (error) {
                    return AddWebpageActions.editWebpageFailure({
                        error: 'Failed to add webpage'
                    });
                }
            }),
            catchError((error) =>
                of(
                    AddWebpageActions.editWebpageFailure({
                        error: error.message
                    })
                )
            )
        )
    );

    refreshWebpages$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AddWebpageActions.refreshWebpages),
            delay(1500),
            map(() => AddWebpageActions.refreshWebpagesSuccess()),
            catchError((error) =>
                of(
                    AddWebpageActions.refreshWebpagesFailure({
                        error: 'Failed to refresh webpages'
                    })
                )
            )
        )
    );

    deleteWebpage$ = createEffect(() =>
        this.actions$.pipe(
            ofType(AddWebpageActions.deleteWebpage),
            delay(300),
            map((action) =>
                AddWebpageActions.deleteWebpageSuccess({ id: action.id })
            ),
            catchError((error) =>
                of(
                    AddWebpageActions.deleteWebpageFailure({
                        error: 'Failed to delete webpage'
                    })
                )
            )
        )
    );

    constructor(private actions$: Actions) {}
}
