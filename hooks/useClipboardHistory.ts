
import { useState, useEffect, useCallback } from 'react';
import { ClipboardItem, Template } from '../types';

const CLIPBOARD_STORAGE_KEY = 'clipgenius_history';
const TEMPLATES_STORAGE_KEY = 'clipgenius_templates';

export const useClipboardHistory = () => {
  const [history, setHistory] = useState<ClipboardItem[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem(CLIPBOARD_STORAGE_KEY);
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
      const storedTemplates = localStorage.getItem(TEMPLATES_STORAGE_KEY);
       if (storedTemplates) {
        setTemplates(JSON.parse(storedTemplates));
      }
    } catch (error) {
      console.error("Failed to load data from localStorage", error);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(CLIPBOARD_STORAGE_KEY, JSON.stringify(history));
      } catch (error) {
        console.error("Failed to save history to localStorage", error);
      }
    }
  }, [history, isLoading]);

   useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(templates));
      } catch (error) {
        console.error("Failed to save templates to localStorage", error);
      }
    }
  }, [templates, isLoading]);

  const addItem = useCallback((item: ClipboardItem) => {
    setHistory(prev => [item, ...prev.slice(0, 199)]); // Keep history to 200 items
  }, []);

  const deleteItem = useCallback((id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  }, []);

  const updateItem = useCallback((id: string, updates: Partial<ClipboardItem>) => {
    setHistory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const addTemplate = useCallback((template: Omit<Template, 'id'>) => {
    const newTemplate = { ...template, id: crypto.randomUUID() };
    setTemplates(prev => [...prev, newTemplate]);
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  }, []);

  return { 
    history, 
    addItem, 
    deleteItem, 
    updateItem, 
    clearHistory, 
    isLoading,
    templates,
    addTemplate,
    deleteTemplate,
  };
};
