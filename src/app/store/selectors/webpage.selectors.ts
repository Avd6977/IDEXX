import { createSelector, createFeatureSelector } from '@ngrx/store';
import { WebpageState } from '../reducers/webpage.reducer';

export const selectWebpageState =
    createFeatureSelector<WebpageState>('webpage');

export const selectCurrentUrl = createSelector(
    selectWebpageState,
    (state: WebpageState) => state.currentUrl
);

export const selectIsLoading = createSelector(
    selectWebpageState,
    (state: WebpageState) => state.isLoading
);

export const selectError = createSelector(
    selectWebpageState,
    (state: WebpageState) => state.error
);
