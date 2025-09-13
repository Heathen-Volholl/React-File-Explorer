
import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ToastMessage {
  id: number;
  message: string;
}

interface ToastContextType {
  addToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts(prevToasts => [...prevToasts, { id, message }]);
  }, []);

  const value = { addToast, toasts, setToasts };

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
    </ToastContext.Provider>
  );
};

// This is a bit of a hack to share state between the Provider and the Container
// A more robust solution might use a library like Zustand or Redux for global state.
export const useToastState = () => {
    const context = useContext(ToastContext);
    // This is an unsafe cast, but we know what we are providing in ToastProvider.
    return (context as any) as {
        toasts: ToastMessage[];
        setToasts: React.Dispatch<React.SetStateAction<ToastMessage[]>>;
    };
}
