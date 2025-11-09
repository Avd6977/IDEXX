import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideMockStore, MockStore } from '@ngrx/store/testing';
import { WebpageLoaderComponent } from 'src/app/components/webpage-loader/webpage-loader.component';
import * as WebpageActions from 'src/app/store/webpage.actions';
import {
    selectCurrentUrl,
    selectIsLoading,
    selectError
} from 'src/app/store/webpage.selectors';

describe('WebpageLoaderComponent', () => {
    let component: WebpageLoaderComponent;
    let fixture: ComponentFixture<WebpageLoaderComponent>;
    let store: MockStore;
    const initialState = {
        currentUrl: '',
        isLoading: false,
        error: null
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [WebpageLoaderComponent],
            providers: [provideMockStore({ initialState })]
        }).compileComponents();

        fixture = TestBed.createComponent(WebpageLoaderComponent);
        component = fixture.componentInstance;
        store = TestBed.inject(MockStore);

        store.overrideSelector(selectCurrentUrl, '');
        store.overrideSelector(selectIsLoading, false);
        store.overrideSelector(selectError, null);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should dispatch loadWebpage action on loadWebpage call', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.urlInput = 'https://www.test.com';

        component.loadWebpage();

        expect(dispatchSpy).toHaveBeenCalledWith(
            WebpageActions.loadWebpage({ url: 'https://www.test.com' })
        );
    });

    it('should not dispatch action with empty URL', () => {
        const dispatchSpy = spyOn(store, 'dispatch');
        component.urlInput = '   ';

        component.loadWebpage();

        expect(dispatchSpy).not.toHaveBeenCalled();
    });

    it('should update urlInput on onUrlChange', () => {
        const newUrl = 'https://www.newsite.com';

        component.onUrlChange(newUrl);

        expect(component.urlInput).toBe(newUrl);
    });

    it('should call loadWebpage on ngOnInit', () => {
        const loadWebpageSpy = spyOn(component, 'loadWebpage');

        component.ngOnInit();

        expect(loadWebpageSpy).toHaveBeenCalled();
    });

    it('should select observables from store', () => {
        expect(component.currentUrl$).toBeDefined();
        expect(component.isLoading$).toBeDefined();
        expect(component.error$).toBeDefined();
    });

    it('should open URL in new tab', () => {
        const windowOpenSpy = spyOn(window, 'open');
        component.currentDisplayUrl = 'https://www.test.com';

        component.openInNewTab();

        expect(windowOpenSpy).toHaveBeenCalledWith(
            'https://www.test.com',
            '_blank'
        );
    });

    it('should not open new tab if URL is empty', () => {
        const windowOpenSpy = spyOn(window, 'open');
        component.currentDisplayUrl = '';

        component.openInNewTab();

        expect(windowOpenSpy).not.toHaveBeenCalled();
    });
});
