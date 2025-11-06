import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type LoaderSize = 'small' | 'medium' | 'large';
export type LoaderColor =
    | 'primary'
    | 'secondary'
    | 'success'
    | 'warning'
    | 'danger';

@Component({
    selector: 'app-loader',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './loader.component.html',
    styleUrls: ['./loader.component.scss']
})
export class LoaderComponent {
    @Input() size: LoaderSize = 'medium';
    @Input() color: LoaderColor = 'primary';
    @Input() message: string = '';
    @Input() overlay: boolean = false;

    getLoaderClasses(): string {
        return `${this.size} ${this.color}`;
    }
}
