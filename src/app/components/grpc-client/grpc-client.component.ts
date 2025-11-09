import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators
} from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
    GrpcService,
    GrpcResponse,
    GreetRequest
} from 'src/app/services/grpc.service';

@Component({
    selector: 'app-grpc-client',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './grpc-client.component.html',
    styleUrls: ['./grpc-client.component.scss']
})
export class GrpcClientComponent implements OnInit, OnDestroy {
    requestForm!: FormGroup;
    isLoading = false;
    requestError: string | null = null;
    callStatus: { type: 'success' | 'error'; message: string } | null = null;
    responseData: any = null;
    grpcEndpoint: string = '';

    private destroy$ = new Subject<void>();

    constructor(
        private formBuilder: FormBuilder,
        private grpcService: GrpcService
    ) {}

    ngOnInit(): void {
        this.initializeForm();
        this.grpcEndpoint = this.grpcService.getEndpoint();
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }

    private initializeForm(): void {
        this.requestForm = this.formBuilder.group({
            serviceName: ['helloworld.Greeter/SayHello', [Validators.required]],
            requestData: [
                JSON.stringify({ name: 'Angular Developer' }),
                [Validators.required, this.jsonValidator]
            ]
        });
    }

    /**
     * Custom validator for JSON input
     */
    private jsonValidator(control: any) {
        try {
            JSON.parse(control.value);
            return null;
        } catch {
            return { invalidJson: true };
        }
    }

    /**
     * Send gRPC request
     */
    sendRequest(): void {
        if (!this.requestForm.valid) {
            this.requestError =
                'Please fill in all required fields with valid data';
            return;
        }

        this.isLoading = true;
        this.requestError = null;
        this.callStatus = null;

        try {
            const serviceName = this.requestForm.value.serviceName;
            const requestData = JSON.parse(this.requestForm.value.requestData);

            // Call the appropriate service method based on selection
            let serviceCall$;
            if (serviceName === 'helloworld.Greeter/SayHello') {
                serviceCall$ = this.grpcService.callGreetService(
                    requestData as GreetRequest
                );
            } else {
                throw new Error(`Unknown service: ${serviceName}`);
            }

            serviceCall$.pipe(takeUntil(this.destroy$)).subscribe({
                next: (response: GrpcResponse<any>) => {
                    this.isLoading = false;
                    this.handleResponse(response);
                },
                error: (error: any) => {
                    this.isLoading = false;
                    this.callStatus = {
                        type: 'error',
                        message: `Error: ${
                            error.message || 'Unknown error occurred'
                        }`
                    };
                }
            });
        } catch (error) {
            this.isLoading = false;
            this.callStatus = {
                type: 'error',
                message: `Error: ${(error as Error).message}`
            };
        }
    }

    /**
     * Handle gRPC response
     */
    private handleResponse(response: GrpcResponse<any>): void {
        if (response.status === 'success' && response.data) {
            this.callStatus = {
                type: 'success',
                message: 'gRPC call completed successfully'
            };
            this.responseData = response.data;
        } else if (response.error) {
            this.callStatus = {
                type: 'error',
                message: `${response.error.code}: ${response.error.message}`
            };
            this.responseData = response.error;
        } else {
            this.callStatus = {
                type: 'error',
                message: 'Unexpected response format'
            };
        }
    }

    /**
     * Clear response data
     */
    clearResponse(): void {
        this.responseData = null;
        this.callStatus = null;
        this.requestError = null;
    }

    /**
     * Get form control for template
     */
    get serviceName() {
        return this.requestForm.get('serviceName');
    }

    get requestDataControl() {
        return this.requestForm.get('requestData');
    }
}
