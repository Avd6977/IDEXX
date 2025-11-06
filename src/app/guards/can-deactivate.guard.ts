import { CanDeactivateFn } from '@angular/router';

export interface CanComponentDeactivate {
    canDeactivate: () => boolean | Promise<boolean>;
}

export const canDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (
    component
) => {
    if (component && component.canDeactivate) {
        return component.canDeactivate();
    }
    return true;
};
