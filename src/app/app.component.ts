import { Component } from '@angular/core';
import { WebpageLoaderComponent } from './components/webpage-loader/webpage-loader.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [WebpageLoaderComponent],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'Angular Webpage Loader with NgRx';
}
