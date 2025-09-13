export enum FileType {
  File = 'file',
  Directory = 'directory',
  Drive = 'drive',
}

export interface FileSystemItem {
  name: string;
  type: FileType;
  size?: string;
  modified?: string;
  children?: { [key: string]: FileSystemItem };
}

export interface TabState {
  id: string;
  path: string;
  history: string[];
  historyIndex: number;
  searchResults?: { item: FileSystemItem, path: string }[];
}

export interface PaneState {
  id: string;
  tabs: TabState[];
  activeTabId: string;
}