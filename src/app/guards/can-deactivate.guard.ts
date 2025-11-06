import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

export interface CanComponentDeactivate {
    canDeactivate: () => boolean | Promise<boolean> | Observable<boolean>;
}

export const canDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (
    component
) => {
    if (component && component.canDeactivate) {
        return component.canDeactivate();
    }
    return true;
};
