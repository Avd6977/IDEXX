import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, Observable } from 'rxjs';

export interface ConfirmationDialogData {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    type?: 'danger' | 'warning' | 'info';
}

// Simple dialog implementation without Angular CDK for interview purposes
@Component({
    selector: 'app-confirmation-dialog',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './confirmation-dialog.component.html',
    styleUrls: ['./confirmation-dialog.component.scss']
})
export class ConfirmationDialogComponent {
    isVisible = false;
    data: ConfirmationDialogData = {
        title: '',
        message: '',
        type: 'info'
    };

    private resultSubject = new Subject<boolean>();

    show(data: ConfirmationDialogData): Observable<boolean> {
        this.data = data;
        this.isVisible = true;
        this.resultSubject = new Subject<boolean>();

        return this.resultSubject.asObservable();
    }

    onConfirm(): void {
        this.close(true);
    }

    onCancel(): void {
        this.close(false);
    }

    onOverlayClick(): void {
        this.close(false);
    }

    private close(result: boolean): void {
        this.isVisible = false;
        this.resultSubject.next(result);
        this.resultSubject.complete();
    }

    getDialogClass(): string {
        return this.data.type || 'info';
    }

    getConfirmButtonClass(): string {
        switch (this.data.type) {
            case 'danger':
                return 'btn-danger';
            case 'warning':
                return 'btn-warning';
            default:
                return 'btn-primary';
        }
    }
}
