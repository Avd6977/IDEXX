import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NotificationContainerComponent } from 'src/app/shared/components/notification-container/notification-container.component';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ConfirmationDialogService } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.service';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [
        RouterOutlet,
        RouterLink,
        RouterLinkActive,
        NotificationContainerComponent,
        ConfirmationDialogComponent
    ],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements AfterViewInit {
    title = 'Angular Webpage Loader with NgRx';

    @ViewChild(ConfirmationDialogComponent)
    confirmationDialog!: ConfirmationDialogComponent;

    constructor(private confirmationDialogService: ConfirmationDialogService) {}

    ngAfterViewInit(): void {
        // Register the dialog instance with the service
        this.confirmationDialogService.setDialogInstance(
            this.confirmationDialog
        );
    }
}
