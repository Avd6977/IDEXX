import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService, Notification } from './notification.service';

@Component({
    selector: 'app-notification-container',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './notification-container.component.html',
    styleUrls: ['./notification-container.component.scss']
})
export class NotificationContainerComponent implements OnInit, OnDestroy {
    notifications: Notification[] = [];
    private subscription?: Subscription;

    constructor(private notificationService: NotificationService) {}

    ngOnInit(): void {
        this.subscription = this.notificationService.notifications$.subscribe(
            (notifications) => {
                this.notifications = notifications;
            }
        );
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    closeNotification(id: string): void {
        this.notificationService.remove(id);
    }

    getNotificationClass(notification: Notification): string {
        return `notification-${notification.type}`;
    }

    getIcon(type: string): string {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type as keyof typeof icons] || icons.info;
    }

    formatTime(date: Date): string {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);

        if (seconds < 60) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;

        return date.toLocaleDateString();
    }

    trackById(index: number, notification: Notification): string {
        return notification.id;
    }
}
