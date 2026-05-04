import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function FilterDropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));

  const toggle = (value) => {
    onChange(
      selected.includes(value)
        ? selected.filter(v => v !== value)
        : [...selected, value]
    );
  };

  const clear = (e) => { e.stopPropagation(); onChange([]); };

  const hasSelection = selected.length > 0;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen(o => !o)}
        className={`filter-select-btn ${hasSelection ? 'filter-select-btn-active' : ''}`}
      >
        <span className="truncate text-xs font-medium">
          {hasSelection ? (
            selected.length === 1 ? selected[0] : `${label}: ${selected.length}`
          ) : label}
        </span>
        {hasSelection
          ? <X size={12} className="shrink-0 text-white/70" onClick={clear} />
          : <ChevronDown size={12} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        }
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="filter-dropdown-panel"
          >
            <div className="relative p-2 border-b border-white/5">
              <Search size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                autoFocus
                type="text"
                placeholder="Search..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-7 pr-3 py-1.5 text-xs bg-white/5 rounded-xl outline-none placeholder:text-zinc-600 text-white border border-white/8 focus:border-accent/40"
              />
            </div>

            <div className="overflow-y-auto max-h-52 py-1">
              {filtered.length === 0 ? (
                <p className="text-zinc-600 text-xs text-center py-4">No results</p>
              ) : filtered.map(option => (
                <button
                  key={option}
                  onClick={() => toggle(option)}
                  className="w-full flex items-center justify-between gap-2 px-3 py-1.5 text-xs hover:bg-white/5 transition-colors text-left"
                >
                  <span className={`truncate ${selected.includes(option) ? 'text-white font-medium' : 'text-zinc-400'}`}>
                    {option}
                  </span>
                  {selected.includes(option) && (
                    <span className="shrink-0 w-4 h-4 rounded-full bg-gradient-modern flex items-center justify-center">
                      <Check size={9} className="text-white" strokeWidth={3} />
                    </span>
                  )}
                </button>
              ))}
            </div>

            {hasSelection && (
              <div className="p-2 border-t border-white/5">
                <button onClick={() => onChange([])} className="w-full text-xs text-zinc-500 hover:text-white transition-colors py-1">
                  Clear all
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
