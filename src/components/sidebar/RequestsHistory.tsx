import { useState, useEffect, useMemo, DragEvent } from 'react';
import { useRequestStore } from '@/store/requestStore';
import type { Request } from '@/types/api';

interface GroupedRequests {
  today: Request[];
  yesterday: Request[];
  older: Request[];
}

export function RequestsHistory() {
  const { recentRequests, loadRequest, deleteRequest, duplicateRequest, fetchRecent, setCurrentRequest } = useRequestStore();
  const [search, setSearch] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  useEffect(() => {
    fetchRecent(50);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'h') {
        e.preventDefault();
        const input = document.getElementById('history-search');
        input?.focus();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const grouped = useMemo((): GroupedRequests => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    const filtered = recentRequests.filter(
      (r) =>
        r.lastUsed &&
        (r.nombre.toLowerCase().includes(search.toLowerCase()) ||
          r.url.toLowerCase().includes(search.toLowerCase()))
    );

    const groupByDate = (req: Request) => {
      const date = new Date(req.lastUsed!);
      if (date >= today) return 'today';
      if (date >= yesterday) return 'yesterday';
      return 'older';
    };

    return {
      today: filtered.filter((r) => groupByDate(r) === 'today'),
      yesterday: filtered.filter((r) => groupByDate(r) === 'yesterday'),
      older: filtered.filter((r) => groupByDate(r) === 'older'),
    };
  }, [recentRequests, search]);

  const handleClick = async (req: Request) => {
    await loadRequest(req.id);
    setCurrentRequest(req);
  };

  const handleDelete = async (id: string) => {
    await deleteRequest(id);
    setMenuOpenId(null);
  };

  const handleDuplicate = async (id: string) => {
    await duplicateRequest(id);
    setMenuOpenId(null);
  };

  const handleDragStart = (e: DragEvent, req: Request) => {
    e.dataTransfer.setData('text/plain', req.id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const methodColors: Record<string, string> = {
    GET: 'text-green-600',
    POST: 'text-yellow-600',
    PUT: 'text-blue-600',
    PATCH: 'text-purple-600',
    DELETE: 'text-red-600',
  };

  const renderGroup = (requests: Request[], title: string) => {
    if (requests.length === 0) return null;

    return (
      <div className="mb-4">
        <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2 px-2">{title}</h3>
        <ul className="space-y-1">
          {requests.map((req) => (
            <li
              key={req.id}
              draggable
              onDragStart={(e) => handleDragStart(e, req)}
              className="relative group"
            >
              <button
                onClick={() => handleClick(req)}
                className="w-full text-left px-2 py-1.5 rounded hover:bg-gray-200 flex items-center gap-2"
              >
                <span className={`text-xs font-medium ${methodColors[req.method]}`}>
                  {req.method}
                </span>
                <span className="flex-1 text-sm truncate text-gray-700">
                  {req.nombre || req.url}
                </span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === req.id ? null : req.id);
                }}
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 px-1 text-gray-400 hover:text-gray-600"
              >
                ⋮
              </button>
              {menuOpenId === req.id && (
                <div className="absolute right-8 top-0 bg-white border border-gray-200 rounded shadow-lg z-10">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDuplicate(req.id);
                    }}
                    className="block w-full px-3 py-1.5 text-left text-sm hover:bg-gray-100"
                  >
                    Duplicate
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(req.id);
                    }}
                    className="block w-full px-3 py-1.5 text-left text-sm text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <input
          id="history-search"
          type="text"
          placeholder="Search... (Ctrl+H)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded"
        />
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {grouped.today.length === 0 &&
        grouped.yesterday.length === 0 &&
        grouped.older.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            No requests yet. Make a request to see it here.
          </div>
        ) : (
          <>
            {renderGroup(grouped.today, 'Today')}
            {renderGroup(grouped.yesterday, 'Yesterday')}
            {renderGroup(grouped.older, 'Older')}
          </>
        )}
      </div>
    </div>
  );
}