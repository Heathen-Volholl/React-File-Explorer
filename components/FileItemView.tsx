
import React from 'react';
import { FileSystemItem, FileType } from '../types';
import { ICONS, getFileIcon } from '../constants';

interface FileItemViewProps {
    item: FileSystemItem;
    isSelected: boolean;
    onClick: (e: React.MouseEvent) => void;
    onDoubleClick: () => void;
    onContextMenu: (e: React.MouseEvent) => void;
    fullPath?: string;
}

export const FileItemView: React.FC<FileItemViewProps> = ({ item, isSelected, onClick, onDoubleClick, onContextMenu, fullPath }) => {
    const icon = item.type === FileType.Directory ? ICONS.folder : getFileIcon(item.name);
    
    const modified = item.modified || 'N/A';
    const tooltipText = item.type === FileType.Directory 
        ? `Folder | Modified: ${modified}` 
        : `File | Size: ${item.size || 'N/A'} | Modified: ${modified}`;

    const location = fullPath ? fullPath.substring(0, fullPath.lastIndexOf('/')) || fullPath.split('/')[0] : null;

    return (
        <tr
            className={`rounded-md cursor-pointer select-none ${
                isSelected ? 'bg-explorer-accent/20' : 'hover:bg-explorer-scrollbar text-explorer-text'
            }`}
            onClick={onClick}
            onDoubleClick={onDoubleClick}
            onContextMenu={onContextMenu}
            title={tooltipText}
        >
            <td className="p-2 flex items-center space-x-3">
                {icon}
                <span className="truncate">{item.name}</span>
            </td>
            {location && <td className="p-2 text-explorer-text-secondary truncate">{location}</td>}
            <td className="p-2 text-explorer-text-secondary">{item.modified || '--'}</td>
            <td className="p-2 text-explorer-text-secondary text-right">{item.size || '--'}</td>
        </tr>
    );
};
