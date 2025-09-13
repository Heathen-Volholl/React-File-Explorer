import React, { useState, useEffect } from 'react';
import { useFileSystem } from '../hooks/useFileSystem';

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
    title?: string;
}> = ({ onClick, disabled, children, title }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className="p-1.5 rounded disabled:opacity-30 disabled:cursor-not-allowed hover:bg-explorer-hover"
    >
        {children}
    </button>
);

export const AddressBar: React.FC<AddressBarProps> = ({ 
    path, 
    onNavigate, 
    onHistoryNav, 
    onNavigateUp, 
    canGoBack, 
    canGoForward, 
    onSearch, 
    isSearching 
}) => {
    const [editPath, setEditPath] = useState(path);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditingPath, setIsEditingPath] = useState(false);
    const { isElectron } = useFileSystem();

    useEffect(() => {
        if (!isSearching) {
            setEditPath(path);
            setIsEditingPath(false);
        } else {
            setEditPath('Search Results');
        }
    }, [path, isSearching]);

    const handlePathSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isSearching && editPath !== path) {
            onNavigate(editPath);
        }
        setIsEditingPath(false);
    };
    
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            onSearch(searchQuery);
        }
    };

    const handlePathFocus = () => {
        setIsEditingPath(true);
        setEditPath(path);
    };

    const handlePathBlur = () => {
        if (editPath === path) {
            setIsEditingPath(false);
        }
    };

    // Convert path to breadcrumbs for better UX
    const renderPathBreadcrumbs = () => {
        if (isEditingPath || isSearching) {
            return null;
        }

        const separator = isElectron ? '\\' : '/';
        const pathSegments = path.split(/[/\\]/).filter(p => p);
        
        return (
            <div className="flex items-center space-x-1 flex-1 px-2 py-1">
                {pathSegments.map((segment, index) => {
                    const segmentPath = pathSegments.slice(0, index + 1).join(separator);
                    const fullPath = isElectron ? segmentPath : `/${segmentPath}`;
                    
                    return (
                        <React.Fragment key={index}>
                            <button
                                className="px-2 py-1 rounded hover:bg-explorer-hover text-left"
                                onClick={() => onNavigate(fullPath)}
                                title={`Navigate to ${fullPath}`}
                            >
                                {segment}
                            </button>
                            {index < pathSegments.length - 1 && (
                                <span className="text-explorer-text-secondary">{separator}</span>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="flex items-center p-1.5 border-b border-explorer-border text-sm select-none">
            <NavButton 
                onClick={() => onHistoryNav('back')} 
                disabled={!canGoBack}
                title="Back (Alt+Left)"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                </svg>
            </NavButton>
            
            <NavButton 
                onClick={() => onHistoryNav('forward')} 
                disabled={!canGoForward}
                title="Forward (Alt+Right)"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
            </NavButton>
            
            <NavButton 
                onClick={onNavigateUp} 
                disabled={path.split(/[/\\]/).filter(p => p).length <= 1 || isSearching}
                title="Up (Alt+Up)"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                </svg>
            </NavButton>

            {/* Refresh Button */}
            <NavButton
                onClick={() => window.location.reload()}
                disabled={false}
                title="Refresh (F5)"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
            </NavButton>
            
            <div className="flex-1 ml-2">
                {isEditingPath || isSearching ? (
                    <form onSubmit={handlePathSubmit}>
                        <input
                            type="text"
                            value={editPath}
                            onChange={(e) => setEditPath(e.target.value)}
                            onBlur={handlePathBlur}
                            readOnly={isSearching}
                            className="w-full bg-explorer-bg px-2 py-1 rounded-md border border-explorer-border focus:outline-none focus:ring-1 focus:ring-explorer-accent"
                            autoFocus={isEditingPath}
                        />
                    </form>
                ) : (
                    <div 
                        className="flex-1 bg-explorer-bg px-2 py-1 rounded-md border border-explorer-border cursor-text hover:bg-explorer-hover"
                        onClick={handlePathFocus}
                    >
                        {renderPathBreadcrumbs()}
                    </div>
                )}
            </div>
            
            <form onSubmit={handleSearchSubmit} className="flex items-center ml-2 relative">
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-explorer-text-secondary">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </div>
                <input 
                    type="search" 
                    placeholder={isElectron ? "Windows Search" : "Search files"} 
                    className="bg-explorer-bg pl-8 pr-2 py-1 rounded-md border border-explorer-border focus:outline-none focus:ring-1 focus:ring-explorer-accent w-48"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    title={isElectron ? "Search with Windows indexing" : "Basic file search"}
                />
            </form>
        </div>
    );
};