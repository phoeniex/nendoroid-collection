import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { CURRENCIES } from '../hooks/useCurrency';

export function OwnedCommentModal({ nendo, currentComment, currentPrice, currency, symbol, onCurrencyChange, onConfirm, onClose }) {
  const [comment, setComment] = useState(currentComment ?? '');
  const [price, setPrice] = useState(currentPrice ?? '');
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm({ comment: comment.trim(), price: price !== '' ? Number(price) : null });
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.18 }}
          className="relative w-full max-w-sm p-5 flex flex-col gap-4 rounded-xl border border-white/10"
          style={{ background: 'rgba(9,9,11,0.75)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-white font-semibold text-sm">Mark as Owned</p>
              <p className="text-zinc-400 text-xs mt-0.5 line-clamp-1">{nendo.name}</p>
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-zinc-300 hover:text-white transition-colors shrink-0"
            >
              <X size={14} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex gap-2">
              <select
                value={currency}
                onChange={e => onCurrencyChange(e.target.value)}
                className="bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-accent/50 cursor-pointer"
              >
                {CURRENCIES.map(c => (
                  <option key={c.code} value={c.code} style={{ background: 'var(--color-bg-core)' }}>
                    {c.symbol} {c.code}
                  </option>
                ))}
              </select>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">{symbol}</span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="Price paid (optional)"
                  className="w-full bg-white/5 border border-white/15 rounded-xl pl-7 pr-3 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-accent/50"
                />
              </div>
            </div>
            <textarea
              ref={inputRef}
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="Add a note... (optional)"
              rows={3}
              className="w-full bg-white/5 border border-white/15 rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-zinc-500 outline-none focus:border-accent/50 resize-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-zinc-400 bg-white/5 hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2 rounded-xl text-xs font-semibold bg-gradient-modern !text-white shadow-md shadow-accent/30 flex items-center justify-center gap-1.5"
              >
                <Check size={12} strokeWidth={3} /> Confirm
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
