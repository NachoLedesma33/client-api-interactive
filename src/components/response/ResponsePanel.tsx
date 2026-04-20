import { useState, useMemo } from 'react';
import { useResponseStore } from '@/store/responseStore';

type Tab = 'body' | 'headers' | 'raw';

export function ResponsePanel() {
  const { currentResponse, isFetching, clearCurrentResponse } = useResponseStore();
  const [activeTab, setActiveTab] = useState<Tab>('body');

  const statusColor = useMemo(() => {
    if (!currentResponse) return 'text-gray-400';
    const status = currentResponse.status;
    if (status >= 200 && status < 300) return 'text-green-600 bg-green-100';
    if (status >= 300 && status < 400) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  }, [currentResponse?.status]);

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    return `${(bytes / 1024).toFixed(2)} KB`;
  };

  const bodySize = useMemo(() => {
    if (!currentResponse) return 0;
    const data = currentResponse.data;
    if (typeof data === 'string') return new Blob([data]).size;
    return new Blob([JSON.stringify(data)]).size;
  }, [currentResponse?.data]);

  const handleCopy = async () => {
    if (!currentResponse) return;
    const text = typeof currentResponse.data === 'string'
      ? currentResponse.data
      : JSON.stringify(currentResponse.data, null, 2);
    await navigator.clipboard.writeText(text);
  };

  const handleDownload = (format: 'json' | 'txt') => {
    if (!currentResponse) return;
    const data = currentResponse.data;
    const text = format === 'json'
      ? JSON.stringify(data, null, 2)
      : (typeof data === 'string' ? data : JSON.stringify(data));
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `response.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePretty = () => {
    if (!currentResponse) return null;
    try {
      const data = typeof currentResponse.data === 'string'
        ? JSON.parse(currentResponse.data)
        : currentResponse.data;
      return JSON.stringify(data, null, 2);
    } catch {
      return currentResponse.data as string;
    }
  };

  if (isFetching) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-gray-500">Sending request...</p>
        </div>
      </div>
    );
  }

  if (!currentResponse) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <p className="text-gray-400">Enter a URL and click Send to make a request</p>
      </div>
    );
  }

  const prettyBody = handlePretty();

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className={`px-2 py-1 text-sm font-medium rounded ${statusColor}`}>
            {currentResponse.status} {currentResponse.statusText}
          </span>
          <span className="text-sm text-gray-500">{currentResponse.duration}ms</span>
          <span className="text-sm text-gray-500">{formatSize(bodySize)}</span>
        </div>
        <button
          onClick={clearCurrentResponse}
          className="text-sm text-gray-500 hover:text-red-600"
        >
          Clear
        </button>
      </div>

      <div className="flex items-center gap-1 px-4 py-2 bg-gray-100">
        {(['body', 'headers', 'raw'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1 text-sm rounded ${
              activeTab === tab
                ? 'bg-white text-gray-800 shadow-sm'
                : 'text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
        {activeTab === 'body' && (
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={handleCopy}
              className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded"
            >
              Copy
            </button>
            <button
              onClick={() => handleDownload('json')}
              className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded"
            >
              JSON
            </button>
            <button
              onClick={() => handleDownload('txt')}
              className="px-2 py-1 text-xs text-gray-600 hover:bg-gray-200 rounded"
            >
              Txt
            </button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'body' && (
          <pre className="text-sm whitespace-pre-wrap font-mono">
            {prettyBody}
          </pre>
        )}

        {activeTab === 'headers' && (
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(currentResponse.headers).map(([key, value]) => (
                <tr key={key} className="border-b border-gray-100">
                  <td className="py-2 pr-4 text-gray-600 w-48">{key}</td>
                  <td className="py-2 text-gray-800 break-all">{value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'raw' && (
          <pre className="text-sm whitespace-pre-wrap font-mono text-gray-600">
            {typeof currentResponse.data === 'string'
              ? currentResponse.data
              : JSON.stringify(currentResponse.data)}
          </pre>
        )}
      </div>
    </div>
  );
}