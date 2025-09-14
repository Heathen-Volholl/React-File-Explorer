import React, { useState, useCallback, useEffect } from 'react';
import SplitPane from 'react-split-pane';
import { FilePane } from './FilePane';
import { PreviewPane } from './PreviewPane';
import { StatusBar } from './StatusBar';
import { PaneState, FileSystemItem, TabState } from '../types';
import { useWindowsSearch } from '../hooks/useWindowsSearch';
import { useFileSystem, getWebModeWarning } from '../hooks/useFileSystem';

interface FileBrowserProps {
    panes: PaneState[];
    setPanes: React.Dispatch<React.SetStateAction<PaneState[]>>;
    quickAccess?: { label: string; path: string }[];
    onAddQuickAccess?: (item: { label: string; path: string }) => void;
    onRemoveQuickAccess?: (path: string) => void;
}

export const FileBrowser: React.FC<FileBrowserProps> = ({ panes, setPanes, quickAccess, onAddQuickAccess, onRemoveQuickAccess }) => {
    const [activePaneId, setActivePaneId] = useState<string>(panes[0].id);
    const [selectedItem, setSelectedItem] = useState<FileSystemItem | null>(null);
    const [selectedItemPath, setSelectedItemPath] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(true);

    const { search, isLoading: isSearchLoading, error: searchError, isAvailable: isSearchAvailable } = useWindowsSearch();
    const { isElectron } = useFileSystem();

    const updatePaneState = useCallback((paneId: string, newPaneState: PaneState | ((prevState: PaneState) => PaneState)) => {
        setPanes(prevPanes => prevPanes.map(p => p.id === paneId ? (typeof newPaneState === 'function' ? newPaneState(p) : newPaneState) : p));
    }, []);
    
    const handleSearch = useCallback(async (query: string) => {
        const activePane = panes.find(p => p.id === activePaneId);
        if (!activePane) return;

        const activeTab = activePane.tabs.find(t => t.id === activePane.activeTabId);
        if (!activeTab) return;

        // Use the current path as the search location for more targeted results
        const searchPath = activeTab.path !== 'C:' && activeTab.path !== 'D:' ? activeTab.path : undefined;
        
        const results = await search(query, searchPath);

        updatePaneState(activePaneId, (currentPane) => {
            const newTabs = currentPane.tabs.map(t => {
                if (t.id === currentPane.activeTabId) {
                    return { ...t, searchResults: results };
                }
                return t;
            });
            return { ...currentPane, tabs: newTabs };
        });

    }, [activePaneId, panes, search, updatePaneState]);

    const handleSelectionChange = (item: FileSystemItem, path: string) => {
        setSelectedItem(item);
        setSelectedItemPath(path);
    };

    const webModeWarning = getWebModeWarning();
    return (
        <div className="flex-1 flex flex-col h-full relative">
            {/* Show status messages */}
            {webModeWarning && (
                <div className="bg-explorer-warning/10 border-l-4 border-explorer-warning text-explorer-warning p-2 text-sm">
                    {webModeWarning}
                </div>
            )}
            {isElectron && !isSearchAvailable && (
                <div className="bg-explorer-warning/10 border-l-4 border-explorer-warning text-explorer-warning p-2 text-sm">
                    ⚠️ Windows Search not available. Search functionality will be limited.
                </div>
            )}
            <SplitPane split="vertical" minSize={150} defaultSize="50%" allowResize={true} style={{ position: 'relative', height: '100%' }}>
                {/* Left Pane */}
                <div className="flex flex-col h-full">
                    <FilePane
                        paneState={panes[0]}
                        setPaneState={(newState) => updatePaneState(panes[0].id, newState)}
                        isActive={activePaneId === panes[0].id}
                        onSelectionChange={handleSelectionChange}
                        onSearch={handleSearch}
                        quickAccess={quickAccess}
                        onAddQuickAccess={onAddQuickAccess}
                        onRemoveQuickAccess={onRemoveQuickAccess}
                    />
                </div>
                {/* Right Pane (with preview if enabled) */}
                <div className="flex flex-col h-full">
                    <FilePane
                        paneState={panes[1]}
                        setPaneState={(newState) => updatePaneState(panes[1].id, newState)}
                        isActive={activePaneId === panes[1].id}
                        onSelectionChange={handleSelectionChange}
                        onSearch={handleSearch}
                        quickAccess={quickAccess}
                        onAddQuickAccess={onAddQuickAccess}
                        onRemoveQuickAccess={onRemoveQuickAccess}
                    />
                    {showPreview && selectedItem && (
                        <PreviewPane 
                            item={selectedItem}
                            path={selectedItemPath!}
                            onClose={() => setShowPreview(false)} 
                        />
                    )}
                </div>
            </SplitPane>
            <StatusBar selectedItem={selectedItem} />
            {isSearchLoading && (
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-explorer-bg-secondary px-4 py-2 rounded-md shadow-lg text-sm border border-explorer-border animate-pulse">
                    🔍 Searching with Windows Search...
                </div>
            )}
            {searchError && (
                 <div className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-explorer-danger/10 text-explorer-danger px-4 py-2 rounded-md shadow-lg text-sm border border-explorer-danger/30">
                    Error: {searchError}
                </div>
            )}
        </div>
    );
};