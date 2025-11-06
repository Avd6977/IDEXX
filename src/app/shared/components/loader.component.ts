import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LoaderSize = 'small' | 'medium' | 'large';
export type LoaderColor =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger';

@Component({
    selector: 'app-loader',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="loader-container" [class.overlay]="overlay">
            <div
                class="loader"
                [class]="getLoaderClasses()"
                [attr.aria-label]="message || 'Loading...'"
                role="status"
                [attr.aria-live]="'polite'"
            >
                <div class="spinner"></div>
                @if (message) {
                <div class="loader-message">{{ message }}</div>
                }
            </div>
        </div>
    `,
    styles: [
        `
            .loader-container {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 60px;
            }

            .loader-container.overlay {
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(255, 255, 255, 0.8);
                z-index: 1000;
                backdrop-filter: blur(2px);
            }

            .loader {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 12px;
            }

            .spinner {
                border-radius: 50%;
                border-style: solid;
                border-top-style: solid;
                animation: spin 1s linear infinite;
            }

            /* Size variations */
            .loader.small .spinner {
                width: 20px;
                height: 20px;
                border-width: 2px;
            }

            .loader.medium .spinner {
                width: 32px;
                height: 32px;
                border-width: 3px;
            }

            .loader.large .spinner {
                width: 48px;
                height: 48px;
                border-width: 4px;
            }

            /* Color variations */
            .loader.primary .spinner {
                border-color: #e5e7eb;
                border-top-color: #3b82f6;
            }

            .loader.secondary .spinner {
                border-color: #e5e7eb;
                border-top-color: #6b7280;
            }

            .loader.success .spinner {
                border-color: #e5e7eb;
                border-top-color: #10b981;
            }

            .loader.warning .spinner {
                border-color: #e5e7eb;
                border-top-color: #f59e0b;
            }

            .loader.danger .spinner {
                border-color: #e5e7eb;
                border-top-color: #ef4444;
            }

            .loader-message {
                font-size: 0.875rem;
                color: #6b7280;
                text-align: center;
                font-weight: 500;
            }

            .loader.small .loader-message {
                font-size: 0.75rem;
            }

            .loader.large .loader-message {
                font-size: 1rem;
            }

            @keyframes spin {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }

            /* Accessibility */
            @media (prefers-reduced-motion: reduce) {
                .spinner {
                    animation: none;
                    border-top-color: transparent;
                    border-right-color: transparent;
                }
            }
        `
    ]
})
export class LoaderComponent {
    @Input() size: LoaderSize = 'medium';
    @Input() color: LoaderColor = 'primary';
    @Input() message: string = '';
    @Input() overlay: boolean = false;

    getLoaderClasses(): string {
        return `${this.size} ${this.color}`;
    }
}
