import { webpageListReducer, initialState } from './webpage-list.reducer';
import * as AddWebpageActions from '../actions/webpage-list.actions';
import { WebpageData } from 'src/app/shared/models/webpage-data.model';

describe('WebpageListReducer', () => {
    describe('initial state', () => {
        it('should return initial state for undefined action', () => {
            const result = webpageListReducer(undefined, {
                type: 'UNKNOWN'
            } as any);
            expect(result).toEqual(initialState);
        });

        it('should have 5 mock webpages in initial state', () => {
            expect(initialState.webpages.length).toBe(5);
        });

        it('should have isLoading set to false initially', () => {
            expect(initialState.isLoading).toBe(false);
        });

        it('should have no error initially', () => {
            expect(initialState.error).toBeNull();
        });
    });

    describe('editWebpage action', () => {
        it('should set isLoading to true when editWebpage is dispatched', () => {
            const action = AddWebpageActions.editWebpage({
                webpage: {
                    url: 'https://test.com',
                    title: 'Test'
                }
            });

            const result = webpageListReducer(initialState, action);

            expect(result.isLoading).toBe(true);
            expect(result.error).toBeNull();
            expect(result.webpages.length).toBe(initialState.webpages.length);
        });
    });

    describe('editWebpageSuccess action', () => {
        it('should add a new webpage to the list', () => {
            const newWebpage: WebpageData = {
                url: 'https://newsite.com',
                title: 'New Site',
                description: 'A new website'
            };

            // First dispatch addWebpage to set loading state
            let state = webpageListReducer(
                initialState,
                AddWebpageActions.editWebpage({ webpage: newWebpage })
            );

            // Then dispatch addWebpageSuccess
            state = webpageListReducer(
                state,
                AddWebpageActions.editWebpageSuccess({ webpage: newWebpage })
            );

            expect(state.webpages.length).toBe(
                initialState.webpages.length + 1
            );
            expect(state.isLoading).toBe(false);
            expect(state.webpages[state.webpages.length - 1].title).toBe(
                'New Site'
            );
        });

        it('should assign an id to the new webpage', () => {
            const newWebpage: WebpageData = {
                url: 'https://example.com',
                title: 'Example'
            };

            let state = webpageListReducer(
                initialState,
                AddWebpageActions.editWebpage({ webpage: newWebpage })
            );

            state = webpageListReducer(
                state,
                AddWebpageActions.editWebpageSuccess({ webpage: newWebpage })
            );

            const addedWebpage = state.webpages[state.webpages.length - 1];
            expect(addedWebpage.id).toBeDefined();
            expect(addedWebpage.id).toBeGreaterThan(0);
        });

        it('should update existing webpage when id is provided', () => {
            const updatedWebpage: WebpageData = {
                id: 2,
                url: 'https://updated-github.com',
                title: 'GitHub Updated',
                description: 'Updated GitHub description'
            };

            let state = webpageListReducer(
                initialState,
                AddWebpageActions.editWebpage({ webpage: updatedWebpage })
            );

            state = webpageListReducer(
                state,
                AddWebpageActions.editWebpageSuccess({
                    webpage: updatedWebpage
                })
            );

            const webpage = state.webpages.find((wp) => wp.id === 2);
            expect(webpage?.title).toBe('GitHub Updated');
            expect(webpage?.url).toBe('https://updated-github.com');
            expect(state.webpages.length).toBe(initialState.webpages.length);
        });

        it('should preserve other properties when updating webpage', () => {
            const originalWebpage = initialState.webpages[0];
            const originalCreatedAt = originalWebpage.createdAt;

            const updatedWebpage: WebpageData = {
                id: 1,
                url: 'https://new-google.com',
                title: 'Google New'
            };

            let state = webpageListReducer(
                initialState,
                AddWebpageActions.editWebpage({ webpage: updatedWebpage })
            );

            state = webpageListReducer(
                state,
                AddWebpageActions.editWebpageSuccess({
                    webpage: updatedWebpage
                })
            );

            const webpage = state.webpages.find((wp) => wp.id === 1);
            expect(webpage?.url).toBe('https://new-google.com');
            expect(webpage?.createdAt).toEqual(originalCreatedAt);
        });
    });

    describe('editWebpageFailure action', () => {
        it('should set isLoading to false and set error message', () => {
            const errorMessage = 'Failed to add webpage';

            let state = webpageListReducer(
                initialState,
                AddWebpageActions.editWebpage({
                    webpage: { url: 'https://test.com', title: 'Test' }
                })
            );

            state = webpageListReducer(
                state,
                AddWebpageActions.editWebpageFailure({ error: errorMessage })
            );

            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(errorMessage);
            expect(state.webpages.length).toBe(initialState.webpages.length);
        });
    });

    describe('refreshWebpages action', () => {
        it('should set isLoading to true', () => {
            const action = AddWebpageActions.refreshWebpages();

            const result = webpageListReducer(initialState, action);

            expect(result.isLoading).toBe(true);
            expect(result.error).toBeNull();
        });
    });

    describe('refreshWebpagesSuccess action', () => {
        it('should set isLoading to false', () => {
            let state = webpageListReducer(
                initialState,
                AddWebpageActions.refreshWebpages()
            );

            state = webpageListReducer(
                state,
                AddWebpageActions.refreshWebpagesSuccess()
            );

            expect(state.isLoading).toBe(false);
        });

        it('should not modify webpages list', () => {
            let state = webpageListReducer(
                initialState,
                AddWebpageActions.refreshWebpages()
            );

            state = webpageListReducer(
                state,
                AddWebpageActions.refreshWebpagesSuccess()
            );

            expect(state.webpages.length).toBe(initialState.webpages.length);
        });
    });

    describe('deleteWebpage action', () => {
        it('should set isLoading to true when deleteWebpage is dispatched', () => {
            const action = AddWebpageActions.deleteWebpage({ id: 1 });

            const result = webpageListReducer(initialState, action);

            expect(result.isLoading).toBe(true);
            expect(result.error).toBeNull();
        });
    });

    describe('deleteWebpageSuccess action', () => {
        it('should remove webpage with matching id from the list', () => {
            let state = webpageListReducer(
                initialState,
                AddWebpageActions.deleteWebpage({ id: 1 })
            );

            state = webpageListReducer(
                state,
                AddWebpageActions.deleteWebpageSuccess({ id: 1 })
            );

            expect(state.webpages.length).toBe(
                initialState.webpages.length - 1
            );
            expect(
                state.webpages.find((webpage) => webpage.id === 1)
            ).toBeUndefined();
        });

        it('should set isLoading to false', () => {
            let state = webpageListReducer(
                initialState,
                AddWebpageActions.deleteWebpage({ id: 2 })
            );

            state = webpageListReducer(
                state,
                AddWebpageActions.deleteWebpageSuccess({ id: 2 })
            );

            expect(state.isLoading).toBe(false);
        });

        it('should preserve other webpages in the list', () => {
            const initialWebpages = [...initialState.webpages];

            let state = webpageListReducer(
                initialState,
                AddWebpageActions.deleteWebpage({ id: 3 })
            );

            state = webpageListReducer(
                state,
                AddWebpageActions.deleteWebpageSuccess({ id: 3 })
            );

            expect(state.webpages).toContain(initialWebpages[0]);
            expect(state.webpages).toContain(initialWebpages[1]);
            expect(state.webpages).not.toContain(initialWebpages[2]);
        });
    });

    describe('deleteWebpageFailure action', () => {
        it('should set isLoading to false and set error message', () => {
            const errorMessage = 'Failed to delete webpage';

            let state = webpageListReducer(
                initialState,
                AddWebpageActions.deleteWebpage({ id: 1 })
            );

            state = webpageListReducer(
                state,
                AddWebpageActions.deleteWebpageFailure({ error: errorMessage })
            );

            expect(state.isLoading).toBe(false);
            expect(state.error).toBe(errorMessage);
            expect(state.webpages.length).toBe(initialState.webpages.length);
        });
    });

    describe('state immutability', () => {
        it('should not mutate the original state when adding webpage', () => {
            const originalState = { ...initialState };
            const newWebpage: WebpageData = {
                url: 'https://test.com',
                title: 'Test'
            };

            let state = webpageListReducer(
                initialState,
                AddWebpageActions.editWebpage({ webpage: newWebpage })
            );

            state = webpageListReducer(
                state,
                AddWebpageActions.editWebpageSuccess({ webpage: newWebpage })
            );

            expect(initialState.webpages.length).toBe(
                originalState.webpages.length
            );
        });

        it('should not mutate the original state when deleting webpage', () => {
            const originalState = { ...initialState };

            let state = webpageListReducer(
                initialState,
                AddWebpageActions.deleteWebpage({ id: 1 })
            );

            state = webpageListReducer(
                state,
                AddWebpageActions.deleteWebpageSuccess({ id: 1 })
            );

            expect(initialState.webpages.length).toBe(
                originalState.webpages.length
            );
        });
    });
});
