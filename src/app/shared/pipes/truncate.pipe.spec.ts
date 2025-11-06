import { TestBed } from '@angular/core/testing';
import { TruncatePipe } from 'src/app/shared/pipes/truncate.pipe';

describe('TruncatePipe', () => {
    let pipe: TruncatePipe;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        pipe = new TruncatePipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('should return empty string for null/undefined input', () => {
        expect(pipe.transform('')).toBe('');
        expect(pipe.transform(null as any)).toBe('');
        expect(pipe.transform(undefined as any)).toBe('');
    });

    it('should return original text if shorter than limit', () => {
        expect(pipe.transform('Short text', 20)).toBe('Short text');
    });

    it('should truncate text longer than limit with default trail', () => {
        const longText = 'This is a very long text that should be truncated';
        expect(pipe.transform(longText, 20)).toBe('This is a very long ...');
    });

    it('should use custom trail', () => {
        const longText = 'This is a very long text that should be truncated';
        expect(pipe.transform(longText, 20, '***')).toBe(
            'This is a very long ***'
        );
    });
});
