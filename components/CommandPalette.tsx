
import React, { useState, useEffect, useRef } from 'react';

interface Command {
    id: string;
    name: string;
    action: () => void;
}

interface CommandPaletteProps {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    commands: Command[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, setIsOpen, commands }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    const filteredCommands = commands.filter(command =>
        command.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [searchTerm]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (filteredCommands[selectedIndex]) {
                filteredCommands[selectedIndex].action();
                setIsOpen(false);
            }
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/50" onClick={() => setIsOpen(false)}>
            <div
                className="w-full max-w-lg bg-explorer-bg-secondary rounded-lg shadow-2xl overflow-hidden"
                onClick={e => e.stopPropagation()}
                onKeyDown={handleKeyDown}
            >
                <div className="p-3 border-b border-explorer-border">
                    <input
                        ref={inputRef}
                        type="text"
                        placeholder="Type a command or search..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full bg-transparent text-explorer-text focus:outline-none"
                    />
                </div>
                <ul className="max-h-80 overflow-y-auto p-2">
                    {filteredCommands.length > 0 ? (
                        filteredCommands.map((command, index) => (
                            <li
                                key={command.id}
                                onMouseEnter={() => setSelectedIndex(index)}
                                onClick={() => {
                                    command.action();
                                    setIsOpen(false);
                                }}
                                className={`p-2 rounded-md cursor-pointer ${
                                    index === selectedIndex ? 'bg-explorer-accent text-explorer-accent-text' : 'hover:bg-explorer-hover'
                                }`}
                            >
                                {command.name}
                            </li>
                        ))
                    ) : (
                        <li className="p-4 text-center text-explorer-text-secondary">No results found.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};
