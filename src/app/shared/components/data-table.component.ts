import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TruncatePipe } from 'src/app/shared/pipes/truncate.pipe';
import { TimeAgoPipe } from 'src/app/shared/pipes/time-ago.pipe';
import { LoaderComponent } from 'src/app/shared/components/loader.component';

export interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    type?: 'text' | 'date' | 'url' | 'number';
    width?: string;
    pipe?: string;
    pipeArgs?: any[];
}

export interface SortEvent {
    column: string;
    direction: 'asc' | 'desc' | null;
}

export interface FilterEvent {
    term: string;
}

export interface PaginationEvent {
    page: number;
    pageSize: number;
}

@Component({
    selector: 'app-data-table',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TruncatePipe,
        TimeAgoPipe,
        LoaderComponent
    ],
    template: `
        <div class="data-table-container">
            <!-- Search/Filter -->
            @if (searchable) {
            <div class="table-header">
                <div class="search-container">
                    <input
                        type="text"
                        class="search-input"
                        placeholder="Search..."
                        [(ngModel)]="searchTerm"
                        (ngModelChange)="onSearch($event)"
                        [attr.aria-label]="
                            'Search through ' + data.length + ' items'
                        "
                    />
                    <span class="search-icon">🔍</span>
                </div>
            </div>
            }

            <!-- Loading State -->
            @if (loading) {
            <app-loader message="Loading data..." [overlay]="true"></app-loader>
            }

            <!-- Table -->
            <div class="table-wrapper" [class.loading]="loading">
                <table class="data-table" role="table">
                    <thead>
                        <tr role="row">
                            @for (column of columns; track column.key) {
                            <th
                                [style.width]="column.width"
                                [class.sortable]="column.sortable"
                                (click)="onSort(column)"
                                [attr.aria-sort]="getSortAriaLabel(column.key)"
                                role="columnheader"
                            >
                                <div class="header-content">
                                    <span class="header-label">{{
                                        column.label
                                    }}</span>
                                    @if (column.sortable) {
                                    <span class="sort-indicator">
                                        <span
                                            [class.active]="
                                                currentSort.column ===
                                                    column.key &&
                                                currentSort.direction === 'asc'
                                            "
                                            >↑</span
                                        >
                                        <span
                                            [class.active]="
                                                currentSort.column ===
                                                    column.key &&
                                                currentSort.direction === 'desc'
                                            "
                                            >↓</span
                                        >
                                    </span>
                                    }
                                </div>
                            </th>
                            }
                        </tr>
                    </thead>

                    <tbody>
                        @for ( item of paginatedData; track item.id || item ) {
                        <tr
                            role="row"
                            class="table-row"
                            (click)="onRowClick(item)"
                        >
                            @for (column of columns; track column.key) {
                            <td
                                role="gridcell"
                                [attr.data-label]="column.label"
                            >
                                @switch (column.type) {
                                <!-- URL type -->
                                @case ('url') {
                                <a
                                    [href]="getValue(item, column.key)"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    class="url-link"
                                >
                                    {{
                                        getValue(item, column.key)
                                            | truncate : 40
                                    }}
                                </a>
                                }
                                <!-- Date type -->
                                @case ('date') {
                                <span>
                                    {{ getValue(item, column.key) | timeAgo }}
                                </span>
                                }
                                <!-- Number type -->
                                @case ('number') {
                                <span class="number-cell">
                                    {{ getValue(item, column.key) | number }}
                                </span>
                                }
                                <!-- Default text -->
                                @default {
                                <span>
                                    {{
                                        getValue(item, column.key)
                                            | truncate
                                                : (column.key === 'description'
                                                      ? 80
                                                      : 50)
                                    }}
                                </span>
                                } }
                            </td>
                            }
                        </tr>
                        }
                    </tbody>
                </table>

                <!-- Empty State -->
                @if (!loading && paginatedData.length === 0) {
                <div class="empty-state">
                    <div class="empty-icon">📭</div>
                    <h3>No data found</h3>
                    @if (searchTerm) {
                    <p>
                        No results match "{{ searchTerm }}". Try a different
                        search term.
                    </p>
                    } @if (!searchTerm) {
                    <p>There are no items to display.</p>
                    }
                </div>
                }
            </div>

            <!-- Pagination -->
            @if (!loading && totalPages > 1) {
            <div class="pagination">
                <div class="pagination-info">
                    Showing {{ getStartRecord() }}-{{ getEndRecord() }} of
                    {{ filteredData.length }} items
                </div>

                <div class="pagination-controls">
                    <button
                        class="page-btn"
                        [disabled]="currentPage === 1"
                        (click)="goToPage(1)"
                        aria-label="Go to first page"
                    >
                        ⏮️
                    </button>

                    <button
                        class="page-btn"
                        [disabled]="currentPage === 1"
                        (click)="goToPage(currentPage - 1)"
                        aria-label="Go to previous page"
                    >
                        ◀️
                    </button>

                    <span class="page-numbers">
                        @for (page of getVisiblePages(); track page) {
                        <button
                            class="page-btn"
                            [class.active]="page === currentPage"
                            (click)="goToPage(page)"
                            [attr.aria-label]="'Go to page ' + page"
                            [attr.aria-current]="
                                page === currentPage ? 'page' : null
                            "
                        >
                            {{ page }}
                        </button>
                        }
                    </span>

                    <button
                        class="page-btn"
                        [disabled]="currentPage === totalPages"
                        (click)="goToPage(currentPage + 1)"
                        aria-label="Go to next page"
                    >
                        ▶️
                    </button>

                    <button
                        class="page-btn"
                        [disabled]="currentPage === totalPages"
                        (click)="goToPage(totalPages)"
                        aria-label="Go to last page"
                    >
                        ⏭️
                    </button>
                </div>

                <div class="page-size-selector">
                    <label for="pageSize">Show:</label>
                    <select
                        id="pageSize"
                        [(ngModel)]="pageSize"
                        (ngModelChange)="onPageSizeChange($event)"
                    >
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                    </select>
                    <span>per page</span>
                </div>
            </div>
            }
        </div>
    `,
    styles: [
        `
            .data-table-container {
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                overflow: hidden;
                position: relative;
            }

            .table-header {
                padding: 1rem;
                border-bottom: 1px solid #e5e7eb;
                background: #f9fafb;
            }

            .search-container {
                position: relative;
                max-width: 400px;
            }

            .search-input {
                width: 100%;
                padding: 0.75rem 2.5rem 0.75rem 1rem;
                border: 1px solid #d1d5db;
                border-radius: 6px;
                font-size: 0.875rem;
                transition: border-color 0.2s ease;
            }

            .search-input:focus {
                outline: none;
                border-color: #3b82f6;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }

            .search-icon {
                position: absolute;
                right: 0.75rem;
                top: 50%;
                transform: translateY(-50%);
                color: #6b7280;
                pointer-events: none;
            }

            .table-wrapper {
                overflow-x: auto;
                transition: opacity 0.2s ease;
            }

            .table-wrapper.loading {
                opacity: 0.6;
                pointer-events: none;
            }

            .data-table {
                width: 100%;
                border-collapse: collapse;
                font-size: 0.875rem;
            }

            .data-table th {
                background: #f9fafb;
                border-bottom: 1px solid #e5e7eb;
                padding: 0.75rem;
                text-align: left;
                font-weight: 600;
                color: #374151;
                white-space: nowrap;
            }

            .data-table th.sortable {
                cursor: pointer;
                user-select: none;
                transition: background-color 0.2s ease;
            }

            .data-table th.sortable:hover {
                background: #f3f4f6;
            }

            .header-content {
                display: flex;
                align-items: center;
                justify-content: space-between;
                gap: 0.5rem;
            }

            .sort-indicator {
                display: flex;
                flex-direction: column;
                font-size: 0.75rem;
                line-height: 0.5;
                color: #d1d5db;
            }

            .sort-indicator span.active {
                color: #3b82f6;
            }

            .data-table td {
                padding: 0.75rem;
                border-bottom: 1px solid #f3f4f6;
                vertical-align: top;
            }

            .table-row {
                transition: background-color 0.2s ease;
                cursor: pointer;
            }

            .table-row:hover {
                background: #f9fafb;
            }

            .url-link {
                color: #3b82f6;
                text-decoration: none;
                transition: color 0.2s ease;
            }

            .url-link:hover {
                color: #2563eb;
                text-decoration: underline;
            }

            .number-cell {
                font-feature-settings: 'tnum';
                text-align: right;
            }

            .empty-state {
                text-align: center;
                padding: 3rem 1rem;
                color: #6b7280;
            }

            .empty-icon {
                font-size: 3rem;
                margin-bottom: 1rem;
            }

            .empty-state h3 {
                margin: 0 0 0.5rem 0;
                color: #374151;
                font-size: 1.125rem;
            }

            .empty-state p {
                margin: 0;
                font-size: 0.875rem;
            }

            .pagination {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 1rem;
                border-top: 1px solid #e5e7eb;
                background: #f9fafb;
                gap: 1rem;
                flex-wrap: wrap;
            }

            .pagination-info {
                font-size: 0.875rem;
                color: #6b7280;
                white-space: nowrap;
            }

            .pagination-controls {
                display: flex;
                align-items: center;
                gap: 0.25rem;
            }

            .page-numbers {
                display: flex;
                gap: 0.25rem;
            }

            .page-btn {
                padding: 0.5rem 0.75rem;
                border: 1px solid #d1d5db;
                background: white;
                color: #374151;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.875rem;
                transition: all 0.2s ease;
                min-width: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .page-btn:hover:not(:disabled) {
                background: #f3f4f6;
                border-color: #9ca3af;
            }

            .page-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .page-btn.active {
                background: #3b82f6;
                color: white;
                border-color: #3b82f6;
            }

            .page-size-selector {
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-size: 0.875rem;
                color: #6b7280;
                white-space: nowrap;
            }

            .page-size-selector select {
                padding: 0.25rem 0.5rem;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                background: white;
                color: #374151;
            }

            /* Responsive */
            @media (max-width: 768px) {
                .data-table {
                    font-size: 0.75rem;
                }

                .data-table th,
                .data-table td {
                    padding: 0.5rem 0.25rem;
                }

                .pagination {
                    flex-direction: column;
                    align-items: stretch;
                    gap: 0.75rem;
                }

                .pagination-info,
                .page-size-selector {
                    text-align: center;
                }
            }

            @media (max-width: 640px) {
                .table-wrapper {
                    overflow-x: scroll;
                }

                .pagination-controls {
                    justify-content: center;
                }

                .page-numbers .page-btn {
                    min-width: 35px;
                    padding: 0.5rem 0.5rem;
                }
            }
        `
    ]
})
export class DataTableComponent implements OnInit, OnChanges {
    @Input() data: any[] = [];
    @Input() columns: TableColumn[] = [];
    @Input() loading: boolean = false;
    @Input() searchable: boolean = true;
    @Input() pageSize: number = 10;
    @Input() sortable: boolean = true;

    @Output() sort = new EventEmitter<SortEvent>();
    @Output() filter = new EventEmitter<FilterEvent>();
    @Output() rowClick = new EventEmitter<any>();
    @Output() pagination = new EventEmitter<PaginationEvent>();

    // Internal state
    searchTerm: string = '';
    currentSort: SortEvent = { column: '', direction: null };
    currentPage: number = 1;
    filteredData: any[] = [];
    paginatedData: any[] = [];
    totalPages: number = 0;

    ngOnInit(): void {
        this.updateData();
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data'] || changes['columns']) {
            this.updateData();
        }
    }

    private updateData(): void {
        this.filteredData = this.filterData(this.data, this.searchTerm);
        this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
        this.currentPage = Math.min(
            this.currentPage,
            Math.max(1, this.totalPages)
        );
        this.updatePaginatedData();
    }

    private filterData(data: any[], term: string): any[] {
        if (!term.trim()) return data;

        return data.filter((item) => {
            return this.columns.some((column) => {
                const value = this.getValue(item, column.key);
                return (
                    value &&
                    value.toString().toLowerCase().includes(term.toLowerCase())
                );
            });
        });
    }

    private updatePaginatedData(): void {
        const startIndex = (this.currentPage - 1) * this.pageSize;
        const endIndex = startIndex + this.pageSize;
        this.paginatedData = this.filteredData.slice(startIndex, endIndex);
    }

    getValue(item: any, key: string): any {
        return key.split('.').reduce((obj, k) => obj?.[k], item);
    }

    onSearch(term: string): void {
        this.searchTerm = term;
        this.currentPage = 1;
        this.updateData();
        this.filter.emit({ term });
    }

    onSort(column: TableColumn): void {
        if (!column.sortable) return;

        let direction: 'asc' | 'desc' | null = 'asc';

        if (this.currentSort.column === column.key) {
            direction =
                this.currentSort.direction === 'asc'
                    ? 'desc'
                    : this.currentSort.direction === 'desc'
                    ? null
                    : 'asc';
        }

        this.currentSort = { column: column.key, direction };

        if (direction) {
            this.filteredData.sort((a, b) => {
                const aVal = this.getValue(a, column.key);
                const bVal = this.getValue(b, column.key);

                let comparison = 0;
                if (aVal > bVal) comparison = 1;
                else if (aVal < bVal) comparison = -1;

                return direction === 'desc' ? -comparison : comparison;
            });
        } else {
            // Reset to original order
            this.filteredData = [
                ...this.filterData(this.data, this.searchTerm)
            ];
        }

        this.currentPage = 1;
        this.updatePaginatedData();
        this.sort.emit(this.currentSort);
    }

    onRowClick(item: any): void {
        this.rowClick.emit(item);
    }

    goToPage(page: number): void {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.updatePaginatedData();
            this.pagination.emit({ page, pageSize: this.pageSize });
        }
    }

    onPageSizeChange(newSize: number): void {
        this.pageSize = newSize;
        this.currentPage = 1;
        this.updateData();
        this.pagination.emit({
            page: this.currentPage,
            pageSize: this.pageSize
        });
    }

    getVisiblePages(): number[] {
        const maxVisible = 5;
        const pages: number[] = [];
        const start = Math.max(
            1,
            this.currentPage - Math.floor(maxVisible / 2)
        );
        const end = Math.min(this.totalPages, start + maxVisible - 1);

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }

        return pages;
    }

    getStartRecord(): number {
        return (this.currentPage - 1) * this.pageSize + 1;
    }

    getEndRecord(): number {
        return Math.min(
            this.currentPage * this.pageSize,
            this.filteredData.length
        );
    }

    getSortAriaLabel(columnKey: string): string {
        if (this.currentSort.column === columnKey) {
            return this.currentSort.direction === 'asc'
                ? 'ascending'
                : 'descending';
        }
        return 'none';
    }

    trackByFn(index: number, item: any): any {
        return item.id || index;
    }
}
