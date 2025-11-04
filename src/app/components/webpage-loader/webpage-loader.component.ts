import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as WebpageActions from '../../store/webpage.actions';
import {
    selectCurrentUrl,
    selectIsLoading,
    selectError
} from '../../store/webpage.selectors';

@Component({
    selector: 'app-webpage-loader',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './webpage-loader.component.html',
    styleUrls: ['./webpage-loader.component.scss']
})
export class WebpageLoaderComponent implements OnInit {
    currentUrl$: Observable<string>;
    isLoading$: Observable<boolean>;
    error$: Observable<string | null>;
    urlInput: string = 'https://www.example.com';

    constructor(private store: Store) {
        this.currentUrl$ = this.store.select(selectCurrentUrl);
        this.isLoading$ = this.store.select(selectIsLoading);
        this.error$ = this.store.select(selectError);
    }

    ngOnInit(): void {
        // Load default URL on initialization
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
}
