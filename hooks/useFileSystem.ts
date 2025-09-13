import { useCallback } from 'react';
import { FileSystemItem, FileType } from '../types';

export const mockFileSystem: { [key: string]: FileSystemItem } = {
    'C:': {
        name: 'Local Disk (C:)',
        type: FileType.Drive,
        children: {
            'Users': {
                name: 'Users',
                type: FileType.Directory,
                children: {
                    'DefaultUser': {
                        name: 'DefaultUser',
                        type: FileType.Directory,
                        children: {
                            'Desktop': { name: 'Desktop', type: FileType.Directory, children: {} },
                            'Documents': {
                                name: 'Documents',
                                type: FileType.Directory,
                                children: {
                                    'report.docx': { name: 'report.docx', type: FileType.File, size: '1.2 MB', modified: '2023-10-27' },
                                    'presentation.pptx': { name: 'presentation.pptx', type: FileType.File, size: '5.4 MB', modified: '2023-10-26' },
                                    'notes.txt': { name: 'notes.txt', type: FileType.File, size: '5 KB', modified: '2023-11-01' },
                                    'data.zip': { name: 'data.zip', type: FileType.File, size: '12.8 MB', modified: '2023-10-25' },
                                    'deep-learning-notes.pdf': { name: 'deep-learning-notes.pdf', type: FileType.File, size: '2.5 MB', modified: '2023-10-28' },
                                }
                            },
                            'Downloads': { 
                                name: 'Downloads', 
                                type: FileType.Directory, 
                                children: {
                                    'sample-video.mp4': { name: 'sample-video.mp4', type: FileType.File, size: '15.2 MB', modified: '2023-10-29' },
                                    'archive.7z': { name: 'archive.7z', type: FileType.File, size: '8.9 MB', modified: '2023-11-02' },
                                } 
                            },
                            'Pictures': {
                                name: 'Pictures',
                                type: FileType.Directory,
                                children: {
                                    'vacation.jpg': { name: 'vacation.jpg', type: FileType.File, size: '3.1 MB', modified: '2023-08-15' },
                                    'family.png': { name: 'family.png', type: FileType.File, size: '2.5 MB', modified: '2023-09-01' },
                                    'logo.svg': { name: 'logo.svg', type: FileType.File, size: '15 KB', modified: '2023-07-20' },
                                }
                            },
                            'Music': {
                                name: 'Music',
                                type: FileType.Directory,
                                children: {
                                    'sample-audio.mp3': { name: 'sample-audio.mp3', type: FileType.File, size: '4.1 MB', modified: '2023-10-30' },
                                }
                            }
                        }
                    },
                    'Public': { name: 'Public', type: FileType.Directory, children: {} }
                }
            },
            'Windows': { name: 'Windows', type: FileType.Directory, children: {} },
            'Program Files': { name: 'Program Files', type: FileType.Directory, children: {} }
        }
    },
    'D:': {
        name: 'Data (D:)',
        type: FileType.Drive,
        children: {
            'Projects': {
                name: 'Projects',
                type: FileType.Directory,
                children: {
                    'readme.md': { name: 'readme.md', type: FileType.File, size: '2 KB', modified: '2023-10-01' }
                }
            }
        }
    }
};

export const useFileSystem = () => {
    const getHomePath = () => 'C:/Users/DefaultUser';

    const getDrives = () => {
        return Object.keys(mockFileSystem).map(key => ({
            name: mockFileSystem[key].name,
            type: FileType.Drive,
            path: key
        }));
    };

    const getItem = useCallback((path: string): FileSystemItem | null => {
        const parts = path.replace(/\\/g, '/').split('/').filter(p => p);
        if (parts.length === 0) return null;
        
        // Handle root path like 'C:'
        if (parts.length === 1 && mockFileSystem[parts[0]]) {
            return mockFileSystem[parts[0]];
        }

        let currentLevel = mockFileSystem[parts[0]];
        if (!currentLevel) return null;

        for (let i = 1; i < parts.length; i++) {
            const part = parts[i];
            if (currentLevel.children && currentLevel.children[part]) {
                currentLevel = currentLevel.children[part];
            } else {
                return null;
            }
        }
        return currentLevel;
    }, []);

    const getContents = useCallback((path: string): FileSystemItem[] => {
        const item = getItem(path);
        if (item && item.type !== FileType.File && item.children) {
            return Object.values(item.children).sort((a, b) => {
                if (a.type === b.type) return a.name.localeCompare(b.name);
                return a.type === FileType.Directory ? -1 : 1;
            });
        }
        return [];
    }, [getItem]);

    return { getHomePath, getDrives, getContents, getItem };
};
