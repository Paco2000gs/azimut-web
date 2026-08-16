import React, { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'azimut.shortlist.v1';

const ShortlistContext = createContext({ ids: [], count: 0 });

export const useShortlist = () => useContext(ShortlistContext);

const readStored = () => {
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed.filter(id => id !== null && id !== undefined) : [];
    } catch {
        // Private browsing and blocked storage both throw here. A shortlist that
        // lasts only for this visit beats a page that refuses to render.
        return [];
    }
};

export const ShortlistProvider = ({ children }) => {
    // Read during the first render rather than in an effect, or the header count
    // flashes from zero to its real value on every page load.
    const [ids, setIds] = useState(() => (typeof window === 'undefined' ? [] : readStored()));

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
        } catch {
            // Nothing to recover from: the shortlist still works for this session.
        }
    }, [ids]);

    // A second tab is the same shortlist, not a competing one.
    useEffect(() => {
        const onStorage = (event) => {
            if (event.key === STORAGE_KEY) setIds(readStored());
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const has = (id) => ids.some(saved => String(saved) === String(id));
    const toggle = (id) => setIds(prev => (
        prev.some(saved => String(saved) === String(id))
            ? prev.filter(saved => String(saved) !== String(id))
            : [...prev, id]
    ));
    const remove = (id) => setIds(prev => prev.filter(saved => String(saved) !== String(id)));
    const clear = () => setIds([]);

    return (
        <ShortlistContext.Provider value={{ ids, count: ids.length, has, toggle, remove, clear }}>
            {children}
        </ShortlistContext.Provider>
    );
};
