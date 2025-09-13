import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { SettingsModal } from './components/SettingsModal';
import { FileBrowser } from './components/FileBrowser';
import { CommandPalette } from './components/CommandPalette';
import { useFileSystem } from './hooks/useFileSystem';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/ToastContainer';

const App: React.FC = () => {
    // Quick Access state
    const [quickAccess, setQuickAccess] = useState<{ label: string; path: string }[]>([]);

    const handleAddQuickAccess = (item: { label: string; path: string }) => {
        setQuickAccess(prev => prev.some(q => q.path === item.path) ? prev : [...prev, item]);
    };
    const handleRemoveQuickAccess = (path: string) => {
        setQuickAccess(prev => prev.filter(q => q.path !== path));
    };
    // Cloud API keys state
    const [cloudKeys, setCloudKeys] = useState({ onedrive: '', gdrive: '', dropbox: '' });
    const [showSettings, setShowSettings] = useState(false);
    const { getHomePath, isElectron } = useFileSystem();
    const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [theme, setTheme] = useState('light');
    const [panes, setPanes] = useState<any[]>([]);

    const toggleTheme = useCallback(() => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    }, []);
    
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    // Initialize panes with real paths
    useEffect(() => {
        const initializePanes = async () => {
            try {
                // Both panes start at C:\ for simplicity
                const startPath = 'C:\\';
                setPanes([
                    {
                        id: 'pane-1',
                        tabs: [{ id: 'tab-1', path: startPath, history: [startPath], historyIndex: 0 }],
                        activeTabId: 'tab-1',
                    },
                    {
                        id: 'pane-2',
                        tabs: [{ id: 'tab-2', path: startPath, history: [startPath], historyIndex: 0 }],
                        activeTabId: 'tab-2',
                    },
                ]);
            } catch (error) {
                console.error('Failed to initialize panes:', error);
                // Fallback initialization
                setPanes([
                    {
                        id: 'pane-1',
                        tabs: [{ id: 'tab-1', path: 'C:\\', history: ['C:\\'], historyIndex: 0 }],
                        activeTabId: 'tab-1',
                    }
                ]);
            }
        };
        initializePanes();
    }, []);

    const commands = [
        { id: 'toggle-theme', name: 'Toggle Dark/Light Theme', action: toggleTheme },
        { id: 'home', name: 'Go to Home', action: () => {
            // This could navigate the active pane to home
            alert(`Home: ${getHomePath()}`);
        }},
        { id: 'new-folder', name: 'Create New Folder', action: () => alert('Creating new folder... (implement in context menu)')},
        { id: 'refresh', name: 'Refresh Current Folder', action: () => {
            // This could refresh the current pane
            window.location.reload();
        }},
    ];

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            setCommandPaletteOpen(prev => !prev);
        }
        // Add more shortcuts
        if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
            e.preventDefault();
            window.location.reload();
        }
        if (e.key === 'F5') {
            e.preventDefault();
            window.location.reload();
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    // Sidebar navigation handler (placeholder)
    const handleSidebarNavigation = (path: string) => {
        // If path is a cloud drive, check for API key
        if (path === 'onedrive' && !cloudKeys.onedrive) {
            setShowSettings(true);
            return;
        }
        if (path === 'gdrive' && !cloudKeys.gdrive) {
            setShowSettings(true);
            return;
        }
        if (path === 'dropbox' && !cloudKeys.dropbox) {
            setShowSettings(true);
            return;
        }
        // For demo, use a virtual path for cloud drives
        const navPath =
            path === 'onedrive' ? '/cloud/onedrive'
            : path === 'gdrive' ? '/cloud/gdrive'
            : path === 'dropbox' ? '/cloud/dropbox'
            : path;
        setPanes(prevPanes => prevPanes.map(pane => {
            if (pane.id !== 'pane-1') return pane;
            const activeTabId = pane.activeTabId;
            const tabs = pane.tabs.map(tab =>
                tab.id === activeTabId
                    ? {
                        ...tab,
                        path: navPath,
                        history: [...tab.history.slice(0, tab.historyIndex + 1), navPath],
                        historyIndex: tab.historyIndex + 1
                    }
                    : tab
            );
            return { ...pane, tabs };
        }));
    };
    // Don't render until we have initial panes
        if (panes.length === 0) {
            return (
                <div className="flex h-screen w-screen bg-explorer-bg text-explorer-text items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-explorer-accent mx-auto mb-4"></div>
                        <p>Loading file explorer...</p>
                    </div>
                </div>
            );
        }

    return (
        <ToastProvider>
            <div className="flex h-screen w-screen bg-explorer-bg text-explorer-text overflow-hidden">
                <Sidebar 
                    onThemeToggle={toggleTheme} 
                    currentTheme={theme}
                    onNavigate={handleSidebarNavigation}
                    onShowSettings={() => setShowSettings(true)}
                    cloudKeys={cloudKeys}
                    quickAccess={quickAccess}
                    onAddQuickAccess={handleAddQuickAccess}
                    onRemoveQuickAccess={handleRemoveQuickAccess}
                />
                <main className="flex-1 flex flex-col">
                    <FileBrowser 
                        panes={panes}
                        setPanes={setPanes}
                    />
                </main>
                {isCommandPaletteOpen && (
                    <CommandPalette
                        isOpen={isCommandPaletteOpen}
                        setIsOpen={setCommandPaletteOpen}
                        commands={commands}
                    />
                )}
            </div>
            {showSettings && (
                <SettingsModal
                    onedrive={cloudKeys.onedrive}
                    gdrive={cloudKeys.gdrive}
                    dropbox={cloudKeys.dropbox}
                    onSave={setCloudKeys}
                    onClose={() => setShowSettings(false)}
                />
            )}
            <ToastContainer />
        </ToastProvider>
    );
};

export default App;