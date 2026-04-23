import { useEffect, useState } from 'react';
import { useCollectionStore } from '@/store/collectionStore';
import { useRequestStore } from '@/store/requestStore';
import type { Collection } from '@/types/api';

export function CollectionsManager() {
  const { collections, loadCollections, createCollection, deleteCollection } = useCollectionStore();
  const { requests, loadAllRequests, setCurrentRequest } = useRequestStore();
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    loadCollections();
    loadAllRequests();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createCollection(newName, newDesc);
    setNewName('');
    setNewDesc('');
  };

  const selected = collections.find((c) => c.id === selectedId);
  const collectionRequests = selected 
    ? requests.filter((r) => selected.requests.includes(r.id))
    : [];

  return (
    <div className="flex gap-4">
      <div className="w-72 shrink-0">
        <div className="mb-4 p-4 bg-white rounded border border-gray-200">
          <h3 className="text-sm font-semibold mb-3">New Collection</h3>
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full mb-2 px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <input
            type="text"
            placeholder="Description"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            className="w-full mb-3 px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <button
            onClick={handleCreate}
            className="w-full px-3 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700"
          >
            Create
          </button>
        </div>

        <div className="space-y-2">
          {collections.map((col) => (
            <div
              key={col.id}
              onClick={() => setSelectedId(col.id)}
              className={`p-3 bg-white rounded border cursor-pointer ${
                selectedId === col.id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'
              }`}
            >
              <div className="text-sm font-medium">{col.nombre}</div>
              <div className="text-xs text-gray-500">{col.requests.length} requests</div>
            </div>
          ))}
          {collections.length === 0 && (
            <div className="text-sm text-gray-400">No collections yet</div>
          )}
        </div>
      </div>

      <div className="flex-1">
        {selected ? (
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selected.nombre}</h3>
              <button
                onClick={() => deleteCollection(selected.id)}
                className="px-3 py-1 text-red-600 text-sm hover:bg-red-50 rounded"
              >
                Delete
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">{selected.descripcion}</p>
            
            <div className="space-y-1">
              {collectionRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => setCurrentRequest(req)}
                  className="p-2 bg-gray-50 rounded cursor-pointer hover:bg-gray-100 flex items-center gap-2"
                >
                  <span className={`text-xs font-medium ${
                    req.method === 'GET' ? 'text-green-600' :
                    req.method === 'POST' ? 'text-blue-600' :
                    req.method === 'PUT' ? 'text-orange-600' :
                    req.method === 'PATCH' ? 'text-purple-600' : 'text-red-600'
                  }`}>{req.method}</span>
                  <span className="text-sm truncate">{req.nombre}</span>
                </div>
              ))}
              {collectionRequests.length === 0 && (
                <div className="text-sm text-gray-400">No requests in this collection</div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-center p-8">Select a collection</div>
        )}
      </div>
    </div>
  );
}

export default CollectionsManager;