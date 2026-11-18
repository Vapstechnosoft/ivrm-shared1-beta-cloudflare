'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Universal Fail-Safe for Navigation
 * 🛡️ This component ensures that the UI never remains "stuck" or "locked"
 * after a page transition by forcefully resetting body styles.
 */
export function NavigationStability() {
    const pathname = usePathname();

    useEffect(() => {
        // Force-release all potential UI locks on every route change
        if (typeof document !== 'undefined') {
            document.body.style.overflow = '';
            document.body.style.pointerEvents = '';

            // Mark the session as active for this tab so we can detect expiration later
            sessionStorage.setItem('isLoggedIn', 'true');

            // Log for debugging if needed (silent in production)
            // console.log('🛡️ Navigation Stability: UI state reset for', pathname);
        }
    }, [pathname]);

    return null; // Invisible component
}
