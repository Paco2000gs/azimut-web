import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { trackEmailClick } from '../utils/analytics';

// The admin dashboard is staff traffic: 68 views and 30 minutes per user in
// GA4 (23 Aug - 20 Nov 2026) were skewing every engagement figure.
const isAdminPath = (pathname) => pathname === '/admin' || pathname.startsWith('/admin/');

const GTMTracker = () => {
    const location = useLocation();

    useEffect(() => {
        if (isAdminPath(location.pathname)) return;

        // Prepare dataLayer if it doesn't exist (though index.html should create it)
        window.dataLayer = window.dataLayer || [];

        // Push the event
        window.dataLayer.push({
            event: 'page_view',
            page_path: location.pathname + location.search,
            page_title: document.title // Optional but helpful
        });
    }, [location]);

    // One listener for every mailto: link on the site, including ones added
    // later, instead of an onClick on each. Capture phase, so a handler that
    // stops propagation cannot hide the click. Admin mailto links (to leads)
    // are not lead events.
    useEffect(() => {
        const onClick = (event) => {
            const link = event.target.closest?.('a[href^="mailto:"]');
            if (!link || isAdminPath(window.location.pathname)) return;
            trackEmailClick(link.closest('[data-form-name]')?.dataset.formName);
        };
        document.addEventListener('click', onClick, true);
        return () => document.removeEventListener('click', onClick, true);
    }, []);

    return null;
};

export default GTMTracker;
