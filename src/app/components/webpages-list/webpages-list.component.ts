import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';
import { NotificationService } from 'src/app/shared/components/notification-container/notification.service';
import { ConfirmationDialogService } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.service';
import { TruncatePipe } from 'src/app/shared/pipes/truncate.pipe';
import { TimeAgoPipe } from 'src/app/shared/pipes/time-ago.pipe';
import { DataTableComponent } from 'src/app/shared/components/data-table/data-table.component';
import { WebpageFormComponent } from 'src/app/components/webpage-form/webpage-form.component';
import { TableColumn } from 'src/app/shared/models/table-events.model';
import { WebpageData } from 'src/app/shared/models/webpage-data.model';
import { Store } from '@ngrx/store';
import {
    selectWebpages,
    selectIsLoading
} from 'src/app/store/selectors/webpage-list.selectors';
import * as AddWebpageActions from 'src/app/store/actions/webpage-list.actions';

@Component({
    selector: 'app-webpages-list',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        DataTableComponent,
        LoaderComponent,
        WebpageFormComponent,
        TruncatePipe,
        TimeAgoPipe
    ],
    templateUrl: './webpages-list.component.html',
    styleUrls: ['./webpages-list.component.scss']
})
export class WebpagesListComponent implements OnInit, OnDestroy {
    private destroy$ = new Subject<void>();

    webpages: WebpageData[] = [];
    isLoading$!: Observable<boolean>;
    showWebpageFormModal = false;
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
        },
        {
            key: 'actions',
            label: 'Actions',
            sortable: false,
            type: 'action',
            width: '100px'
        }
    ];

    showLoaderDemo = false;
    loaderSize: 'small' | 'medium' | 'large' = 'medium';
    longText =
        'This is a very long text that demonstrates the truncate pipe functionality. It should be cut off after a certain number of characters with an ellipsis or custom trail.';
    sampleDate = new Date(Date.now() - 2 * 60 * 60 * 1000);
    interceptorLogs: { timestamp: Date; message: string }[] = [];
    webpageDataForEdit: WebpageData | null = null;

    constructor(
        private store: Store,
        private notificationService: NotificationService,
        private confirmationService: ConfirmationDialogService
    ) {}

    ngOnInit(): void {
        this.isLoading$ = this.store.select(selectIsLoading);
        this.loadData();
    }

    private loadData(): void {
        this.store
            .select(selectWebpages)
            .pipe(takeUntil(this.destroy$))
            .subscribe((data) => {
                this.webpages = data;
                this.closeWebpageForm();
            });
    }

    refreshData(): void {
        this.store.dispatch(AddWebpageActions.refreshWebpages());
        setTimeout(() => {
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

    onRowAction(event: { action: string; item: WebpageData }): void {
        switch (event.action) {
            case 'delete':
                this.onDeleteWebpage(event.item);
                break;
            case 'edit':
                this.webpageDataForEdit = event.item;
                this.openWebpageForm();
                break;
        }
    }

    private onDeleteWebpage(webpage: WebpageData): void {
        if (!webpage.id) {
            this.notificationService.error(
                'Delete Failed',
                'Unable to delete webpage without a valid ID.'
            );
            return;
        }

        this.confirmationService
            .confirmDelete(webpage.title)
            .pipe(takeUntil(this.destroy$))
            .subscribe((confirmed) => {
                if (confirmed) {
                    this.store.dispatch(
                        AddWebpageActions.deleteWebpage({
                            id: webpage.id as number
                        })
                    );
                    // Show success notification when delete completes
                    setTimeout(() => {
                        this.notificationService.success(
                            'Webpage Deleted',
                            `"${webpage.title}" has been deleted successfully.`
                        );
                    }, 300);
                }
            });
    }

    openWebpageForm(): void {
        this.showWebpageFormModal = true;
    }

    closeWebpageForm(): void {
        this.showWebpageFormModal = false;
        this.webpageDataForEdit = null;
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
        this.addInterceptorLog(
            'Error interceptor would handle HTTP error responses (4xx, 5xx)'
        );
        this.notificationService.warning(
            'Error Demo',
            'Error interceptor handles failed requests with retry logic'
        );
    }

    triggerLoadingInterceptor(): void {
        this.addInterceptorLog(
            'Loading interceptor tracks active HTTP requests'
        );
        this.notificationService.info(
            'Loading Demo',
            'Loading interceptor shows/hides global loading indicator'
        );

        this.store.dispatch(AddWebpageActions.refreshWebpages());
        setTimeout(() => {
            this.store.dispatch(AddWebpageActions.refreshWebpagesSuccess());
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
