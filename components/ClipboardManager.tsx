import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useClipboardHistory } from '../hooks/useClipboardHistory';
import { ClipboardItem, ItemType, Tag, Template } from '../types';
import { Icons, ItemTypeIcon } from './icons';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

// --- UTILITY FUNCTIONS ---
const getMimeType = (file: File): string => file.type;
const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve((reader.result as string).split(',')[1]);
  reader.onerror = error => reject(error);
});
const truncate = (str: string, length: number) => str.length > length ? `${str.substring(0, length)}...` : str;

const analyzeTextContent = (text: string): { type: ItemType; preview: string; } => {
    if (/^https?:\/\/[^\s$.?#].[^\s]*$/i.test(text)) return { type: ItemType.LINK, preview: text };
    if (/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(text)) return { type: ItemType.EMAIL, preview: text };
    if (/^(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/.test(text)) return { type: ItemType.PHONE, preview: text };
    if (/^(rgb|hsl)a?\((\s*\d+\s*,){2,3}\s*[\d.]+\s*\)|#([0-9a-f]{3}){1,2}$/i.test(text)) return { type: ItemType.COLOR, preview: text };
    // Basic check for code-like structures
    if (/[{};=()]/.test(text.substring(0, 200)) && text.includes('\n')) return { type: ItemType.CODE, preview: truncate(text, 100) };
    return { type: ItemType.TEXT, preview: truncate(text, 100) };
};

// --- SUB-COMPONENTS (Defined outside main component to prevent re-creation on re-renders) ---

interface SidebarProps {
  tags: Tag[];
  activeTag: string | null;
  onTagClick: (tag: string | null) => void;
  templates: Template[];
  onTemplateUse: (content: string) => void;
  onTemplateAdd: () => void;
  onTemplateDelete: (id: string) => void;
}
const Sidebar: React.FC<SidebarProps> = ({ tags, activeTag, onTagClick, templates, onTemplateUse, onTemplateAdd, onTemplateDelete }) => (
    <div className="w-64 bg-explorer-bg-secondary p-4 flex flex-col shrink-0 border-r border-explorer-border">
    <h2 className="text-lg font-bold mb-4 text-explorer-text">ClipGenius</h2>
        <div className="mb-6">
            <h3 className="text-xs font-semibold text-explorer-text-secondary mb-2 flex items-center"><Icons.Tag className="w-4 h-4 mr-2"/> Tags</h3>
            <div className="flex flex-col space-y-1">
                <button onClick={() => onTagClick(null)} className={`text-left text-sm p-2 rounded-md ${!activeTag ? 'bg-explorer-accent/20 text-explorer-accent' : 'hover:bg-explorer-hover'}`}>All Items</button>
                {tags.map(tag => (
                    <button key={tag.name} onClick={() => onTagClick(tag.name)} className={`text-left text-sm p-2 rounded-md flex justify-between items-center ${activeTag === tag.name ? 'bg-explorer-accent/20 text-explorer-accent' : 'hover:bg-explorer-hover'}`}>
                        <span>{tag.name}</span>
                        <span className="text-xs bg-explorer-badge px-1.5 py-0.5 rounded-full">{tag.count}</span>
                    </button>
                ))}
            </div>
        </div>
        <div>
            <h3 className="text-xs font-semibold text-explorer-text-secondary mb-2 flex items-center justify-between">
                <div className="flex items-center"><Icons.Star className="w-4 h-4 mr-2"/> Templates</div>
                <button onClick={onTemplateAdd} className="p-1 hover:bg-explorer-hover rounded"><Icons.Plus className="w-4 h-4"/></button>
            </h3>
            <div className="flex flex-col space-y-1 max-h-64 overflow-y-auto">
                {templates.map(t => (
                    <div key={t.id} className="group text-left text-sm p-2 rounded-md hover:bg-explorer-hover flex justify-between items-center">
                        <button onClick={() => onTemplateUse(t.content)} className="flex-grow text-left">
                            <p className="font-semibold">{t.name}</p>
                            <p className="text-xs text-explorer-text-secondary">{truncate(t.content, 30)}</p>
                        </button>
                        <button onClick={() => onTemplateDelete(t.id)} className="opacity-0 group-hover:opacity-100 p-1 text-explorer-danger hover:bg-explorer-danger/20 rounded"><Icons.Trash className="w-3 h-3"/></button>
                    </div>
                ))}
            </div>
        </div>
    </div>
);

interface HistoryListProps {
  items: ClipboardItem[];
  selectedId: string | null;
  onSelect: (item: ClipboardItem) => void;
  onDelete: (id: string) => void;
}
const HistoryList: React.FC<HistoryListProps> = ({ items, selectedId, onSelect, onDelete }) => {
    return (
    <div className="flex-1 p-4 overflow-y-auto bg-explorer-bg">
            <div className="grid grid-cols-1 gap-3">
                {items.map(item => (
                    <button
                        key={item.id}
                        onClick={() => onSelect(item)}
                        className={`p-3 rounded-lg text-left transition-colors duration-200 group ${selectedId === item.id ? 'bg-explorer-accent/10' : 'bg-explorer-bg-secondary hover:bg-explorer-hover'}`}
                    >
                        <div className="flex items-start">
                            <div className="mr-3 pt-1">
                                <ItemTypeIcon type={item.type} className="w-5 h-5 text-explorer-text-secondary" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                                {item.type === ItemType.IMAGE ? (
                                    <img src={`data:image/png;base64,${item.content}`} alt="clipboard item" className="max-h-24 rounded-md object-contain" />
                                ) : (
                                    <p className="text-sm text-explorer-text break-words whitespace-pre-wrap font-mono">{item.preview}</p>
                                )}
                            </div>
                            <button
                                type="button"
                                onClick={e => {
                                    e.stopPropagation();
                                    onDelete(item.id);
                                }}
                                className="p-1.5 text-explorer-text-secondary rounded-full hover:bg-explorer-danger/20 hover:text-explorer-danger opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <Icons.Trash className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                            <div className="flex gap-1.5">
                                {item.tags.map(tag => (
                                    <span key={tag} className="text-xs bg-explorer-badge px-2 py-0.5 rounded-full">{tag}</span>
                                ))}
                            </div>
                            <span className="text-xs text-explorer-text-secondary">{new Date(item.createdAt).toLocaleTimeString()}</span>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

interface DetailViewProps {
    item: ClipboardItem | null;
    onUpdate: (id: string, updates: Partial<ClipboardItem>) => void;
}
const DetailView: React.FC<DetailViewProps> = ({ item }) => {
    const [copied, setCopied] = useState(false);
    useEffect(() => { setCopied(false); }, [item]);
    if (!item) {
        return (
            <div className="w-1/3 bg-explorer-bg-secondary/70 p-6 flex flex-col items-center justify-center text-explorer-text-secondary">
                <Icons.Clipboard className="w-16 h-16 mb-4"/>
                <h3 className="text-lg">Select an item</h3>
                <p className="text-sm text-center">Select an item from the list to see its details and perform actions.</p>
            </div>
        );
    }
    const handleCopy = () => {
        navigator.clipboard.writeText(item.content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    const renderContent = () => {
        switch (item.type) {
            case ItemType.IMAGE:
                return <img src={`data:image/png;base64,${item.content}`} alt="clipboard content" className="w-full rounded-lg object-contain max-h-64"/>;
            case ItemType.CODE:
                return (
                    <div className="relative group">
                        <SyntaxHighlighter language={item.metadata?.language || 'plaintext'} style={atomDark} customStyle={{ margin: 0, borderRadius: '0.5rem', maxHeight: '50vh' }}>
                            {item.content}
                        </SyntaxHighlighter>
                    </div>
                );
            case ItemType.COLOR:
                return (
                    <div className="flex items-center gap-4">
                        <div className="w-24 h-24 rounded-lg border-4 border-explorer-border" style={{ backgroundColor: item.content }}></div>
                        <p className="text-2xl font-mono">{item.content}</p>
                    </div>
                );
            default:
                return <p className="text-base whitespace-pre-wrap break-words bg-explorer-bg-secondary p-4 rounded-lg font-mono">{item.content}</p>;
        }
    };
    return (
    <div className="w-1/3 bg-explorer-bg-secondary/30 p-6 flex flex-col overflow-y-auto">
            <div className="flex-1">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-lg font-bold text-explorer-text">
                        <ItemTypeIcon type={item.type} className="w-6 h-6"/>
                        <span>{ItemType[item.type]}</span>
                    </div>
                    <span className="text-sm text-explorer-text-secondary">{new Date(item.createdAt).toLocaleString()}</span>
                </div>
                <div className="mb-4">{renderContent()}</div>
            </div>
            <div className="flex flex-col gap-2 mt-auto">
                {item.metadata?.isSensitive && <div className="flex items-center gap-2 p-2 rounded-md bg-explorer-warning/10 text-explorer-warning text-xs"><Icons.Warning className="w-4 h-4 shrink-0"/> Potentially sensitive data detected.</div>}
                <button onClick={handleCopy} className="w-full flex items-center justify-center gap-2 p-2 rounded-md bg-explorer-accent/20 hover:bg-explorer-accent/30 text-explorer-accent">
                    {copied ? <><Icons.Check className="w-4 h-4"/> Copied!</> : <><Icons.Copy className="w-4 h-4"/> Copy</>}
                </button>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
const ClipboardManager: React.FC = () => {
    const { history, addItem, deleteItem, updateItem, clearHistory, templates, addTemplate, deleteTemplate } = useClipboardHistory();
    const [selectedItem, setSelectedItem] = useState<ClipboardItem | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTag, setActiveTag] = useState<string | null>(null);

    useEffect(() => {
        const handlePaste = async (event: ClipboardEvent) => {
            const clipboardData = event.clipboardData;
            if (!clipboardData) return;

            let newItem: ClipboardItem | null = null;
            const text = clipboardData.getData('text/plain');

            if (clipboardData.files.length > 0 && clipboardData.files[0].type.startsWith('image/')) {
                const file = clipboardData.files[0];
                const base64 = await fileToBase64(file);
                newItem = {
                    id: crypto.randomUUID(),
                    type: ItemType.IMAGE,
                    content: base64,
                    preview: 'Image',
                    createdAt: Date.now(),
                    tags: ['image'],
                };
            } else if (text) {
                const { type, preview } = analyzeTextContent(text);
                newItem = {
                    id: crypto.randomUUID(),
                    type,
                    content: text,
                    preview,
                    createdAt: Date.now(),
                    tags: [type.toLowerCase()],
                };

                                // AI code analysis removed
            }
            
            if (newItem) {
                addItem(newItem);
                setSelectedItem(newItem);
            }
        };

        document.addEventListener('paste', handlePaste);
        return () => document.removeEventListener('paste', handlePaste);
    }, [addItem]);

    useEffect(() => {
        if (selectedItem && !history.find(h => h.id === selectedItem.id)) {
            setSelectedItem(null);
        }
    }, [history, selectedItem]);
    
    const handleDeleteItem = (id: string) => {
        deleteItem(id);
        if (selectedItem?.id === id) {
            setSelectedItem(null);
        }
    }

    const tags = useMemo<Tag[]>(() => {
        const tagCount: Record<string, number> = {};
        history.forEach(item => {
            item.tags.forEach(tag => {
                tagCount[tag] = (tagCount[tag] || 0) + 1;
            });
        });
        return Object.entries(tagCount).map(([name, count]) => ({ name, count })).sort((a,b) => b.count - a.count);
    }, [history]);

    const filteredHistory = useMemo(() => {
        return history.filter(item => {
            const matchesSearch = item.content.toLowerCase().includes(searchTerm.toLowerCase()) || item.preview.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTag = !activeTag || item.tags.includes(activeTag);
            return matchesSearch && matchesTag;
        });
    }, [history, searchTerm, activeTag]);

    const handleTemplateAdd = () => {
        const name = prompt("Enter template name:");
        const content = prompt("Enter template content:");
        if (name && content) {
            addTemplate({ name, content });
        }
    };
    
    const handleUseTemplate = async (content: string) => {
        try {
            await navigator.clipboard.writeText(content);
            alert("Template content copied to clipboard!");
        } catch (err) {
            console.error('Failed to copy: ', err);
            alert("Failed to copy template content.");
        }
    }

    return (
    <div className="flex h-full w-full bg-explorer-bg">
            <Sidebar 
              tags={tags} 
              activeTag={activeTag} 
              onTagClick={setActiveTag} 
              templates={templates} 
              onTemplateAdd={handleTemplateAdd}
              onTemplateDelete={deleteTemplate}
              onTemplateUse={handleUseTemplate}
            />
            <div className="flex-[2] bg-explorer-bg flex flex-col">
                <div className="p-4 border-b border-explorer-border">
                                        <div className="relative">
                                             <Icons.Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-explorer-text-secondary"/>
                                             <input 
                                                 type="text" 
                                                 placeholder="Search history..." 
                                                 value={searchTerm} 
                                                 onChange={(e) => setSearchTerm(e.target.value)} 
                                                 className="w-full bg-explorer-bg-secondary rounded-full pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-explorer-accent"
                                             />
                                        </div>
                </div>
                {filteredHistory.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-explorer-text-secondary p-4">
                      <Icons.Clipboard className="w-16 h-16 mb-4"/>
                      <h3 className="text-lg">Your clipboard is empty</h3>
                      <p className="text-sm text-center">Press <kbd className="px-2 py-1.5 text-xs font-semibold text-explorer-bg bg-explorer-badge border border-explorer-border rounded-lg">Ctrl+V</kbd> or <kbd className="px-2 py-1.5 text-xs font-semibold text-explorer-bg bg-explorer-badge border border-explorer-border rounded-lg">Cmd+V</kbd> to add an item.</p>
                  </div>
                ) : (
                  <HistoryList items={filteredHistory} selectedId={selectedItem?.id || null} onSelect={setSelectedItem} onDelete={handleDeleteItem}/>
                )}
            </div>
            <DetailView item={selectedItem} onUpdate={updateItem}/>
        </div>
    );
};

export default ClipboardManager;