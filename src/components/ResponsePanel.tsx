import { useResponseStore } from '@/store/responseStore';

export function ResponsePanel() {
  const { currentResponse, isFetching, error } = useResponseStore();

  if (isFetching) {
    return (
      <div className="flex-1 p-4 bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 p-4 bg-gray-50">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  if (!currentResponse) {
    return (
      <div className="flex-1 p-4 bg-gray-50 flex items-center justify-center">
        <div className="text-gray-400">Enter a URL and click Send</div>
      </div>
    );
  }

  const statusColor = currentResponse.status >= 200 && currentResponse.status < 300 ? 'text-green-600' :
    currentResponse.status >= 300 && currentResponse.status < 400 ? 'text-yellow-600' :
    'text-red-600';

  return (
    <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
      <div className="px-4 py-2 bg-white border-b border-gray-200 flex items-center gap-4 text-sm">
        <span className={`font-medium ${statusColor}`}>
          {currentResponse.status} {currentResponse.statusText}
        </span>
        <span className="text-gray-500">{currentResponse.duration}ms</span>
        <span className="text-gray-400 text-xs">
          {new Date(currentResponse.timestamp).toLocaleTimeString()}
        </span>
      </div>

      <div className="flex-1 overflow-auto p-4">
        <div className="mb-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Response Body</h4>
          <pre className="bg-white p-3 rounded border border-gray-200 text-sm overflow-x-auto">
            {typeof currentResponse.data === 'string'
              ? currentResponse.data
              : JSON.stringify(currentResponse.data, null, 2)}
          </pre>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Headers</h4>
          <div className="bg-white p-3 rounded border border-gray-200 text-sm">
            {Object.entries(currentResponse.headers).map(([key, value]) => (
              <div key={key} className="mb-1">
                <span className="text-gray-600">{key}:</span>{' '}
                <span className="text-gray-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}