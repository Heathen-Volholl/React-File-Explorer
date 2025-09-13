import React, { useState, useEffect } from 'react';
import { useFileSystem } from '../hooks/useFileSystem';
import { ICONS } from '../constants';
import { FileType } from '../types';

type QuickAccessItem = { label: string; path: string };

interface SidebarProps {
    onThemeToggle: () => void;
    currentTheme: string;
    onNavigate?: (path: string) => void;
    onShowSettings?: () => void;
    cloudKeys?: { onedrive: string; gdrive: string; dropbox: string };
    quickAccess?: QuickAccessItem[];
    onAddQuickAccess?: (item: QuickAccessItem) => void;
    onRemoveQuickAccess?: (path: string) => void;
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    path: string;
    onClick?: (path: string) => void;
}

interface Drive {
    name: string;
    path: string;
    type: FileType;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label, path, onClick }) => (
    <button 
        onClick={() => onClick?.(path)} 
        className="flex items-center space-x-3 px-2 py-1.5 rounded-md text-sm hover:bg-explorer-hover transition-colors w-full text-left"
        title={`Navigate to ${path}`}
    >
        {icon}
        <span className="truncate">{label}</span>
    </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ onThemeToggle, currentTheme, onNavigate, onShowSettings, cloudKeys, quickAccess, onAddQuickAccess, onRemoveQuickAccess }) => {
    const { getDrives, getHomePath, specialFolders } = useFileSystem();
    const [drives, setDrives] = useState<Drive[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load drives when component mounts
    useEffect(() => {
        const loadDrives = async () => {
            try {
                setIsLoading(true);
                const driveList = await getDrives();
                setDrives(driveList);
            } catch (error) {
                console.error('Failed to load drives:', error);
                setDrives([]);
            } finally {
                setIsLoading(false);
            }
        };
        loadDrives();
    }, [getDrives]);

    // Handle navigation
    const handleNavigation = (path: string) => {
        if (onNavigate) {
            onNavigate(path);
        } else {
            console.log(`Navigate to: ${path}`);
            // Fallback - you could emit an event or use a different method
        }
    };

    // Get home path - this is now synchronous
    const homePath = getHomePath();
    
    const defaultQuickAccess = [
        { icon: ICONS.home, label: 'Home', path: homePath },
        { icon: ICONS.desktop, label: 'Desktop', path: specialFolders.desktop || `${homePath}\Desktop` },
        { icon: ICONS.documents, label: 'Documents', path: specialFolders.documents || `${homePath}\Documents` },
        { icon: ICONS.downloads, label: 'Downloads', path: specialFolders.downloads || `${homePath}\Downloads` },
        { icon: ICONS.pictures, label: 'Pictures', path: specialFolders.pictures || `${homePath}\Pictures` },
        { icon: ICONS.music, label: 'Music', path: specialFolders.music || `${homePath}\Music` },
    ];
    const quickAccessItems = quickAccess && quickAccess.length > 0
        ? quickAccess.map(item => ({ ...item, icon: ICONS.folder }))
        : defaultQuickAccess;
    
    const cloudItems = [
        { icon: ICONS.cloud, label: 'OneDrive', path: 'onedrive', needsKey: true },
        { icon: ICONS.cloud, label: 'Google Drive', path: 'gdrive', needsKey: true },
        { icon: ICONS.cloud, label: 'Dropbox', path: 'dropbox', needsKey: true },
    ];

    return (
        <aside className="w-64 bg-explorer-bg-secondary flex flex-col p-2 border-r border-explorer-border select-none">
            <div className="flex items-center justify-between p-2 mb-2">
                <h1 className="font-semibold text-lg">Explorer</h1>
                <div className="flex gap-2">
                    <button onClick={onThemeToggle} className="p-1.5 rounded-full hover:bg-explorer-hover" title="Toggle theme">
                        {currentTheme === 'light' ? ICONS.moon : ICONS.sun}
                    </button>
                    <button onClick={onShowSettings} className="p-1.5 rounded-full hover:bg-explorer-hover" title="Settings">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 12a5.25 5.25 0 1010.5 0 5.25 5.25 0 00-10.5 0zm12.5 0c0 .414-.336.75-.75.75h-1.086a6.978 6.978 0 01-.548 1.324l.77.77a.75.75 0 010 1.06l-1.06 1.06a.75.75 0 01-1.06 0l-.77-.77a6.978 6.978 0 01-1.324.548v1.086a.75.75 0 01-.75.75h-1.5a.75.75 0 01-.75-.75v-1.086a6.978 6.978 0 01-1.324-.548l-.77.77a.75.75 0 01-1.06 0l-1.06-1.06a.75.75 0 010-1.06l.77-.77a6.978 6.978 0 01-.548-1.324H3.25a.75.75 0 01-.75-.75v-1.5c0-.414.336-.75.75-.75h1.086a6.978 6.978 0 01.548-1.324l-.77-.77a.75.75 0 010-1.06l1.06-1.06a.75.75 0 011.06 0l.77.77a6.978 6.978 0 011.324-.548V3.25a.75.75 0 01.75-.75h1.5c.414 0 .75.336.75.75v1.086a6.978 6.978 0 011.324.548l.77-.77a.75.75 0 011.06 0l1.06 1.06a.75.75 0 010 1.06l-.77.77a6.978 6.978 0 01.548 1.324h1.086c.414 0 .75.336.75.75v1.5z" />
                        </svg>
                    </button>
                </div>
            </div>
            <nav className="flex-1 space-y-4 overflow-y-auto">
                <div>
                    <h2 className="text-xs font-semibold text-explorer-text-secondary px-2 mb-1">Quick Access</h2>
                    <div className="space-y-0.5">
                        {quickAccessItems.map(item => (
                            <NavItem 
                                key={item.label} 
                                {...item} 
                                onClick={handleNavigation}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <h2 className="text-xs font-semibold text-explorer-text-secondary px-2 mb-1">Cloud</h2>
                    <div className="space-y-0.5">
                        {cloudItems.map(item => (
                            <NavItem
                                key={item.label}
                                icon={item.icon}
                                label={item.label}
                                path={item.path}
                                onClick={() => {
                                    if (item.needsKey && cloudKeys && !cloudKeys[item.path as keyof typeof cloudKeys]) {
                                        onShowSettings && onShowSettings();
                                    } else {
                                        handleNavigation(item.path);
                                    }
                                }}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <h2 className="text-xs font-semibold text-explorer-text-secondary px-2 mb-1">This PC</h2>
                    <div className="space-y-0.5">
                        {isLoading ? (
                            <div className="px-2 py-1.5 text-sm text-explorer-text-secondary">
                                Loading drives...
                            </div>
                        ) : drives.length > 0 ? (
                            drives.map(drive => (
                                <NavItem 
                                    key={drive.path} 
                                    icon={ICONS.drive} 
                                    label={drive.name} 
                                    path={drive.path}
                                    onClick={handleNavigation}
                                />
                            ))
                        ) : (
                            <div className="px-2 py-1.5 text-sm text-explorer-text-secondary">
                                No drives found
                            </div>
                        )}
                    </div>
                </div>
            </nav>
        </aside>
    );
};