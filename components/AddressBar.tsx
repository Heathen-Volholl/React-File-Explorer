
import React, { useState, useEffect } from 'react';
import { ICONS } from '../constants';

interface AddressBarProps {
    path: string;
    onNavigate: (path: string) => void;
    onHistoryNav: (direction: 'back' | 'forward') => void;
    onNavigateUp: () => void;
    canGoBack: boolean;
    canGoForward: boolean;
    onSearch: (query: string) => void;
    isSearching: boolean;
}

const NavButton: React.FC<{
    onClick: () => void;
    disabled: boolean;
    children: React.ReactNode;
}> = ({ onClick, disabled, children }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="p-1.5 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-explorer-hover"
    >
        {children}
    </button>
);


export const AddressBar: React.FC<AddressBarProps> = ({ path, onNavigate, onHistoryNav, onNavigateUp, canGoBack, canGoForward, onSearch, isSearching }) => {
    const [editPath, setEditPath] = useState(path);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!isSearching) {
            setEditPath(path);
        } else {
            setEditPath('Search Results');
        }
    }, [path, isSearching]);

    const handlePathSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSearching) {
            onNavigate(editPath);
        }
    };
    
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onSearch(searchQuery);
        }
    };

    const pathSegments = path.split('/').filter(p => p);

    return (
        <div className="flex items-center p-1.5 border-b border-explorer-border text-sm select-none">
            <NavButton onClick={() => onHistoryNav('back')} disabled={!canGoBack}>
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
            </NavButton>
            <NavButton onClick={() => onHistoryNav('forward')} disabled={!canGoForward}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </NavButton>
            <NavButton onClick={onNavigateUp} disabled={pathSegments.length <= 1 || isSearching}>
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" /></svg>
            </NavButton>
            <div className="flex-1 ml-2">
                <form onSubmit={handlePathSubmit}>
                    <input
                        type="text"
                        value={editPath}
                        onChange={(e) => setEditPath(e.target.value)}
                        readOnly={isSearching}
                        className="w-full bg-explorer-bg px-2 py-1 rounded-md border border-explorer-border focus:outline-none focus:ring-1 focus:ring-explorer-accent"
                    />
                </form>
            </div>
             <form onSubmit={handleSearchSubmit} className="flex items-center ml-2 relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-explorer-text-secondary">
                    {ICONS.sparkles}
                </div>
                <input 
                    type="search" 
                    placeholder="Semantic Search" 
                    className="bg-explorer-bg pl-8 pr-2 py-1 rounded-md border border-explorer-border focus:outline-none focus:ring-1 focus:ring-explorer-accent w-48"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </form>
        </div>
    );
};
