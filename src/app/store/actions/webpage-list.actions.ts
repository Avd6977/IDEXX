import { createAction, props } from '@ngrx/store';
import { WebpageData } from 'src/app/shared/models/webpage-data.model';

export const editWebpage = createAction(
    '[Webpage] Add Webpage',
    props<{ webpage: WebpageData }>()
);

export const editWebpageSuccess = createAction(
    '[Webpage] Add Webpage Success',
    props<{ webpage: WebpageData }>()
);

export const editWebpageFailure = createAction(
    '[Webpage] Add Webpage Failure',
    props<{ error: string }>()
);

export const refreshWebpages = createAction('[Webpage List] Refresh Webpages');

export const refreshWebpagesSuccess = createAction(
    '[Webpage List] Refresh Webpages Success'
);

export const refreshWebpagesFailure = createAction(
    '[Webpage List] Refresh Webpages Failure',
    props<{ error: string }>()
);

export const deleteWebpage = createAction(
    '[Webpage List] Delete Webpage',
    props<{ id: number }>()
);

export const deleteWebpageSuccess = createAction(
    '[Webpage List] Delete Webpage Success',
    props<{ id: number }>()
);

export const deleteWebpageFailure = createAction(
    '[Webpage List] Delete Webpage Failure',
    props<{ error: string }>()
);
