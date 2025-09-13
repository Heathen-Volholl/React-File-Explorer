
export enum FileType {
  File = 'file',
  Directory = 'directory',
  Drive = 'drive',
}

export enum ItemType {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  CODE = 'CODE',
  LINK = 'LINK',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  COLOR = 'COLOR',
  FILE = 'FILE',
}


export interface FileSystemItem {
  name: string;
  type: FileType;
  size?: string;
  modified?: string;
  children?: { [key: string]: FileSystemItem };
  fullPath?: string;
  extension?: string;
}

export interface ClipboardItem {
  id: string;
  type: ItemType;
  content: string; // For text, code, links, etc. or base64 for images
  preview: string; // Truncated text or thumbnail data
  createdAt: number;
  tags: string[];
  metadata?: {
    language?: string; // For code
    fileName?: string;
    fileType?: string;
    isSensitive?: boolean;
  };
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

export type Tag = {
  name: string;
  count: number;
};

export type Template = {
  id: string;
  name: string;
  content: string;
};