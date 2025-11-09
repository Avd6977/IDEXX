import { Action, createReducer, on } from '@ngrx/store';
import * as AddWebpageActions from '../actions/webpage-list.actions';
import { WebpageData } from 'src/app/shared/models/webpage-data.model';

export interface WebpageListState {
    webpages: WebpageData[];
    isLoading: boolean;
    error: string | null;
}

export const initialState: WebpageListState = {
    webpages: [
        {
            id: 1,
            url: 'https://www.google.com',
            title: 'Google',
            description: 'Search engine and technology company',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        },
        {
            id: 2,
            url: 'https://www.github.com',
            title: 'GitHub',
            description:
                'Git repository hosting service for software development',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        {
            id: 3,
            url: 'https://www.stackoverflow.com',
            title: 'Stack Overflow',
            description:
                'Question and answer site for professional and enthusiast programmers',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        },
        {
            id: 4,
            url: 'https://www.angular.io',
            title: 'Angular',
            description:
                'Platform and framework for building single-page client applications using HTML and TypeScript',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        },
        {
            id: 5,
            url: 'https://www.typescriptlang.org',
            title: 'TypeScript',
            description:
                'Typed superset of JavaScript that compiles to plain JavaScript',
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
        }
    ],
    isLoading: false,
    error: null
};

export const webpageListReducer = (
    reducerState: WebpageListState | undefined,
    reducerAction: Action
): WebpageListState => {
    return createReducer(
        initialState,
        on(AddWebpageActions.editWebpage, (state) => ({
            ...state,
            isLoading: true,
            error: null
        })),
        on(AddWebpageActions.editWebpageSuccess, (state, { webpage }) => {
            let existingWebpage = state.webpages.find(
                (wp) => wp.id === webpage.id
            );
            if (existingWebpage) {
                existingWebpage = { ...existingWebpage, ...webpage };
                const webpages = state.webpages.map((wp) =>
                    wp.id === existingWebpage!.id ? existingWebpage! : wp
                );
                return {
                    ...state,
                    isLoading: false,
                    webpages: [...webpages]
                };
            }
            const nextId =
                Math.max(0, ...state.webpages.map((wp) => wp.id || 0)) + 1;
            return {
                ...state,
                isLoading: false,
                webpages: [...state.webpages, { ...webpage, id: nextId }]
            };
        }),
        on(AddWebpageActions.editWebpageFailure, (state, { error }) => ({
            ...state,
            isLoading: false,
            error
        })),
        on(AddWebpageActions.refreshWebpages, (state) => ({
            ...state,
            isLoading: true,
            error: null
        })),
        on(AddWebpageActions.refreshWebpagesSuccess, (state) => ({
            ...state,
            isLoading: false
        })),
        on(AddWebpageActions.deleteWebpage, (state) => ({
            ...state,
            isLoading: true,
            error: null
        })),
        on(AddWebpageActions.deleteWebpageSuccess, (state, { id }) => ({
            ...state,
            isLoading: false,
            webpages: state.webpages.filter((webpage) => webpage.id !== id)
        })),
        on(AddWebpageActions.deleteWebpageFailure, (state, { error }) => ({
            ...state,
            isLoading: false,
            error
        }))
    )(reducerState, reducerAction);
};
