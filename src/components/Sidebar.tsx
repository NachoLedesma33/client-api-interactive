import { useEffect } from 'react';
import { useRequestStore } from '@/store/requestStore';
import { useCollectionStore } from '@/store/collectionStore';

export function Sidebar() {
  const { requests, loadAllRequests, fetchRecent } = useRequestStore();
  const { collections, loadCollections } = useCollectionStore();

  useEffect(() => {
    loadAllRequests();
    fetchRecent(10);
    loadCollections();
  }, []);

  return (
    <div className="w-64 bg-gray-100 border-r border-gray-200 p-4 overflow-y-auto">
      <div className="mb-4">
        <button className="w-full mb-2 px-3 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700">
          + New Request
        </button>
      </div>
      
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Recent</h3>
        <ul className="space-y-1">
          {requests.slice(0, 5).map((req) => (
            <li key={req.id}>
              <button className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-200 truncate">
                <span className={`text-xs mr-1 ${
                  req.method === 'GET' ? 'text-green-600' :
                  req.method === 'POST' ? 'text-blue-600' :
                  req.method === 'PUT' ? 'text-orange-600' :
                  req.method === 'PATCH' ? 'text-purple-600' :
                  'text-red-600'
                }`}>{req.method}</span>
                {req.nombre}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">Collections</h3>
        <ul className="space-y-1">
          {collections.map((col) => (
            <li key={col.id}>
              <button className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-gray-200">
                📁 {col.nombre}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}