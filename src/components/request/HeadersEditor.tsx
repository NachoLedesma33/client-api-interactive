import { useState, useEffect } from 'react';
import { useRequestStore } from '@/store/requestStore';

const commonHeaders = [
  'Accept',
  'Authorization',
  'Cache-Control',
  'Content-Type',
  'Cookie',
  'Host',
  'Origin',
  'Referer',
  'User-Agent',
  'X-API-Key',
  'X-Requested-With',
];

export function HeadersEditor() {
  const { currentRequest, updateCurrentRequestField } = useRequestStore();
  const [mode, setMode] = useState<'table' | 'bulk'>('table');
  const [bulkText, setBulkText] = useState('');
  const headers = currentRequest?.headers || {};

  useEffect(() => {
    const entries = Object.entries(headers)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');
    setBulkText(entries);
  }, [currentRequest?.id]);

  const handleAddHeader = (key: string, value: string) => {
    if (!key.trim()) return;
    const updated = { ...headers, [key]: value };
    updateCurrentRequestField('headers', updated);
  };

  const handleDeleteHeader = (key: string) => {
    const updated = { ...headers };
    delete updated[key];
    updateCurrentRequestField('headers', updated);
  };

  const handleUpdateHeader = (oldKey: string, newKey: string, value: string) => {
    const updated = { ...headers };
    if (oldKey !== newKey) delete updated[oldKey];
    updated[newKey] = value;
    updateCurrentRequestField('headers', updated);
  };

  const handleBulkChange = (text: string) => {
    setBulkText(text);
    try {
      const newHeaders: Record<string, string> = {};
      text.split('\n').forEach((line) => {
        const colonIndex = line.indexOf(':');
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          const value = line.substring(colonIndex + 1).trim();
          if (key && value) newHeaders[key] = value;
        }
      });
      updateCurrentRequestField('headers', newHeaders);
    } catch {}
  };

  const parseCurl = (curl: string) => {
    const headerRegex = /-H\s+['"]([^'"]+)['"]/g;
    const newHeaders: Record<string, string> = {};
    let match;
    while ((match = headerRegex.exec(curl)) !== null) {
      const [key, value] = match[1].split(':').map((s) => s.trim());
      if (key && value) newHeaders[key] = value;
    }
    if (Object.keys(newHeaders).length > 0) {
      updateCurrentRequestField('headers', { ...headers, ...newHeaders });
    }
  };

  return (
    <div className="border-t border-gray-100">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
        <h4 className="text-xs font-semibold text-gray-500 uppercase">Headers</h4>
        <div className="flex gap-2">
          <button
            onClick={() => setMode('table')}
            className={`text-xs px-2 py-1 rounded ${
              mode === 'table' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Table
          </button>
          <button
            onClick={() => setMode('bulk')}
            className={`text-xs px-2 py-1 rounded ${
              mode === 'bulk' ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            Bulk
          </button>
          <button
            onClick={() => parseCurl(prompt('Paste cURL command:') || '')}
            className="text-xs px-2 py-1 text-gray-500 hover:bg-gray-100 rounded"
            title="Parse from cURL"
          >
            cURL
          </button>
        </div>
      </div>

      <datalist id="common-headers">
        {commonHeaders.map((h) => (
          <option key={h} value={h} />
        ))}
      </datalist>

      {mode === 'table' ? (
        <div className="px-4 pb-4 space-y-2">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400">
                <th className="w-6 pb-1"></th>
                <th className="pb-1 font-medium">Key</th>
                <th className="pb-1 font-medium">Value</th>
                <th className="w-8 pb-1"></th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(headers).map(([key, value]) => (
                <tr key={key} className="group">
                  <td className="pr-2">
                    <input
                      type="checkbox"
                      checked={value !== ''}
                      onChange={(e) =>
                        e.target.checked
                          ? handleUpdateHeader(key, key, value as string)
                          : handleDeleteHeader(key)
                      }
                      className="rounded"
                    />
                  </td>
                  <td className="pr-2">
                    <input
                      type="text"
                      value={key}
                      list="common-headers"
                      onChange={(e) =>
                        handleUpdateHeader(key, e.target.value, value as string)
                      }
                      className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                    />
                  </td>
                  <td className="pr-2">
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => handleUpdateHeader(key, key, e.target.value)}
                      className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => handleDeleteHeader(key)}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
              <tr className="group">
                <td></td>
                <td className="pr-2">
                  <input
                    type="text"
                    placeholder="Add header..."
                    list="common-headers"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        const target = e.target as HTMLInputElement;
                        handleAddHeader(target.value, '');
                        target.value = '';
                      }
                    }}
                    className="w-full px-2 py-1 border border-dashed border-gray-300 rounded text-xs placeholder-gray-300"
                  />
                </td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="px-4 pb-4">
          <textarea
            value={bulkText}
            onChange={(e) => handleBulkChange(e.target.value)}
            placeholder="Key: Value"
            className="w-full h-32 px-3 py-2 text-sm border border-gray-200 rounded font-mono"
          />
          <p className="text-xs text-gray-400 mt-1">
            One header per line (Key: Value format)
          </p>
        </div>
      )}
    </div>
  );
}