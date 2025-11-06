import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NotificationContainerComponent } from './notification-container.component';
import { NotificationService, Notification } from './notification.service';

describe('NotificationContainerComponent', () => {
    let component: NotificationContainerComponent;
    let fixture: ComponentFixture<NotificationContainerComponent>;
    let notificationService: NotificationService;

    const mockNotification: Notification = {
        id: 'test-1',
        type: 'success',
        title: 'Success',
        message: 'Operation completed',
        timestamp: new Date()
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [NotificationContainerComponent],
            providers: [NotificationService]
        }).compileComponents();

        fixture = TestBed.createComponent(NotificationContainerComponent);
        component = fixture.componentInstance;
        notificationService = TestBed.inject(NotificationService);
        fixture.detectChanges();
    });

    describe('Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize empty notifications array', () => {
            expect(component.notifications).toEqual([]);
        });

        it('should subscribe to notification service on init', () => {
            expect(component.notifications).toBeDefined();
            expect(Array.isArray(component.notifications)).toBe(true);
        });
    });

    describe('Receiving Notifications', () => {
        it('should receive and display notifications', () => {
            notificationService.success('Test Title', 'Test Message');
            fixture.detectChanges();
            expect(component.notifications.length).toBe(1);
            expect(component.notifications[0].title).toBe('Test Title');
        });

        it('should receive multiple notifications', () => {
            notificationService.success('First', 'First message');
            notificationService.error('Second', 'Second message');
            notificationService.warning('Third', 'Third message');
            fixture.detectChanges();
            expect(component.notifications.length).toBe(3);
        });

        it('should maintain notification order', () => {
            notificationService.success('First');
            notificationService.error('Second');
            fixture.detectChanges();
            expect(component.notifications[0].title).toBe('First');
            expect(component.notifications[1].title).toBe('Second');
        });
    });

    describe('Closing Notifications', () => {
        beforeEach(() => {
            notificationService.success('Test', 'Message');
            fixture.detectChanges();
        });

        it('should remove notification on close', () => {
            const notificationId = component.notifications[0].id;
            component.closeNotification(notificationId);
            fixture.detectChanges();
            expect(component.notifications.length).toBe(0);
        });

        it('should only remove specific notification', () => {
            notificationService.success('Second', 'Message');
            fixture.detectChanges();
            const firstId = component.notifications[0].id;
            const secondId = component.notifications[1].id;

            component.closeNotification(firstId);
            fixture.detectChanges();

            expect(component.notifications.length).toBe(1);
            expect(component.notifications[0].id).toBe(secondId);
        });

        it('should call service remove method', () => {
            spyOn(notificationService, 'remove');
            const notificationId = component.notifications[0].id;
            component.closeNotification(notificationId);
            expect(notificationService.remove).toHaveBeenCalledWith(
                notificationId
            );
        });
    });

    describe('Notification Styling', () => {
        it('should return correct class for success type', () => {
            const notification: Notification = {
                ...mockNotification,
                type: 'success'
            };
            expect(component.getNotificationClass(notification)).toBe(
                'notification-success'
            );
        });

        it('should return correct class for error type', () => {
            const notification: Notification = {
                ...mockNotification,
                type: 'error'
            };
            expect(component.getNotificationClass(notification)).toBe(
                'notification-error'
            );
        });

        it('should return correct class for warning type', () => {
            const notification: Notification = {
                ...mockNotification,
                type: 'warning'
            };
            expect(component.getNotificationClass(notification)).toBe(
                'notification-warning'
            );
        });

        it('should return correct class for info type', () => {
            const notification: Notification = {
                ...mockNotification,
                type: 'info'
            };
            expect(component.getNotificationClass(notification)).toBe(
                'notification-info'
            );
        });
    });

    describe('Notification Icons', () => {
        it('should return checkmark for success', () => {
            expect(component.getIcon('success')).toBe('✓');
        });

        it('should return cross for error', () => {
            expect(component.getIcon('error')).toBe('✕');
        });

        it('should return warning symbol for warning', () => {
            expect(component.getIcon('warning')).toBe('⚠');
        });

        it('should return info symbol for info', () => {
            expect(component.getIcon('info')).toBe('ℹ');
        });

        it('should return info as default for unknown type', () => {
            expect(component.getIcon('unknown')).toBe('ℹ');
        });
    });

    describe('Time Formatting', () => {
        it('should format just now for recent dates', () => {
            const now = new Date();
            expect(component.formatTime(now)).toBe('just now');
        });

        it('should format minutes ago', () => {
            const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
            expect(component.formatTime(fiveMinutesAgo)).toContain('m ago');
        });

        it('should format hours ago', () => {
            const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
            expect(component.formatTime(twoHoursAgo)).toContain('h ago');
        });

        it('should format as date for older times', () => {
            const lastWeek = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const formatted = component.formatTime(lastWeek);
            // Should return a date string, not relative time
            expect(formatted).not.toContain('ago');
        });

        it('should format exactly 60 seconds as 1m ago', () => {
            const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);
            expect(component.formatTime(sixtySecondsAgo)).toBe('1m ago');
        });

        it('should format exactly 60 minutes as 1h ago', () => {
            const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000);
            expect(component.formatTime(sixtyMinutesAgo)).toBe('1h ago');
        });
    });

    describe('Template Rendering', () => {
        beforeEach(() => {
            notificationService.success('Success Title', 'Success Message');
            fixture.detectChanges();
        });

        it('should display notification title', () => {
            const titleElement = fixture.nativeElement.querySelector(
                '.notification-title'
            );
            expect(titleElement.textContent).toContain('Success Title');
        });

        it('should display notification message', () => {
            const messageElement = fixture.nativeElement.querySelector(
                '.notification-message'
            );
            expect(messageElement.textContent).toContain('Success Message');
        });

        it('should display close button', () => {
            const closeButton = fixture.nativeElement.querySelector(
                '.notification-close'
            );
            expect(closeButton).toBeTruthy();
        });

        it('should apply notification type class', () => {
            const notification =
                fixture.nativeElement.querySelector('.notification');
            expect(
                notification.classList.contains('notification-success')
            ).toBe(true);
        });

        it('should display notification icon', () => {
            const iconSpan = fixture.nativeElement.querySelector(
                '.notification-icon span'
            );
            expect(iconSpan.textContent).toBe('✓');
        });

        it('should display timestamp', () => {
            const timestamp = fixture.nativeElement.querySelector(
                '.notification-timestamp'
            );
            expect(timestamp.textContent).toBeTruthy();
        });
    });

    describe('User Interactions', () => {
        beforeEach(() => {
            notificationService.success('Test', 'Message');
            fixture.detectChanges();
        });

        it('should close notification on close button click', () => {
            const closeButton = fixture.nativeElement.querySelector(
                '.notification-close'
            );
            closeButton.click();
            fixture.detectChanges();
            expect(component.notifications.length).toBe(0);
        });

        it('should call closeNotification on close button click', () => {
            spyOn(component, 'closeNotification');
            const closeButton = fixture.nativeElement.querySelector(
                '.notification-close'
            );
            closeButton.click();
            expect(component.closeNotification).toHaveBeenCalled();
        });
    });

    describe('Accessibility', () => {
        beforeEach(() => {
            notificationService.success('Test', 'Message');
            notificationService.error('Error', 'Error Message');
            fixture.detectChanges();
        });

        it('should have aria-live attribute', () => {
            const container = fixture.nativeElement.querySelector(
                '.notification-container'
            );
            expect(container.getAttribute('aria-live')).toBe('polite');
        });

        it('should have aria-label', () => {
            const container = fixture.nativeElement.querySelector(
                '.notification-container'
            );
            expect(container.getAttribute('aria-label')).toBe('Notifications');
        });

        it('should have role alert for errors', () => {
            const notifications =
                fixture.nativeElement.querySelectorAll('.notification');
            const errorNotification = Array.from(notifications).find((n: any) =>
                n.classList.contains('notification-error')
            ) as HTMLElement;
            expect(errorNotification.getAttribute('role')).toBe('alert');
        });

        it('should have role status for non-error notifications', () => {
            const notifications =
                fixture.nativeElement.querySelectorAll('.notification');
            const successNotification = Array.from(notifications).find(
                (n: any) => n.classList.contains('notification-success')
            ) as HTMLElement;
            expect(successNotification.getAttribute('role')).toBe('status');
        });

        it('should have aria-label on close button', () => {
            const closeButton = fixture.nativeElement.querySelector(
                '.notification-close'
            );
            expect(closeButton.getAttribute('aria-label')).toBeTruthy();
        });
    });

    describe('Lifecycle', () => {
        it('should unsubscribe on destroy', () => {
            const subscription = component['subscription'];
            if (subscription) {
                spyOn(subscription, 'unsubscribe');
                component.ngOnDestroy();
                expect(subscription.unsubscribe).toHaveBeenCalled();
            }
        });

        it('should not throw on destroy if subscription undefined', () => {
            component['subscription'] = undefined;
            expect(() => component.ngOnDestroy()).not.toThrow();
        });
    });

    describe('Track By', () => {
        beforeEach(() => {
            notificationService.success('Test 1');
            notificationService.success('Test 2');
            fixture.detectChanges();
        });

        it('should track notifications by id', () => {
            const notification = component.notifications[0];
            expect(component.trackById(0, notification)).toBe(notification.id);
        });

        it('should use id for tracking optimization', () => {
            const notification: Notification = {
                id: 'unique-id-123',
                type: 'info',
                title: 'Test',
                timestamp: new Date()
            };
            expect(component.trackById(0, notification)).toBe('unique-id-123');
        });
    });

    describe('Multiple Notifications', () => {
        it('should display all notifications simultaneously', () => {
            notificationService.success('First');
            notificationService.warning('Second');
            notificationService.error('Third');
            notificationService.info('Fourth');
            fixture.detectChanges();

            const notifications =
                fixture.nativeElement.querySelectorAll('.notification');
            expect(notifications.length).toBe(4);
        });

        it('should handle rapid notifications', () => {
            for (let i = 0; i < 5; i++) {
                notificationService.success(`Notification ${i}`);
            }
            fixture.detectChanges();
            expect(component.notifications.length).toBe(5);
        });

        it('should remove specific notification from list', () => {
            notificationService.success('Keep This');
            notificationService.success('Remove This');
            notificationService.success('Keep This Too');
            fixture.detectChanges();

            const toRemove = component.notifications[1];
            component.closeNotification(toRemove.id);
            fixture.detectChanges();

            expect(component.notifications.length).toBe(2);
            expect(
                component.notifications.every((n) => n.id !== toRemove.id)
            ).toBe(true);
        });
    });
});
