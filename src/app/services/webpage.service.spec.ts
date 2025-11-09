import { TestBed } from '@angular/core/testing';
import {
    HttpClientTestingModule,
    HttpTestingController
} from '@angular/common/http/testing';
import { WebpageService } from 'src/app/services/webpage.service';
import { WebpageData } from 'src/app/shared/models/webpage-data.model';

describe('WebpageService', () => {
    let service: WebpageService;
    let httpMock: HttpTestingController;

    const mockWebpage: WebpageData = {
        id: 1,
        url: 'https://example.com',
        title: 'Example Website',
        description: 'A test website',
        createdAt: new Date()
    };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [WebpageService]
        });
        service = TestBed.inject(WebpageService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('getWebpages', () => {
        it('should retrieve all webpages', () => {
            const mockWebpages: WebpageData[] = [mockWebpage];

            service.getWebpages().subscribe((webpages) => {
                expect(webpages).toEqual(mockWebpages);
            });

            const req = httpMock.expectOne('/api/webpages');
            expect(req.request.method).toBe('GET');
            req.flush(mockWebpages);
        });

        it('should handle errors when retrieving webpages', () => {
            service.getWebpages().subscribe({
                next: () => fail('should have failed with 404 error'),
                error: (error) => {
                    expect(error.message).toContain('Server Error Code: 404');
                }
            });

            // Handle retry behavior - expect 4 requests (initial + 3 retries)
            for (let i = 0; i < 4; i++) {
                const req = httpMock.expectOne('/api/webpages');
                req.flush('Not Found', {
                    status: 404,
                    statusText: 'Not Found'
                });
            }
        });
    });

    describe('getWebpage', () => {
        it('should retrieve a specific webpage', () => {
            service.getWebpage(1).subscribe((webpage) => {
                expect(webpage).toEqual(mockWebpage);
            });

            const req = httpMock.expectOne('/api/webpages/1');
            expect(req.request.method).toBe('GET');
            req.flush(mockWebpage);
        });
    });

    describe('createWebpage', () => {
        it('should create a new webpage', () => {
            const newWebpage: WebpageData = {
                url: 'https://newsite.com',
                title: 'New Site'
            };

            service.createWebpage(newWebpage).subscribe((webpage) => {
                expect(webpage).toEqual({ ...newWebpage, id: 2 });
            });

            const req = httpMock.expectOne('/api/webpages');
            expect(req.request.method).toBe('POST');
            expect(req.request.headers.get('Content-Type')).toBe(
                'application/json'
            );
            req.flush({ ...newWebpage, id: 2 });
        });
    });

    describe('updateWebpage', () => {
        it('should update an existing webpage', () => {
            const updatedWebpage: WebpageData = {
                ...mockWebpage,
                title: 'Updated Title'
            };

            service.updateWebpage(1, updatedWebpage).subscribe((webpage) => {
                expect(webpage).toEqual(updatedWebpage);
            });

            const req = httpMock.expectOne('/api/webpages/1');
            expect(req.request.method).toBe('PUT');
            req.flush(updatedWebpage);
        });
    });

    describe('deleteWebpage', () => {
        it('should delete a webpage', () => {
            service.deleteWebpage(1).subscribe((response) => {
                expect(response).toEqual({});
            });

            const req = httpMock.expectOne('/api/webpages/1');
            expect(req.request.method).toBe('DELETE');
            req.flush({});
        });
    });
});
