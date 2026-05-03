import React, { useState, useEffect, useMemo } from 'react';
import { Search, Check, Filter, ExternalLink, Heart, Trophy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import nendoroidsData from './data/nendoroids.json';

const NendoroidCard = ({ nendo, isChecked, onToggle }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -8 }}
      className="glass-panel glass-panel-hover overflow-hidden relative group"
    >
      <div 
        className={`checkbox-custom z-10 ${isChecked ? 'checked shadow-lg shadow-accent/40' : ''}`}
        onClick={() => onToggle(nendo.id)}
      >
        {isChecked && <Check size={14} className="text-white" strokeWidth={3} />}
      </div>
      
      <div className="card-image-container">
        <img 
          src={nendo.image} 
          alt={nendo.name} 
          className="card-image"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <a 
                href={nendo.link.startsWith('http') ? nendo.link : `https://www.goodsmile.info${nendo.link}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn btn-xs btn-ghost text-white gap-1"
            >
                <ExternalLink size={12} /> View Official
            </a>
        </div>
      </div>
      
      <div className="p-3">
        <span className="text-gradient font-bold text-xs tracking-wider">{nendo.number}</span>
        <h3 className="text-white font-medium mt-0.5 line-clamp-2 text-sm leading-tight min-h-[32px]">{nendo.name}</h3>
        
        <div className="mt-2 text-[10px] text-zinc-400 flex flex-col gap-0.5">
          {nendo.series && <span className="truncate" title={nendo.series}><b className="text-zinc-500 font-medium">Series:</b> {nendo.series}</span>}
          {nendo.type && <span className="truncate" title={nendo.type}><b className="text-zinc-500 font-medium">Type:</b> {nendo.type}</span>}
          <div className="flex justify-between items-center mt-1 pt-1 border-t border-white/5">
            {nendo.year && <span>{nendo.year}</span>}
            {nendo.notes && <span className="truncate max-w-[60%] text-right text-gradient font-medium" title={nendo.notes}>{nendo.notes}</span>}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

function App() {
  const [search, setSearch] = useState('');
  const [checkedItems, setCheckedItems] = useState(() => {
    const saved = localStorage.getItem('nendoroid-checklist');
    return saved ? JSON.parse(saved) : {};
  });
  const [filterMode, setFilterMode] = useState('all');

  useEffect(() => {
    localStorage.setItem('nendoroid-checklist', JSON.stringify(checkedItems));
  }, [checkedItems]);

  const toggleCheck = (id) => {
    setCheckedItems(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredNendoroids = useMemo(() => {
    return nendoroidsData.filter(n => {
      if (!n.number) return false;
      const matchesSearch = n.name.toLowerCase().includes(search.toLowerCase()) || 
                           n.number.toLowerCase().includes(search.toLowerCase());
      
      if (filterMode === 'checked') return matchesSearch && checkedItems[n.id];
      if (filterMode === 'unchecked') return matchesSearch && !checkedItems[n.id];
      return matchesSearch;
    });
  }, [search, checkedItems, filterMode]);

  const stats = useMemo(() => {
    const numberedNendoroids = nendoroidsData.filter(n => n.number);
    const checkedCount = Object.keys(checkedItems).filter(id => {
        const item = nendoroidsData.find(n => n.id === id);
        return item && item.number && checkedItems[id];
    }).length;
    
    return {
      total: numberedNendoroids.length,
      checked: checkedCount,
      percent: numberedNendoroids.length > 0 ? Math.round((checkedCount / numberedNendoroids.length) * 100) : 0
    };
  }, [checkedItems]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <header className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16">
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <h1 className="text-5xl md:text-6xl font-black text-gradient tracking-tighter pb-2">
            Nendoroid Hub
          </h1>
          <p className="text-zinc-400 mt-3 text-lg font-medium">Track and showcase your collection with style.</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="stats glass-panel overflow-hidden"
        >
          <div className="stat px-8">
            <div className="stat-figure text-accent">
              <Heart size={28} />
            </div>
            <div className="stat-title text-zinc-400 uppercase text-xs font-bold tracking-widest">Collected</div>
            <div className="stat-value text-white">{stats.checked}</div>
            <div className="stat-desc text-zinc-500">out of {stats.total}</div>
          </div>
          
          <div className="stat px-8 border-l border-white/5">
            <div className="stat-figure text-accent">
              <Trophy size={28} />
            </div>
            <div className="stat-title text-zinc-400 uppercase text-xs font-bold tracking-widest">Progress</div>
            <div className="stat-value text-gradient">{stats.percent}%</div>
            <div className="stat-actions mt-2">
                <progress className="progress w-24 h-1.5 [&::-webkit-progress-value]:bg-gradient-modern [&::-moz-progress-bar]:bg-gradient-modern" value={stats.percent} max="100"></progress>
            </div>
          </div>
        </motion.div>
      </header>

      <div className="sticky top-6 z-40 mb-12 flex flex-col items-center gap-6">
        <div className="relative w-full max-w-2xl group">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <Search className="text-zinc-500 group-focus-within:text-accent transition-colors" size={20} />
          </div>
          <input
            type="text"
            placeholder="Find by name or number..."
            className="input input-lg w-full pl-14 glass-panel focus:outline-none focus:border-accent/50 !rounded-2xl placeholder:text-zinc-500 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="join glass-panel p-1 !rounded-2xl">
          {['all', 'checked', 'unchecked'].map((mode) => (
            <button
              key={mode}
              onClick={() => setFilterMode(mode)}
              className={`join-item btn btn-sm md:btn-md px-8 rounded-xl border-none transition-all ${
                filterMode === mode 
                  ? 'bg-gradient-modern text-white shadow-lg shadow-accent/20' 
                  : 'btn-ghost text-zinc-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {mode === 'all' ? 'Everything' : mode === 'checked' ? 'Collected' : 'Remaining'}
            </button>
          ))}
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4"
        layout
      >
        <AnimatePresence mode="popLayout">
          {filteredNendoroids.map(nendo => (
            <NendoroidCard
              key={nendo.id}
              nendo={nendo}
              isChecked={checkedItems[nendo.id]}
              onToggle={toggleCheck}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filteredNendoroids.length === 0 && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-32 glass-panel mt-12"
        >
          <div className="text-zinc-500 text-xl font-medium">No results found for "{search}"</div>
          <button onClick={() => setSearch('')} className="btn bg-gradient-modern border-none text-white shadow-lg shadow-accent/20 btn-sm mt-4 rounded-full px-8">Clear Search</button>
        </motion.div>
      )}
    </div>
  );
}

export default App;
