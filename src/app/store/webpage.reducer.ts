import { createReducer, on } from '@ngrx/store';
import * as WebpageActions from './webpage.actions';

export interface WebpageState {
    currentUrl: string;
    isLoading: boolean;
    error: string | null;
}

export const initialState: WebpageState = {
    currentUrl: '',
    isLoading: false,
    error: null
};

export const webpageReducer = createReducer(
    initialState,
    on(WebpageActions.loadWebpage, (state, { url }) => ({
        ...state,
        isLoading: true,
        error: null,
        currentUrl: url
    })),
    on(WebpageActions.loadWebpageSuccess, (state, { url }) => ({
        ...state,
        isLoading: false,
        currentUrl: url
    })),
    on(WebpageActions.loadWebpageFailure, (state, { error }) => ({
        ...state,
        isLoading: false,
        error
    })),
    on(WebpageActions.setCurrentUrl, (state, { url }) => ({
        ...state,
        currentUrl: url
    }))
);
