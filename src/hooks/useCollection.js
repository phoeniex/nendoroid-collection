import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

const LOCAL_KEY = 'nendoroid-checklist';

function loadLocal() {
  try {
    const saved = localStorage.getItem(LOCAL_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    // Support both old format {id: bool} and new format {id: {owned, favorited}}
    const migrated = {};
    for (const [id, val] of Object.entries(parsed)) {
      if (typeof val === 'boolean') {
        migrated[id] = { owned: val, favorited: false };
      } else {
        migrated[id] = val;
      }
    }
    return migrated;
  } catch {
    return {};
  }
}

function saveLocal(collection) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(collection));
}

export function useCollection(user) {
  const [collection, setCollection] = useState({});
  const [syncing, setSyncing] = useState(false);

  // Load from Supabase when user logs in, else fall back to localStorage
  useEffect(() => {
    if (!user) {
      setCollection(loadLocal());
      return;
    }

    setSyncing(true);
    supabase
      .from('user_collections')
      .select('nendo_id, owned, favorited')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (error) { console.error(error); setSyncing(false); return; }
        const remote = {};
        for (const row of data) {
          remote[row.nendo_id] = { owned: row.owned, favorited: row.favorited, owned_at: row.owned_at, favorited_at: row.favorited_at, comment: row.comment, price: row.price };
        }

        // Merge any local items not yet in remote (first-time login migration)
        const local = loadLocal();
        const merged = { ...remote };
        const upserts = [];
        for (const [id, val] of Object.entries(local)) {
          if (!remote[id] && (val.owned || val.favorited)) {
            merged[id] = val;
            upserts.push({ user_id: user.id, nendo_id: id, owned: val.owned, favorited: val.favorited });
          }
        }
        if (upserts.length > 0) {
          supabase.from('user_collections').upsert(upserts).then(() => {
            localStorage.removeItem(LOCAL_KEY);
          });
        }

        setCollection(merged);
        setSyncing(false);
      });
  }, [user]);

  // Persist locally when no user
  useEffect(() => {
    if (!user) saveLocal(collection);
  }, [collection, user]);

  const updateItem = useCallback(async (nendoId, patch) => {
    const now = new Date().toISOString();
    const datePatch = {};
    if ('owned' in patch) datePatch.owned_at = patch.owned ? now : null;
    if ('favorited' in patch) datePatch.favorited_at = patch.favorited ? now : null;

    setCollection(prev => ({
      ...prev,
      [nendoId]: { owned: false, favorited: false, ...prev[nendoId], ...patch, ...datePatch },
    }));

    if (user) {
      const current = await supabase
        .from('user_collections')
        .select('owned, favorited, owned_at, favorited_at, comment')
        .eq('user_id', user.id)
        .eq('nendo_id', nendoId)
        .maybeSingle();

      const existing = current.data ?? { owned: false, favorited: false, owned_at: null, favorited_at: null, comment: null, price: null };
      const updated = { ...existing, ...patch, ...datePatch };

      await supabase.from('user_collections').upsert({
        user_id: user.id,
        nendo_id: nendoId,
        owned: updated.owned,
        favorited: updated.favorited,
        owned_at: updated.owned_at,
        favorited_at: updated.favorited_at,
        comment: updated.comment,
        price: updated.price,
        updated_at: now,
      });
    }
  }, [user]);

  const toggleOwned = useCallback((nendoId, opts = {}) => {
    const current = collection[nendoId];
    const nextOwned = opts.forceOwned !== undefined ? opts.forceOwned : !current?.owned;
    const patch = { owned: nextOwned };
    if (opts.comment !== undefined) patch.comment = opts.comment;
    if (opts.price !== undefined) patch.price = opts.price;
    updateItem(nendoId, patch);
  }, [collection, updateItem]);

  const toggleFavorited = useCallback((nendoId) => {
    const current = collection[nendoId];
    updateItem(nendoId, { favorited: !current?.favorited });
  }, [collection, updateItem]);

  return { collection, syncing, toggleOwned, toggleFavorited };
}
