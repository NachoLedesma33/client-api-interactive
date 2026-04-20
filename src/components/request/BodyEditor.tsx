import { useState, useEffect, useMemo } from 'react';
import { useRequestStore } from '@/store/requestStore';
import type { BodyType } from '@/types/api';

const bodyTypes: BodyType[] = ['none', 'json', 'form-data', 'x-www-form-urlencoded'];

interface FormField {
  key: string;
  value: string;
  type: 'text' | 'file';
  enabled: boolean;
}

export function BodyEditor() {
  const { currentRequest, updateCurrentRequestField } = useRequestStore();
  const [bodyType, setBodyType] = useState<BodyType>(currentRequest?.bodyType || 'none');
  const [jsonText, setJsonText] = useState('');
  const [urlencodedText, setUrlencodedText] = useState('');
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [jsonError, setJsonError] = useState<string | null>(null);

  const bt = currentRequest?.bodyType || bodyType;

  useEffect(() => {
    if (!currentRequest) return;
    
    const currentBt = currentRequest.bodyType || bodyType;
    
    if (currentBt === 'json') {
      const body = currentRequest.body;
      const text = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
      setJsonText(text || '');
      setJsonError(null);
    } else if (currentBt === 'x-www-form-urlencoded') {
      const body = currentRequest.body;
      if (typeof body === 'string') {
        setUrlencodedText(body);
      } else if (typeof body === 'object' && body !== null) {
        const params = new URLSearchParams(body as Record<string, string>);
        setUrlencodedText(params.toString());
      } else {
        setUrlencodedText('');
      }
    } else if (currentBt === 'form-data') {
      const body = currentRequest.body;
      if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
        const fields: FormField[] = Object.entries(body as Record<string, string>).map(
          ([key, value]) => ({ key, value, type: 'text' as const, enabled: true })
        );
        setFormFields(fields.length > 0 ? fields : [{ key: '', value: '', type: 'text', enabled: true }]);
      } else {
        setFormFields([{ key: '', value: '', type: 'text', enabled: true }]);
      }
    }
  }, [currentRequest?.id]);

  const bodySize = useMemo(() => {
    if (bt === 'none') return 0;
    if (bt === 'json') return new Blob([jsonText]).size;
    if (bt === 'x-www-form-urlencoded') return new Blob([urlencodedText]).size;
    if (bt === 'form-data') {
      const text = formFields
        .filter((f) => f.enabled && f.key)
        .map((f) => `${f.key}=${f.value}`)
        .join('&');
      return new Blob([text]).size;
    }
    return 0;
  }, [bt, jsonText, urlencodedText, formFields]);

  const handleBodyTypeChange = (newBt: BodyType) => {
    setBodyType(newBt);
    updateCurrentRequestField('bodyType', newBt);
    
    if (newBt === 'json') {
      updateCurrentRequestField('body', {});
    } else if (newBt === 'x-www-form-urlencoded') {
      updateCurrentRequestField('body', '');
    } else if (newBt === 'form-data') {
      updateCurrentRequestField('body', {});
    } else {
      updateCurrentRequestField('body', null);
    }
  };

  const handleJsonChange = (text: string) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      updateCurrentRequestField('body', parsed);
      setJsonError(null);
    } catch (e) {
      setJsonError('Invalid JSON');
    }
  };

  const handlePrettify = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      updateCurrentRequestField('body', parsed);
      setJsonError(null);
    } catch (e) {
      setJsonError('Invalid JSON');
    }
  };

  const handleUrlencodedChange = (text: string) => {
    setUrlencodedText(text);
    updateCurrentRequestField('body', text);
  };

  const handleFormFieldChange = (index: number, field: Partial<FormField>) => {
    const updated = [...formFields];
    updated[index] = { ...updated[index], ...field };
    setFormFields(updated);
    
    const body: Record<string, string> = {};
    updated.forEach((f) => {
      if (f.enabled && f.key) body[f.key] = f.value;
    });
    updateCurrentRequestField('body', body);
  };

  const handleAddFormField = () => {
    setFormFields([...formFields, { key: '', value: '', type: 'text', enabled: true }]);
  };

  const handleRemoveFormField = (index: number) => {
    const updated = formFields.filter((_, i) => i !== index);
    setFormFields(updated);
    
    const body: Record<string, string> = {};
    updated.forEach((f) => {
      if (f.enabled && f.key) body[f.key] = f.value;
    });
    updateCurrentRequestField('body', body);
  };

  return (
    <div className="border-t border-gray-100">
      <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
        <div className="flex items-center gap-4">
          <h4 className="text-xs font-semibold text-gray-500 uppercase">Body</h4>
          <div className="flex gap-1">
            {bodyTypes.map((type) => (
              <button
                key={type}
                onClick={() => handleBodyTypeChange(type)}
                className={`px-2 py-1 text-xs rounded ${
                  bt === type
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        {bt !== 'none' && (
          <span className="text-xs text-gray-400">{bodySize} bytes</span>
        )}
      </div>

      {bt === 'json' && (
        <div className="px-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={handlePrettify}
              className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
            >
              Prettify
            </button>
            {jsonError && <span className="text-xs text-red-500">{jsonError}</span>}
          </div>
          <textarea
            value={jsonText}
            onChange={(e) => handleJsonChange(e.target.value)}
            placeholder='{"key": "value"}'
            className="w-full h-32 px-3 py-2 text-sm border border-gray-300 rounded font-mono"
          />
        </div>
      )}

      {bt === 'x-www-form-urlencoded' && (
        <div className="px-4 pb-4">
          <textarea
            value={urlencodedText}
            onChange={(e) => handleUrlencodedChange(e.target.value)}
            placeholder="key1=value1&key2=value2"
            className="w-full h-32 px-3 py-2 text-sm border border-gray-300 rounded font-mono"
          />
        </div>
      )}

      {bt === 'form-data' && (
        <div className="px-4 pb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-gray-400">
                <th className="w-8 pb-2"></th>
                <th className="pb-2 font-medium">Key</th>
                <th className="pb-2 font-medium">Value</th>
                <th className="w-8 pb-2"></th>
              </tr>
            </thead>
            <tbody>
              {formFields.map((field, index) => (
                <tr key={index} className="group">
                  <td className="pr-2">
                    <input
                      type="checkbox"
                      checked={field.enabled}
                      onChange={(e) =>
                        handleFormFieldChange(index, { enabled: e.target.checked })
                      }
                      className="rounded"
                    />
                  </td>
                  <td className="pr-2">
                    <input
                      type="text"
                      value={field.key}
                      onChange={(e) =>
                        handleFormFieldChange(index, { key: e.target.value })
                      }
                      placeholder="Key"
                      className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                    />
                  </td>
                  <td className="pr-2">
                    <input
                      type="text"
                      value={field.value}
                      onChange={(e) =>
                        handleFormFieldChange(index, { value: e.target.value })
                      }
                      placeholder="Value"
                      className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                    />
                  </td>
                  <td>
                    <button
                      onClick={() => handleRemoveFormField(index)}
                      className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button
            onClick={handleAddFormField}
            className="mt-2 text-xs text-indigo-600 hover:text-indigo-700"
          >
            + Add Field
          </button>
        </div>
      )}
    </div>
  );
}