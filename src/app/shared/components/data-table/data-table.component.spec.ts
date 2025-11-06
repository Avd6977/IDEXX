import {
    ComponentFixture,
    TestBed,
    fakeAsync,
    tick
} from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { DataTableComponent } from './data-table.component';
import {
    TableColumn,
    SortEvent
} from 'src/app/shared/models/table-events.model';
import { TruncatePipe } from 'src/app/shared/pipes/truncate.pipe';
import { TimeAgoPipe } from 'src/app/shared/pipes/time-ago.pipe';
import { LoaderComponent } from '../loader/loader.component';

describe('DataTableComponent', () => {
    let component: DataTableComponent;
    let fixture: ComponentFixture<DataTableComponent>;

    const mockColumns: TableColumn[] = [
        {
            key: 'id',
            label: 'ID',
            sortable: true,
            type: 'number',
            width: '80px'
        },
        {
            key: 'name',
            label: 'Name',
            sortable: true,
            type: 'text',
            width: '200px'
        },
        { key: 'email', label: 'Email', sortable: false, type: 'text' },
        { key: 'createdAt', label: 'Created', sortable: true, type: 'date' }
    ];

    const mockData = [
        {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
            createdAt: new Date('2023-01-01')
        },
        {
            id: 2,
            name: 'Jane Smith',
            email: 'jane@example.com',
            createdAt: new Date('2023-01-02')
        },
        {
            id: 3,
            name: 'Bob Johnson',
            email: 'bob@example.com',
            createdAt: new Date('2023-01-03')
        },
        {
            id: 4,
            name: 'Alice Williams',
            email: 'alice@example.com',
            createdAt: new Date('2023-01-04')
        }
    ];

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [
                DataTableComponent,
                FormsModule,
                TruncatePipe,
                TimeAgoPipe,
                LoaderComponent
            ]
        }).compileComponents();

        fixture = TestBed.createComponent(DataTableComponent);
        component = fixture.componentInstance;
    });

    describe('Initialization', () => {
        it('should create', () => {
            expect(component).toBeTruthy();
        });

        it('should have default values', () => {
            expect(component.data).toEqual([]);
            expect(component.columns).toEqual([]);
            expect(component.loading).toBe(false);
            expect(component.searchable).toBe(true);
            expect(component.pageSize).toBe(10);
            expect(component.sortable).toBe(true);
        });

        it('should initialize internal state', () => {
            expect(component.searchTerm).toBe('');
            expect(component.currentSort).toEqual({
                column: '',
                direction: null
            });
            expect(component.currentPage).toBe(1);
            expect(component.filteredData).toEqual([]);
            expect(component.paginatedData).toEqual([]);
            expect(component.totalPages).toBe(0);
        });
    });

    describe('Data Processing', () => {
        beforeEach(() => {
            component.data = mockData;
            component.columns = mockColumns;
            fixture.detectChanges();
        });

        it('should update filtered data on initialization', () => {
            expect(component.filteredData.length).toBe(4);
            expect(component.paginatedData.length).toBe(4);
        });

        it('should calculate total pages correctly', () => {
            component.pageSize = 2;
            component.ngOnInit();
            expect(component.totalPages).toBe(2);
        });

        it('should get nested object values', () => {
            const obj = { user: { profile: { name: 'Test' } } };
            expect(component.getValue(obj, 'user.profile.name')).toBe('Test');
        });

        it('should return undefined for invalid path', () => {
            const obj = { name: 'Test' };
            expect(component.getValue(obj, 'invalid.path')).toBeUndefined();
        });
    });

    describe('Search/Filter', () => {
        beforeEach(() => {
            component.data = mockData;
            component.columns = mockColumns;
            fixture.detectChanges();
        });

        it('should filter data by search term', fakeAsync(() => {
            spyOn(component.filter, 'emit');
            component.onSearch('John');
            tick(300);
            expect(component.filteredData.length).toBe(1);
            expect(component.filteredData[0].name).toBe('John Doe');
        }));

        it('should search case-insensitively', fakeAsync(() => {
            component.onSearch('JANE');
            tick(300);
            expect(component.filteredData.length).toBe(1);
            expect(component.filteredData[0].name).toBe('Jane Smith');
        }));

        it('should reset to page 1 on search', fakeAsync(() => {
            component.currentPage = 5;
            component.onSearch('test');
            tick(300);
            expect(component.currentPage).toBe(1);
        }));

        it('should emit filter event on search', fakeAsync(() => {
            spyOn(component.filter, 'emit');
            component.onSearch('John');
            tick(300);
            expect(component.filter.emit).toHaveBeenCalledWith({
                term: 'John'
            });
        }));

        it('should clear filter when search term is empty', fakeAsync(() => {
            component.onSearch('John');
            tick(300);
            expect(component.filteredData.length).toBe(1);
            component.onSearch('');
            tick(300);
            expect(component.filteredData.length).toBe(4);
        }));
    });

    describe('Sorting', () => {
        beforeEach(() => {
            component.data = mockData;
            component.columns = mockColumns;
            fixture.detectChanges();
        });

        it('should sort data ascending', () => {
            const nameColumn = mockColumns[1];
            component.onSort(nameColumn);
            expect(component.filteredData[0].name).toBe('Alice Williams');
            expect(component.filteredData[1].name).toBe('Bob Johnson');
        });

        it('should sort data descending on second click', () => {
            const nameColumn = mockColumns[1];
            component.onSort(nameColumn); // First click: asc
            component.onSort(nameColumn); // Second click: desc
            expect(component.filteredData[0].name).toBe('John Doe');
            expect(component.filteredData[1].name).toBe('Jane Smith');
        });

        it('should reset sort on third click', () => {
            const nameColumn = mockColumns[1];
            component.onSort(nameColumn); // asc
            component.onSort(nameColumn); // desc
            component.onSort(nameColumn); // reset
            expect(component.currentSort.direction).toBeNull();
            expect(component.filteredData[0].id).toBe(1);
        });

        it('should not sort non-sortable columns', () => {
            const emailColumn = mockColumns[2];
            const originalData = [...component.filteredData];
            component.onSort(emailColumn);
            expect(component.currentSort.column).toBe('');
        });

        it('should emit sort event', () => {
            spyOn(component.sort, 'emit');
            const nameColumn = mockColumns[1];
            component.onSort(nameColumn);
            expect(component.sort.emit).toHaveBeenCalledWith({
                column: 'name',
                direction: 'asc'
            });
        });

        it('should reset to page 1 after sorting', () => {
            component.currentPage = 2;
            const nameColumn = mockColumns[1];
            component.onSort(nameColumn);
            expect(component.currentPage).toBe(1);
        });

        it('should update paginated data after sort', () => {
            component.pageSize = 2;
            component.ngOnInit();
            const nameColumn = mockColumns[1];
            component.onSort(nameColumn);
            expect(component.paginatedData[0].name).toBe('Alice Williams');
        });
    });

    describe('Pagination', () => {
        beforeEach(() => {
            component.data = mockData;
            component.columns = mockColumns;
            component.pageSize = 2;
            fixture.detectChanges();
        });

        it('should display correct number of records per page', () => {
            expect(component.paginatedData.length).toBe(2);
        });

        it('should navigate to specific page', () => {
            spyOn(component.pagination, 'emit');
            component.goToPage(2);
            expect(component.currentPage).toBe(2);
            expect(component.paginatedData[0].id).toBe(3);
        });

        it('should not navigate to invalid page', () => {
            component.goToPage(0);
            expect(component.currentPage).toBe(1);
            component.goToPage(100);
            expect(component.currentPage).toBe(1);
        });

        it('should emit pagination event', () => {
            spyOn(component.pagination, 'emit');
            component.goToPage(2);
            expect(component.pagination.emit).toHaveBeenCalledWith({
                page: 2,
                pageSize: 2
            });
        });

        it('should change page size', () => {
            spyOn(component.pagination, 'emit');
            component.onPageSizeChange(1);
            expect(component.pageSize).toBe(1);
            expect(component.totalPages).toBe(4);
        });

        it('should reset to page 1 on page size change', () => {
            component.currentPage = 2;
            component.onPageSizeChange(5);
            expect(component.currentPage).toBe(1);
        });

        it('should calculate start record correctly', () => {
            expect(component.getStartRecord()).toBe(1);
            component.goToPage(2);
            expect(component.getStartRecord()).toBe(3);
        });

        it('should calculate end record correctly', () => {
            expect(component.getEndRecord()).toBe(2);
            component.goToPage(2);
            expect(component.getEndRecord()).toBe(4);
        });

        it('should get visible pages', () => {
            component.pageSize = 1;
            component.ngOnInit();
            const visiblePages = component.getVisiblePages();
            expect(visiblePages.length).toBeLessThanOrEqual(5);
            expect(visiblePages).toContain(component.currentPage);
        });
    });

    describe('Row Click', () => {
        it('should emit row click event', () => {
            spyOn(component.rowClick, 'emit');
            const item = { id: 1, name: 'Test' };
            component.onRowClick(item);
            expect(component.rowClick.emit).toHaveBeenCalledWith(item);
        });
    });

    describe('Sorting Indicators', () => {
        beforeEach(() => {
            component.data = mockData;
            component.columns = mockColumns;
            fixture.detectChanges();
        });

        it('should return ascending for ascending sort', () => {
            component.currentSort = { column: 'name', direction: 'asc' };
            expect(component.getSortAriaLabel('name')).toBe('ascending');
        });

        it('should return descending for descending sort', () => {
            component.currentSort = { column: 'name', direction: 'desc' };
            expect(component.getSortAriaLabel('name')).toBe('descending');
        });

        it('should return none for unsorted column', () => {
            component.currentSort = { column: '', direction: null };
            expect(component.getSortAriaLabel('name')).toBe('none');
        });
    });

    describe('Track By', () => {
        it('should track by id', () => {
            const item = { id: 123, name: 'Test' };
            expect(component.trackByFn(0, item)).toBe(123);
        });

        it('should track by index if no id', () => {
            const item = { name: 'Test' };
            expect(component.trackByFn(5, item)).toBe(5);
        });
    });

    describe('Change Detection', () => {
        it('should update data on input changes', () => {
            component.data = mockData;
            component.columns = mockColumns;
            component.ngOnChanges({
                data: {
                    currentValue: mockData,
                    previousValue: [],
                    firstChange: true,
                    isFirstChange: () => true
                }
            });
            expect(component.filteredData.length).toBe(4);
        });
    });
});
