import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { useRequestStore } from '@/store/requestStore';
import { useResponseStore } from '@/store/responseStore';
import type { HttpMethod } from '@/types/api';

const methodColors: Record<HttpMethod, string> = {
  GET: 'bg-green-100 text-green-700 border-green-300',
  POST: 'bg-yellow-100 text-yellow-700 border-yellow-300',
  PUT: 'bg-blue-100 text-blue-700 border-blue-300',
  PATCH: 'bg-purple-100 text-purple-700 border-purple-300',
  DELETE: 'bg-red-100 text-red-700 border-red-300',
};

const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];

export function RequestUrlBar() {
  const { currentRequest, updateCurrentRequestField, saveCurrentRequest, setCurrentRequest } = useRequestStore();
  const { sendRequest, isFetching } = useResponseStore();
  const { recentRequests, fetchRecent } = useRequestStore();
  
  const [url, setUrl] = useState(currentRequest?.url || '');
  const [method, setMethod] = useState<HttpMethod>(currentRequest?.method || 'GET');
  const [showDropdown, setShowDropdown] = useState(false);
  const [urlError, setUrlError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRecent(10);
  }, []);

  useEffect(() => {
    if (currentRequest) {
      setUrl(currentRequest.url || '');
      setMethod(currentRequest.method || 'GET');
    }
  }, [currentRequest]);

  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        handleSend();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [url, method]);

  const validateUrl = (value: string): boolean => {
    if (!value) return true;
    try {
      const parsed = new URL(value);
      return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
      return false;
    }
  };

  const handleUrlChange = (value: string) => {
    setUrl(value);
    setUrlError(!validateUrl(value));
    updateCurrentRequestField('url', value);
  };

  const handleMethodChange = (m: HttpMethod) => {
    setMethod(m);
    updateCurrentRequestField('method', m);
    setShowDropdown(false);
  };

  const handleSend = async () => {
    if (!validateUrl(url)) {
      setUrlError(true);
      return;
    }
    const req = {
      ...currentRequest,
      id: currentRequest?.id || crypto.randomUUID(),
      url,
      method,
      nombre: currentRequest?.nombre || 'New Request',
      headers: currentRequest?.headers || {},
      body: currentRequest?.body,
      bodyType: currentRequest?.bodyType || 'none',
      createdAt: currentRequest?.createdAt || new Date().toISOString(),
      lastUsed: currentRequest?.lastUsed || null,
    };
    setCurrentRequest(req);
    await sendRequest(req);
    await saveCurrentRequest();
  };

  const selectedColor = methodColors[method];

  return (
    <div className="flex gap-2 p-4 bg-white border-b border-gray-200">
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className={`px-3 py-2 border rounded-l text-sm font-medium ${selectedColor} bg-white`}
        >
          {method}
        </button>
        {showDropdown && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded shadow-lg z-10">
            {methods.map((m) => (
              <button
                key={m}
                onClick={() => handleMethodChange(m)}
                className={`block w-full px-4 py-2 text-left text-sm ${methodColors[m]} hover:bg-gray-50`}
              >
                {m}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex-1 relative">
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={(e) => handleUrlChange(e.target.value)}
          placeholder="Enter URL..."
          list="recent-urls"
          className={`w-full px-3 py-2 border rounded-r text-sm ${
            urlError ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
        />
        {urlError && (
          <span className="absolute right-3 top-2 text-xs text-red-500">Invalid URL</span>
        )}
        <datalist id="recent-urls">
          {recentRequests.map((req) => (
            <option key={req.id} value={req.url} />
          ))}
        </datalist>
      </div>

      <button
        onClick={handleSend}
        disabled={isFetching || !url || urlError}
        className={`px-6 py-2 rounded text-sm font-medium transition-colors ${
          isFetching || !url || urlError
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-green-600 text-white hover:bg-green-700'
        }`}
      >
        {isFetching ? (
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            Sending
          </span>
        ) : (
          'Send'
        )}
      </button>
    </div>
  );
}