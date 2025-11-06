import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import { WebpageService, WebpageData } from 'src/app/services/webpage.service';

@Component({
    selector: 'app-webpage-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './webpage-form.component.html',
    styleUrls: ['./webpage-form.component.scss']
})
export class WebpageFormComponent implements OnInit {
    webpageForm!: FormGroup;
    isLoading = false;
    formStatus: { type: 'success' | 'error'; message: string } | null = null;

    constructor(
        private formBuilder: FormBuilder,
        private webpageService: WebpageService
    ) {}

    ngOnInit(): void {
        this.initializeForm();
    }

    private initializeForm(): void {
        this.webpageForm = this.formBuilder.group({
            url: [
                '',
                [Validators.required, Validators.pattern(/^https?:\/\/.+/)]
            ],
            title: [''],
            description: ['']
        });
    }

    get url() {
        return this.webpageForm.get('url');
    }

    onSubmit(): void {
        if (this.webpageForm.valid) {
            this.isLoading = true;
            this.formStatus = null;

            const webpageData: WebpageData = {
                url: this.webpageForm.value.url,
                title: this.webpageForm.value.title || undefined,
                description: this.webpageForm.value.description || undefined
            };

            this.webpageService.createWebpage(webpageData).subscribe({
                next: (response) => {
                    this.isLoading = false;
                    this.formStatus = {
                        type: 'success',
                        message: 'Webpage saved successfully!'
                    };
                    this.resetForm();
                },
                error: (error) => {
                    this.isLoading = false;
                    this.formStatus = {
                        type: 'error',
                        message: `Failed to save webpage: ${error.message}`
                    };
                }
            });
        } else {
            // Mark all fields as touched to show validation errors
            Object.keys(this.webpageForm.controls).forEach((key) => {
                this.webpageForm.get(key)?.markAsTouched();
            });
        }
    }

    resetForm(): void {
        this.webpageForm.reset();
        this.formStatus = null;
    }

    canDeactivate(): boolean {
        if (this.webpageForm.dirty) {
            return confirm(
                'You have unsaved changes. Do you really want to leave?'
            );
        }
        return true;
    }
}
