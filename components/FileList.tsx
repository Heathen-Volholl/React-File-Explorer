
import React, { useState, useEffect } from 'react';
import { useFileSystem } from '../hooks/useFileSystem';
import { FileSystemItem, FileType, TabState } from '../types';
import { FileItemView } from './FileItemView';
import { ContextMenu } from './ContextMenu';
import { PropertiesModal } from './PropertiesModal';
import { useToast } from '../contexts/ToastContext';

interface FileListProps {
    path: string;
    searchResults?: TabState['searchResults'];
    onNavigate: (path: string) => void;
    isActive: boolean;
    onSelectionChange: (item: FileSystemItem, path: string) => void;
}

interface ContextMenuState {
    visible: boolean;
    x: number;
    y: number;
    item: FileSystemItem | null;
    itemPath: string | null;
}

export const FileList: React.FC<FileListProps> = ({ path, searchResults, onNavigate, isActive, onSelectionChange }) => {
    const { getContents } = useFileSystem();
    const { addToast } = useToast();
    const [selectedItem, setSelectedItem] = useState<string | null>(null);
    const [contextMenu, setContextMenu] = useState<ContextMenuState>({ visible: false, x: 0, y: 0, item: null, itemPath: null });
    const [propertiesModalItem, setPropertiesModalItem] = useState<FileSystemItem | null>(null);

    const isSearchMode = !!searchResults;

    const handleItemClick = (item: FileSystemItem, itemPath: string) => {
        setSelectedItem(isSearchMode ? itemPath : item.name);
        onSelectionChange(item, itemPath);
    };

    const handleItemDoubleClick = (item: FileSystemItem, itemPath: string) => {
        if (item.type === FileType.Directory) {
            onNavigate(itemPath);
        } else {
            // Preview logic is handled by parent selection
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

    const closeContextMenu = () => setContextMenu({ ...contextMenu, visible: false, item: null, itemPath: null });

    useEffect(() => {
        const handleClickOutside = () => closeContextMenu();
        window.addEventListener('click', handleClickOutside);
        return () => window.removeEventListener('click', handleClickOutside);
    }, []);

    const handleAction = (action: string, item: FileSystemItem | null) => {
        if (action === 'Properties' && item) {
            setPropertiesModalItem(item);
        } else if (action === 'Extract' && item) {
            addToast(`Successfully extracted ${item.name}`);
        } else if (action === 'Encrypt' && item) {
            addToast(`Successfully encrypted ${item.name}`);
        } else {
            alert(`${action} on ${item?.name || 'background'}`);
        }
        closeContextMenu();
    };

    const items = isSearchMode ? [] : getContents(path);

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
                    {isSearchMode ? (
                        searchResults.length > 0 ? (
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
                                    No results found.
                                </td>
                            </tr>
                        )
                    ) : (
                        items.length > 0 ? (
                            items.map(item => {
                                const itemPath = `${path}/${item.name}`;
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
                            )})
                        ) : (
                            <tr>
                                <td colSpan={3} className="text-center text-explorer-text-secondary p-4">
                                    This folder is empty.
                                </td>
                            </tr>
                        )
                    )}
                </tbody>
            </table>
            {contextMenu.visible && <ContextMenu {...contextMenu} onAction={handleAction} />}
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
