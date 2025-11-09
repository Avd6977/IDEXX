import { Injectable } from '@angular/core';
import { Observable, Subject, throwError } from 'rxjs';

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

@Injectable({
    providedIn: 'root'
})
export class GrpcService {
    private grpcEndpoint = 'http://localhost:50051';
    private responseSubject = new Subject<GrpcResponse<any>>();
    public response$ = this.responseSubject.asObservable();

    constructor() {}

    callGreetService(
        request: GreetRequest
    ): Observable<GrpcResponse<GreetReply>> {
        return this.performGrpcCall<GreetReply>(
            'helloworld.Greeter/SayHello',
            request
        );
    }

    private performGrpcCall<T>(
        servicePath: string,
        request: any
    ): Observable<GrpcResponse<T>> {
        try {
            if (!request || typeof request !== 'object') {
                return throwError(() => ({
                    code: 'INVALID_ARGUMENT',
                    message: 'Invalid request object'
                }));
            }

            const mockResponse = this.getMockResponse<T>(servicePath, request);
            return new Observable((observer) => {
                setTimeout(() => {
                    observer.next(mockResponse);
                    observer.complete();
                }, 500);
            });
        } catch (error) {
            return throwError(() => this.handleGrpcError(error));
        }
    }

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

    getEndpoint(): string {
        return this.grpcEndpoint;
    }

    setEndpoint(endpoint: string): void {
        this.grpcEndpoint = endpoint;
    }
}
