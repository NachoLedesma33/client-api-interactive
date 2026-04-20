import { useEffect, useState } from 'react';
import { useEnvironmentStore } from '@/store/environmentStore';

export function EnvironmentsManager() {
  const { 
    environments, activeEnvId, loadEnvironments, createEnv, updateEnv, deleteEnv, setActiveEnv, resolveVariables 
  } = useEnvironmentStore();
  const [newName, setNewName] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newVarKey, setNewVarKey] = useState('');
  const [newVarValue, setNewVarValue] = useState('');

  useEffect(() => {
    loadEnvironments();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    await createEnv(newName, {});
    setNewName('');
  };

  const selected = environments.find((e) => e.id === selectedId);

  const handleAddVar = async () => {
    if (!selected || !newVarKey.trim()) return;
    const vars = { ...selected.variables, [newVarKey]: newVarValue };
    await updateEnv(selected.id, { variables: vars });
    setNewVarKey('');
    setNewVarValue('');
  };

  const handleDeleteVar = async (key: string) => {
    if (!selected) return;
    const vars = { ...selected.variables };
    delete vars[key];
    await updateEnv(selected.id, { variables: vars });
  };

  const handleSetActive = async (id: string | null) => {
    if (id) await setActiveEnv(id);
    else await setActiveEnv(null);
  };

  return (
    <div className="flex gap-4">
      <div className="w-72 shrink-0">
        <div className="mb-4 p-4 bg-white rounded border border-gray-200">
          <h3 className="text-sm font-semibold mb-3">New Environment</h3>
          <input
            type="text"
            placeholder="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
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
          {environments.map((env) => (
            <div
              key={env.id}
              onClick={() => setSelectedId(env.id)}
              className={`p-3 bg-white rounded border cursor-pointer ${
                selectedId === env.id ? 'border-indigo-500 ring-2 ring-indigo-200' : 'border-gray-200'
              }`}
            >
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{env.nombre}</span>
                {activeEnvId === env.id && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">Active</span>
                )}
              </div>
              <div className="text-xs text-gray-500">{Object.keys(env.variables).length} variables</div>
            </div>
          ))}
          {environments.length === 0 && (
            <div className="text-sm text-gray-400">No environments yet</div>
          )}
        </div>
      </div>

      <div className="flex-1">
        {selected ? (
          <div className="bg-white rounded border border-gray-200 p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">{selected.nombre}</h3>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSetActive(activeEnvId === selected.id ? null : selected.id)}
                  className={`px-3 py-1 text-sm rounded ${
                    activeEnvId === selected.id 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {activeEnvId === selected.id ? 'Active' : 'Set Active'}
                </button>
                <button
                  onClick={() => { deleteEnv(selected.id); setSelectedId(null); }}
                  className="px-3 py-1 text-red-600 text-sm hover:bg-red-50 rounded"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Add Variable</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Key"
                  value={newVarKey}
                  onChange={(e) => setNewVarKey(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <input
                  type="text"
                  placeholder="Value"
                  value={newVarValue}
                  onChange={(e) => setNewVarValue(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm"
                />
                <button
                  onClick={handleAddVar}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium mb-2">Variables</h4>
              <div className="space-y-1">
                {Object.entries(selected.variables).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div>
                      <span className="text-sm font-medium">{key}</span>
                      <span className="mx-2 text-gray-400">=</span>
                      <span className="text-sm text-gray-600">{resolveVariables(value)}</span>
                    </div>
                    <button
                      onClick={() => handleDeleteVar(key)}
                      className="text-gray-400 hover:text-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {Object.keys(selected.variables).length === 0 && (
                  <div className="text-sm text-gray-400">No variables</div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 text-center p-8">Select an environment</div>
        )}
      </div>
    </div>
  );
}