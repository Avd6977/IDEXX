import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { WebpageFormComponent } from './webpage-form.component';
import { WebpageService } from '../../services/webpage.service';

describe('WebpageFormComponent', () => {
    let component: WebpageFormComponent;
    let fixture: ComponentFixture<WebpageFormComponent>;
    let mockWebpageService: jasmine.SpyObj<WebpageService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('WebpageService', ['createWebpage']);

        await TestBed.configureTestingModule({
            imports: [WebpageFormComponent, ReactiveFormsModule],
            providers: [{ provide: WebpageService, useValue: spy }]
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
    });

    it('should validate required URL field', () => {
        const urlControl = component.webpageForm.get('url');

        expect(urlControl?.hasError('required')).toBeTruthy();

        urlControl?.setValue('invalid-url');
        expect(urlControl?.hasError('pattern')).toBeTruthy();

        urlControl?.setValue('https://example.com');
        expect(urlControl?.valid).toBeTruthy();
    });

    it('should submit form when valid', () => {
        const mockResponse = { id: 1, url: 'https://test.com', title: 'Test' };
        mockWebpageService.createWebpage.and.returnValue(of(mockResponse));

        component.webpageForm.patchValue({
            url: 'https://test.com',
            title: 'Test Site',
            description: 'Test description'
        });

        component.onSubmit();

        expect(mockWebpageService.createWebpage).toHaveBeenCalledWith({
            url: 'https://test.com',
            title: 'Test Site',
            description: 'Test description'
        });
    });

    it('should handle form submission error', () => {
        mockWebpageService.createWebpage.and.returnValue(
            throwError(() => new Error('Server error'))
        );

        component.webpageForm.patchValue({
            url: 'https://test.com'
        });

        component.onSubmit();

        expect(component.formStatus?.type).toBe('error');
        expect(component.formStatus?.message).toContain('Server error');
    });

    it('should reset form', () => {
        component.webpageForm.patchValue({
            url: 'https://test.com',
            title: 'Test'
        });

        component.resetForm();

        expect(component.webpageForm.get('url')?.value).toBeNull();
        expect(component.webpageForm.get('title')?.value).toBeNull();
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
});
