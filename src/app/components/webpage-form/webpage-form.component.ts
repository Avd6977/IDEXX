import {
    Component,
    Input,
    OnInit,
    OnChanges,
    SimpleChanges
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { WebpageService } from 'src/app/services/webpage.service';
import { WebpageData } from 'src/app/shared/models/webpage-data.model';
import { Store } from '@ngrx/store';
import { editWebpage } from 'src/app/store/actions/webpage-list.actions';

// Extend dayjs with UTC and timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

@Component({
    selector: 'app-webpage-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './webpage-form.component.html',
    styleUrls: ['./webpage-form.component.scss']
})
export class WebpageFormComponent implements OnInit, OnChanges {
    @Input()
    webpageData?: WebpageData | null;

    webpageForm!: FormGroup;
    isLoading = false;
    formStatus: { type: 'success' | 'error'; message: string } | null = null;
    minDate: string = '';
    imagePreview: string | null = null;
    selectedImageName: string | null = null;
    selectedImageFile: File | null = null;

    constructor(
        private formBuilder: FormBuilder,
        private webpageService: WebpageService,
        private store: Store
    ) {
        this.minDate = this.getTodayDateString();
    }

    ngOnInit(): void {
        this.initializeForm();
        // Set form values if data is already available
        if (this.webpageData) {
            this.setFormValues();
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['webpageData']) {
            if (this.webpageForm) {
                this.setFormValues();
            }
        }
    }

    private initializeForm(): void {
        this.webpageForm = this.formBuilder.group({
            url: [
                '',
                [Validators.required, Validators.pattern(/^https?:\/\/.+/)]
            ],
            title: [''],
            description: [''],
            publishDate: [this.getTodayDateString()]
        });
    }
    private getTodayDateString(): string {
        // Get today's date in the user's local timezone
        const today = dayjs().tz();
        return today.format('YYYY-MM-DD');
    }

    get url() {
        return this.webpageForm.get('url');
    }

    get publishDate() {
        return this.webpageForm.get('publishDate');
    }

    onSubmit(): void {
        if (this.webpageForm.valid) {
            this.isLoading = true;
            this.formStatus = null;

            const webpageData: WebpageData = {
                id: this.webpageData?.id,
                url: this.webpageForm.value.url,
                title: this.webpageForm.value.title || undefined,
                description: this.webpageForm.value.description || undefined,
                createdAt: new Date(
                    this.webpageForm.value.publishDate || undefined
                ),
                imageFile: this.selectedImageFile || undefined
            };

            this.store.dispatch(editWebpage({ webpage: webpageData }));

            // this.webpageService.createWebpage(webpageData).subscribe({
            //     next: (response) => {
            //         this.isLoading = false;
            //         this.formStatus = {
            //             type: 'success',
            //             message: 'Webpage saved successfully!'
            //         };
            //         this.resetForm();
            //     },
            //     error: (error) => {
            //         this.isLoading = false;
            //         this.formStatus = {
            //             type: 'error',
            //             message: `Failed to save webpage: ${error.message}`
            //         };
            //     }
            // });
        } else {
            // Mark all fields as touched to show validation errors
            Object.keys(this.webpageForm.controls).forEach((key) => {
                this.webpageForm.get(key)?.markAsTouched();
            });
        }
    }

    resetForm(): void {
        this.webpageForm.reset();
        this.removeImage();
        this.setFormValues();
        this.formStatus = null;
    }

    setFormValues(): void {
        if (this.webpageData) {
            let publishDateValue = this.getTodayDateString();

            if (this.webpageData.createdAt) {
                // Handle both Date objects and ISO strings
                const createdAt = this.webpageData.createdAt as any;
                if (typeof createdAt === 'string') {
                    publishDateValue = createdAt.split('T')[0];
                } else if (createdAt instanceof Date) {
                    publishDateValue = createdAt.toISOString().split('T')[0];
                }
            }

            this.webpageForm.patchValue({
                url: this.webpageData.url,
                title: this.webpageData.title || '',
                description: this.webpageData.description || '',
                publishDate: publishDateValue
            });
        }
    }

    canDeactivate(): boolean {
        if (this.webpageForm.dirty) {
            return confirm(
                'You have unsaved changes. Do you really want to leave?'
            );
        }
        return true;
    }

    onImageSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        const files = input.files;

        if (files && files.length > 0) {
            const file = files[0];

            if (file.size > 5 * 1024 * 1024) {
                this.formStatus = {
                    type: 'error',
                    message: 'Image size must be less than 5MB'
                };
                return;
            }

            if (!file.type.startsWith('image/')) {
                this.formStatus = {
                    type: 'error',
                    message: 'Please select a valid image file'
                };
                return;
            }

            this.selectedImageFile = file;
            this.selectedImageName = file.name;

            const reader = new FileReader();
            reader.onload = (e) => {
                this.imagePreview = (e.target?.result as string) || null;
            };
            reader.readAsDataURL(file);

            this.formStatus = null;
        }
    }

    removeImage(): void {
        this.selectedImageFile = null;
        this.selectedImageName = null;
        this.imagePreview = null;
    }
}
