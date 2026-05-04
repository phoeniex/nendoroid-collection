import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Search, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.innerWidth < 640);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)');
    const handler = (e) => setMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return mobile;
}

function OptionList({ filtered, selected, toggle, search, setSearch, onChange, hasSelection, label }) {
  return (
    <>
      <div className="relative p-2 border-b border-white/5">
        <Search size={12} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-7 pr-3 py-1.5 text-xs bg-white/5 rounded-xl outline-none placeholder:text-zinc-600 text-white border border-white/8 focus:border-accent/40"
        />
      </div>
      <div className="overflow-y-auto flex-1 py-1">
        {filtered.length === 0 ? (
          <p className="text-zinc-600 text-xs text-center py-4">No results</p>
        ) : filtered.map(option => (
          <button
            key={option}
            onClick={() => toggle(option)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm hover:bg-white/5 transition-colors text-left"
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
    </>
  );
}

export function FilterDropdown({ label, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const ref = useRef(null);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (isMobile) return;
    const handler = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, [isMobile]);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = isMobile ? 'hidden' : '';
    } else {
      document.body.style.overflow = '';
      setSearch('');
    }
    return () => { document.body.style.overflow = ''; };
  }, [open, isMobile]);

  const filtered = options.filter(o => o.toLowerCase().includes(search.toLowerCase()));
  const toggle = (value) => {
    onChange(selected.includes(value) ? selected.filter(v => v !== value) : [...selected, value]);
  };
  const clear = (e) => { e.stopPropagation(); onChange([]); };
  const hasSelection = selected.length > 0;

  const handleOpen = () => {
    if (!open && !isMobile && ref.current) {
      const rect = ref.current.getBoundingClientRect();
      const left = Math.min(rect.left, window.innerWidth - 224);
      setDropdownPos({ top: rect.bottom + 6, left: Math.max(8, left) });
    }
    setOpen(o => !o);
  };

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={handleOpen}
        className={`filter-select-btn ${hasSelection ? 'filter-select-btn-active' : ''}`}
      >
        <span className="truncate text-xs font-medium">
          {hasSelection ? (selected.length === 1 ? selected[0] : `${label}: ${selected.length}`) : label}
        </span>
        {hasSelection
          ? <X size={12} className="shrink-0 text-white/70" onClick={clear} />
          : <ChevronDown size={12} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
        }
      </button>

      {/* Desktop dropdown */}
      <AnimatePresence>
        {open && !isMobile && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="filter-dropdown-panel"
            style={{ top: dropdownPos.top, left: dropdownPos.left, transformOrigin: 'top left' }}
          >
            <OptionList filtered={filtered} selected={selected} toggle={toggle} search={search} setSearch={setSearch} onChange={onChange} hasSelection={hasSelection} label={label} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile bottom sheet — portalled to body */}
      {isMobile && createPortal(
        <AnimatePresence>
          {open && (
            <>
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm"
                onClick={() => setOpen(false)}
              />
              <motion.div
                key="sheet"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', stiffness: 400, damping: 40 }}
                className="fixed bottom-0 left-0 right-0 z-[100] flex flex-col rounded-t-2xl border-t border-white/10"
                style={{ background: 'rgba(9,9,11,0.75)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', maxHeight: '70vh' }}
              >
                <div className="flex items-center justify-between px-4 pt-4 pb-2 shrink-0">
                  <span className="text-white font-semibold text-sm">{label}</span>
                  <button onClick={() => setOpen(false)} className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 transition-colors">
                    <X size={14} />
                  </button>
                </div>
                <OptionList filtered={filtered} selected={selected} toggle={toggle} search={search} setSearch={setSearch} onChange={onChange} hasSelection={hasSelection} label={label} />
              </motion.div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
}
