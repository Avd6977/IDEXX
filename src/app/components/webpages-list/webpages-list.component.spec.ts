import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WebpagesListComponent } from 'src/app/components/webpages-list/webpages-list.component';
import { NotificationService } from 'src/app/shared/components/notification-container/notification.service';
import { ConfirmationDialogService } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.service';
import { WebpageService } from 'src/app/services/webpage.service';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';

describe('WebpagesListComponent', () => {
    let component: WebpagesListComponent;
    let fixture: ComponentFixture<WebpagesListComponent>;
    let mockNotificationService: jasmine.SpyObj<NotificationService>;
    let mockConfirmationService: jasmine.SpyObj<ConfirmationDialogService>;
    let mockWebpageService: jasmine.SpyObj<WebpageService>;
    let mockStore: jasmine.SpyObj<Store>;

    beforeEach(async () => {
        const notificationSpy = jasmine.createSpyObj('NotificationService', [
            'success',
            'info',
            'warning',
            'error'
        ]);
        const confirmationSpy = jasmine.createSpyObj(
            'ConfirmationDialogService',
            ['confirmDelete', 'confirmUnsavedChanges', 'confirmAction']
        );
        const webpageSpy = jasmine.createSpyObj('WebpageService', [
            'getWebpages'
        ]);
        const storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'select']);
        // Mock store.select() to return observables with mock data
        const mockWebpages = [
            {
                id: 1,
                url: 'https://google.com',
                title: 'Google',
                description: 'Search engine',
                createdAt: new Date()
            }
        ];
        storeSpy.select.and.callFake(() => of(mockWebpages));

        await TestBed.configureTestingModule({
            imports: [WebpagesListComponent],
            providers: [
                { provide: NotificationService, useValue: notificationSpy },
                {
                    provide: ConfirmationDialogService,
                    useValue: confirmationSpy
                },
                { provide: WebpageService, useValue: webpageSpy },
                { provide: Store, useValue: storeSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(WebpagesListComponent);
        component = fixture.componentInstance;
        mockNotificationService = TestBed.inject(
            NotificationService
        ) as jasmine.SpyObj<NotificationService>;
        mockConfirmationService = TestBed.inject(
            ConfirmationDialogService
        ) as jasmine.SpyObj<ConfirmationDialogService>;
        mockWebpageService = TestBed.inject(
            WebpageService
        ) as jasmine.SpyObj<WebpageService>;
        mockStore = TestBed.inject(Store) as jasmine.SpyObj<Store>;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load mock data on init', () => {
        expect(component.webpages.length).toBeGreaterThan(0);
        expect(component.webpages[0].title).toBe('Google');
    });

    it('should show success notification on refresh', (done) => {
        component.refreshData();
        // refreshData dispatches action; verify notification is shown after delay
        setTimeout(() => {
            expect(mockNotificationService.success).toHaveBeenCalledWith(
                'Data refreshed successfully!'
            );
            done();
        }, 1600);
    });

    it('should handle row click', () => {
        const mockItem = { id: 1, url: 'test.com', title: 'Test' };
        component.onRowClick(mockItem);

        expect(mockNotificationService.info).toHaveBeenCalledWith(
            'Row clicked',
            'Selected: Test'
        );
    });

    it('should show different types of notifications', () => {
        component.showSuccessDemo();
        expect(mockNotificationService.success).toHaveBeenCalled();

        component.showErrorDemo();
        expect(mockNotificationService.error).toHaveBeenCalled();

        component.showWarningDemo();
        expect(mockNotificationService.warning).toHaveBeenCalled();

        component.showInfoDemo();
        expect(mockNotificationService.info).toHaveBeenCalled();
    });

    it('should handle loader demos', (done) => {
        component.showLoader('large');
        expect(component.loaderSize).toBe('large');
        expect(component.showLoaderDemo).toBeTruthy();

        setTimeout(() => {
            expect(component.showLoaderDemo).toBeFalsy();
            done();
        }, 3100);
    });

    it('should open webpage form modal', () => {
        expect(component.showWebpageFormModal).toBeFalsy();
        component.openWebpageForm();
        expect(component.showWebpageFormModal).toBeTruthy();
    });

    it('should close webpage form modal', () => {
        component.showWebpageFormModal = true;
        component.closeWebpageForm();
        expect(component.showWebpageFormModal).toBeFalsy();
    });
});
