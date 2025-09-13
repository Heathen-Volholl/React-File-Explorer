import { useState, useCallback } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { FileSystemItem, FileType } from '../types';
import { useFileSystem } from './useFileSystem';

type SearchResult = {
    path: string;
    reason: string;
};

type FormattedResult = {
    item: FileSystemItem;
    path: string;
};

const flattenFileSystem = (node: { [key: string]: FileSystemItem }, path = ''): string[] => {
    let fileList: string[] = [];
    for (const key in node) {
        const currentPath = path ? `${path}/${key}` : key;
        const item = node[key];

        if (item.type === FileType.Directory || item.type === FileType.Drive) {
            fileList.push(`D: ${currentPath}`);
        } else if (item.type === FileType.File) {
            fileList.push(`F: ${currentPath} | ${item.size || 'N/A'} | ${item.modified || 'N/A'}`);
        }
        
        if (item.children) {
            fileList = fileList.concat(flattenFileSystem(item.children, currentPath));
        }
    }
    return fileList;
};

export const useSemanticSearch = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { getItem } = useFileSystem();

    const search = useCallback(async (query: string, fileSystem: { [key: string]: FileSystemItem }): Promise<FormattedResult[]> => {
        setIsLoading(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            const fileSystemString = flattenFileSystem(fileSystem).join('\n');
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: `Based on the following file system structure, find files and folders that match the user's query.\n\nFile System:\n${fileSystemString}\n\nUser Query: "${query}"`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                path: {
                                    type: Type.STRING,
                                    description: "The full, exact path to the file or folder."
                                },
                                reason: {
                                    type: Type.STRING,
                                    description: "A brief explanation of why this item is relevant."
                                }
                            },
                            propertyOrdering: ["path", "reason"],
                        }
                    },
                    systemInstruction: "You are an intelligent file system assistant. Your goal is to find files and folders based on a user's natural language query. The file system is provided in a compact format where each line represents a file or directory. 'D:' indicates a directory or drive. 'F:' indicates a file, followed by its path, size, and modification date, separated by '|'. Analyze this structure and the user query. Return a JSON array of objects, each containing the full, exact path to a relevant item and a brief reason for its relevance. Only return paths that exist in the provided structure. If no results are found, return an empty array."
                },
            });

            const jsonStr = response.text.trim();
            const results: SearchResult[] = JSON.parse(jsonStr);
            
            const formattedResults: FormattedResult[] = results
                .map(result => {
                    const item = getItem(result.path);
                    if (item) {
                        return { item, path: result.path };
                    }
                    console.warn(`Search result path not found in file system: ${result.path}`);
                    return null;
                })
                .filter((r): r is FormattedResult => r !== null);

            return formattedResults;

        } catch (e: any) {
            console.error("Semantic search failed:", e);
            setError(e.message || 'An error occurred during the search.');
            return [];
        } finally {
            setIsLoading(false);
        }
    }, [getItem]);

    return { search, isLoading, error };
};