import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    persistent?: boolean;
    timestamp: Date;
}

@Injectable({
    providedIn: 'root'
})
export class NotificationService {
    private notificationsSubject = new BehaviorSubject<Notification[]>([]);
    public notifications$: Observable<Notification[]> =
        this.notificationsSubject.asObservable();

    private defaultDuration = 5000; // 5 seconds

    show(notification: Omit<Notification, 'id' | 'timestamp'>): string {
        const id = this.generateId();
        const newNotification: Notification = {
            ...notification,
            id,
            timestamp: new Date(),
            duration: notification.duration ?? this.defaultDuration
        };

        const currentNotifications = this.notificationsSubject.value;
        this.notificationsSubject.next([
            ...currentNotifications,
            newNotification
        ]);

        // Auto-remove notification if not persistent
        if (!newNotification.persistent) {
            setTimeout(() => {
                this.remove(id);
            }, newNotification.duration);
        }

        return id;
    }

    success(
        title: string,
        message?: string,
        options?: Partial<Notification>
    ): string {
        return this.show({
            type: 'success',
            title,
            message,
            ...options
        });
    }

    error(
        title: string,
        message?: string,
        options?: Partial<Notification>
    ): string {
        return this.show({
            type: 'error',
            title,
            message,
            persistent: true, // Errors should be persistent by default
            ...options
        });
    }

    warning(
        title: string,
        message?: string,
        options?: Partial<Notification>
    ): string {
        return this.show({
            type: 'warning',
            title,
            message,
            duration: 7000, // Warnings last longer
            ...options
        });
    }

    info(
        title: string,
        message?: string,
        options?: Partial<Notification>
    ): string {
        return this.show({
            type: 'info',
            title,
            message,
            ...options
        });
    }

    remove(id: string): void {
        const currentNotifications = this.notificationsSubject.value;
        const filteredNotifications = currentNotifications.filter(
            (n) => n.id !== id
        );
        this.notificationsSubject.next(filteredNotifications);
    }

    clear(): void {
        this.notificationsSubject.next([]);
    }

    private generateId(): string {
        return `notification_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
    }
}
