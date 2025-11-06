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
    template: `
        <div class="webpage-form-container">
            <h2>Add New Webpage</h2>

            <form
                [formGroup]="webpageForm"
                (ngSubmit)="onSubmit()"
                class="webpage-form"
            >
                <div class="form-group">
                    <label for="url">URL *</label>
                    <input
                        type="url"
                        id="url"
                        formControlName="url"
                        class="form-control"
                        [class.is-invalid]="url?.invalid && url?.touched"
                        placeholder="https://example.com"
                    />

                    <div
                        class="invalid-feedback"
                        *ngIf="url?.invalid && url?.touched"
                    >
                        <div *ngIf="url?.errors?.['required']">
                            URL is required
                        </div>
                        <div *ngIf="url?.errors?.['pattern']">
                            Please enter a valid URL
                        </div>
                    </div>
                </div>

                <div class="form-group">
                    <label for="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        formControlName="title"
                        class="form-control"
                        placeholder="Website title"
                    />
                </div>

                <div class="form-group">
                    <label for="description">Description</label>
                    <textarea
                        id="description"
                        formControlName="description"
                        class="form-control"
                        rows="3"
                        placeholder="Brief description of the website"
                    ></textarea>
                </div>

                <div class="form-actions">
                    <button
                        type="submit"
                        class="btn btn-primary"
                        [disabled]="webpageForm.invalid || isLoading"
                    >
                        <span *ngIf="isLoading" class="loading-spinner"></span>
                        {{ isLoading ? 'Saving...' : 'Save Webpage' }}
                    </button>

                    <button
                        type="button"
                        class="btn btn-secondary"
                        (click)="resetForm()"
                    >
                        Reset
                    </button>
                </div>
            </form>

            <div class="form-status" *ngIf="formStatus">
                <div
                    class="alert"
                    [class.alert-success]="formStatus.type === 'success'"
                    [class.alert-error]="formStatus.type === 'error'"
                >
                    {{ formStatus.message }}
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            .webpage-form-container {
                padding: 2rem;
                max-width: 600px;
                margin: 0 auto;
            }

            .webpage-form {
                background: white;
                padding: 2rem;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
            }

            .form-group {
                margin-bottom: 1.5rem;

                label {
                    display: block;
                    margin-bottom: 0.5rem;
                    font-weight: 500;
                    color: #374151;
                }
            }

            .form-control {
                width: 100%;
                padding: 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 4px;
                font-size: 1rem;
                transition: border-color 0.2s ease;

                &:focus {
                    outline: none;
                    border-color: #3b82f6;
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }

                &.is-invalid {
                    border-color: #ef4444;
                }
            }

            .invalid-feedback {
                color: #ef4444;
                font-size: 0.875rem;
                margin-top: 0.25rem;
            }

            .form-actions {
                display: flex;
                gap: 1rem;
                margin-top: 2rem;
            }

            .btn {
                padding: 0.75rem 1.5rem;
                border: none;
                border-radius: 4px;
                font-size: 1rem;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                align-items: center;
                gap: 0.5rem;

                &:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
            }

            .btn-primary {
                background: #3b82f6;
                color: white;

                &:hover:not(:disabled) {
                    background: #2563eb;
                }
            }

            .btn-secondary {
                background: #6b7280;
                color: white;

                &:hover {
                    background: #4b5563;
                }
            }

            .loading-spinner {
                width: 16px;
                height: 16px;
                border: 2px solid transparent;
                border-top: 2px solid currentColor;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            @keyframes spin {
                0% {
                    transform: rotate(0deg);
                }
                100% {
                    transform: rotate(360deg);
                }
            }

            .form-status {
                margin-top: 1rem;
            }

            .alert {
                padding: 1rem;
                border-radius: 4px;
                margin-bottom: 1rem;
            }

            .alert-success {
                background: #d1fae5;
                color: #065f46;
                border: 1px solid #a7f3d0;
            }

            .alert-error {
                background: #fee2e2;
                color: #991b1b;
                border: 1px solid #fca5a5;
            }
        `
    ]
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
