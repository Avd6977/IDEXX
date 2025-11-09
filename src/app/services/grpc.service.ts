import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Example protobuf message types
 * In a real implementation, these would be generated from .proto files using protoc compiler
 */
export interface GreetRequest {
    name: string;
}

export interface GreetReply {
    message: string;
}

export interface GrpcError {
    code: string;
    message: string;
    details?: string;
}

export interface GrpcResponse<T> {
    data?: T;
    error?: GrpcError;
    status: 'success' | 'error';
}

/**
 * gRPC Service for communicating with a gRPC microservice
 *
 * In a production environment:
 * 1. Install @grpc/grpc-js and @grpc/proto-loader
 * 2. Generate TypeScript code from .proto files using protoc compiler
 * 3. Import generated service client and message types
 * 4. Use gRPC methods directly via the generated client
 *
 * This implementation demonstrates the pattern using a mock gRPC endpoint
 */
@Injectable({
    providedIn: 'root'
})
export class GrpcService {
    // In production, this would be your actual gRPC service endpoint
    private grpcEndpoint = 'http://localhost:50051';
    private responseSubject = new Subject<GrpcResponse<any>>();
    public response$ = this.responseSubject.asObservable();

    constructor() {}

    /**
     * Example: Call a gRPC service method
     * This demonstrates the pattern for calling unary RPC methods
     */
    callGreetService(
        request: GreetRequest
    ): Observable<GrpcResponse<GreetReply>> {
        return this.performGrpcCall<GreetReply>(
            'helloworld.Greeter/SayHello',
            request
        );
    }

    /**
     * Generic method to perform gRPC calls
     * In production, this would use the generated gRPC client
     */
    private performGrpcCall<T>(
        servicePath: string,
        request: any
    ): Observable<GrpcResponse<T>> {
        try {
            // Validate request
            if (!request || typeof request !== 'object') {
                return throwError(() => ({
                    code: 'INVALID_ARGUMENT',
                    message: 'Invalid request object'
                }));
            }

            // In production, you would use the generated gRPC client:
            // const client = new ServiceClient(this.grpcEndpoint);
            // return client.methodName(request).pipe(
            //     map(response => ({
            //         data: response,
            //         status: 'success'
            //     })),
            //     catchError(error => this.handleGrpcError(error))
            // );

            // Demo: Simulate gRPC call with mock data
            const mockResponse = this.getMockResponse<T>(servicePath, request);
            return new Observable((observer) => {
                setTimeout(() => {
                    observer.next(mockResponse);
                    observer.complete();
                }, 500); // Simulate network delay
            });
        } catch (error) {
            return throwError(() => this.handleGrpcError(error));
        }
    }

    /**
     * Handle gRPC specific errors
     */
    private handleGrpcError(error: any): GrpcResponse<any> {
        let grpcError: GrpcError = {
            code: 'UNKNOWN',
            message: 'An unknown error occurred',
            details: undefined
        };

        if (error?.code) {
            grpcError.code = error.code;
            grpcError.message =
                error.message || this.getGrpcErrorMessage(error.code);
            grpcError.details = error.details;
        } else if (error instanceof Error) {
            grpcError.message = error.message;
        }

        return {
            error: grpcError,
            status: 'error'
        };
    }

    /**
     * Map gRPC error codes to user-friendly messages
     */
    private getGrpcErrorMessage(code: string): string {
        const grpcErrorMessages: { [key: string]: string } = {
            OK: 'Success',
            CANCELLED: 'Operation was cancelled',
            UNKNOWN: 'Unknown error',
            INVALID_ARGUMENT: 'Invalid argument provided',
            DEADLINE_EXCEEDED: 'Operation deadline exceeded',
            NOT_FOUND: 'Resource not found',
            ALREADY_EXISTS: 'Resource already exists',
            PERMISSION_DENIED: 'Permission denied',
            RESOURCE_EXHAUSTED: 'Resource exhausted',
            FAILED_PRECONDITION: 'Failed precondition',
            ABORTED: 'Operation aborted',
            OUT_OF_RANGE: 'Out of range',
            UNIMPLEMENTED: 'Method not implemented',
            INTERNAL: 'Internal server error',
            UNAVAILABLE: 'Service unavailable',
            DATA_LOSS: 'Data loss',
            UNAUTHENTICATED: 'Unauthenticated'
        };
        return grpcErrorMessages[code] || 'Unknown gRPC error';
    }

    /**
     * Mock response generation for demo purposes
     */
    private getMockResponse<T>(
        servicePath: string,
        request: any
    ): GrpcResponse<T> {
        if (servicePath === 'helloworld.Greeter/SayHello') {
            const greetRequest = request as GreetRequest;
            return {
                data: {
                    message: `Hello, ${greetRequest.name}! Welcome to gRPC.`
                } as unknown as T,
                status: 'success'
            };
        }

        return {
            error: {
                code: 'UNIMPLEMENTED',
                message: `Service ${servicePath} not implemented`
            },
            status: 'error'
        };
    }

    /**
     * Get the current gRPC endpoint
     */
    getEndpoint(): string {
        return this.grpcEndpoint;
    }

    /**
     * Set the gRPC endpoint (useful for configuration)
     */
    setEndpoint(endpoint: string): void {
        this.grpcEndpoint = endpoint;
    }
}
