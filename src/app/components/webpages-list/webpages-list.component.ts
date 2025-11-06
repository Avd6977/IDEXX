import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { WebpageService, WebpageData } from 'src/app/services/webpage.service';
import {
    DataTableComponent,
    TableColumn
} from 'src/app/shared/components/data-table.component';
import { LoaderComponent } from 'src/app/shared/components/loader.component';
import { NotificationService } from 'src/app/shared/components/notification.service';
import { ConfirmationDialogService } from 'src/app/shared/components/confirmation-dialog.service';
import { TruncatePipe } from 'src/app/shared/pipes/truncate.pipe';
import { TimeAgoPipe } from 'src/app/shared/pipes/time-ago.pipe';

@Component({
    selector: 'app-webpages-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DataTableComponent,
        LoaderComponent,
        TruncatePipe,
        TimeAgoPipe
    ],
    template: `
        <div class="webpages-list-container">
            <div class="page-header">
                <h2>Webpages Management</h2>
                <div class="page-actions">
                    <button class="btn btn-primary" (click)="refreshData()">
                        🔄 Refresh
                    </button>
                    <button class="btn btn-success" (click)="showSuccessDemo()">
                        ✅ Success Demo
                    </button>
                    <button class="btn btn-warning" (click)="showWarningDemo()">
                        ⚠️ Warning Demo
                    </button>
                    <button class="btn btn-danger" (click)="showErrorDemo()">
                        ❌ Error Demo
                    </button>
                </div>
            </div>

            <div class="demo-section">
                <h3>Data Table Demo</h3>
                <p class="demo-description">
                    This demonstrates sorting, filtering, pagination, and row
                    actions. The table shows webpage data with different column
                    types and custom pipes.
                </p>

                <app-data-table
                    [data]="webpages"
                    [columns]="tableColumns"
                    [loading]="isLoading"
                    [searchable]="true"
                    [pageSize]="10"
                    (rowClick)="onRowClick($event)"
                    (sort)="onSort($event)"
                    (filter)="onFilter($event)"
                    (pagination)="onPagination($event)"
                >
                </app-data-table>
            </div>

            <div class="demo-section">
                <h3>Component Demos</h3>
                <div class="demo-grid">
                    <div class="demo-card">
                        <h4>Loading States</h4>
                        <div class="demo-buttons">
                            <button
                                class="btn btn-outline"
                                (click)="showLoader('small')"
                            >
                                Small Loader
                            </button>
                            <button
                                class="btn btn-outline"
                                (click)="showLoader('medium')"
                            >
                                Medium Loader
                            </button>
                            <button
                                class="btn btn-outline"
                                (click)="showLoader('large')"
                            >
                                Large Loader
                            </button>
                        </div>
                        @if (showLoaderDemo) {
                        <div class="loader-demo">
                            <app-loader
                                [size]="loaderSize"
                                [color]="'primary'"
                                [message]="'Demo loader...'"
                                [overlay]="false"
                            >
                            </app-loader>
                        </div>
                        }
                    </div>

                    <div class="demo-card">
                        <h4>Notifications</h4>
                        <div class="demo-buttons">
                            <button
                                class="btn btn-success"
                                (click)="showSuccessDemo()"
                            >
                                Success
                            </button>
                            <button
                                class="btn btn-info"
                                (click)="showInfoDemo()"
                            >
                                Info
                            </button>
                            <button
                                class="btn btn-warning"
                                (click)="showWarningDemo()"
                            >
                                Warning
                            </button>
                            <button
                                class="btn btn-danger"
                                (click)="showErrorDemo()"
                            >
                                Error
                            </button>
                        </div>
                    </div>

                    <div class="demo-card">
                        <h4>Confirmations</h4>
                        <div class="demo-buttons">
                            <button
                                class="btn btn-outline"
                                (click)="showDeleteConfirm()"
                            >
                                Delete Confirm
                            </button>
                            <button
                                class="btn btn-outline"
                                (click)="showUnsavedConfirm()"
                            >
                                Unsaved Changes
                            </button>
                            <button
                                class="btn btn-outline"
                                (click)="showCustomConfirm()"
                            >
                                Custom Action
                            </button>
                        </div>
                    </div>

                    <div class="demo-card">
                        <h4>Custom Pipes</h4>
                        <div class="pipe-demos">
                            <div class="pipe-example">
                                <strong>Truncate Pipe:</strong><br />
                                <span>{{
                                    longText | truncate : 50 : '...'
                                }}</span>
                            </div>
                            <div class="pipe-example">
                                <strong>Time Ago Pipe:</strong><br />
                                <span>{{ sampleDate | timeAgo }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="demo-section">
                <h3>HTTP Interceptors Demo</h3>
                <p class="demo-description">
                    The following actions demonstrate HTTP interceptors in
                    action:
                </p>
                <div class="demo-buttons">
                    <button
                        class="btn btn-outline"
                        (click)="triggerAuthInterceptor()"
                    >
                        Test Auth Header
                    </button>
                    <button
                        class="btn btn-outline"
                        (click)="triggerErrorInterceptor()"
                    >
                        Test Error Handling
                    </button>
                    <button
                        class="btn btn-outline"
                        (click)="triggerLoadingInterceptor()"
                    >
                        Test Loading State
                    </button>
                </div>

                @if (interceptorLogs.length > 0) {
                <div class="interceptor-logs">
                    <h4>Interceptor Activity:</h4>
                    <div class="log-entries">
                        @for (log of interceptorLogs; track log.timestamp) {
                        <div class="log-entry">
                            <span class="log-time">{{
                                log.timestamp | timeAgo
                            }}</span>
                            <span class="log-message">{{ log.message }}</span>
                        </div>
                        }
                    </div>
                </div>
                }
            </div>
        </div>
    `,
    styles: [
        `
            .webpages-list-container {
                padding: 2rem;
                max-width: 1200px;
                margin: 0 auto;
            }

            .page-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 2rem;
                padding-bottom: 1rem;
                border-bottom: 1px solid #e5e7eb;
            }

            .page-header h2 {
                margin: 0;
                color: #1f2937;
            }

            .page-actions {
                display: flex;
                gap: 0.5rem;
            }

            .demo-section {
                margin-bottom: 3rem;
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                padding: 2rem;
            }

            .demo-section h3 {
                margin: 0 0 1rem 0;
                color: #1f2937;
                border-bottom: 1px solid #e5e7eb;
                padding-bottom: 0.5rem;
            }

            .demo-description {
                color: #6b7280;
                margin-bottom: 1.5rem;
                line-height: 1.6;
            }

            .demo-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 1.5rem;
                margin-top: 1.5rem;
            }

            .demo-card {
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                padding: 1.5rem;
                background: #f9fafb;
            }

            .demo-card h4 {
                margin: 0 0 1rem 0;
                color: #374151;
            }

            .demo-buttons {
                display: flex;
                flex-wrap: wrap;
                gap: 0.5rem;
                margin-bottom: 1rem;
            }

            .btn {
                padding: 0.5rem 1rem;
                border: none;
                border-radius: 6px;
                font-size: 0.875rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s ease;
                text-decoration: none;
                display: inline-flex;
                align-items: center;
                gap: 0.25rem;
            }

            .btn-primary {
                background: #3b82f6;
                color: white;
            }

            .btn-primary:hover {
                background: #2563eb;
            }

            .btn-success {
                background: #10b981;
                color: white;
            }

            .btn-success:hover {
                background: #059669;
            }

            .btn-warning {
                background: #f59e0b;
                color: white;
            }

            .btn-warning:hover {
                background: #d97706;
            }

            .btn-danger {
                background: #ef4444;
                color: white;
            }

            .btn-danger:hover {
                background: #dc2626;
            }

            .btn-info {
                background: #3b82f6;
                color: white;
            }

            .btn-info:hover {
                background: #2563eb;
            }

            .btn-outline {
                background: white;
                color: #374151;
                border: 1px solid #d1d5db;
            }

            .btn-outline:hover {
                background: #f3f4f6;
                border-color: #9ca3af;
            }

            .loader-demo {
                margin-top: 1rem;
                padding: 1rem;
                border: 1px dashed #d1d5db;
                border-radius: 4px;
                display: flex;
                justify-content: center;
            }

            .pipe-demos {
                font-size: 0.875rem;
            }

            .pipe-example {
                margin-bottom: 1rem;
                padding: 0.75rem;
                background: white;
                border-radius: 4px;
                border: 1px solid #e5e7eb;
            }

            .pipe-example strong {
                color: #374151;
            }

            .interceptor-logs {
                margin-top: 1.5rem;
                padding: 1rem;
                background: #f3f4f6;
                border-radius: 6px;
                border: 1px solid #e5e7eb;
            }

            .interceptor-logs h4 {
                margin: 0 0 1rem 0;
                color: #374151;
                font-size: 1rem;
            }

            .log-entries {
                max-height: 200px;
                overflow-y: auto;
            }

            .log-entry {
                display: flex;
                gap: 1rem;
                padding: 0.5rem 0;
                border-bottom: 1px solid #e5e7eb;
                font-size: 0.8125rem;
            }

            .log-entry:last-child {
                border-bottom: none;
            }

            .log-time {
                color: #6b7280;
                font-weight: 500;
                min-width: 80px;
            }

            .log-message {
                color: #374151;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .webpages-list-container {
                    padding: 1rem;
                }

                .page-header {
                    flex-direction: column;
                    gap: 1rem;
                    align-items: stretch;
                }

                .page-actions {
                    justify-content: center;
                }

                .demo-grid {
                    grid-template-columns: 1fr;
                }
            }
        `
    ]
})
export class WebpagesListComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    webpages: WebpageData[] = [];
    isLoading = false;
    tableColumns: TableColumn[] = [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
            type: 'number',
            width: '80px'
        },
        {
            key: 'url',
            label: 'URL',
            sortable: true,
            type: 'url',
            width: '300px'
        },
        {
            key: 'title',
            label: 'Title',
            sortable: true,
            type: 'text',
            width: '200px'
        },
        {
            key: 'description',
            label: 'Description',
            sortable: false,
            type: 'text'
        },
        {
            key: 'createdAt',
            label: 'Created',
            sortable: true,
            type: 'date',
            width: '120px'
        }
    ];

    // Demo properties
    showLoaderDemo = false;
    loaderSize: 'small' | 'medium' | 'large' = 'medium';
    longText =
        'This is a very long text that demonstrates the truncate pipe functionality. It should be cut off after a certain number of characters with an ellipsis or custom trail.';
    sampleDate = new Date(Date.now() - 2 * 60 * 60 * 1000); // 2 hours ago
    interceptorLogs: { timestamp: Date; message: string }[] = [];

    constructor(
        private webpageService: WebpageService,
        private notificationService: NotificationService,
        private confirmationService: ConfirmationDialogService
    ) {}

    ngOnInit(): void {
        this.loadMockData();
    }

    private loadMockData(): void {
        // Create mock data for demo purposes
        this.webpages = [
            {
                id: 1,
                url: 'https://www.google.com',
                title: 'Google',
                description: 'Search engine and technology company',
                createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // 1 day ago
            },
            {
                id: 2,
                url: 'https://www.github.com',
                title: 'GitHub',
                description:
                    'Git repository hosting service for software development',
                createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
            },
            {
                id: 3,
                url: 'https://www.stackoverflow.com',
                title: 'Stack Overflow',
                description:
                    'Question and answer site for professional and enthusiast programmers',
                createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) // 5 days ago
            },
            {
                id: 4,
                url: 'https://www.angular.io',
                title: 'Angular',
                description:
                    'Platform and framework for building single-page client applications using HTML and TypeScript',
                createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 1 week ago
            },
            {
                id: 5,
                url: 'https://www.typescriptlang.org',
                title: 'TypeScript',
                description:
                    'Typed superset of JavaScript that compiles to plain JavaScript',
                createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago
            }
        ];
    }

    refreshData(): void {
        this.isLoading = true;

        // Simulate API call
        setTimeout(() => {
            this.loadMockData();
            this.isLoading = false;
            this.notificationService.success('Data refreshed successfully!');
        }, 1500);
    }

    onRowClick(item: WebpageData): void {
        this.notificationService.info('Row clicked', `Selected: ${item.title}`);
    }

    onSort(event: any): void {
        console.log('Sort event:', event);
        this.addInterceptorLog(
            `Table sorted by ${event.column} (${event.direction})`
        );
    }

    onFilter(event: any): void {
        console.log('Filter event:', event);
        this.addInterceptorLog(`Table filtered with term: "${event.term}"`);
    }

    onPagination(event: any): void {
        console.log('Pagination event:', event);
        this.addInterceptorLog(
            `Pagination changed to page ${event.page}, size ${event.pageSize}`
        );
    }

    // Loader demos
    showLoader(size: 'small' | 'medium' | 'large'): void {
        this.loaderSize = size;
        this.showLoaderDemo = true;

        setTimeout(() => {
            this.showLoaderDemo = false;
        }, 3000);
    }

    // Notification demos
    showSuccessDemo(): void {
        this.notificationService.success(
            'Operation Successful!',
            'Your webpage has been successfully processed.'
        );
    }

    showInfoDemo(): void {
        this.notificationService.info(
            'Information',
            'This is an informational message with additional context.'
        );
    }

    showWarningDemo(): void {
        this.notificationService.warning(
            'Warning Notice',
            'Please check your input data before proceeding.'
        );
    }

    showErrorDemo(): void {
        this.notificationService.error(
            'Error Occurred',
            'Failed to connect to the server. Please try again later.'
        );
    }

    // Confirmation demos
    showDeleteConfirm(): void {
        this.confirmationService
            .confirmDelete('this webpage')
            .pipe(takeUntil(this.destroy$))
            .subscribe((confirmed) => {
                if (confirmed) {
                    this.notificationService.success(
                        'Deleted!',
                        'The webpage has been deleted.'
                    );
                }
            });
    }

    showUnsavedConfirm(): void {
        this.confirmationService
            .confirmUnsavedChanges()
            .pipe(takeUntil(this.destroy$))
            .subscribe((confirmed) => {
                if (confirmed) {
                    this.notificationService.warning(
                        'Left without saving',
                        'Your changes were not saved.'
                    );
                }
            });
    }

    showCustomConfirm(): void {
        this.confirmationService
            .confirmAction(
                'Custom Action',
                'Do you want to perform this custom action? This is just a demo.'
            )
            .pipe(takeUntil(this.destroy$))
            .subscribe((confirmed) => {
                if (confirmed) {
                    this.notificationService.success(
                        'Action performed!',
                        'Your custom action was completed.'
                    );
                }
            });
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    // Interceptor demos
    triggerAuthInterceptor(): void {
        // Simulate a request that would trigger auth interceptor
        localStorage.setItem('authToken', 'demo-token-12345');
        this.addInterceptorLog(
            'Auth token added to localStorage - next HTTP request will include Authorization header'
        );
        this.notificationService.info(
            'Auth Demo',
            'Auth token set - check network tab on next API call'
        );
    }

    triggerErrorInterceptor(): void {
        // This would trigger error interceptor in a real scenario
        this.addInterceptorLog(
            'Error interceptor would handle HTTP error responses (4xx, 5xx)'
        );
        this.notificationService.warning(
            'Error Demo',
            'Error interceptor handles failed requests with retry logic'
        );
    }

    triggerLoadingInterceptor(): void {
        // This demonstrates the loading interceptor
        this.addInterceptorLog(
            'Loading interceptor tracks active HTTP requests'
        );
        this.notificationService.info(
            'Loading Demo',
            'Loading interceptor shows/hides global loading indicator'
        );

        // Simulate a quick request
        this.isLoading = true;
        setTimeout(() => {
            this.isLoading = false;
            this.addInterceptorLog(
                'Loading interceptor cleared - no active requests'
            );
        }, 2000);
    }

    private addInterceptorLog(message: string): void {
        this.interceptorLogs.unshift({
            timestamp: new Date(),
            message
        });

        // Keep only last 10 logs
        if (this.interceptorLogs.length > 10) {
            this.interceptorLogs = this.interceptorLogs.slice(0, 10);
        }
    }
}
