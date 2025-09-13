
import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { FileBrowser } from './components/FileBrowser';
import { CommandPalette } from './components/CommandPalette';
import { useFileSystem } from './hooks/useFileSystem';
import { ToastProvider } from './contexts/ToastContext';
import { ToastContainer } from './components/ToastContainer';

const App: React.FC = () => {
    const { getHomePath } = useFileSystem();
    const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
    const [theme, setTheme] = useState('light');

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

    const commands = [
        { id: 'toggle-theme', name: 'Toggle Dark/Light Theme', action: toggleTheme },
        { id: 'home', name: 'Go to Home', action: () => alert('Navigating home... (not implemented)')},
        { id: 'new-folder', name: 'Create New Folder', action: () => alert('Creating new folder... (not implemented)')},
    ];

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            setCommandPaletteOpen(prev => !prev);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [handleKeyDown]);

    const initialPanes = [
        {
            id: 'pane-1',
            tabs: [{ id: 'tab-1', path: getHomePath(), history: [getHomePath()], historyIndex: 0 }],
            activeTabId: 'tab-1',
        },
        {
            id: 'pane-2',
            tabs: [{ id: 'tab-2', path: 'C:/Users/Public', history: ['C:/Users/Public'], historyIndex: 0 }],
            activeTabId: 'tab-2',
        },
    ];

    return (
        <ToastProvider>
            <div className="flex h-screen w-screen bg-explorer-bg text-explorer-text overflow-hidden">
                <Sidebar onThemeToggle={toggleTheme} currentTheme={theme} />
                <main className="flex-1 flex flex-col">
                    <FileBrowser initialPanes={initialPanes} />
                </main>
                {isCommandPaletteOpen && (
                    <CommandPalette
                        isOpen={isCommandPaletteOpen}
                        setIsOpen={setCommandPaletteOpen}
                        commands={commands}
                    />
                )}
            </div>
            <ToastContainer />
        </ToastProvider>
    );
};

export default App;
