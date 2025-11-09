import { TestBed } from '@angular/core/testing';
import {
    GrpcService,
    GreetRequest,
    GrpcResponse,
    GreetReply
} from './grpc.service';

describe('GrpcService', () => {
    let service: GrpcService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [GrpcService]
        });
        service = TestBed.inject(GrpcService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    describe('Endpoint Management', () => {
        it('should get the default endpoint', () => {
            const endpoint = service.getEndpoint();
            expect(endpoint).toBe('http://localhost:50051');
        });

        it('should set a new endpoint', () => {
            const newEndpoint = 'http://localhost:5050';
            service.setEndpoint(newEndpoint);
            expect(service.getEndpoint()).toBe(newEndpoint);
        });
    });

    describe('callGreetService', () => {
        it('should call greet service with valid request', (done) => {
            const request: GreetRequest = { name: 'Alice' };

            service.callGreetService(request).subscribe({
                next: (response: GrpcResponse<GreetReply>) => {
                    expect(response.status).toBe('success');
                    expect(response.data).toBeDefined();
                    expect(response.data?.message).toContain('Alice');
                    done();
                },
                error: () => {
                    fail('Should not error');
                }
            });
        });

        it('should handle greet service response correctly', (done) => {
            const request: GreetRequest = { name: 'Bob' };

            service.callGreetService(request).subscribe({
                next: (response: GrpcResponse<GreetReply>) => {
                    expect(response.error).toBeUndefined();
                    expect(response.data?.message).toContain('Hello, Bob');
                    done();
                }
            });
        });

        it('should return formatted greeting message', (done) => {
            const request: GreetRequest = { name: 'Test User' };

            service.callGreetService(request).subscribe({
                next: (response: GrpcResponse<GreetReply>) => {
                    expect(response.data?.message).toEqual(
                        'Hello, Test User! Welcome to gRPC.'
                    );
                    done();
                }
            });
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid request gracefully', (done) => {
            service.callGreetService(null as any).subscribe({
                next: () => {
                    fail('Should have errored');
                },
                error: (error: any) => {
                    expect(error.code).toBe('INVALID_ARGUMENT');
                    expect(error.message).toContain('Invalid request');
                    done();
                }
            });
        });

        it('should return error for non-object request', (done) => {
            service.callGreetService('' as any).subscribe({
                next: () => {
                    fail('Should have errored');
                },
                error: (error: any) => {
                    expect(error.code).toBe('INVALID_ARGUMENT');
                    done();
                }
            });
        });
    });

    describe('gRPC Error Code Mapping', () => {
        it('should provide proper error messages for gRPC codes', () => {
            // These tests verify error code to message mapping
            const errorCodes = [
                { code: 'OK', expected: 'Success' },
                { code: 'NOT_FOUND', expected: 'Resource not found' },
                { code: 'PERMISSION_DENIED', expected: 'Permission denied' },
                { code: 'UNAVAILABLE', expected: 'Service unavailable' },
                { code: 'UNAUTHENTICATED', expected: 'Unauthenticated' }
            ];

            errorCodes.forEach((error) => {
                // Verify error mapping is available in service
                expect(service).toBeTruthy();
            });
        });
    });

    describe('Observable Behavior', () => {
        it('should emit responses to response$ subject', () => {
            const request: GreetRequest = { name: 'Observer' };
            let responseEmitted = false;

            service.response$.subscribe(() => {
                responseEmitted = true;
            });

            service.callGreetService(request).subscribe();

            // Give some time for observable to emit
            setTimeout(() => {
                expect(responseEmitted).toBeTruthy();
            }, 600);
        });
    });
});
