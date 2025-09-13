
import React, { useEffect } from 'react';
import { useToastState } from '../contexts/ToastContext';

interface ToastProps {
  message: string;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss();
    }, 3000); // Auto-dismiss after 3 seconds

    return () => clearTimeout(timer);
  }, [onDismiss]);

  return (
    <div className="bg-explorer-bg-secondary text-explorer-text rounded-md shadow-lg p-3 m-2 text-sm border border-explorer-border animate-fade-in-up">
      {message}
    </div>
  );
};

export const ToastContainer: React.FC = () => {
  const { toasts, setToasts } = useToastState();

  const handleDismiss = (id: number) => {
    setToasts(prevToasts => prevToasts.filter(toast => toast.id !== id));
  };

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 p-4">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          onDismiss={() => handleDismiss(toast.id)}
        />
      ))}
    </div>
  );
};
