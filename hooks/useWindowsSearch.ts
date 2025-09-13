import { useState, useCallback } from 'react';
import { FileSystemItem, FileType } from '../types';

type SearchResult = {
    item: FileSystemItem;
    path: string;
};

export const useWindowsSearch = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isElectron = !!window.electronAPI;

    const search = useCallback(async (query: string, searchPath?: string): Promise<SearchResult[]> => {
        if (!isElectron) {
            setError('Windows Search requires the desktop app');
            return [];
        }

        if (!query.trim()) {
            return [];
        }

        setIsLoading(true);
        setError(null);

        try {
            // Default search path to C:\ if not provided
            const searchLocation = searchPath || 'C:\\';
            
            const results = await window.electronAPI!.searchWindows(query, searchLocation);
            
            return results.map(result => ({
                item: {
                    name: result.name,
                    type: result.type === 'directory' ? FileType.Directory : FileType.File,
                    size: result.size,
                    modified: result.modified,
                    fullPath: result.fullPath
                },
                path: result.fullPath
            }));
        } catch (err: any) {
            console.error('Windows Search failed:', err);
            setError(err.message || 'Search failed');
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [isElectron]);

    return { 
        search, 
        isLoading, 
        error, 
        isAvailable: isElectron && window.electronAPI?.platform === 'win32'
    };
};