import {
    ComponentFixture,
    TestBed,
    fakeAsync,
    tick
} from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { GrpcClientComponent } from './grpc-client.component';
import {
    GrpcService,
    GrpcResponse,
    GreetReply
} from 'src/app/services/grpc.service';

describe('GrpcClientComponent', () => {
    let component: GrpcClientComponent;
    let fixture: ComponentFixture<GrpcClientComponent>;
    let mockGrpcService: jasmine.SpyObj<GrpcService>;

    beforeEach(async () => {
        const spy = jasmine.createSpyObj('GrpcService', [
            'callGreetService',
            'getEndpoint',
            'setEndpoint'
        ]);

        await TestBed.configureTestingModule({
            imports: [GrpcClientComponent, ReactiveFormsModule],
            providers: [{ provide: GrpcService, useValue: spy }]
        }).compileComponents();

        fixture = TestBed.createComponent(GrpcClientComponent);
        component = fixture.componentInstance;
        mockGrpcService = TestBed.inject(
            GrpcService
        ) as jasmine.SpyObj<GrpcService>;
        mockGrpcService.getEndpoint.and.returnValue('http://localhost:50051');

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    describe('Form Initialization', () => {
        it('should initialize form with default values', () => {
            expect(component.requestForm.get('serviceName')?.value).toBe(
                'helloworld.Greeter/SayHello'
            );
            expect(component.requestForm.get('requestData')?.value).toContain(
                'Angular Developer'
            );
        });

        it('should have valid form on init', () => {
            expect(component.requestForm.valid).toBeTruthy();
        });

        it('should set grpc endpoint from service', () => {
            expect(component.grpcEndpoint).toBe('http://localhost:50051');
            expect(mockGrpcService.getEndpoint).toHaveBeenCalled();
        });
    });

    describe('Request Validation', () => {
        it('should validate JSON input', () => {
            const requestControl = component.requestForm.get('requestData');

            // Valid JSON
            requestControl?.setValue('{"name": "test"}');
            expect(requestControl?.hasError('invalidJson')).toBeFalsy();

            // Invalid JSON
            requestControl?.setValue('{invalid json}');
            expect(requestControl?.hasError('invalidJson')).toBeTruthy();
        });

        it('should require service name', () => {
            component.requestForm.get('serviceName')?.setValue('');
            expect(
                component.requestForm.get('serviceName')?.hasError('required')
            ).toBeTruthy();
        });

        it('should require request data', () => {
            component.requestForm.get('requestData')?.setValue('');
            expect(
                component.requestForm.get('requestData')?.hasError('required')
            ).toBeTruthy();
        });
    });

    describe('Send Request', () => {
        it('should call grpc service on valid submit', fakeAsync(() => {
            const mockResponse: GrpcResponse<GreetReply> = {
                status: 'success',
                data: { message: 'Hello, Test!' }
            };
            mockGrpcService.callGreetService.and.returnValue(of(mockResponse));

            component.requestForm.patchValue({
                serviceName: 'helloworld.Greeter/SayHello',
                requestData: '{"name": "Test"}'
            });

            component.sendRequest();
            tick();

            expect(mockGrpcService.callGreetService).toHaveBeenCalledWith({
                name: 'Test'
            });
        }));

        it('should set loading state during request', fakeAsync(() => {
            const mockResponse: GrpcResponse<GreetReply> = {
                status: 'success',
                data: { message: 'Hello, Test!' }
            };
            mockGrpcService.callGreetService.and.returnValue(
                of(mockResponse).pipe(delay(100))
            );

            component.requestForm.patchValue({
                serviceName: 'helloworld.Greeter/SayHello',
                requestData: '{"name": "Test"}'
            });

            component.sendRequest();
            expect(component.isLoading).toBeTruthy();

            tick(100);
            expect(component.isLoading).toBeFalsy();
        }));

        it('should display success response', fakeAsync(() => {
            const mockResponse: GrpcResponse<GreetReply> = {
                status: 'success',
                data: { message: 'Hello, User!' }
            };
            mockGrpcService.callGreetService.and.returnValue(of(mockResponse));

            component.requestForm.patchValue({
                serviceName: 'helloworld.Greeter/SayHello',
                requestData: '{"name": "User"}'
            });

            component.sendRequest();
            tick();

            expect(component.callStatus?.type).toBe('success');
            expect(component.responseData).toEqual({ message: 'Hello, User!' });
        }));

        it('should handle error response', fakeAsync(() => {
            const mockResponse: GrpcResponse<any> = {
                status: 'error',
                error: {
                    code: 'NOT_FOUND',
                    message: 'Service not found'
                }
            };
            mockGrpcService.callGreetService.and.returnValue(of(mockResponse));

            component.requestForm.patchValue({
                serviceName: 'helloworld.Greeter/SayHello',
                requestData: '{"name": "Test"}'
            });

            component.sendRequest();
            tick();

            expect(component.callStatus?.type).toBe('error');
            expect(component.callStatus?.message).toContain('NOT_FOUND');
        }));

        it('should handle request error', fakeAsync(() => {
            const error = new Error('Network error');
            mockGrpcService.callGreetService.and.returnValue(
                throwError(() => error)
            );

            component.requestForm.patchValue({
                serviceName: 'helloworld.Greeter/SayHello',
                requestData: '{"name": "Test"}'
            });

            component.sendRequest();
            tick();

            expect(component.callStatus?.type).toBe('error');
            expect(component.callStatus?.message).toContain('Network error');
            expect(component.isLoading).toBeFalsy();
        }));

        it('should show error for invalid form', () => {
            component.requestForm.patchValue({
                serviceName: '',
                requestData: ''
            });

            component.sendRequest();

            expect(component.requestError).toBeTruthy();
            expect(component.requestError).toContain(
                'Please fill in all required fields'
            );
        });

        it('should show error for invalid JSON', () => {
            component.requestForm.patchValue({
                serviceName: 'helloworld.Greeter/SayHello',
                requestData: '{invalid}'
            });

            component.sendRequest();

            expect(component.requestError).toBeTruthy();
        });
    });

    describe('Clear Response', () => {
        it('should clear response data', () => {
            component.responseData = { test: 'data' };
            component.callStatus = { type: 'success', message: 'Test' };
            component.requestError = 'Test error';

            component.clearResponse();

            expect(component.responseData).toBeNull();
            expect(component.callStatus).toBeNull();
            expect(component.requestError).toBeNull();
        });
    });

    describe('Lifecycle', () => {
        it('should unsubscribe on destroy', () => {
            spyOn(component['destroy$'], 'next');
            spyOn(component['destroy$'], 'complete');

            component.ngOnDestroy();

            expect(component['destroy$'].next).toHaveBeenCalled();
            expect(component['destroy$'].complete).toHaveBeenCalled();
        });
    });
});
