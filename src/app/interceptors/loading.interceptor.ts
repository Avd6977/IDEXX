import { Injectable } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
    private activeRequests = 0;

    intercept(
        req: HttpRequest<any>,
        next: HttpHandler
    ): Observable<HttpEvent<any>> {
        // Skip loading indicator for certain requests
        if (req.headers.get('skipLoading')) {
            return next.handle(req);
        }

        // Increment active requests
        this.activeRequests++;
        this.setLoadingState(true);

        return next.handle(req).pipe(
            finalize(() => {
                // Decrement active requests
                this.activeRequests--;

                // Hide loading indicator when no active requests
                if (this.activeRequests === 0) {
                    this.setLoadingState(false);
                }
            })
        );
    }

    private setLoadingState(isLoading: boolean): void {
        this.updateLoadingIndicator(isLoading);
    }

    private updateLoadingIndicator(show: boolean): void {
        const loadingElement = document.getElementById('global-loading');
        if (loadingElement) {
            loadingElement.style.display = show ? 'block' : 'none';
        }
    }

    // Public method to get current loading state
    get isLoading(): boolean {
        return this.activeRequests > 0;
    }
}
