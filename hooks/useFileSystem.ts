// Utility to detect and warn about web mode
export function getWebModeWarning(): string | null {
  if (!window.electronAPI) {
    return '⚠️ Running in web mode with mock data. File operations are not real.';
  }
  return null;
}
import { useCallback, useState, useEffect } from 'react';
import { FileSystemItem, FileType } from '../types';

// Mock data for web version fallback
const mockFileSystem: { [key: string]: FileSystemItem } = {
    'C:\\': {
        name: 'Local Disk (C:)',
        type: FileType.Drive,
        children: {
            'Users': {
                name: 'Users',
                type: FileType.Directory,
                children: {
                    'Public': {
                        name: 'Public',
                        type: FileType.Directory,
                        children: {
                            'Documents': {
                                name: 'Documents',
                                type: FileType.Directory,
                                children: {
                                    'sample.txt': { name: 'sample.txt', type: FileType.File, size: '1 KB', modified: '2023-10-27' },
                                }
                            }
                        }
                    }
                }
            },
            'Windows': { name: 'Windows', type: FileType.Directory, children: {} },
            'Program Files': { name: 'Program Files', type: FileType.Directory, children: {} }
        }
    }
};

// Extend the window interface
declare global {
  interface Window {
    electronAPI?: {
      readDirectory: (path: string) => Promise<any[]>;
      getFileStats: (path: string) => Promise<any>;
      getDrives: () => Promise<any[]>;
      getHome: () => Promise<string>;
      getSpecialFolders: () => Promise<{[key: string]: string}>;
      copyFile: (source: string, dest: string) => Promise<boolean>;
      moveFile: (source: string, dest: string) => Promise<boolean>;
      deleteFile: (path: string) => Promise<boolean>;
      createDirectory: (path: string) => Promise<boolean>;
      openFile: (path: string) => Promise<boolean>;
      showInFolder: (path: string) => Promise<void>;
      searchWindows: (query: string, searchPath?: string) => Promise<any[]>;
      platform: string;
    };
  }
}

export const useFileSystem = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [specialFolders, setSpecialFolders] = useState<{[key: string]: string}>({});

  const isElectron = !!window.electronAPI;

  // Load special folders on mount - only once
  useEffect(() => {
    let isMounted = true;
    
    if (isElectron) {
      window.electronAPI!.getSpecialFolders()
        .then(folders => {
          if (isMounted) {
            setSpecialFolders(folders);
          }
        })
        .catch(err => {
          if (isMounted) {
            console.error('Failed to load special folders:', err);
          }
        });
    }
    
    return () => {
      isMounted = false;
    };
  }, [isElectron]);

  // Simple synchronous function - no state updates
  const getHomePath = useCallback((): string => {
    if (!isElectron) return 'C:\\'; // Simple fallback for web mode
    return specialFolders.home || 'C:\\';
  }, [isElectron, specialFolders]);

  const getDrives = useCallback(async () => {
    if (!isElectron) {
      return [
        { name: 'Local Disk (C:)', path: 'C:\\', type: FileType.Drive }
      ];
    }
    
    try {
      const drives = await window.electronAPI!.getDrives();
      return drives.map(drive => ({
        ...drive,
        type: FileType.Drive
      }));
    } catch (err: any) {
      console.error('Failed to get drives:', err);
      throw err;
    }
  }, [isElectron]);

  const getContents = useCallback(async (path: string): Promise<FileSystemItem[]> => {
    if (!isElectron) {
      // Fallback to mock data for web version
      const mockGetContents = (path: string): FileSystemItem[] => {
        // Normalize path
        const normalizedPath = path.replace(/\//g, '\\');
        
        // Handle root cases
        if (normalizedPath === 'C:' || normalizedPath === 'C:\\') {
          const rootItem = mockFileSystem['C:\\'];
          if (rootItem && rootItem.children) {
            return Object.values(rootItem.children).sort((a, b) => {
              if (a.type === b.type) return a.name.localeCompare(b.name);
              return a.type === FileType.Directory ? -1 : 1;
            });
          }
          return [];
        }
        
        // Navigate through the mock structure
        const parts = normalizedPath.split('\\').filter(p => p && p !== 'C:');
        let currentLevel = mockFileSystem['C:\\'];
        
        if (!currentLevel) return [];

        for (const part of parts) {
          if (currentLevel.children && currentLevel.children[part]) {
            currentLevel = currentLevel.children[part];
          } else {
            return [];
          }
        }
        
        if (currentLevel && currentLevel.children) {
          return Object.values(currentLevel.children).sort((a, b) => {
            if (a.type === b.type) return a.name.localeCompare(b.name);
            return a.type === FileType.Directory ? -1 : 1;
          });
        }
        return [];
      };
      
      return mockGetContents(path);
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const items = await window.electronAPI!.readDirectory(path);
      return items.map(item => ({
        name: item.name,
        type: item.type === 'directory' ? FileType.Directory : FileType.File,
        size: item.size,
        modified: item.modified,
        fullPath: item.fullPath,
        extension: item.extension
      }));
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [isElectron]);

  const getItem = useCallback(async (path: string): Promise<FileSystemItem | null> => {
    if (!isElectron) {
      // Mock implementation for web mode
      const normalizedPath = path.replace(/\//g, '\\');
      if (normalizedPath === 'C:' || normalizedPath === 'C:\\') {
        return mockFileSystem['C:\\'];
      }
      return null;
    }
    
    try {
      const stats = await window.electronAPI!.getFileStats(path);
      const name = path.split(/[/\\]/).pop() || '';
      
      return {
        name,
        type: stats.isDirectory ? FileType.Directory : FileType.File,
        size: stats.size,
        modified: new Date(stats.modified).toLocaleDateString(),
        fullPath: path
      };
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  }, [isElectron]);

  // File operations (only work in Electron)
  const copyFile = useCallback(async (source: string, dest: string): Promise<boolean> => {
    if (!isElectron) return false;
    
    try {
      return await window.electronAPI!.copyFile(source, dest);
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [isElectron]);

  const moveFile = useCallback(async (source: string, dest: string): Promise<boolean> => {
    if (!isElectron) return false;
    
    try {
      return await window.electronAPI!.moveFile(source, dest);
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [isElectron]);

  const deleteFile = useCallback(async (path: string): Promise<boolean> => {
    if (!isElectron) return false;
    
    try {
      return await window.electronAPI!.deleteFile(path);
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [isElectron]);

  const createDirectory = useCallback(async (path: string): Promise<boolean> => {
    if (!isElectron) return false;
    
    try {
      return await window.electronAPI!.createDirectory(path);
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [isElectron]);

  const openFile = useCallback(async (path: string): Promise<boolean> => {
    if (!isElectron) return false;
    
    try {
      return await window.electronAPI!.openFile(path);
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  }, [isElectron]);

  const showInFolder = useCallback(async (path: string): Promise<void> => {
    if (!isElectron) return;
    
    try {
      await window.electronAPI!.showInFolder(path);
    } catch (err: any) {
      setError(err.message);
    }
  }, [isElectron]);

  return {
    // Properties
    isElectron,
    isLoading,
    error,
    specialFolders,
    
    // Original methods (keeping compatibility)
    getHomePath,
    getDrives,
    getContents,
    getItem,
    
    // New file operations
    copyFile,
    moveFile,
    deleteFile,
    createDirectory,
    openFile,
    showInFolder
  };
};