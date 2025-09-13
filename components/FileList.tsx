import React, { useState, useEffect } from 'react';
import { useFileSystem } from '../hooks/useFileSystem';
import { FileSystemItem, FileType, TabState } from '../types';
import { FileItemView } from './FileItemView';
// import ClipboardManager from './ClipboardManager';
import { PropertiesModal } from './PropertiesModal';
import { useToast } from '../contexts/ToastContext';
import { zipFiles, unzipFile, tarFiles, untarFile, sevenZipFiles, unsevenZipFile } from '../hooks/useArchiveActions';

interface FileListProps {
    path: string;
    searchResults?: TabState['searchResults'];
    onNavigate: (path: string) => void;
    isActive: boolean;
    onSelectionChange: (item: FileSystemItem, path: string) => void;
    quickAccess?: { label: string; path: string }[];
    onAddQuickAccess?: (item: { label: string; path: string }) => void;
    onRemoveQuickAccess?: (path: string) => void;
}

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    item: FileSystemItem | null;
    itemPath: string | null;
}

export const FileList: React.FC<FileListProps> = ({ 
    path, 
    searchResults, 
    onNavigate, 
    isActive, 
    onSelectionChange, 
    quickAccess = [],
    onAddQuickAccess,
    onRemoveQuickAccess
}) => {
    const { getContents } = useFileSystem();
    const { addToast } = useToast();
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    // const [showClipboard, setShowClipboard] = useState(false);
    const [propertiesModalItem, setPropertiesModalItem] = useState<FileSystemItem | null>(null);
    const [items, setItems] = useState<FileSystemItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const isSearchMode = !!searchResults;

    // Load directory contents when path changes
    useEffect(() => {
        if (isSearchMode) return; // Don't load if in search mode

        let isMounted = true;
        
        const loadContents = async () => {
            try {
                setIsLoading(true);
                setError(null);
                const contents = await getContents(path);
                
                if (isMounted) {
                    setItems(contents);
                }
            } catch (err: any) {
                if (isMounted) {
                    setError(err.message || 'Failed to load directory contents');
                    setItems([]);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        loadContents();

        return () => {
            isMounted = false;
        };
    }, [path, getContents, isSearchMode]);

    const handleItemClick = (item: FileSystemItem, itemPath: string) => {
        setSelectedItem(isSearchMode ? itemPath : item.name);
        onSelectionChange(item, itemPath);
    };

    const handleItemDoubleClick = (item: FileSystemItem, itemPath: string) => {
        if (item.type === FileType.Directory) {
            onNavigate(itemPath);
        }
    };
    
    // Restore default system context menu; no custom modal
    const handleContextMenu = undefined;

    // No context menu to close

    // No context menu to close

    // No context menu actions; archive/quick access actions are no-ops or show a toast
    const handleAction = async (action: string, item: any) => {
        addToast('Clipboard actions are now handled via the Clipboard Manager.');
    };

    const handleRefresh = async () => {
        if (isSearchMode) return;
        try {
            setIsLoading(true);
            const contents = await getContents(path);
            setItems(contents);
        } catch (err: any) {
            setError(err.message || 'Failed to refresh directory');
        } finally {
            setIsLoading(false);
        }
    };

    const displayItems = isSearchMode ? [] : items;

    return (
        <div
            className="flex-1 overflow-y-auto p-2"
            onClick={() => setSelectedItem(null)}
        >
            <table className="w-full text-left text-sm">
                <thead>
                    <tr className="border-b border-explorer-border text-explorer-text-secondary select-none">
                        <th className="p-2 font-normal">Name</th>
                        {isSearchMode && <th className="p-2 font-normal w-1/3">Location</th>}
                        <th className="p-2 font-normal w-32">Date modified</th>
                        <th className="p-2 font-normal w-24">Size</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan={isSearchMode ? 4 : 3} className="text-center text-explorer-text-secondary p-4">
                                Loading...
                            </td>
                        </tr>
                    ) : error ? (
                        <tr>
                            <td colSpan={isSearchMode ? 4 : 3} className="text-center text-red-500 p-4">
                                Error: {error}
                            </td>
                        </tr>
                    ) : isSearchMode ? (
                        searchResults && searchResults.length > 0 ? (
                            searchResults.map(({ item, path: itemPath }) => (
                                <FileItemView
                                    key={itemPath}
                                    item={item}
                                    fullPath={itemPath}
                                    isSelected={selectedItem === itemPath && isActive}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleItemClick(item, itemPath);
                                    }}
                                    onDoubleClick={() => handleItemDoubleClick(item, itemPath)}
                                    // onContextMenu={(e) => handleContextMenu(e, item, itemPath)}
                                />
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="text-center text-explorer-text-secondary p-4">
                                    No search results found.
                                </td>
                            </tr>
                        )
                    ) : displayItems.length > 0 ? (
                        displayItems.map(item => {
                            const itemPath = `${path}${path.endsWith('\\') ? '' : '\\'}${item.name}`;
                            return (
                                <FileItemView
                                    key={item.name}
                                    item={item}
                                    isSelected={selectedItem === item.name && isActive}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleItemClick(item, itemPath);
                                    }}
                                    onDoubleClick={() => handleItemDoubleClick(item, itemPath)}
                                    // onContextMenu={(e) => handleContextMenu(e, item, itemPath)}
                                />
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={isSearchMode ? 4 : 3} className="text-center text-explorer-text-secondary p-4">
                                This folder is empty.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
                        {/* Clipboard modal removed; system context menu is now default */}
            {propertiesModalItem && (
                <PropertiesModal
                    item={propertiesModalItem}
                    path={path}
                    onClose={() => setPropertiesModalItem(null)}
                />
            )}
        </div>
    );
};