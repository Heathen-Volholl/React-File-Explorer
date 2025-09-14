import React from 'react';
import { FileSystemItem, FileType } from '../types';
import { getFileIcon } from '../constants';

interface PropertiesModalProps {
    item: FileSystemItem;
    path: string;
    onClose: () => void;
}

const PropertyRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex mb-2">
        <span className="w-1/3 text-explorer-text-secondary">{label}:</span>
        <span className="w-2/3 break-words">{value}</span>
    </div>
);

export const PropertiesModal: React.FC<PropertiesModalProps> = ({ item, path, onClose }) => {
    const icon = getFileIcon(item.name);

    return (
        <div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-explorer-bg/80"
            onClick={onClose}
            aria-modal="true"
            role="dialog"
            aria-labelledby="properties-title"
        >
            <div
                className="w-full max-w-md bg-explorer-bg-secondary rounded-lg shadow-2xl overflow-hidden text-sm"
                onClick={e => e.stopPropagation()}
            >
                <div className="p-4 border-b border-explorer-border">
                    <h2 id="properties-title" className="text-lg font-semibold">Properties</h2>
                </div>
                <div className="p-6">
                    <div className="flex items-center mb-6">
                        <div className="w-10 h-10 mr-4 flex-shrink-0">{icon}</div>
                        <p className="text-lg font-medium break-all">{item.name}</p>
                    </div>

                    <div className="space-y-2">
                        <PropertyRow label="Type" value={item.type === FileType.Directory ? 'Folder' : 'File'} />
                        <PropertyRow label="Location" value={path.substring(0, path.lastIndexOf('/')) || path} />
                        <PropertyRow label="Size" value={item.size || '--'} />
                        <hr className="my-4 border-explorer-border" />
                        <PropertyRow label="Modified" value={item.modified || '--'} />
                        <PropertyRow label="Created" value="(not available)" />
                        <PropertyRow label="Accessed" value="(not available)" />
                        <hr className="my-4 border-explorer-border" />
                        <PropertyRow label="Permissions" value="(not available)" />
                    </div>
                </div>

                <div className="p-4 bg-explorer-bg flex justify-end border-t border-explorer-border">
                    <button
                        onClick={onClose}
                        className="px-4 py-1.5 bg-explorer-accent text-explorer-accent-text rounded-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-explorer-accent focus:ring-offset-2 focus:ring-offset-explorer-bg"
                    >
                        OK
                    </button>
                </div>
            </div>
        </div>
    );
};
