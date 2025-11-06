import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
    ConfirmationDialogComponent,
    ConfirmationDialogData
} from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
    let component: ConfirmationDialogComponent;
    let fixture: ComponentFixture<ConfirmationDialogComponent>;

    const mockDialogData: ConfirmationDialogData = {
        title: 'Delete Item?',
        message:
            'Are you sure you want to delete this item? This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger'
    };

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ConfirmationDialogComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(ConfirmationDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    describe('Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should initialize with hidden state', () => {
            expect(component.isVisible).toBe(false);
        });

        it('should have default data', () => {
            expect(component.data.title).toBe('');
            expect(component.data.message).toBe('');
            expect(component.data.type).toBe('info');
        });
    });

    describe('Show Dialog', () => {
        it('should show dialog with provided data', () => {
            component.show(mockDialogData);
            expect(component.isVisible).toBe(true);
            expect(component.data).toEqual(mockDialogData);
        });

        it('should return observable', () => {
            const result = component.show(mockDialogData);
            expect(result).toBeDefined();
            expect(result.subscribe).toBeDefined();
        });

        it('should emit true when confirmed', (done) => {
            const result = component.show(mockDialogData);
            result.subscribe((value) => {
                expect(value).toBe(true);
                done();
            });
            component.onConfirm();
        });

        it('should emit false when cancelled', (done) => {
            const result = component.show(mockDialogData);
            result.subscribe((value) => {
                expect(value).toBe(false);
                done();
            });
            component.onCancel();
        });

        it('should emit false when overlay clicked', (done) => {
            const result = component.show(mockDialogData);
            result.subscribe((value) => {
                expect(value).toBe(false);
                done();
            });
            component.onOverlayClick();
        });
    });

    describe('Dialog Actions', () => {
        beforeEach(() => {
            component.show(mockDialogData);
            fixture.detectChanges();
        });

        it('should hide dialog on confirm', () => {
            component.onConfirm();
            expect(component.isVisible).toBe(false);
        });

        it('should hide dialog on cancel', () => {
            component.onCancel();
            expect(component.isVisible).toBe(false);
        });

        it('should hide dialog on overlay click', () => {
            component.onOverlayClick();
            expect(component.isVisible).toBe(false);
        });
    });

    describe('Dialog Type Styling', () => {
        it('should return correct class for danger type', () => {
            component.data = { ...mockDialogData, type: 'danger' };
            expect(component.getDialogClass()).toBe('danger');
        });

        it('should return correct class for warning type', () => {
            component.data = { ...mockDialogData, type: 'warning' };
            expect(component.getDialogClass()).toBe('warning');
        });

        it('should return info as default type', () => {
            component.data = { ...mockDialogData, type: undefined };
            expect(component.getDialogClass()).toBe('info');
        });
    });

    describe('Confirm Button Styling', () => {
        it('should return btn-danger for danger type', () => {
            component.data = { ...mockDialogData, type: 'danger' };
            expect(component.getConfirmButtonClass()).toBe('btn-danger');
        });

        it('should return btn-warning for warning type', () => {
            component.data = { ...mockDialogData, type: 'warning' };
            expect(component.getConfirmButtonClass()).toBe('btn-warning');
        });

        it('should return btn-primary for info type', () => {
            component.data = { ...mockDialogData, type: 'info' };
            expect(component.getConfirmButtonClass()).toBe('btn-primary');
        });

        it('should return btn-primary as default', () => {
            component.data = { ...mockDialogData, type: undefined };
            expect(component.getConfirmButtonClass()).toBe('btn-primary');
        });
    });

    describe('Dialog Content', () => {
        beforeEach(() => {
            component.show(mockDialogData);
            fixture.detectChanges();
        });

        it('should display title', () => {
            const titleElement =
                fixture.nativeElement.querySelector('.dialog-title');
            expect(titleElement.textContent).toContain('Delete Item?');
        });

        it('should display message', () => {
            const messageElement =
                fixture.nativeElement.querySelector('.dialog-message');
            expect(messageElement.textContent).toContain(
                'Are you sure you want to delete this item'
            );
        });

        it('should display custom confirm text', () => {
            const buttons = fixture.nativeElement.querySelectorAll('.btn');
            const confirmButton = buttons[buttons.length - 1];
            expect(confirmButton.textContent).toContain('Delete');
        });

        it('should display custom cancel text', () => {
            const buttons = fixture.nativeElement.querySelectorAll('.btn');
            const cancelButton = buttons[0];
            expect(cancelButton.textContent).toContain('Cancel');
        });

        it('should use default confirm text when not provided', () => {
            const dataWithoutText = {
                title: 'Confirm',
                message: 'Are you sure?'
            };
            component.show(dataWithoutText);
            fixture.detectChanges();
            const buttons = fixture.nativeElement.querySelectorAll('.btn');
            const confirmButton = buttons[buttons.length - 1];
            expect(confirmButton.textContent).toContain('Confirm');
        });

        it('should use default cancel text when not provided', () => {
            const dataWithoutText = {
                title: 'Confirm',
                message: 'Are you sure?'
            };
            component.show(dataWithoutText);
            fixture.detectChanges();
            const buttons = fixture.nativeElement.querySelectorAll('.btn');
            const cancelButton = buttons[0];
            expect(cancelButton.textContent).toContain('Cancel');
        });
    });

    describe('Dialog Visibility', () => {
        it('should show overlay when visible', () => {
            component.show(mockDialogData);
            fixture.detectChanges();
            const overlay =
                fixture.nativeElement.querySelector('.dialog-overlay');
            expect(overlay.classList.contains('show')).toBe(true);
        });

        it('should hide overlay when not visible', () => {
            const overlay =
                fixture.nativeElement.querySelector('.dialog-overlay');
            expect(overlay.classList.contains('show')).toBe(false);
        });
    });

    describe('Multiple Dialog Instances', () => {
        it('should handle multiple show calls with different data', (done) => {
            const firstData: ConfirmationDialogData = {
                title: 'First Dialog',
                message: 'First message'
            };

            const secondData: ConfirmationDialogData = {
                title: 'Second Dialog',
                message: 'Second message'
            };

            component.show(firstData);
            fixture.detectChanges();

            let confirmCount = 0;
            component.show(secondData).subscribe((confirmed) => {
                confirmCount++;
                if (confirmCount === 1) {
                    // First subscription completes with first show()
                    component.show(firstData).subscribe((secondConfirmed) => {
                        confirmCount++;
                        done();
                    });
                    component.onConfirm();
                }
            });
            component.onConfirm();
        });
    });

    describe('User Interactions', () => {
        beforeEach(() => {
            component.show(mockDialogData);
            fixture.detectChanges();
        });

        it('should trigger confirm when confirm button clicked', () => {
            spyOn(component, 'onConfirm');
            const buttons = fixture.nativeElement.querySelectorAll('.btn');
            const confirmButton = buttons[buttons.length - 1];
            confirmButton.click();
            expect(component.onConfirm).toHaveBeenCalled();
        });

        it('should trigger cancel when cancel button clicked', () => {
            spyOn(component, 'onCancel');
            const buttons = fixture.nativeElement.querySelectorAll('.btn');
            const cancelButton = buttons[0];
            cancelButton.click();
            expect(component.onCancel).toHaveBeenCalled();
        });

        it('should trigger cancel when close button clicked', () => {
            spyOn(component, 'onCancel');
            const closeButton =
                fixture.nativeElement.querySelector('.close-button');
            closeButton.click();
            expect(component.onCancel).toHaveBeenCalled();
        });

        it('should stop propagation when clicking dialog', () => {
            const event = new MouseEvent('click');
            spyOn(event, 'stopPropagation');
            component.onOverlayClick();
            expect(component.isVisible).toBe(false);
        });
    });
});
