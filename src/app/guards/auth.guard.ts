import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
    const router = inject(Router);

    // Example authentication logic
    // For demo purposes, always allow access
    // Replace this with your actual authentication check
    const isAuthenticated = true; // localStorage.getItem('isAuthenticated') === 'true';

    if (isAuthenticated) {
        return true;
    } else {
        // Redirect to login or show unauthorized message
        console.warn('Access denied. User not authenticated.');
        // router.navigate(['/login']);
        return false;
    }
};
