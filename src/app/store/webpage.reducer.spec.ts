import {
    webpageReducer,
    initialState,
    WebpageState
} from 'src/app/store/webpage.reducer';
import * as WebpageActions from 'src/app/store/webpage.actions';

describe('Webpage Reducer', () => {
    describe('unknown action', () => {
        it('should return the previous state', () => {
            const action = {} as any;

            const result = webpageReducer(initialState, action);

            expect(result).toBe(initialState);
        });
    });

    describe('loadWebpage action', () => {
        it('should set loading to true and update currentUrl', () => {
            const url = 'https://www.test.com';
            const action = WebpageActions.loadWebpage({ url });

            const result = webpageReducer(initialState, action);

            expect(result).toEqual({
                currentUrl: url,
                isLoading: true,
                error: null
            });
        });
    });

    describe('loadWebpageSuccess action', () => {
        it('should set loading to false and update currentUrl', () => {
            const url = 'https://www.test.com';
            const action = WebpageActions.loadWebpageSuccess({ url });
            const previousState: WebpageState = {
                currentUrl: '',
                isLoading: true,
                error: null
            };

            const result = webpageReducer(previousState, action);

            expect(result).toEqual({
                currentUrl: url,
                isLoading: false,
                error: null
            });
        });
    });

    describe('loadWebpageFailure action', () => {
        it('should set loading to false and update error', () => {
            const error = 'Failed to load webpage';
            const action = WebpageActions.loadWebpageFailure({ error });
            const previousState: WebpageState = {
                currentUrl: 'https://www.test.com',
                isLoading: true,
                error: null
            };

            const result = webpageReducer(previousState, action);

            expect(result).toEqual({
                currentUrl: 'https://www.test.com',
                isLoading: false,
                error
            });
        });
    });

    describe('setCurrentUrl action', () => {
        it('should update currentUrl', () => {
            const url = 'https://www.newurl.com';
            const action = WebpageActions.setCurrentUrl({ url });

            const result = webpageReducer(initialState, action);

            expect(result).toEqual({
                currentUrl: url,
                isLoading: false,
                error: null
            });
        });
    });
});
