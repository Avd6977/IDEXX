import { createAction, props } from '@ngrx/store';

export const loadWebpage = createAction(
    '[Webpage] Load Webpage',
    props<{ url: string }>()
);

export const loadWebpageSuccess = createAction(
    '[Webpage] Load Webpage Success',
    props<{ url: string }>()
);

export const loadWebpageFailure = createAction(
    '[Webpage] Load Webpage Failure',
    props<{ error: string }>()
);

export const setCurrentUrl = createAction(
    '[Webpage] Set Current URL',
    props<{ url: string }>()
);
