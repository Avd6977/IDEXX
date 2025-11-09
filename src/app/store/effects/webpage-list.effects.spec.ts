import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { Observable } from 'rxjs';
import { AddWebpageEffects } from './webpage-list.effects';
import * as AddWebpageActions from '../actions/webpage-list.actions';
import { WebpageData } from 'src/app/shared/models/webpage-data.model';

describe('AddWebpageEffects', () => {
    let effects: AddWebpageEffects;
    let actions$: Observable<any>;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [AddWebpageEffects, provideMockActions(() => actions$)]
        });

        effects = TestBed.inject(AddWebpageEffects);
    });

    describe('addWebpage$ effect', () => {
        it('should return addWebpageSuccess action on success', (done) => {
            const newWebpage: WebpageData = {
                url: 'https://test.com',
                title: 'Test',
                description: 'Test webpage'
            };

            const action = AddWebpageActions.editWebpage({
                webpage: newWebpage
            });
            const completion = AddWebpageActions.editWebpageSuccess({
                webpage: newWebpage
            });

            actions$ = new Observable((observer) => {
                observer.next(action);
                observer.complete();
            });

            effects.editWebpage$.subscribe((result) => {
                expect(result).toEqual(completion);
                done();
            });
        });

        it('should return editWebpageSuccess action on valid webpage data', (done) => {
            const newWebpage: WebpageData = {
                url: 'https://valid.com',
                title: 'Valid Site',
                description: 'Valid description'
            };

            const action = AddWebpageActions.editWebpage({
                webpage: newWebpage
            });
            const completion = AddWebpageActions.editWebpageSuccess({
                webpage: newWebpage
            });

            actions$ = new Observable((observer) => {
                observer.next(action);
                observer.complete();
            });

            effects.editWebpage$.subscribe({
                next: (result) => {
                    expect(result.type).toContain('Success');
                    expect(result).toEqual(completion);
                    done();
                }
            });
        });
    });

    describe('refreshWebpages$ effect', () => {
        it('should delay 1500ms before dispatching refreshWebpagesSuccess', (done) => {
            const action = AddWebpageActions.refreshWebpages();
            const completion = AddWebpageActions.refreshWebpagesSuccess();

            actions$ = new Observable((observer) => {
                observer.next(action);
                observer.complete();
            });

            const startTime = Date.now();

            effects.refreshWebpages$.subscribe((result) => {
                const elapsed = Date.now() - startTime;

                expect(result).toEqual(completion);
                expect(elapsed).toBeGreaterThanOrEqual(1500);
                done();
            });
        });

        it('should dispatch refreshWebpagesSuccess after 1500ms', (done) => {
            const action = AddWebpageActions.refreshWebpages();
            const completion = AddWebpageActions.refreshWebpagesSuccess();

            actions$ = new Observable((observer) => {
                observer.next(action);
                observer.complete();
            });

            const startTime = Date.now();

            effects.refreshWebpages$.subscribe({
                next: (result) => {
                    const elapsed = Date.now() - startTime;
                    expect(result).toEqual(completion);
                    expect(elapsed).toBeGreaterThanOrEqual(1500);
                    done();
                }
            });
        });
    });

    describe('deleteWebpage$ effect', () => {
        it('should delay 300ms before dispatching deleteWebpageSuccess', (done) => {
            const action = AddWebpageActions.deleteWebpage({ id: 1 });
            const completion = AddWebpageActions.deleteWebpageSuccess({
                id: 1
            });

            actions$ = new Observable((observer) => {
                observer.next(action);
                observer.complete();
            });

            const startTime = Date.now();

            effects.deleteWebpage$.subscribe((result) => {
                const elapsed = Date.now() - startTime;

                expect(result).toEqual(completion);
                expect(elapsed).toBeGreaterThanOrEqual(300);
                done();
            });
        });

        it('should pass the correct id through the effect', (done) => {
            const testId = 42;
            const action = AddWebpageActions.deleteWebpage({ id: testId });

            actions$ = new Observable((observer) => {
                observer.next(action);
                observer.complete();
            });

            effects.deleteWebpage$.subscribe((result) => {
                expect(result).toEqual(
                    AddWebpageActions.deleteWebpageSuccess({ id: testId })
                );
                done();
            });
        });

        it('should dispatch deleteWebpageSuccess after 300ms delay', (done) => {
            const testId = 5;
            const action = AddWebpageActions.deleteWebpage({ id: testId });
            const completion = AddWebpageActions.deleteWebpageSuccess({
                id: testId
            });

            actions$ = new Observable((observer) => {
                observer.next(action);
                observer.complete();
            });

            const startTime = Date.now();

            effects.deleteWebpage$.subscribe({
                next: (result) => {
                    const elapsed = Date.now() - startTime;
                    expect(result).toEqual(completion);
                    expect(elapsed).toBeGreaterThanOrEqual(300);
                    done();
                }
            });
        });

        it('should handle multiple delete actions sequentially', (done) => {
            const action1 = AddWebpageActions.deleteWebpage({ id: 1 });
            const action2 = AddWebpageActions.deleteWebpage({ id: 2 });

            let resultCount = 0;

            actions$ = new Observable((observer) => {
                observer.next(action1);
                observer.next(action2);
                observer.complete();
            });

            effects.deleteWebpage$.subscribe((result) => {
                resultCount++;

                if (resultCount === 1) {
                    expect(result.type).toContain('Success');
                } else if (resultCount === 2) {
                    expect(result.type).toContain('Success');
                    done();
                }
            });
        });
    });

    describe('effects configuration', () => {
        it('should dispatch multiple actions without errors', (done) => {
            const newWebpage: WebpageData = {
                url: 'https://test.com',
                title: 'Test'
            };

            const editAction = AddWebpageActions.editWebpage({
                webpage: newWebpage
            });

            actions$ = new Observable((observer) => {
                observer.next(editAction);
                observer.complete();
            });

            effects.editWebpage$.subscribe({
                next: (result) => {
                    expect(result.type).toBeDefined();
                },
                error: (err) => {
                    fail('Effect should not error: ' + err);
                },
                complete: () => {
                    done();
                }
            });
        });
    });
});
