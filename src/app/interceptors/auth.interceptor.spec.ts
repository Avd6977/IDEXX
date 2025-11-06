import { TestBed } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController
} from '@angular/common/http/testing';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from 'src/app/interceptors/auth.interceptor';

describe('AuthInterceptor', () => {
    let httpMock: HttpTestingController;
    let httpClient: HttpClient;
    let interceptor: AuthInterceptor;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                AuthInterceptor,
                {
                    provide: HTTP_INTERCEPTORS,
                    useClass: AuthInterceptor,
                    multi: true
                }
            ]
        });

        httpMock = TestBed.inject(HttpTestingController);
        httpClient = TestBed.inject(HttpClient);
        interceptor = TestBed.inject(AuthInterceptor);
    });

    afterEach(() => {
        httpMock.verify();
        // Clean up localStorage after each test
        localStorage.removeItem('authToken');
    });

    it('should be created', () => {
        expect(interceptor).toBeTruthy();
    });

    it('should add Authorization header when token exists', () => {
        // Arrange
        const testToken = 'test-auth-token-123';
        localStorage.setItem('authToken', testToken);
        const testUrl = '/api/test';
        const testData = { message: 'test' };

        // Act
        httpClient.get(testUrl).subscribe();

        // Assert
        const httpRequest = httpMock.expectOne(testUrl);
        expect(httpRequest.request.headers.has('Authorization')).toBeTruthy();
        expect(httpRequest.request.headers.get('Authorization')).toBe(
            `Bearer ${testToken}`
        );
        expect(httpRequest.request.headers.get('Content-Type')).toBe(
            'application/json'
        );

        httpRequest.flush(testData);
    });

    it('should not add Authorization header when token does not exist', () => {
        // Arrange
        const testUrl = '/api/test';
        const testData = { message: 'test' };

        // Act
        httpClient.get(testUrl).subscribe();

        // Assert
        const httpRequest = httpMock.expectOne(testUrl);
        expect(httpRequest.request.headers.has('Authorization')).toBeFalsy();

        httpRequest.flush(testData);
    });

    it('should not add Authorization header when token is empty string', () => {
        // Arrange
        localStorage.setItem('authToken', '');
        const testUrl = '/api/test';
        const testData = { message: 'test' };

        // Act
        httpClient.get(testUrl).subscribe();

        // Assert
        const httpRequest = httpMock.expectOne(testUrl);
        expect(httpRequest.request.headers.has('Authorization')).toBeFalsy();

        httpRequest.flush(testData);
    });

    it('should not add Authorization header when token is null', () => {
        // Arrange
        localStorage.setItem('authToken', 'null');
        localStorage.removeItem('authToken'); // This sets it to null
        const testUrl = '/api/test';
        const testData = { message: 'test' };

        // Act
        httpClient.get(testUrl).subscribe();

        // Assert
        const httpRequest = httpMock.expectOne(testUrl);
        expect(httpRequest.request.headers.has('Authorization')).toBeFalsy();

        httpRequest.flush(testData);
    });

    it('should add headers to POST requests with token', () => {
        // Arrange
        const testToken = 'post-test-token';
        localStorage.setItem('authToken', testToken);
        const testUrl = '/api/create';
        const postData = { name: 'test', value: 123 };

        // Act
        httpClient.post(testUrl, postData).subscribe();

        // Assert
        const httpRequest = httpMock.expectOne(testUrl);
        expect(httpRequest.request.method).toBe('POST');
        expect(httpRequest.request.headers.get('Authorization')).toBe(
            `Bearer ${testToken}`
        );
        expect(httpRequest.request.headers.get('Content-Type')).toBe(
            'application/json'
        );
        expect(httpRequest.request.body).toEqual(postData);

        httpRequest.flush({ success: true });
    });

    it('should add headers to PUT requests with token', () => {
        // Arrange
        const testToken = 'put-test-token';
        localStorage.setItem('authToken', testToken);
        const testUrl = '/api/update/1';
        const putData = { id: 1, name: 'updated' };

        // Act
        httpClient.put(testUrl, putData).subscribe();

        // Assert
        const httpRequest = httpMock.expectOne(testUrl);
        expect(httpRequest.request.method).toBe('PUT');
        expect(httpRequest.request.headers.get('Authorization')).toBe(
            `Bearer ${testToken}`
        );
        expect(httpRequest.request.headers.get('Content-Type')).toBe(
            'application/json'
        );

        httpRequest.flush({ success: true });
    });

    it('should add headers to DELETE requests with token', () => {
        // Arrange
        const testToken = 'delete-test-token';
        localStorage.setItem('authToken', testToken);
        const testUrl = '/api/delete/1';

        // Act
        httpClient.delete(testUrl).subscribe();

        // Assert
        const httpRequest = httpMock.expectOne(testUrl);
        expect(httpRequest.request.method).toBe('DELETE');
        expect(httpRequest.request.headers.get('Authorization')).toBe(
            `Bearer ${testToken}`
        );
        expect(httpRequest.request.headers.get('Content-Type')).toBe(
            'application/json'
        );

        httpRequest.flush({ success: true });
    });

    it('should preserve existing headers while adding auth headers', () => {
        // Arrange
        const testToken = 'preserve-headers-token';
        localStorage.setItem('authToken', testToken);
        const testUrl = '/api/test';
        const customHeaders = {
            'Custom-Header': 'custom-value',
            'X-Request-ID': '12345'
        };

        // Act
        httpClient.get(testUrl, { headers: customHeaders }).subscribe();

        // Assert
        const httpRequest = httpMock.expectOne(testUrl);
        expect(httpRequest.request.headers.get('Authorization')).toBe(
            `Bearer ${testToken}`
        );
        expect(httpRequest.request.headers.get('Content-Type')).toBe(
            'application/json'
        );
        expect(httpRequest.request.headers.get('Custom-Header')).toBe(
            'custom-value'
        );
        expect(httpRequest.request.headers.get('X-Request-ID')).toBe('12345');

        httpRequest.flush({ success: true });
    });

    it('should handle multiple concurrent requests with token', () => {
        // Arrange
        const testToken = 'concurrent-test-token';
        localStorage.setItem('authToken', testToken);
        const urls = ['/api/test1', '/api/test2', '/api/test3'];

        // Act
        urls.forEach((url) => httpClient.get(url).subscribe());

        // Assert
        urls.forEach((url) => {
            const httpRequest = httpMock.expectOne(url);
            expect(httpRequest.request.headers.get('Authorization')).toBe(
                `Bearer ${testToken}`
            );
            httpRequest.flush({ url });
        });
    });

    it('should not modify original request when cloning', () => {
        // Arrange
        const testToken = 'clone-test-token';
        localStorage.setItem('authToken', testToken);
        const testUrl = '/api/test';

        // Act
        httpClient.get(testUrl).subscribe();

        // Assert
        const httpRequest = httpMock.expectOne(testUrl);
        expect(httpRequest.request.headers.get('Authorization')).toBe(
            `Bearer ${testToken}`
        );

        // The interceptor should have cloned the request, not modified the original
        expect(httpRequest.request.url).toBe(testUrl);

        httpRequest.flush({ success: true });
    });
});
