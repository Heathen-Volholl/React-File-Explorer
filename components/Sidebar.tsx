import React from 'react';
import { useFileSystem } from '../hooks/useFileSystem';
import { ICONS } from '../constants';
import { FileType } from '../types';

interface SidebarProps {
    onThemeToggle: () => void;
    currentTheme: string;
}

interface NavItemProps {
    icon: React.ReactNode;
    label: string;
    path: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, label }) => (
    <a href="#" className="flex items-center space-x-3 px-2 py-1.5 rounded-md text-sm hover:bg-explorer-hover transition-colors">
        {icon}
        <span className="truncate">{label}</span>
    </a>
);

export const Sidebar: React.FC<SidebarProps> = ({ onThemeToggle, currentTheme }) => {
    const { getDrives, getHomePath } = useFileSystem();
    
    const quickAccessItems = [
        { icon: ICONS.home, label: 'Home', path: getHomePath() },
        { icon: ICONS.desktop, label: 'Desktop', path: `${getHomePath()}/Desktop` },
        { icon: ICONS.documents, label: 'Documents', path: `${getHomePath()}/Documents` },
        { icon: ICONS.downloads, label: 'Downloads', path: `${getHomePath()}/Downloads` },
        { icon: ICONS.pictures, label: 'Pictures', path: `${getHomePath()}/Pictures` },
        { icon: ICONS.music, label: 'Music', path: `${getHomePath()}/Music` },
    ];
    
    const cloudItems = [
        { icon: ICONS.cloud, label: 'OneDrive', path: '#' },
        { icon: ICONS.cloud, label: 'Google Drive', path: '#' },
        { icon: ICONS.cloud, label: 'Dropbox', path: '#' },
    ];

    return (
        <aside className="w-64 bg-explorer-bg-secondary flex flex-col p-2 border-r border-explorer-border select-none">
            <div className="flex items-center justify-between p-2 mb-2">
                <h1 className="font-semibold text-lg">Explorer</h1>
                <button onClick={onThemeToggle} className="p-1.5 rounded-full hover:bg-explorer-hover">
                    {currentTheme === 'light' ? ICONS.moon : ICONS.sun}
                </button>
            </div>
            <nav className="flex-1 space-y-4 overflow-y-auto">
                <div>
                    <h2 className="text-xs font-semibold text-explorer-text-secondary px-2 mb-1">Quick Access</h2>
                    <div className="space-y-0.5">
                        {quickAccessItems.map(item => <NavItem key={item.label} {...item} />)}
                    </div>
                </div>
                <div>
                    <h2 className="text-xs font-semibold text-explorer-text-secondary px-2 mb-1">Cloud</h2>
                    <div className="space-y-0.5">
                        {cloudItems.map(item => <NavItem key={item.label} {...item} />)}
                    </div>
                </div>
                <div>
                    <h2 className="text-xs font-semibold text-explorer-text-secondary px-2 mb-1">This PC</h2>
                    <div className="space-y-0.5">
                        {getDrives().map(drive => (
                            <NavItem key={drive.path} icon={ICONS.drive} label={drive.name} path={drive.path} />
                        ))}
                    </div>
                </div>
            </nav>
        </aside>
    );
};