export interface TableColumn {
    key: string;
    label: string;
    sortable?: boolean;
    type?: 'text' | 'date' | 'url' | 'number' | 'action';
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
