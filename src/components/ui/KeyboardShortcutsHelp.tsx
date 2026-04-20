import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface Shortcut {
  key: string;
  description: string;
  category: 'general' | 'editor' | 'navigation';
}

const shortcuts: Shortcut[] = [
  { key: 'Ctrl + Enter', description: 'Send request', category: 'editor' },
  { key: 'Ctrl + S', description: 'Save request', category: 'editor' },
  { key: 'Ctrl + N', description: 'New request', category: 'general' },
  { key: 'Ctrl + Shift + N', description: 'New collection', category: 'general' },
  { key: 'Ctrl + H', description: 'Focus search/history', category: 'navigation' },
  { key: 'Ctrl + E', description: 'Toggle environments', category: 'navigation' },
  { key: 'Ctrl + C', description: 'Copy response', category: 'editor' },
  { key: 'Ctrl + Shift + C', description: 'Copy as cURL', category: 'editor' },
  { key: 'F1', description: 'Open shortcuts help', category: 'general' },
  { key: 'Esc', description: 'Close modal', category: 'general' },
];

export function KeyboardShortcutsHelp({ trigger }: { trigger?: boolean }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'F1' || (e.ctrlKey && e.key === '/')) && !e.shiftKey) {
        e.preventDefault();
        setIsOpen(true);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  const getByCategory = (cat: 'general' | 'editor' | 'navigation') => {
    return shortcuts.filter((s) => s.category === cat);
  };

  return (
    <>
      {(trigger !== false) && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 w-10 h-10 bg-white border border-gray-200 rounded-full shadow-lg flex items-center justify-center text-gray-500 hover:text-gray-700 hover:bg-gray-50 transition-colors"
          aria-label="Keyboard shortcuts help"
        >
          ?
        </button>
      )}

      {isOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="shortcuts-title"
          >
            <div
              className="bg-white rounded-lg shadow-xl w-full max-w-lg mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 id="shortcuts-title" className="text-lg font-semibold text-gray-800">
                  Keyboard Shortcuts
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600 text-xl"
                  aria-label="Close"
                >
                  ×
                </button>
              </div>

              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {(['general', 'editor', 'navigation'] as const).map((category) => (
                  <div key={category}>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                      {category}
                    </h3>
                    <table className="w-full">
                      <tbody>
                        {getByCategory(category).map((shortcut) => (
                          <tr key={shortcut.key} className="border-b border-gray-100">
                            <td className="py-2 pr-4">
                              <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm font-mono shadow-sm">
                                {shortcut.key}
                              </kbd>
                            </td>
                            <td className="py-2 text-sm text-gray-600">
                              {shortcut.description}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>

              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
                <p className="text-xs text-gray-500 text-center">
                  Press <kbd className="px-1 bg-gray-200 rounded text-xs">F1</kbd> to toggle this help
                </p>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}