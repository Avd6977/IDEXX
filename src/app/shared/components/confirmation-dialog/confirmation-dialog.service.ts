import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {
    ConfirmationDialogComponent,
    ConfirmationDialogData
} from './confirmation-dialog.component';

@Injectable({
    providedIn: 'root'
})
export class ConfirmationDialogService {
    private dialogInstance?: ConfirmationDialogComponent;

    setDialogInstance(instance: ConfirmationDialogComponent): void {
        this.dialogInstance = instance;
    }

    confirm(data: ConfirmationDialogData): Observable<boolean> {
        if (!this.dialogInstance) {
            throw new Error(
                'ConfirmationDialogComponent not registered. Add it to your app component.'
            );
        }
        return this.dialogInstance.show(data);
    }

    // Convenience methods for common dialog types
    confirmDelete(itemName: string = 'this item'): Observable<boolean> {
        return this.confirm({
            title: 'Confirm Deletion',
            message: `Are you sure you want to delete ${itemName}? This action cannot be undone.`,
            confirmText: 'Delete',
            cancelText: 'Cancel',
            type: 'danger'
        });
    }

    confirmUnsavedChanges(): Observable<boolean> {
        return this.confirm({
            title: 'Unsaved Changes',
            message:
                'You have unsaved changes. Do you want to leave without saving?',
            confirmText: 'Leave',
            cancelText: 'Stay',
            type: 'warning'
        });
    }

    confirmAction(title: string, message: string): Observable<boolean> {
        return this.confirm({
            title,
            message,
            confirmText: 'Continue',
            cancelText: 'Cancel',
            type: 'info'
        });
    }
}
