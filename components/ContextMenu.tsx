import React from 'react';
import { FileSystemItem, FileType } from '../types';
import { useFileSystem } from '../hooks/useFileSystem';
import { useToast } from '../contexts/ToastContext';

interface ContextMenuProps {
    x: number;
    y: number;
    item: FileSystemItem | null;
    currentPath: string;
    onAction: (action: string, item: FileSystemItem | null) => void;
    onRefresh?: () => void;
    quickAccess?: { label: string; path: string }[];
}

const MenuItem: React.FC<{ 
    label: string; 
    onSelect: () => void; 
    disabled?: boolean;
    separator?: boolean;
}> = ({ label, onSelect, disabled, separator }) => {
    if (separator) {
        return <div className="my-1 h-px bg-explorer-border" />;
    }
    
    return (
        <button
            onClick={onSelect}
            disabled={disabled}
            className="w-full text-left px-4 py-1.5 text-sm text-explorer-text hover:bg-explorer-hover disabled:opacity-50"
        >
            {label}
        </button>
    );
};

export const ContextMenu: React.FC<ContextMenuProps> = ({ 
    x, 
    y, 
    item, 
    currentPath,
    onAction,
    onRefresh,
    quickAccess = []
}) => {
    const { 
        isElectron, 
        openFile, 
        showInFolder, 
        deleteFile, 
        createDirectory, 
        copyFile, 
        moveFile 
    } = useFileSystem();
    const { addToast } = useToast();

    const isZip = item?.name.endsWith('.zip');
    const is7z = item?.name.endsWith('.7z');
    const isTar = item?.name.endsWith('.tar');
    const isArchive = isZip || is7z || isTar;
    const isFile = item?.type === FileType.File;
    const isFolder = item?.type === FileType.Directory;
    const itemPath = item?.fullPath || (item ? `${currentPath}/${item.name}`.replace(/\/+/g, '/') : '');
    const inQuickAccess = isFolder && quickAccess.some(q => q.path === itemPath);

    const menuStyle: React.CSSProperties = {
        top: y,
        left: x,
        position: 'fixed',
    };

    const handleOpen = async () => {
        if (!item || !isElectron) {
            onAction('Open', item);
            return;
        }

        try {
            await openFile(itemPath);
            addToast(`Opened ${item.name}`);
        } catch (error) {
            addToast(`Failed to open ${item.name}`);
        }
    };

    const handleShowInExplorer = async () => {
        if (!item || !isElectron) return;

        try {
            await showInFolder(itemPath);
        } catch (error) {
            addToast(`Failed to show ${item.name} in Explorer`);
        }
    };

    const handleCopy = async () => {
        if (!item || !isElectron) {
            // Fallback to clipboard API
            if (item) {
                try {
                    await navigator.clipboard.writeText(itemPath);
                    addToast(`Copied path: ${item.name}`);
                } catch (error) {
                    addToast('Failed to copy to clipboard');
                }
            }
            return;
        }

        // For now, just copy the path to clipboard
        // Real copy/paste would need a clipboard manager
        try {
            await navigator.clipboard.writeText(itemPath);
            addToast(`Copied path: ${item.name}`);
        } catch (error) {
            addToast('Failed to copy to clipboard');
        }
    };

    const handleDelete = async () => {
        if (!item || !isElectron) {
            onAction('Delete', item);
            return;
        }

        const confirmed = confirm(`Are you sure you want to delete "${item.name}"?`);
        if (!confirmed) return;

        try {
            await deleteFile(itemPath);
            addToast(`Deleted ${item.name}`);
            onRefresh?.();
        } catch (error) {
            addToast(`Failed to delete ${item.name}`);
        }
    };

    const handleNewFolder = async () => {
        const folderName = prompt('Enter folder name:');
        if (!folderName || !isElectron) {
            onAction('New Folder', null);
            return;
        }

        const newFolderPath = `${currentPath}/${folderName}`.replace(/\/+/g, '/');
        
        try {
            await createDirectory(newFolderPath);
            addToast(`Created folder: ${folderName}`);
            onRefresh?.();
        } catch (error) {
            addToast(`Failed to create folder: ${folderName}`);
        }
    };

    return (
        <div
            style={menuStyle}
            className="z-50 w-48 bg-explorer-bg-secondary rounded-md shadow-lg border border-explorer-border py-1"
            onClick={e => e.stopPropagation()}
        >
            {item && (
                <>
                    {isFolder && !inQuickAccess && (
                        <MenuItem label="Add to Quick Access" onSelect={() => onAction('AddQuickAccess', item)} />
                    )}
                    {isFolder && inQuickAccess && (
                        <MenuItem label="Remove from Quick Access" onSelect={() => onAction('RemoveQuickAccess', item)} />
                    )}
                    <MenuItem label="Open" onSelect={handleOpen} />
                    {isElectron && (
                        <MenuItem 
                            label="Show in Explorer" 
                            onSelect={handleShowInExplorer} 
                        />
                    )}
                    <MenuItem separator />
                    <MenuItem label="Copy" onSelect={handleCopy} />
                    <MenuItem label="Cut" onSelect={() => onAction('Cut', item)} />
                    {/* Archive actions */}
                    {isFile && (
                        <>
                            <MenuItem
                                label="Zip"
                                onSelect={() => {
                                    const output = prompt('Enter output zip file name:', item.name.replace(/\.[^/.]+$/, '') + '.zip');
                                    if (output) onAction('Zip', { ...item, output });
                                }}
                            />
                            <MenuItem
                                label="Tar"
                                onSelect={() => {
                                    const output = prompt('Enter output tar file name:', item.name.replace(/\.[^/.]+$/, '') + '.tar');
                                    if (output) onAction('Tar', { ...item, output });
                                }}
                            />
                            <MenuItem
                                label="7z"
                                onSelect={() => {
                                    const output = prompt('Enter output 7z file name:', item.name.replace(/\.[^/.]+$/, '') + '.7z');
                                    if (output) onAction('7z', { ...item, output });
                                }}
                            />
                            <MenuItem
                                label="Encrypt"
                                onSelect={() => {
                                    onAction('Encrypt', item);
                                }}
                            />
                        </>
                    )}
                    {isZip && (
                        <MenuItem
                            label="Unzip Here"
                            onSelect={() => {
                                const output = prompt('Enter output folder for unzip:', item.name.replace(/\.[^/.]+$/, ''));
                                if (output) onAction('Unzip', { ...item, output });
                            }}
                        />
                    )}
                    {isTar && (
                        <MenuItem
                            label="Untar Here"
                            onSelect={() => {
                                const output = prompt('Enter output folder for untar:', item.name.replace(/\.[^/.]+$/, ''));
                                if (output) onAction('Untar', { ...item, output });
                            }}
                        />
                    )}
                    {is7z && (
                        <MenuItem
                            label="Un7z Here"
                            onSelect={() => {
                                const output = prompt('Enter output folder for un7z:', item.name.replace(/\.[^/.]+$/, ''));
                                if (output) onAction('Un7z', { ...item, output });
                            }}
                        />
                    )}
                    <MenuItem separator />
                    <MenuItem 
                        label="Delete" 
                        onSelect={handleDelete}
                    />
                    <MenuItem separator />
                </>
            )}
            <MenuItem 
                label="Paste" 
                onSelect={() => {
                    addToast('Paste functionality would be implemented here');
                    onAction('Paste', null);
                }} 
                disabled={false}
            />
            <MenuItem separator />
            <MenuItem label="New Folder" onSelect={handleNewFolder} />
            <MenuItem separator />
            <MenuItem 
                label="Properties" 
                onSelect={() => onAction('Properties', item)} 
                disabled={!item} 
            />
            <MenuItem 
                label="Refresh" 
                onSelect={() => {
                    onRefresh?.();
                    addToast('Refreshed folder');
                }} 
            />
        </div>
    );
};