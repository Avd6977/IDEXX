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
    publishDate?: string;
    createdAt?: Date;
}

@Injectable({
    providedIn: 'root'
})
export class WebpageService {
    // Use relative path - this will connect to the same host where the Angular app is served
    // For local development, ensure your backend API is running on the same port or configure CORS
    private apiUrl = '/api/webpages';

    constructor(private http: HttpClient) {}

    getWebpages(): Observable<WebpageData[]> {
        return this.http
            .get<WebpageData[]>(this.apiUrl)
            .pipe(retry(3), catchError(this.handleError));
    }

    getWebpage(id: number): Observable<WebpageData> {
        const url = `${this.apiUrl}/${id}`;
        return this.http
            .get<WebpageData>(url)
            .pipe(retry(3), catchError(this.handleError));
    }

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

    deleteWebpage(id: number): Observable<{}> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete(url).pipe(catchError(this.handleError));
    }

    checkUrlAccessibility(url: string): Observable<any> {
        // Consider using a proxy endpoint on your backend for CORS issues
        return this.http.head(url).pipe(catchError(this.handleError));
    }

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
