import { useState, useEffect, useRef, useMemo } from 'react';
import { useEnvironmentStore } from '@/store/environmentStore';
import { useRequestStore } from '@/store/requestStore';

export function EnvironmentsPanel() {
  const { 
    environments, activeEnvId, loadEnvironments, createEnv, updateEnv, deleteEnv, 
    setActiveEnv, importEnvs, exportEnvs 
  } = useEnvironmentStore();
  const { currentRequest } = useRequestStore();

  const [showNewForm, setShowNewForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarValue, setNewVarValue] = useState('');
  const [previewText, setPreviewText] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadEnvironments();
  }, []);

  useEffect(() => {
    if (selectedId === null && environments.length > 0) {
      setSelectedId(environments[0].id);
    }
  }, [environments]);

  useEffect(() => {
    if (currentRequest?.url) {
      setPreviewText(currentRequest.url);
    }
  }, [currentRequest?.url, activeEnvId]);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createEnv(newName, {});
    setNewName('');
    setShowNewForm(false);
  };

  const handleAddVar = async () => {
    if (!selectedId || !newVarKey.trim()) return;
    const env = environments.find((e) => e.id === selectedId);
    if (!env) return;
    const vars = { ...env.variables, [newVarKey]: newVarValue };
    await updateEnv(selectedId, { variables: vars });
    setNewVarKey('');
    setNewVarValue('');
  };

  const handleDeleteVar = async (key: string) => {
    if (!selectedId) return;
    const env = environments.find((e) => e.id === selectedId);
    if (!env) return;
    const vars = { ...env.variables };
    delete vars[key];
    await updateEnv(selectedId, { variables: vars });
  };

  const handleToggleVar = async (key: string, enabled: boolean) => {
    if (!selectedId) return;
  };

  const handleSetActive = async (id: string) => {
    if (activeEnvId === id) {
      await setActiveEnv(null);
    } else {
      await setActiveEnv(id);
    }
  };

  const handleExport = () => {
    const json = exportEnvs();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `environments-${Date.now()}.json`;
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
    await importEnvs(text);
    e.target.value = '';
  };

  const resolvedPreview = useMemo(() => {
    const active = environments.find((e) => e.id === activeEnvId);
    if (!active) return previewText;
    
    return previewText.replace(/\{\{(\w+)\}\}/g, (_match: string, _key: string) => {
      const value = active.variables[_key];
      return value !== undefined ? value : `{{${_key}}}`;
    });
  }, [previewText, activeEnvId, environments]);

  const selected = environments.find((e) => e.id === selectedId);

  return (
    <div className="h-full flex flex-col">
      <div className="p-3 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Environments</h3>
          <div className="flex gap-1">
            <button onClick={handleImport} className="p-1 text-gray-500 hover:text-gray-700" title="Import">
              ↓
            </button>
            <button onClick={handleExport} className="p-1 text-gray-500 hover:text-gray-700" title="Export">
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
            + New Environment
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {environments.length === 0 ? (
          <div className="text-center text-gray-400 text-sm py-8">
            No environments. Create one to manage variables.
          </div>
        ) : (
          <ul className="space-y-1 mb-4">
            {environments.map((env) => (
              <li key={env.id}>
                <button
                  onClick={() => setSelectedId(env.id)}
                  className={`w-full text-left px-2 py-1.5 rounded flex items-center gap-2 ${
                    selectedId === env.id ? 'bg-gray-200' : 'hover:bg-gray-100'
                  }`}
                >
                  <span className="text-sm">{env.nombre}</span>
                  {activeEnvId === env.id && (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}

        {selected && (
          <div className="border-t border-gray-200 pt-3">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-gray-500 uppercase">
                Variables ({Object.keys(selected.variables).length})
              </h4>
              <button
                onClick={() => handleSetActive(selected.id)}
                className={`text-xs px-2 py-1 rounded ${
                  activeEnvId === selected.id
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {activeEnvId === selected.id ? 'Active' : 'Set Active'}
              </button>
            </div>

            <table className="w-full text-sm mb-3">
              <thead>
                <tr className="text-left text-xs text-gray-400">
                  <th className="w-6 pb-1"></th>
                  <th className="pb-1 font-medium">Key</th>
                  <th className="pb-1 font-medium">Value</th>
                  <th className="w-8 pb-1"></th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(selected.variables).map(([key, value]) => (
                  <tr key={key} className="group">
                    <td className="pr-1">
                      <input type="checkbox" defaultChecked className="rounded" />
                    </td>
                    <td className="pr-1">
                      <span className="text-xs font-mono text-gray-600">{key}</span>
                    </td>
                    <td className="pr-1">
                      <span className="text-xs text-gray-800 truncate block max-w-[120px]">
                        {value}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDeleteVar(key)}
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex gap-1 mb-3">
              <input
                type="text"
                placeholder="Key"
                value={newVarKey}
                onChange={(e) => setNewVarKey(e.target.value)}
                className="w-24 px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Value"
                value={newVarValue}
                onChange={(e) => setNewVarValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddVar()}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <button
                onClick={handleAddVar}
                className="px-2 py-1 text-gray-500 hover:text-indigo-600"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>

      {showPreview && activeEnvId && (
        <div className="border-t border-gray-200 p-3 bg-gray-50">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold text-gray-500 uppercase">Preview</h4>
            <button
              onClick={() => setShowPreview(false)}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              ×
            </button>
          </div>
          <input
            type="text"
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
            placeholder="Enter URL or text to preview..."
            className="w-full px-2 py-1 text-sm border border-gray-300 rounded mb-2"
          />
          <div className="text-xs text-gray-600 break-all">
            {resolvedPreview}
          </div>
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