import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { WebpageFormComponent } from 'src/app/components/webpage-form/webpage-form.component';
import { WebpageService } from 'src/app/services/webpage.service';

describe('WebpageFormComponent', () => {
    let component: WebpageFormComponent;
    let fixture: ComponentFixture<WebpageFormComponent>;
    let mockWebpageService: jasmine.SpyObj<WebpageService>;
    const storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'select']);

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('WebpageService', ['createWebpage']);

        await TestBed.configureTestingModule({
            imports: [WebpageFormComponent, ReactiveFormsModule],
            providers: [
                { provide: WebpageService, useValue: spy },
                { provide: Store, useValue: storeSpy }
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(WebpageFormComponent);
        component = fixture.componentInstance;
        mockWebpageService = TestBed.inject(
            WebpageService
        ) as jasmine.SpyObj<WebpageService>;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should initialize form with empty values', () => {
        expect(component.webpageForm.get('url')?.value).toBe('');
        expect(component.webpageForm.get('title')?.value).toBe('');
        expect(component.webpageForm.get('description')?.value).toBe('');
        expect(component.webpageForm.get('publishDate')?.value).toBe(
            component.minDate
        );
    });

    it('should validate required URL field', () => {
        const urlControl = component.webpageForm.get('url');

        expect(urlControl?.hasError('required')).toBeTruthy();

        urlControl?.setValue('invalid-url');
        expect(urlControl?.hasError('pattern')).toBeTruthy();

        urlControl?.setValue('https://example.com');
        expect(urlControl?.valid).toBeTruthy();
    });

    it('should set minDate to today', () => {
        const today = new Date();
        const expectedDate = `${today.getFullYear()}-${String(
            today.getMonth() + 1
        ).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        expect(component.minDate).toBe(expectedDate);
    });

    it('should use dayjs for timezone-aware date handling', () => {
        const publishDateControl = component.webpageForm.get('publishDate');
        const minDateValue = publishDateControl?.value;

        expect(minDateValue).toBeDefined();
        expect(minDateValue).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('should reset form', () => {
        component.webpageForm.patchValue({
            url: 'https://test.com',
            title: 'Test',
            publishDate: '2025-12-31'
        });

        component.resetForm();

        expect(component.webpageForm.get('url')?.value).toBeNull();
        expect(component.webpageForm.get('title')?.value).toBeNull();
        expect(component.webpageForm.get('publishDate')?.value).toBeNull();
    });

    it('should prevent deactivation when form is dirty', () => {
        spyOn(window, 'confirm').and.returnValue(false);

        component.webpageForm.markAsDirty();

        expect(component.canDeactivate()).toBeFalsy();
        expect(window.confirm).toHaveBeenCalled();
    });

    it('should allow deactivation when form is clean', () => {
        expect(component.canDeactivate()).toBeTruthy();
    });

    it('should set form values when webpageData is provided at initialization', () => {
        component.webpageData = {
            id: 1,
            url: 'https://existing.com',
            title: 'Existing Site',
            description: 'An existing webpage',
            createdAt: new Date('2025-11-01')
        };

        component.ngOnInit();

        expect(component.webpageForm.get('url')?.value).toBe(
            'https://existing.com'
        );
        expect(component.webpageForm.get('title')?.value).toBe('Existing Site');
        expect(component.webpageForm.get('description')?.value).toBe(
            'An existing webpage'
        );
        expect(component.webpageForm.get('publishDate')?.value).toBe(
            '2025-11-01'
        );
    });

    it('should update form values when ngOnChanges detects webpageData change', () => {
        component.ngOnInit();

        component.webpageData = {
            id: 2,
            url: 'https://updated.com',
            title: 'Updated Site',
            description: 'Updated description',
            createdAt: new Date('2025-11-05')
        };

        component.ngOnChanges({
            webpageData: {
                currentValue: component.webpageData,
                previousValue: null,
                firstChange: false,
                isFirstChange: () => false
            }
        });

        expect(component.webpageForm.get('url')?.value).toBe(
            'https://updated.com'
        );
        expect(component.webpageForm.get('title')?.value).toBe('Updated Site');
    });

    it('should handle createdAt as ISO string in setFormValues', () => {
        component.ngOnInit();

        component.webpageData = {
            id: 1,
            url: 'https://test.com',
            title: 'Test',
            createdAt: '2025-11-15T10:30:00.000Z' as any
        };

        component.setFormValues();

        expect(component.webpageForm.get('publishDate')?.value).toBe(
            '2025-11-15'
        );
    });

    it('should handle createdAt as Date object in setFormValues', () => {
        component.ngOnInit();

        const testDate = new Date('2025-11-20');
        component.webpageData = {
            id: 1,
            url: 'https://test.com',
            title: 'Test',
            createdAt: testDate
        };

        component.setFormValues();

        const expectedDate = testDate.toISOString().split('T')[0];
        expect(component.webpageForm.get('publishDate')?.value).toBe(
            expectedDate
        );
    });

    it('should include webpage id when submitting edited webpage', () => {
        component.ngOnInit();
        component.webpageData = {
            id: 42,
            url: 'https://test.com',
            title: 'Test'
        };

        component.webpageForm.patchValue({
            url: 'https://updated.com',
            title: 'Updated'
        });

        component.onSubmit();

        expect(storeSpy.dispatch).toHaveBeenCalled();
        const dispatchedAction = (
            storeSpy.dispatch as jasmine.Spy
        ).calls.mostRecent().args[0];
        expect(dispatchedAction.webpage.id).toBe(42);
    });

    it('should reset form to original webpageData values', () => {
        component.ngOnInit();
        component.webpageData = {
            id: 1,
            url: 'https://original.com',
            title: 'Original',
            description: 'Original description',
            createdAt: new Date('2025-11-01')
        };

        component.setFormValues();

        component.webpageForm.patchValue({
            url: 'https://changed.com',
            title: 'Changed',
            description: 'Changed description'
        });

        component.resetForm();

        expect(component.webpageForm.get('url')?.value).toBe(
            'https://original.com'
        );
        expect(component.webpageForm.get('title')?.value).toBe('Original');
        expect(component.webpageForm.get('description')?.value).toBe(
            'Original description'
        );
    });

    it('should handle null webpageData in setFormValues', () => {
        component.ngOnInit();
        component.webpageData = null;

        component.setFormValues();

        // Form should not be modified when webpageData is null
        expect(component.webpageForm.get('url')?.value).toBe('');
    });

    it('should handle webpageData without createdAt', () => {
        component.ngOnInit();
        component.webpageData = {
            url: 'https://test.com',
            title: 'Test'
        };

        component.setFormValues();

        expect(component.webpageForm.get('publishDate')?.value).toBe(
            component.minDate
        );
    });

    it('should initialize image properties as null', () => {
        expect(component.imagePreview).toBeNull();
        expect(component.selectedImageName).toBeNull();
        expect(component.selectedImageFile).toBeNull();
    });

    it('should handle valid image selection', (done) => {
        const file = new File(['test'], 'test-image.png', {
            type: 'image/png'
        });

        const event = {
            target: {
                files: [file]
            }
        } as any;

        component.onImageSelected(event);

        setTimeout(() => {
            expect(component.selectedImageFile).toBe(file);
            expect(component.selectedImageName).toBe('test-image.png');
            expect(component.imagePreview).toBeTruthy();
            expect(component.formStatus).toBeNull();
            done();
        }, 100);
    });

    it('should reject image larger than 5MB', () => {
        const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.png', {
            type: 'image/png'
        });

        const event = {
            target: {
                files: [largeFile]
            }
        } as any;

        component.onImageSelected(event);

        expect(component.formStatus?.type).toBe('error');
        expect(component.formStatus?.message).toContain('5MB');
    });

    it('should reject non-image files', () => {
        const textFile = new File(['test'], 'test.txt', { type: 'text/plain' });

        const event = {
            target: {
                files: [textFile]
            }
        } as any;

        component.onImageSelected(event);

        expect(component.formStatus?.type).toBe('error');
        expect(component.formStatus?.message).toContain('valid image');
    });

    it('should remove image', () => {
        component.selectedImageFile = new File(['test'], 'test.png', {
            type: 'image/png'
        });
        component.selectedImageName = 'test.png';
        component.imagePreview = 'data:image/png;base64,...';

        component.removeImage();

        expect(component.selectedImageFile).toBeNull();
        expect(component.selectedImageName).toBeNull();
        expect(component.imagePreview).toBeNull();
    });

    it('should include image file in form submission', () => {
        component.ngOnInit();
        component.selectedImageFile = new File(['test'], 'test.png', {
            type: 'image/png'
        });

        component.webpageForm.patchValue({
            url: 'https://test.com',
            title: 'Test'
        });

        component.onSubmit();

        expect(storeSpy.dispatch).toHaveBeenCalled();
        const dispatchedAction = (
            storeSpy.dispatch as jasmine.Spy
        ).calls.mostRecent().args[0];
        expect(dispatchedAction.webpage.imageFile).toBe(
            component.selectedImageFile
        );
    });
});
