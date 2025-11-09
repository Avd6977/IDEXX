import { createSelector, createFeatureSelector } from '@ngrx/store';
import { WebpageListState } from '../reducers/webpage-list.reducer';

export const selectWebpageListState =
    createFeatureSelector<WebpageListState>('webpageList');

export const selectWebpages = createSelector(
    selectWebpageListState,
    (state: WebpageListState) => state.webpages
);

export const selectIsLoading = createSelector(
    selectWebpageListState,
    (state: WebpageListState) => state.isLoading
);

export const selectError = createSelector(
    selectWebpageListState,
    (state: WebpageListState) => state.error
);
