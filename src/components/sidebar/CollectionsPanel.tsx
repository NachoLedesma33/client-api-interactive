import { useState, useEffect, useRef, DragEvent, MouseEvent } from 'react';
import { useCollectionStore } from '@/store/collectionStore';
import { useRequestStore } from '@/store/requestStore';
import type { Collection, Request } from '@/types/api';

export function CollectionsPanel() {
  const { 
    collections, loadCollections, createCollection, updateCollection, deleteCollection, 
    addRequestToCollection, removeRequestFromCollection 
  } = useCollectionStore();
  const { requests, loadAllRequests, setCurrentRequest, loadRequest } = useRequestStore();
  
  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; type: 'collection' | 'request'; id: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadCollections();
    loadAllRequests();
  }, []);

  useEffect(() => {
    const handleClick = () => setContextMenu(null);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createCollection(newName, newDesc);
    setNewName('');
    setNewDesc('');
    setShowNewForm(false);
  };

  const handleEdit = async (id: string) => {
    if (!editName.trim()) return;
    await updateCollection(id, { nombre: editName });
    setEditingId(null);
  };

  const handleContextMenu = (e: MouseEvent, type: 'collection' | 'request', id: string) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, type, id });
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: DragEvent, colId: string) => {
    e.preventDefault();
    const requestId = e.dataTransfer.getData('text/plain');
    if (requestId) {
      await addRequestToCollection(colId, requestId);
    }
  };

  const handleExportCollection = (collection: Collection) => {
    const collectionRequests = requests.filter((r) => collection.requests.includes(r.id));
    const data = { collection, requests: collectionRequests };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${collection.nombre}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportAll = async () => {
    const { environments } = await import('@/store/environmentStore');
    const data = { collections, requests, environments };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-client-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const data = JSON.parse(text);
      if (data.collections && Array.isArray(data.collections)) {
        for (const col of data.collections) {
          await createCollection(col.nombre, col.descripcion);
        }
      }
    } catch {}
    e.target.value = '';
  };

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const methodColors: Record<string, string> = {
    GET: 'text-green-600',
    POST: 'text-yellow-600',
    PUT: 'text-blue-600',
    PATCH: 'text-purple-600',
    DELETE: 'text-red-600',
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Collections</h3>
          <div className="flex gap-1">
            <button onClick={handleImport} className="p-1 text-gray-500 hover:text-gray-700" title="Import">
              ↓
            </button>
            <button onClick={handleExportAll} className="p-1 text-gray-500 hover:text-gray-700" title="Export">
              ↑
            </button>
          </div>
        </div>
        
        {showNewForm ? (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <input
              type="text"
              placeholder="Description"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
            />
            <div className="flex gap-1">
              <button onClick={handleCreate} className="flex-1 px-2 py-1 bg-indigo-600 text-white text-sm rounded">
                Create
              </button>
              <button onClick={() => setShowNewForm(false)} className="px-2 py-1 text-gray-500 text-sm rounded">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowNewForm(true)}
            className="w-full px-3 py-2 bg-indigo-600 text-white text-sm font-medium rounded hover:bg-indigo-700"
          >
            + New Collection
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {collections.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            No collections. Create one to organize your requests.
          </div>
        ) : (
          <ul className="space-y-2">
            {collections.map((col) => (
              <li key={col.id}>
                <div
                  onContextMenu={(e) => handleContextMenu(e, 'collection', col.id)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, col.id)}
                  className="group"
                >
                  <button
                    onClick={() => toggleExpand(col.id)}
                    className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-200 flex items-center gap-2"
                  >
                    <span className="text-xs">
                      {expandedIds.has(col.id) ? '▼' : '▶'}
                    </span>
                    <span className="text-sm">📁</span>
                    {editingId === col.id ? (
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        onBlur={() => handleEdit(col.id)}
                        onKeyDown={(e) => e.key === 'Enter' && handleEdit(col.id)}
                        className="flex-1 px-1 text-sm border border-gray-300 rounded"
                        autoFocus
                      />
                    ) : (
                      <span className="flex-1 text-sm truncate">{col.nombre}</span>
                    )}
                    <span className="text-xs text-gray-400">{col.requests.length}</span>
                  </button>
                </div>
                
                {expandedIds.has(col.id) && (
                  <ul className="ml-4 mt-1 space-y-1">
                    {requests
                      .filter((r) => col.requests.includes(r.id))
                      .map((req) => (
                        <li
                          key={req.id}
                          onContextMenu={(e) => handleContextMenu(e, 'request', req.id)}
                          className="group"
                        >
                          <button
                            onClick={() => {
                              loadRequest(req.id);
                              setCurrentRequest(req);
                            }}
                            className="w-full text-left px-2 py-1 rounded hover:bg-gray-200 flex items-center gap-2"
                          >
                            <span className={`text-xs font-medium ${methodColors[req.method]}`}>
                              {req.method}
                            </span>
                            <span className="text-sm truncate">{req.nombre || req.url}</span>
                          </button>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {contextMenu && (
        <div
          className="fixed bg-white border border-gray-200 rounded shadow-lg z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          {contextMenu.type === 'collection' && (
            <>
              <button
                onClick={() => {
                  setEditingId(contextMenu.id);
                  setEditName(collections.find((c) => c.id === contextMenu.id)?.nombre || '');
                  setContextMenu(null);
                }}
                className="block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100"
              >
                Rename
              </button>
              <button
                onClick={() => handleExportCollection(collections.find((c) => c.id === contextMenu.id)!)}
                className="block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100"
              >
                Export
              </button>
              <button
                onClick={() => {
                  deleteCollection(contextMenu.id);
                  setContextMenu(null);
                }}
                className="block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </>
          )}
          {contextMenu.type === 'request' && (
            <>
              <button
                onClick={() => {
                  const req = requests.find((r) => r.id === contextMenu.id);
                  if (req) {
                    loadRequest(req.id);
                    setCurrentRequest(req);
                  }
                  setContextMenu(null);
                }}
                className="block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100"
              >
                Load
              </button>
              <button
                onClick={() => {
                  collections.forEach((col) => {
                    if (col.requests.includes(contextMenu.id)) {
                      removeRequestFromCollection(col.id, contextMenu.id);
                    }
                  });
                  setContextMenu(null);
                }}
                className="block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
              >
                Remove from Collection
              </button>
            </>
          )}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}