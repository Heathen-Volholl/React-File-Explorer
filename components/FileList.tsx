import React, { useState, useEffect } from 'react';
import { useFileSystem } from '../hooks/useFileSystem';
import { FileSystemItem, FileType, TabState } from '../types';
import { FileItemView } from './FileItemView';
import { ContextMenu } from './ContextMenu';
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
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({ 
        visible: false, 
        x: 0, 
        y: 0, 
        item: null, 
        itemPath: null 
    });
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
    
    const handleContextMenu = (e: React.MouseEvent, item: FileSystemItem | null = null, itemPath: string | null = null) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ visible: true, x: e.clientX, y: e.clientY, item, itemPath });
        if(item && itemPath) {
            setSelectedItem(isSearchMode ? itemPath : item.name);
            onSelectionChange(item, itemPath);
        }
    };

    const closeContextMenu = () => setContextMenu({ 
        ...contextMenu, 
        visible: false, 
        item: null, 
        itemPath: null 
    });

    useEffect(() => {
        const handleClickOutside = () => closeContextMenu();
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleAction = async (action: string, item: any) => {
        try {
            if (action === 'Properties' && item) {
                setPropertiesModalItem(item);
            } else if (action === 'Zip' && item) {
                await zipFiles([contextMenu.itemPath!], item.output);
                addToast(`Zipped to ${item.output}`);
                await handleRefresh();
            } else if (action === 'Unzip' && item) {
                await unzipFile(contextMenu.itemPath!, item.output);
                addToast(`Unzipped to ${item.output}`);
                await handleRefresh();
            } else if (action === 'Tar' && item) {
                await tarFiles([contextMenu.itemPath!], item.output);
                addToast(`Tarred to ${item.output}`);
                await handleRefresh();
            } else if (action === 'Untar' && item) {
                await untarFile(contextMenu.itemPath!, item.output);
                addToast(`Untarred to ${item.output}`);
                await handleRefresh();
            } else if (action === '7z' && item) {
                await sevenZipFiles([contextMenu.itemPath!], item.output);
                addToast(`7z archive created: ${item.output}`);
                await handleRefresh();
            } else if (action === 'Un7z' && item) {
                await unsevenZipFile(contextMenu.itemPath!, item.output);
                addToast(`Un7z extracted to ${item.output}`);
                await handleRefresh();
            } else if (action === 'Encrypt' && item) {
                addToast(`Successfully encrypted ${item.name}`);
            } else if (action === 'AddQuickAccess' && item) {
                onAddQuickAccess && onAddQuickAccess({ label: item.name, path: contextMenu.itemPath! });
                addToast(`Added to Quick Access: ${item.name}`);
            } else if (action === 'RemoveQuickAccess' && item) {
                onRemoveQuickAccess && onRemoveQuickAccess(contextMenu.itemPath!);
                addToast(`Removed from Quick Access: ${item.name}`);
            } else {
                addToast(`${action} action triggered${item ? ` on ${item.name}` : ''}`);
            }
        } catch (err: any) {
            addToast(`Error: ${err.message || err}`);
        }
        closeContextMenu();
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
            onContextMenu={(e) => handleContextMenu(e)}
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
                                    onContextMenu={(e) => handleContextMenu(e, item, itemPath)}
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
                                    onContextMenu={(e) => handleContextMenu(e, item, itemPath)}
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
            {contextMenu.visible && (
                <ContextMenu 
                    {...contextMenu} 
                    currentPath={path}
                    onAction={handleAction}
                    onRefresh={handleRefresh}
                    quickAccess={quickAccess}
                />
            )}
            {propertiesModalItem && (
                <PropertiesModal
                    item={propertiesModalItem}
                    path={contextMenu.itemPath!}
                    onClose={() => setPropertiesModalItem(null)}
                />
            )}
        </div>
    );
};