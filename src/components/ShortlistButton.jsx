import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import { useShortlist } from '../context/ShortlistContext';
import '../styles/ShortlistButton.css';

/**
 * variant "icon" sits on top of a card that is itself a link;
 * variant "labelled" stands on its own on the property page.
 */
const ShortlistButton = ({ property, variant = 'icon' }) => {
    const { has, toggle } = useShortlist();

    if (!property) return null;

    const saved = has(property.id);
    const label = saved
        ? `Remove ${property.title} from your shortlist`
        : `Save ${property.title} to your shortlist`;

    const handleClick = (event) => {
        // Cards wrap the whole tile in a link, so saving must not navigate.
        event.preventDefault();
        event.stopPropagation();
        toggle(property.id);
    };

    return (
        <button
            type="button"
            className={`shortlist-btn shortlist-btn--${variant}${saved ? ' is-saved' : ''}`}
            onClick={handleClick}
            aria-pressed={saved}
            aria-label={variant === 'icon' ? label : undefined}
        >
            {saved
                ? <BookmarkCheck size={variant === 'icon' ? 18 : 17} aria-hidden="true" />
                : <Bookmark size={variant === 'icon' ? 18 : 17} aria-hidden="true" />}
            {variant === 'labelled' && <span>{saved ? 'Saved to shortlist' : 'Save to shortlist'}</span>}
        </button>
    );
};

export default ShortlistButton;
