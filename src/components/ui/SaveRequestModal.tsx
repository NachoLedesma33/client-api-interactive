import { useState, useEffect, useMemo, Fragment } from 'react';
import { createPortal } from 'react-dom';
import { useRequestStore } from '@/store/requestStore';
import { useCollectionStore } from '@/store/collectionStore';
import { useResponseStore } from '@/store/responseStore';
import type { Request } from '@/types/api';

interface SaveRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SaveRequestModal({ isOpen, onClose }: SaveRequestModalProps) {
  const { currentRequest, saveCurrentRequest, setCurrentRequest, requests } = useRequestStore();
  const { collections, loadCollections, addRequestToCollection } = useCollectionStore();
  const { currentResponse } = useResponseStore();

  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [selectedCollection, setSelectedCollection] = useState<string>('');
  const [tagsInput, setTagsInput] = useState('');
  const [saveWithResponse, setSaveWithResponse] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadCollections();
      if (currentRequest) {
        setNombre(currentRequest.nombre);
        setDescripcion('');
        setTagsInput('');
      }
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const tags = useMemo(() => {
    return tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t !== '');
  }, [tagsInput]);

  const nameExists = useMemo(() => {
    return requests.some(
      (r) => r.nombre.toLowerCase() === nombre.toLowerCase() && r.id !== currentRequest?.id
    );
  }, [requests, nombre, currentRequest?.id]);

  const handleSave = async () => {
    if (!nombre.trim()) {
      setError('Name is required');
      return;
    }

    if (nameExists) {
      setError('A request with this name already exists');
      return;
    }

    setError(null);

    const updatedRequest: Request = {
      ...currentRequest!,
      id: currentRequest!.id,
      nombre: nombre.trim(),
      createdAt: currentRequest!.createdAt,
      lastUsed: new Date().toISOString(),
    };

    setCurrentRequest(updatedRequest);
    await saveCurrentRequest();

    if (selectedCollection) {
      await addRequestToCollection(selectedCollection, updatedRequest.id);
    }

    onClose();
  };

  const handleSaveAsNew = async () => {
    if (!nombre.trim()) {
      setError('Name is required');
      return;
    }

    setError(null);

    const newRequest: Request = {
      ...currentRequest!,
      id: crypto.randomUUID(),
      nombre: nombre.trim(),
      createdAt: new Date().toISOString(),
      lastUsed: null,
    };

    setCurrentRequest(newRequest);
    await saveCurrentRequest();

    if (selectedCollection) {
      await addRequestToCollection(selectedCollection, newRequest.id);
    }

    onClose();
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 transform transition-all duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">Save Request</h2>
        </div>

        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-sm text-red-600">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => {
                setNombre(e.target.value);
                setError(null);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="My API Request"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              rows={3}
              placeholder="Optional description..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Collection
            </label>
            <select
              value={selectedCollection}
              onChange={(e) => setSelectedCollection(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
            >
              <option value="">No collection</option>
              {collections.map((col) => (
                <option key={col.id} value={col.id}>
                  {col.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded text-sm"
              placeholder="tag1, tag2, tag3"
            />
            <p className="text-xs text-gray-400 mt-1">Separate tags with commas</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="saveWithResponse"
              checked={saveWithResponse}
              onChange={(e) => setSaveWithResponse(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="saveWithResponse" className="text-sm text-gray-600">
              Save with current response
            </label>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSaveAsNew}
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded"
          >
            Save as new
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-sm bg-indigo-600 text-white hover:bg-indigo-700 rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}