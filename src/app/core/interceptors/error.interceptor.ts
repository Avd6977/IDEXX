import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface ErrorResponse {
    message: string;
    status: number;
    timestamp: Date;
}

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        return next.handle(req).pipe(
            retry(2), // Retry failed requests up to 2 times
            catchError((error: HttpErrorResponse) => {
                let errorMessage = '';

                if (error.error instanceof ErrorEvent) {
                    // Client-side error
                    errorMessage = `Client Error: ${error.error.message}`;
                } else {
                    // Server-side error
                    switch (error.status) {
                        case 400:
                            errorMessage =
                                'Bad Request - Please check your input';
                            break;
                        case 401:
                            errorMessage = 'Unauthorized - Please log in';
                            this.handleUnauthorized();
                            break;
                        case 403:
                            errorMessage =
                                'Forbidden - You do not have permission';
                            break;
                        case 404:
                            errorMessage =
                                'Not Found - The requested resource was not found';
                            break;
                        case 500:
                            errorMessage =
                                'Internal Server Error - Please try again later';
                            break;
                        case 503:
                            errorMessage =
                                'Service Unavailable - Please try again later';
                            break;
                        default:
                            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
                    }
                }

                // Create structured error response
                const errorResponse: ErrorResponse = {
                    message: errorMessage,
                    status: error.status || 0,
                    timestamp: new Date()
                };

                console.error('HTTP Error:', errorResponse);

                // You could also dispatch to a global error handling service here
                // this.errorHandlingService.handleError(errorResponse);

                return throwError(() => new Error(errorMessage));
            })
        );
    }

    private handleUnauthorized(): void {
        // Clear auth token and redirect to login
        localStorage.removeItem('authToken');
        // router.navigate(['/login']);
        console.warn('Session expired. Please log in again.');
    }
}
