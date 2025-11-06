import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WebpagesListComponent } from 'src/app/components/webpages-list/webpages-list.component';
import { NotificationService } from 'src/app/shared/components/notification-container/notification.service';
import { ConfirmationDialogService } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.service';
import { WebpageService } from 'src/app/services/webpage.service';

describe('WebpagesListComponent', () => {
    let component: WebpagesListComponent;
    let fixture: ComponentFixture<WebpagesListComponent>;
    let mockNotificationService: jasmine.SpyObj<NotificationService>;
    let mockConfirmationService: jasmine.SpyObj<ConfirmationDialogService>;
    let mockWebpageService: jasmine.SpyObj<WebpageService>;

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

        await TestBed.configureTestingModule({
            imports: [WebpagesListComponent],
            providers: [
                { provide: NotificationService, useValue: notificationSpy },
                {
                    provide: ConfirmationDialogService,
                    useValue: confirmationSpy
                },
                { provide: WebpageService, useValue: webpageSpy }
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
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load mock data on init', () => {
        component.ngOnInit();
        expect(component.webpages.length).toBeGreaterThan(0);
        expect(component.webpages[0].title).toBe('Google');
    });

    it('should show success notification on refresh', (done) => {
        component.refreshData();
        expect(component.isLoading).toBeTruthy();

        setTimeout(() => {
            expect(component.isLoading).toBeFalsy();
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
});
