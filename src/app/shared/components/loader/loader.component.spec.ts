import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoaderComponent } from './loader.component';

describe('LoaderComponent', () => {
    let component: LoaderComponent;
    let fixture: ComponentFixture<LoaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [LoaderComponent]
        }).compileComponents();

        fixture = TestBed.createComponent(LoaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have default size medium', () => {
        expect(component.size).toBe('medium');
    });

    it('should have default color primary', () => {
        expect(component.color).toBe('primary');
    });

    it('should apply correct CSS classes', () => {
        component.size = 'large';
        component.color = 'success';
        expect(component.getLoaderClasses()).toBe('large success');
    });

    it('should show message when provided', () => {
        component.message = 'Loading data...';
        fixture.detectChanges();

        const messageElement =
            fixture.nativeElement.querySelector('.loader-message');
        expect(messageElement.textContent).toContain('Loading data...');
    });

    it('should apply overlay class when overlay is true', () => {
        component.overlay = true;
        fixture.detectChanges();

        const container =
            fixture.nativeElement.querySelector('.loader-container');
        expect(container.classList.contains('overlay')).toBeTruthy();
    });

    it('should have proper accessibility attributes', () => {
        component.message = 'Custom loading message';
        fixture.detectChanges();

        const loader = fixture.nativeElement.querySelector('.loader');
        expect(loader.getAttribute('role')).toBe('status');
        expect(loader.getAttribute('aria-label')).toBe(
            'Custom loading message'
        );
        expect(loader.getAttribute('aria-live')).toBe('polite');
    });
});
