import { TestBed } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController
} from '@angular/common/http/testing';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { ErrorInterceptor } from 'src/app/interceptors/error.interceptor';

describe('ErrorInterceptor', () => {
    let httpMock: HttpTestingController;
    let httpClient: HttpClient;
    let interceptor: ErrorInterceptor;
    let consoleSpy: jasmine.Spy;
    let consoleWarnSpy: jasmine.Spy;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                ErrorInterceptor,
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: ErrorInterceptor,
                    multi: true
                }
            ]
        });

        httpMock = TestBed.inject(HttpTestingController);
        httpClient = TestBed.inject(HttpClient);
        interceptor = TestBed.inject(ErrorInterceptor);

        // Spy on console methods
        consoleSpy = spyOn(console, 'error');
        consoleWarnSpy = spyOn(console, 'warn');
    });

    afterEach(() => {
        httpMock.verify();
        // Clean up localStorage after each test
        localStorage.removeItem('authToken');
    });

    it('should be created', () => {
        expect(interceptor).toBeTruthy();
    });

    it('should handle 400 Bad Request error with retry', () => {
        const testUrl = '/api/test';

        httpClient.get(testUrl).subscribe({
            next: () => fail('should have failed with 400 error'),
            error: (error) => {
                expect(error.message).toBe(
                    'Bad Request - Please check your input'
                );
            }
        });

        // Handle initial request + 2 retries (total 3 requests due to retry(2))
        for (let i = 0; i < 3; i++) {
            const req = httpMock.expectOne(testUrl);
            req.flush('Bad Request', {
                status: 400,
                statusText: 'Bad Request'
            });
        }

        expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle 401 Unauthorized error and clear auth token', () => {
        localStorage.setItem('authToken', 'test-token');
        const testUrl = '/api/protected';

        httpClient.get(testUrl).subscribe({
            next: () => fail('should have failed with 401 error'),
            error: (error) => {
                expect(error.message).toBe('Unauthorized - Please log in');
                expect(localStorage.getItem('authToken')).toBeNull();
            }
        });

        // Handle initial request + 2 retries
        for (let i = 0; i < 3; i++) {
            const req = httpMock.expectOne(testUrl);
            req.flush('Unauthorized', {
                status: 401,
                statusText: 'Unauthorized'
            });
        }

        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'Session expired. Please log in again.'
        );
        expect(consoleSpy).toHaveBeenCalled();
    });

    it('should handle 403 Forbidden error with retry', () => {
        const testUrl = '/api/admin';

        httpClient.get(testUrl).subscribe({
            next: () => fail('should have failed with 403 error'),
            error: (error) => {
                expect(error.message).toBe(
                    'Forbidden - You do not have permission'
                );
            }
        });

        // Handle all retry attempts
        for (let i = 0; i < 3; i++) {
            const req = httpMock.expectOne(testUrl);
            req.flush('Forbidden', { status: 403, statusText: 'Forbidden' });
        }
    });

    it('should handle 404 Not Found error with retry', () => {
        const testUrl = '/api/nonexistent';

        httpClient.get(testUrl).subscribe({
            next: () => fail('should have failed with 404 error'),
            error: (error) => {
                expect(error.message).toBe(
                    'Not Found - The requested resource was not found'
                );
            }
        });

        // Handle all retry attempts
        for (let i = 0; i < 3; i++) {
            const req = httpMock.expectOne(testUrl);
            req.flush('Not Found', { status: 404, statusText: 'Not Found' });
        }
    });

    it('should handle 500 Internal Server Error with retry', () => {
        const testUrl = '/api/server-error';

        httpClient.get(testUrl).subscribe({
            next: () => fail('should have failed with 500 error'),
            error: (error) => {
                expect(error.message).toBe(
                    'Internal Server Error - Please try again later'
                );
            }
        });

        // Handle all retry attempts
        for (let i = 0; i < 3; i++) {
            const req = httpMock.expectOne(testUrl);
            req.flush('Internal Server Error', {
                status: 500,
                statusText: 'Internal Server Error'
            });
        }
    });

    it('should handle 503 Service Unavailable error with retry', () => {
        const testUrl = '/api/unavailable';

        httpClient.get(testUrl).subscribe({
            next: () => fail('should have failed with 503 error'),
            error: (error) => {
                expect(error.message).toBe(
                    'Service Unavailable - Please try again later'
                );
            }
        });

        // Handle all retry attempts
        for (let i = 0; i < 3; i++) {
            const req = httpMock.expectOne(testUrl);
            req.flush('Service Unavailable', {
                status: 503,
                statusText: 'Service Unavailable'
            });
        }
    });

    it('should handle unknown HTTP error status codes with retry', () => {
        const testUrl = '/api/unknown-error';

        httpClient.get(testUrl).subscribe({
            next: () => fail('should have failed with unknown error'),
            error: (error) => {
                expect(error.message).toContain('Error Code: 418');
                expect(error.message).toContain('Message:');
            }
        });

        // Handle all retry attempts
        for (let i = 0; i < 3; i++) {
            const req = httpMock.expectOne(testUrl);
            req.flush("I'm a teapot", {
                status: 418,
                statusText: "I'm a teapot"
            });
        }
    });

    it('should handle client-side errors (ErrorEvent)', () => {
        const testUrl = '/api/client-error';
        const errorEvent = new ErrorEvent('Network error', {
            message: 'Connection failed'
        });

        httpClient.get(testUrl).subscribe({
            next: () => fail('should have failed with client error'),
            error: (error) => {
                expect(error.message).toBe('Client Error: Connection failed');
            }
        });

        // Client errors typically don't retry, but our interceptor has retry(2)
        // so we need to handle multiple attempts
        for (let i = 0; i < 3; i++) {
            const req = httpMock.expectOne(testUrl);
            req.error(errorEvent);
        }
    });

    it('should succeed on retry if server recovers', () => {
        const testUrl = '/api/retry-success';
        const successData = { success: true };

        httpClient.get(testUrl).subscribe({
            next: (data) => {
                expect(data).toEqual(successData);
            },
            error: () => fail('should have succeeded on retry')
        });

        // First request fails
        const req1 = httpMock.expectOne(testUrl);
        req1.flush('Error', { status: 500, statusText: 'Server Error' });

        // Second request (retry) succeeds
        const req2 = httpMock.expectOne(testUrl);
        req2.flush(successData);
    });

    it('should pass through successful requests without modification', () => {
        const testUrl = '/api/success';
        const successData = { message: 'success', data: [1, 2, 3] };

        httpClient.get(testUrl).subscribe((data) => {
            expect(data).toEqual(successData);
        });

        const req = httpMock.expectOne(testUrl);
        req.flush(successData);

        expect(consoleSpy).not.toHaveBeenCalled();
    });

    it('should handle POST request errors with retry', () => {
        const testUrl = '/api/create';
        const postData = { name: 'test' };

        httpClient.post(testUrl, postData).subscribe({
            next: () => fail('should have failed with 400 error'),
            error: (error) => {
                expect(error.message).toBe(
                    'Bad Request - Please check your input'
                );
            }
        });

        // Handle all retry attempts
        for (let i = 0; i < 3; i++) {
            const req = httpMock.expectOne(testUrl);
            expect(req.request.method).toBe('POST');
            req.flush('Validation Error', {
                status: 400,
                statusText: 'Bad Request'
            });
        }
    });

    it('should log error response with correct structure', () => {
        const testUrl = '/api/logging-test';

        httpClient.get(testUrl).subscribe({
            next: () => fail('should have failed'),
            error: () => {
                // Verify console.error was called with ErrorResponse structure
                expect(consoleSpy).toHaveBeenCalled();
                const loggedError = consoleSpy.calls.mostRecent().args[1];
                expect(loggedError.message).toBeDefined();
                expect(loggedError.status).toBeDefined();
                expect(loggedError.timestamp).toBeDefined();
                expect(loggedError.status).toBe(400);
                expect(loggedError.timestamp instanceof Date).toBeTruthy();
            }
        });

        // Handle all retry attempts
        for (let i = 0; i < 3; i++) {
            const req = httpMock.expectOne(testUrl);
            req.flush('Bad Request', {
                status: 400,
                statusText: 'Bad Request'
            });
        }
    });

    it('should handle errors with zero status code', () => {
        const testUrl = '/api/zero-status';
        const errorEvent = new ErrorEvent('Network error', {
            message: 'Network failure'
        });

        httpClient.get(testUrl).subscribe({
            next: () => fail('should have failed'),
            error: (error) => {
                expect(error.message).toBe('Client Error: Network failure');
            }
        });

        // Handle retry attempts for network errors
        for (let i = 0; i < 3; i++) {
            const req = httpMock.expectOne(testUrl);
            req.error(errorEvent);
        }

        expect(consoleSpy).toHaveBeenCalled();
        if (consoleSpy.calls.count() > 0) {
            const loggedError = consoleSpy.calls.mostRecent().args[1];
            expect(loggedError.status).toBe(0);
        }
    });
});
