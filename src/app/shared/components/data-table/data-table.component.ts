import {
    Component,
    Input,
    Output,
    EventEmitter,
    OnInit,
    OnChanges,
    SimpleChanges,
    OnDestroy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { TruncatePipe } from 'src/app/shared/pipes/truncate.pipe';
import { TimeAgoPipe } from 'src/app/shared/pipes/time-ago.pipe';
import { LoaderComponent } from 'src/app/shared/components/loader/loader.component';
import {
    TableColumn,
    SortEvent,
    FilterEvent,
    PaginationEvent
} from 'src/app/shared/models/table-events.model';

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
    templateUrl: './data-table.component.html',
    styleUrls: ['./data-table.component.scss']
})
export class DataTableComponent implements OnInit, OnChanges, OnDestroy {
    @Input() data: any[] = [];
    @Input() columns: TableColumn[] = [];
    @Input() loading: boolean = false;
    @Input() searchable: boolean = true;
    @Input() pageSize: number = 10;
    @Input() sortable: boolean = true;

    @Output() sort = new EventEmitter<SortEvent>();
    @Output() filter = new EventEmitter<FilterEvent>();
    @Output() rowClick = new EventEmitter<any>();
    @Output() rowAction = new EventEmitter<{ action: string; item: any }>();
    @Output() pagination = new EventEmitter<PaginationEvent>();

    // Internal state
    searchTerm: string = '';
    currentSort: SortEvent = { column: '', direction: null };
    currentPage: number = 1;
    filteredData: any[] = [];
    paginatedData: any[] = [];
    totalPages: number = 0;

    // Search debounce
    private searchSubject = new Subject<string>();
    private destroy$ = new Subject<void>();

    ngOnInit(): void {
        this.updateData();
        this.searchSubject
            .pipe(debounceTime(300), takeUntil(this.destroy$))
            .subscribe((term: string) => {
                this.performSearch(term);
            });
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['data'] || changes['columns']) {
            this.updateData();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
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
        if (!term.trim()) return [...data];

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
        this.searchSubject.next(term);
    }

    private performSearch(term: string): void {
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
