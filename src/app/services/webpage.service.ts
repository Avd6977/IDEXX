import { Injectable } from '@angular/core';
import {
    HttpClient,
    HttpHeaders,
    HttpErrorResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface WebpageData {
    id?: number;
    url: string;
    title?: string;
    description?: string;
    createdAt?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class WebpageService {
    private apiUrl = 'https://api.example.com/webpages'; // Replace with your actual API endpoint

    constructor(private http: HttpClient) {}

    /**
     * Get all webpage entries
     */
    getWebpages(): Observable<WebpageData[]> {
        return this.http
            .get<WebpageData[]>(this.apiUrl)
            .pipe(retry(3), catchError(this.handleError));
    }

    /**
     * Get a specific webpage by ID
     */
    getWebpage(id: number): Observable<WebpageData> {
        const url = `${this.apiUrl}/${id}`;
        return this.http
            .get<WebpageData>(url)
            .pipe(retry(3), catchError(this.handleError));
    }

    /**
     * Create a new webpage entry
     */
    createWebpage(webpage: WebpageData): Observable<WebpageData> {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };

        return this.http
            .post<WebpageData>(this.apiUrl, webpage, httpOptions)
            .pipe(catchError(this.handleError));
    }

    /**
     * Update an existing webpage entry
     */
    updateWebpage(id: number, webpage: WebpageData): Observable<WebpageData> {
        const url = `${this.apiUrl}/${id}`;
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            })
        };

        return this.http
            .put<WebpageData>(url, webpage, httpOptions)
            .pipe(catchError(this.handleError));
    }

    /**
     * Delete a webpage entry
     */
    deleteWebpage(id: number): Observable<{}> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete(url).pipe(catchError(this.handleError));
    }

    /**
     * Check if a URL is accessible
     */
    checkUrlAccessibility(url: string): Observable<any> {
        // This might need to be handled differently due to CORS
        // Consider using a proxy endpoint on your backend
        return this.http.head(url).pipe(catchError(this.handleError));
    }

    /**
     * Handle HTTP errors
     */
    private handleError(error: HttpErrorResponse) {
        let errorMessage = 'An unknown error occurred';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Client Error: ${error.error.message}`;
        } else {
            // Server-side error
            errorMessage = `Server Error Code: ${error.status}\nMessage: ${error.message}`;
        }

        console.error(errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}
