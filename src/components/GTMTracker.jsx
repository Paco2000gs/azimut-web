import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const GTMTracker = () => {
    const location = useLocation();

    useEffect(() => {
        // Prepare dataLayer if it doesn't exist (though index.html should create it)
        window.dataLayer = window.dataLayer || [];

        // Push the event
        window.dataLayer.push({
            event: 'page_view',
            page_path: location.pathname + location.search,
            page_title: document.title // Optional but helpful
        });
    }, [location]);

    return null;
};

export default GTMTracker;
