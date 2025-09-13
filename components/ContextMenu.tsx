
import React from 'react';
import { FileSystemItem, FileType } from '../types';

interface ContextMenuProps {
    x: number;
    y: number;
    item: FileSystemItem | null;
    onAction: (action: string, item: FileSystemItem | null) => void;
}

const MenuItem: React.FC<{ label: string; onSelect: () => void; disabled?: boolean }> = ({ label, onSelect, disabled }) => (
    <button
        onClick={onSelect}
        disabled={disabled}
        className="w-full text-left px-4 py-1.5 text-sm text-explorer-text hover:bg-explorer-hover disabled:opacity-50"
    >
        {label}
    </button>
);

export const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, item, onAction }) => {
    const isArchive = item?.name.endsWith('.zip') || item?.name.endsWith('.7z');
    const isFile = item?.type === FileType.File;

    const menuStyle: React.CSSProperties = {
        top: y,
        left: x,
        position: 'fixed',
    };

    return (
        <div
            style={menuStyle}
            className="z-50 w-48 bg-explorer-bg-secondary rounded-md shadow-lg border border-explorer-border py-1"
            onClick={e => e.stopPropagation()}
        >
            {item && (
                <>
                    <MenuItem label="Open" onSelect={() => onAction('Open', item)} />
                    <MenuItem label="Copy" onSelect={() => onAction('Copy', item)} />
                    <MenuItem label="Cut" onSelect={() => onAction('Cut', item)} />
                    {isArchive && <MenuItem label="Extract Here" onSelect={() => onAction('Extract', item)} />}
                    {isFile && <MenuItem label="Encrypt" onSelect={() => onAction('Encrypt', item)} />}
                    <div className="my-1 h-px bg-explorer-border" />
                </>
            )}
            <MenuItem label="Paste" onSelect={() => onAction('Paste', null)} disabled={!navigator.clipboard} />
            <div className="my-1 h-px bg-explorer-border" />
            <MenuItem label="New Folder" onSelect={() => onAction('New Folder', null)} />
            <MenuItem label="Properties" onSelect={() => onAction('Properties', item)} disabled={!item} />
        </div>
    );
};
