import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable, of } from 'rxjs';
import { WebpageEffects } from './webpage.effects';
import * as WebpageActions from './webpage.actions';
import { Action } from '@ngrx/store';

describe('WebpageEffects', () => {
    let actions$: Observable<Action>;
    let effects: WebpageEffects;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [WebpageEffects, provideMockActions(() => actions$)]
        });

        effects = TestBed.inject(WebpageEffects);
    });

    describe('loadWebpage$', () => {
        it('should return loadWebpageSuccess action on successful load', (done) => {
            const url = 'https://www.test.com';
            const action = WebpageActions.loadWebpage({ url });
            const expectedAction = WebpageActions.loadWebpageSuccess({ url });

            actions$ = of(action);

            effects.loadWebpage$.subscribe((result) => {
                expect(result).toEqual(expectedAction);
                done();
            });
        });
    });
});
