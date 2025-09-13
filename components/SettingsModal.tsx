import React, { useState } from 'react';

interface CloudKeys {
  onedrive: string;
  gdrive: string;
  dropbox: string;
  onSave: (keys: { onedrive: string; gdrive: string; dropbox: string }) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<CloudKeys> = ({ onedrive, gdrive, dropbox, onSave, onClose }) => {
  const [keys, setKeys] = useState({ onedrive, gdrive, dropbox });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setKeys({ ...keys, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(keys);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <form onSubmit={handleSubmit} className="bg-explorer-bg-secondary rounded-lg shadow-xl p-8 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">Cloud API Keys</h2>
        <label className="block mb-2">
          OneDrive API Key
          <input
            className="w-full mt-1 p-2 border border-explorer-border rounded"
            name="onedrive"
            value={keys.onedrive}
            onChange={handleChange}
            autoComplete="off"
          />
        </label>
        <label className="block mb-2">
          Google Drive API Key
          <input
            className="w-full mt-1 p-2 border border-explorer-border rounded"
            name="gdrive"
            value={keys.gdrive}
            onChange={handleChange}
            autoComplete="off"
          />
        </label>
        <label className="block mb-4">
          Dropbox API Key
          <input
            className="w-full mt-1 p-2 border border-explorer-border rounded"
            name="dropbox"
            value={keys.dropbox}
            onChange={handleChange}
            autoComplete="off"
          />
        </label>
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-explorer-border rounded">Cancel</button>
          <button type="submit" className="px-4 py-2 bg-explorer-accent text-explorer-accent-text rounded">Save</button>
        </div>
      </form>
    </div>
  );
};
