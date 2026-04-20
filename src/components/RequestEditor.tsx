import { useState, useEffect } from 'react';
import { useRequestStore } from '@/store/requestStore';
import { useResponseStore } from '@/store/responseStore';
import { useEnvironmentStore } from '@/store/environmentStore';
import type { Request, HttpMethod, BodyType } from '@/types/api';

export function RequestEditor() {
  const { currentRequest, setCurrentRequest, updateCurrentRequestField, saveCurrentRequest, clearCurrentRequest } = useRequestStore();
  const { sendRequest, isFetching, error } = useResponseStore();
  const { resolveVariables } = useEnvironmentStore();

  const [localRequest, setLocalRequest] = useState<Partial<Request>>({
    method: 'GET',
    url: '',
    nombre: 'New Request',
    headers: {},
    body: null,
    bodyType: 'none',
  });

  useEffect(() => {
    if (currentRequest) {
      setLocalRequest(currentRequest);
    } else {
      setLocalRequest({
        method: 'GET',
        url: '',
        nombre: 'New Request',
        headers: {},
        body: null,
        bodyType: 'none',
      });
    }
  }, [currentRequest]);

  const handleFieldChange = <K extends keyof Request>(field: K, value: Request[K]) => {
    setLocalRequest((prev) => ({ ...prev, [field]: value }));
    if (currentRequest) {
      updateCurrentRequestField(field, value);
    }
  };

  const handleSend = async () => {
    const req: Request = {
      id: currentRequest?.id || crypto.randomUUID(),
      nombre: localRequest.nombre || 'New Request',
      method: localRequest.method as HttpMethod,
      url: resolveVariables(localRequest.url || ''),
      headers: localRequest.headers as Record<string, string>,
      body: localRequest.body,
      bodyType: localRequest.bodyType as BodyType,
      createdAt: currentRequest?.createdAt || new Date().toISOString(),
      lastUsed: currentRequest?.lastUsed || null,
    };
    setCurrentRequest(req);
    await sendRequest(req);
    await saveCurrentRequest();
  };

  const handleSave = async () => {
    const req: Request = {
      id: currentRequest?.id || crypto.randomUUID(),
      nombre: localRequest.nombre || 'New Request',
      method: localRequest.method as HttpMethod,
      url: localRequest.url || '',
      headers: localRequest.headers as Record<string, string>,
      body: localRequest.body,
      bodyType: localRequest.bodyType as BodyType,
      createdAt: currentRequest?.createdAt || new Date().toISOString(),
      lastUsed: currentRequest?.lastUsed || null,
    };
    setCurrentRequest(req);
    await saveCurrentRequest();
  };

  const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
  const bodyTypes: BodyType[] = ['none', 'json', 'form-data', 'x-www-form-urlencoded'];

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex gap-2 mb-3">
        <select
          value={localRequest.method}
          onChange={(e) => handleFieldChange('method', e.target.value as HttpMethod)}
          className="px-3 py-2 border border-gray-300 rounded text-sm font-medium"
        >
          {methods.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        
        <input
          type="text"
          placeholder="URL"
          value={localRequest.url || ''}
          onChange={(e) => handleFieldChange('url', e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
        />
        
        <button
          onClick={handleSend}
          disabled={isFetching || !localRequest.url}
          className="px-4 py-2 bg-green-600 text-white rounded text-sm font-medium hover:bg-green-700 disabled:opacity-50"
        >
          {isFetching ? '...' : 'Send'}
        </button>
        
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-indigo-600 text-white rounded text-sm font-medium hover:bg-indigo-700"
        >
          Save
        </button>
      </div>

      <div className="flex gap-4 text-sm">
        <div>
          <label className="block text-gray-500 text-xs mb-1">Name</label>
          <input
            type="text"
            value={localRequest.nombre || ''}
            onChange={(e) => handleFieldChange('nombre', e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded text-sm w-40"
          />
        </div>
        
        <div>
          <label className="block text-gray-500 text-xs mb-1">Body Type</label>
          <select
            value={localRequest.bodyType}
            onChange={(e) => handleFieldChange('bodyType', e.target.value as BodyType)}
            className="px-2 py-1 border border-gray-300 rounded text-sm"
          >
            {bodyTypes.map((bt) => (
              <option key={bt} value={bt}>{bt}</option>
            ))}
          </select>
        </div>

        {error && (
          <div className="text-red-600 text-sm">{error}</div>
        )}
      </div>
    </div>
  );
}