
import React from 'react';
import { FileSystemItem } from '../types';

interface StatusBarProps {
    selectedItem: FileSystemItem | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({ selectedItem }) => {
    return (
        <div className="h-6 bg-explorer-bg-secondary border-t border-explorer-border px-4 flex items-center justify-between text-xs text-explorer-text-secondary select-none">
            <div>
                {selectedItem ? `1 item selected | ${selectedItem.size || ''}` : 'No item selected'}
            </div>
            <div>
                {/* Could show total items in folder */}
            </div>
        </div>
    );
};
