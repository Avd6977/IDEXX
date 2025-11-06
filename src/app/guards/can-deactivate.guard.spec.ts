import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {
    canDeactivateGuard,
    CanComponentDeactivate
} from 'src/app/guards/can-deactivate.guard';

// Mock component that implements CanComponentDeactivate
class MockComponent implements CanComponentDeactivate {
    private shouldDeactivate = true;

    canDeactivate(): boolean {
        return this.shouldDeactivate;
    }

    setShouldDeactivate(value: boolean): void {
        this.shouldDeactivate = value;
    }
}

// Mock component that returns a Promise
class MockAsyncComponent implements CanComponentDeactivate {
    private shouldDeactivate = true;

    canDeactivate(): Promise<boolean> {
        return Promise.resolve(this.shouldDeactivate);
    }

    setShouldDeactivate(value: boolean): void {
        this.shouldDeactivate = value;
    }
}

// Component without canDeactivate method
class ComponentWithoutDeactivate {
    someMethod() {
        return 'test';
    }
}

describe('canDeactivateGuard', () => {
    let mockRoute: ActivatedRouteSnapshot;
    let mockState: RouterStateSnapshot;
    let mockNextState: RouterStateSnapshot;

    beforeEach(() => {
        TestBed.configureTestingModule({});

        // Create mock route and state objects
        mockRoute = {} as ActivatedRouteSnapshot;
        mockState = { url: '/current' } as RouterStateSnapshot;
        mockNextState = { url: '/next' } as RouterStateSnapshot;
    });

    it('should allow deactivation when component canDeactivate returns true', () => {
        const mockComponent = new MockComponent();
        mockComponent.setShouldDeactivate(true);

        const result = TestBed.runInInjectionContext(() =>
            canDeactivateGuard(
                mockComponent,
                mockRoute,
                mockState,
                mockNextState
            )
        );

        expect(result).toBe(true);
    });

    it('should prevent deactivation when component canDeactivate returns false', () => {
        const mockComponent = new MockComponent();
        mockComponent.setShouldDeactivate(false);

        const result = TestBed.runInInjectionContext(() =>
            canDeactivateGuard(
                mockComponent,
                mockRoute,
                mockState,
                mockNextState
            )
        );

        expect(result).toBe(false);
    });

    it('should handle async canDeactivate that resolves to true', async () => {
        const mockComponent = new MockAsyncComponent();
        mockComponent.setShouldDeactivate(true);

        const result = TestBed.runInInjectionContext(() =>
            canDeactivateGuard(
                mockComponent,
                mockRoute,
                mockState,
                mockNextState
            )
        );

        expect(result).toBeInstanceOf(Promise);
        const resolvedResult = await result;
        expect(resolvedResult).toBe(true);
    });

    it('should handle async canDeactivate that resolves to false', async () => {
        const mockComponent = new MockAsyncComponent();
        mockComponent.setShouldDeactivate(false);

        const result = TestBed.runInInjectionContext(() =>
            canDeactivateGuard(
                mockComponent,
                mockRoute,
                mockState,
                mockNextState
            )
        );

        expect(result).toBeInstanceOf(Promise);
        const resolvedResult = await result;
        expect(resolvedResult).toBe(false);
    });

    it('should return true when component does not have canDeactivate method', () => {
        const componentWithoutDeactivate = new ComponentWithoutDeactivate();

        const result = TestBed.runInInjectionContext(() =>
            canDeactivateGuard(
                componentWithoutDeactivate as any,
                mockRoute,
                mockState,
                mockNextState
            )
        );

        expect(result).toBe(true);
    });

    it('should return true when component is null', () => {
        const result = TestBed.runInInjectionContext(() =>
            canDeactivateGuard(null as any, mockRoute, mockState, mockNextState)
        );

        expect(result).toBe(true);
    });

    it('should return true when component is undefined', () => {
        const result = TestBed.runInInjectionContext(() =>
            canDeactivateGuard(
                undefined as any,
                mockRoute,
                mockState,
                mockNextState
            )
        );

        expect(result).toBe(true);
    });

    it('should handle component with canDeactivate method that throws error', () => {
        const errorComponent = {
            canDeactivate: () => {
                throw new Error('Something went wrong');
            }
        };

        expect(() => {
            TestBed.runInInjectionContext(() =>
                canDeactivateGuard(
                    errorComponent,
                    mockRoute,
                    mockState,
                    mockNextState
                )
            );
        }).toThrowError('Something went wrong');
    });

    it('should handle component with canDeactivate returning Promise that rejects', async () => {
        const rejectingComponent = {
            canDeactivate: () => {
                return Promise.reject(new Error('Async error'));
            }
        };

        try {
            const result = TestBed.runInInjectionContext(() =>
                canDeactivateGuard(
                    rejectingComponent,
                    mockRoute,
                    mockState,
                    mockNextState
                )
            );
            await result;
            fail('Should have thrown an error');
        } catch (error: any) {
            expect(error.message).toBe('Async error');
        }
    });

    it('should work with different component types', () => {
        // Test with object literal
        const objectComponent = {
            canDeactivate: () => true
        };

        let result = TestBed.runInInjectionContext(() =>
            canDeactivateGuard(
                objectComponent,
                mockRoute,
                mockState,
                mockNextState
            )
        );
        expect(result).toBe(true);

        // Test with class instance
        const classComponent = new MockComponent();
        result = TestBed.runInInjectionContext(() =>
            canDeactivateGuard(
                classComponent,
                mockRoute,
                mockState,
                mockNextState
            )
        );
        expect(result).toBe(true);
    });

    it('should handle edge case where canDeactivate is not a function', () => {
        const malformedComponent = {
            canDeactivate: 'not a function' as any
        };

        expect(() => {
            TestBed.runInInjectionContext(() =>
                canDeactivateGuard(
                    malformedComponent,
                    mockRoute,
                    mockState,
                    mockNextState
                )
            );
        }).toThrow();
    });

    it('should preserve the return type of canDeactivate', () => {
        // Test boolean return
        const booleanComponent = new MockComponent();
        const booleanResult = TestBed.runInInjectionContext(() =>
            canDeactivateGuard(
                booleanComponent,
                mockRoute,
                mockState,
                mockNextState
            )
        );
        expect(typeof booleanResult).toBe('boolean');

        // Test Promise return
        const promiseComponent = new MockAsyncComponent();
        const promiseResult = TestBed.runInInjectionContext(() =>
            canDeactivateGuard(
                promiseComponent,
                mockRoute,
                mockState,
                mockNextState
            )
        );
        expect(promiseResult).toBeInstanceOf(Promise);
    });

    it('should handle component with canDeactivate returning truthy values', () => {
        const truthyComponent = {
            canDeactivate: () => true // return boolean instead
        };

        const result = TestBed.runInInjectionContext(() =>
            canDeactivateGuard(
                truthyComponent,
                mockRoute,
                mockState,
                mockNextState
            )
        );

        expect(result).toBe(true);
    });

    it('should call canDeactivate method only once', () => {
        const spyComponent = {
            canDeactivate: jasmine
                .createSpy('canDeactivate')
                .and.returnValue(true)
        };

        TestBed.runInInjectionContext(() =>
            canDeactivateGuard(
                spyComponent,
                mockRoute,
                mockState,
                mockNextState
            )
        );

        expect(spyComponent.canDeactivate).toHaveBeenCalledTimes(1);
    });

    it('should handle rapid successive calls', () => {
        const mockComponent = new MockComponent();

        const results = [];
        for (let i = 0; i < 5; i++) {
            const result = TestBed.runInInjectionContext(() =>
                canDeactivateGuard(
                    mockComponent,
                    mockRoute,
                    mockState,
                    mockNextState
                )
            );
            results.push(result);
        }

        expect(results.every((result) => result === true)).toBe(true);
    });

    it('should work regardless of route parameters', () => {
        const mockComponent = new MockComponent();

        // Test with different route snapshots
        const routeWithParams = {
            params: { id: '123' }
        } as unknown as ActivatedRouteSnapshot;
        const routeWithQuery = {
            queryParams: { filter: 'active' }
        } as unknown as ActivatedRouteSnapshot;

        let result = TestBed.runInInjectionContext(() =>
            canDeactivateGuard(
                mockComponent,
                routeWithParams,
                mockState,
                mockNextState
            )
        );
        expect(result).toBe(true);

        result = TestBed.runInInjectionContext(() =>
            canDeactivateGuard(
                mockComponent,
                routeWithQuery,
                mockState,
                mockNextState
            )
        );
        expect(result).toBe(true);
    });

    it('should work regardless of state URLs', () => {
        const mockComponent = new MockComponent();

        // Test with different state URLs
        const currentState = { url: '/dashboard' } as RouterStateSnapshot;
        const nextState = { url: '/profile' } as RouterStateSnapshot;

        const result = TestBed.runInInjectionContext(() =>
            canDeactivateGuard(
                mockComponent,
                mockRoute,
                currentState,
                nextState
            )
        );

        expect(result).toBe(true);
    });

    it('should handle component that modifies state during canDeactivate', () => {
        let callCount = 0;
        const statefulComponent = {
            canDeactivate: () => {
                callCount++;
                return callCount <= 1; // First call returns true, subsequent calls false
            }
        };

        const result1 = TestBed.runInInjectionContext(() =>
            canDeactivateGuard(
                statefulComponent,
                mockRoute,
                mockState,
                mockNextState
            )
        );
        expect(result1).toBe(true);

        const result2 = TestBed.runInInjectionContext(() =>
            canDeactivateGuard(
                statefulComponent,
                mockRoute,
                mockState,
                mockNextState
            )
        );
        expect(result2).toBe(false);
    });
});
