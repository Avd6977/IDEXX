import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as WebpageActions from 'src/app/store/actions';
import {
    selectCurrentUrl,
    selectIsLoading,
    selectError
} from 'src/app/store/selectors';

@Component({
    selector: 'app-webpage-loader',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './webpage-loader.component.html',
    styleUrls: ['./webpage-loader.component.scss']
})
export class WebpageLoaderComponent implements OnInit {
    currentUrl$: Observable<SafeResourceUrl>;
    isLoading$: Observable<boolean>;
    error$: Observable<string | null>;
    urlInput: string = 'https://jsfiddle.net';
    currentDisplayUrl: string = '';

    constructor(private store: Store, private sanitizer: DomSanitizer) {
        this.currentUrl$ = this.store.select(selectCurrentUrl).pipe(
            map((url) => {
                this.currentDisplayUrl = url;
                return url
                    ? this.sanitizer.bypassSecurityTrustResourceUrl(url)
                    : this.sanitizer.bypassSecurityTrustResourceUrl('');
            })
        );
        this.isLoading$ = this.store.select(selectIsLoading);
        this.error$ = this.store.select(selectError);
    }

    ngOnInit(): void {
        this.loadWebpage();
    }

    loadWebpage(): void {
        if (this.urlInput.trim()) {
            this.store.dispatch(
                WebpageActions.loadWebpage({ url: this.urlInput.trim() })
            );
        }
    }

    onUrlChange(url: string): void {
        this.urlInput = url;
    }

    openInNewTab(): void {
        if (this.currentDisplayUrl) {
            window.open(this.currentDisplayUrl, '_blank');
        }
    }
}
