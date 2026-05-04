import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import {
  Search,
  Check,
  ExternalLink,
  ArrowUp,
  X,
  Star,
  LogOut,
  User,
  Loader,
  Tv2,
  Gamepad2,
  Music4,
  MonitorPlay,
  Clapperboard,
  Smile,
  Globe,
  Wand2,
  Pencil,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import nendoroidsData from "./data/nendoroids.json";
import { useAuth } from "./hooks/useAuth";
import { useCollection } from "./hooks/useCollection";
import { useTheme } from "./hooks/useTheme";
import { useCurrency } from "./hooks/useCurrency";
import { useDominantColor } from "./hooks/useDominantColor";
import { AuthModal } from "./components/AuthModal";
import { FilterDropdown } from "./components/FilterDropdown";
import { OwnedCommentModal } from "./components/OwnedCommentModal";

const THEME_OPTIONS = [
  { value: "light", icon: <Sun size={14} /> },
  { value: "dark", icon: <Moon size={14} /> },
  { value: "system", icon: <Monitor size={14} /> },
];

const ITEMS_PER_PAGE = 60;
const FILTER_LABELS = {
  all: "Everything",
  owned: "Collected",
  favorited: "Favorites",
};

const formatNumber = (num) => {
  const digits = num.replace(/[^0-9]/g, "");
  const letters = num.replace(/[^A-Za-z]/g, "");
  if (!letters) return <>{digits}</>;
  return (
    <>
      {digits}
      <span style={{ fontSize: "0.55em", verticalAlign: "baseline" }}>
        {letters}
      </span>
    </>
  );
};

const TYPE_ICON = {
  "Anime & Manga": <Tv2 size={10} />,
  "Video Games": <Gamepad2 size={10} />,
  Vocaloid: <Music4 size={10} />,
  "Virtual Youtuber": <MonitorPlay size={10} />,
  "Movies & TV": <Clapperboard size={10} />,
  Disney: <Wand2 size={10} />,
  Marvel: <Smile size={10} />,
  "DC Comics": <Smile size={10} />,
  "Western Animation": <Pencil size={10} />,
  Celebrity: <Globe size={10} />,
  Mascot: <Smile size={10} />,
  Danganronpa: <Gamepad2 size={10} />,
  Others: <Globe size={10} />,
};

const formatDate = (iso) => {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const NendoroidCard = ({
  nendo,
  isOwned,
  isFavorited,
  collectionItem,
  currencySymbol,
  onToggleOwned,
  onToggleFavorited,
  onOwnWithComment,
}) => {
  const dominantColor = useDominantColor(nendo.image);
  const [infoOpen, setInfoOpen] = useState(false);
  const hasInfo =
    isOwned &&
    (collectionItem?.owned_at ||
      collectionItem?.comment ||
      collectionItem?.price != null);
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`glass-panel glass-panel-hover overflow-hidden relative group flex flex-row${isOwned ? " card-collected" : ""}`}
    >
      {/* Number — absolutely positioned over the card, outside image container so hover scale doesn't shift it */}
      <span
        className="card-number"
        style={
          dominantColor
            ? { color: dominantColor, WebkitTextFillColor: dominantColor }
            : {}
        }
      >
        {formatNumber(nendo.number)}
      </span>

      {/* Image — left side */}
      <div className="card-image-container card-image-side">
        <img
          src={nendo.image}
          alt={nendo.name}
          className="card-image"
          loading="lazy"
        />
        <div className="absolute inset-0 flex items-end p-3">
          <a
            href={
              nendo.link.startsWith("http")
                ? nendo.link
                : `https://www.goodsmile.info${nendo.link}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-xs btn-ghost opacity-0 group-hover:opacity-100 transition-opacity duration-300 gap-1 pointer-events-auto"
          >
            <ExternalLink size={10} />
          </a>
        </div>
      </div>

      {/* Content — right side */}
      <div className="flex flex-col flex-1 min-w-0 p-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold line-clamp-2 text-sm leading-snug">
            {nendo.name}
          </h3>
          {nendo.series && (
            <span
              className="line-clamp-2 text-gradient font-medium text-[11px] mt-1.5 block"
              title={nendo.series}
            >
              {nendo.series}
            </span>
          )}

          {nendo.notes && (
            <span
              className="text-[11px] text-zinc-500 truncate mt-1.5 block"
              title={nendo.notes}
            >
              {nendo.notes}
            </span>
          )}
        </div>

        <div className="flex flex-wrap gap-1 mt-3">
          {nendo.type && (
            <span className="type-badge">
              {TYPE_ICON[nendo.type] ?? <Globe size={10} />}
              {nendo.type}
            </span>
          )}
          {nendo.year && (
            <span className="type-badge type-badge-year">{nendo.year}</span>
          )}
        </div>

        {/* Action buttons — pinned to bottom */}
        <div className="mt-2 pt-2.5 border-t border-white/5 flex gap-2">
          {/* Split own button */}
          <div
            className={`flex flex-1 rounded-xl overflow-hidden transition-all duration-200 ${
              isOwned
                ? "bg-gradient-modern shadow-md shadow-accent/30"
                : "bg-white/5 hover:bg-white/10"
            }`}
          >
            <button
              onClick={() => onToggleOwned(nendo.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-semibold transition-colors ${
                isOwned ? "!text-white" : "text-zinc-500 hover:text-white"
              }`}
            >
              <Check size={12} strokeWidth={3} />
              {isOwned ? "Owned" : "Own"}
            </button>
            <div
              className={`w-px self-stretch ${isOwned ? "bg-white/20" : "bg-white/10"}`}
            />
            <button
              onClick={() => onOwnWithComment(nendo)}
              className={`flex items-center justify-center px-2 transition-colors ${
                isOwned
                  ? "!text-white/70 hover:!text-white"
                  : "text-zinc-500 hover:text-white"
              }`}
              aria-label="Own with comment"
            >
              <ChevronDown size={12} />
            </button>
          </div>

          <button
            onClick={() => onToggleFavorited(nendo.id)}
            className={`w-8 flex items-center justify-center rounded-xl py-1.5 transition-all duration-200 ${
              isFavorited
                ? "bg-yellow-400/20 text-yellow-400 shadow-md shadow-yellow-400/20 border border-yellow-400/30"
                : "bg-white/5 text-zinc-500 hover:bg-white/10 hover:text-yellow-400"
            }`}
            aria-label="Toggle favorite"
          >
            <Star size={13} fill={isFavorited ? "currentColor" : "none"} />
          </button>
        </div>

        {hasInfo && (
          <div className="mt-2 border-t border-white/5">
            <button
              onClick={() => setInfoOpen((o) => !o)}
              className="w-full flex items-center justify-between pt-2 text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <span className="flex items-center gap-1">
                <Check size={9} strokeWidth={3} className="text-accent" />
                {formatDate(collectionItem.owned_at) ?? "Details"}
              </span>
              <ChevronDown
                size={11}
                className={`transition-transform duration-200 ${infoOpen ? "rotate-180" : ""}`}
              />
            </button>

            <AnimatePresence initial={false}>
              {infoOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="pt-2 pb-1 flex flex-col gap-1.5">
                    {collectionItem?.price != null && (
                      <p className="text-[10px] text-zinc-400 flex items-center gap-1">
                        <span className="text-zinc-600">Paid</span>
                        <span className="font-medium text-white">
                          {currencySymbol}
                          {collectionItem.price.toLocaleString()}
                        </span>
                      </p>
                    )}
                    {collectionItem?.comment ? (
                      <p className="text-[10px] text-zinc-400 italic">
                        "{collectionItem.comment}"
                      </p>
                    ) : (
                      <p className="text-[10px] text-zinc-600">
                        No note added.
                      </p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.div>
  );
};

function App() {
  const auth = useAuth();
  const { collection, syncing, toggleOwned, toggleFavorited } = useCollection(
    auth.user,
  );
  const { pref: themePref, setTheme } = useTheme();
  const { currency, symbol, setCurrency } = useCurrency();

  const [search, setSearch] = useState("");
  const [filterMode, setFilterMode] = useState("all");
  const [filterType, setFilterType] = useState([]);
  const [filterYear, setFilterYear] = useState([]);
  const [filterSeries, setFilterSeries] = useState([]);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [dismissedSyncBanner, setDismissedSyncBanner] = useState(false);

  const hasLocalData =
    !auth.user && Object.values(collection).some((v) => v.owned || v.favorited);
  const [commentTarget, setCommentTarget] = useState(null);
  const sentinelRef = useRef(null);

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 600);
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setVisibleCount(ITEMS_PER_PAGE);
  }, [
    search,
    filterMode,
    filterType.join(","),
    filterYear.join(","),
    filterSeries.join(","),
  ]);

  const numberedNendoroids = useMemo(
    () => nendoroidsData.filter((n) => n.number),
    [],
  );

  const allTypes = useMemo(
    () =>
      [
        ...new Set(numberedNendoroids.map((n) => n.type).filter(Boolean)),
      ].sort(),
    [numberedNendoroids],
  );
  const allYears = useMemo(
    () =>
      [...new Set(numberedNendoroids.map((n) => n.year).filter(Boolean))].sort(
        (a, b) => b - a,
      ),
    [numberedNendoroids],
  );
  const allSeries = useMemo(
    () =>
      [
        ...new Set(numberedNendoroids.map((n) => n.series).filter(Boolean)),
      ].sort(),
    [numberedNendoroids],
  );

  const stats = useMemo(() => {
    const ownedCount = numberedNendoroids.filter(
      (n) => collection[n.id]?.owned,
    ).length;
    const favCount = numberedNendoroids.filter(
      (n) => collection[n.id]?.favorited,
    ).length;
    return {
      total: numberedNendoroids.length,
      owned: ownedCount,
      favorited: favCount,
      percent:
        numberedNendoroids.length > 0
          ? Math.round((ownedCount / numberedNendoroids.length) * 100)
          : 0,
    };
  }, [collection, numberedNendoroids]);

  const searchMatched = useMemo(() => {
    const q = search.toLowerCase();
    return numberedNendoroids.filter((n) => {
      if (
        search &&
        ![n.name, n.number, n.series, n.type, n.notes, n.year].some((f) =>
          f?.toLowerCase().includes(q),
        )
      )
        return false;
      if (filterType.length > 0 && !filterType.includes(n.type)) return false;
      if (filterYear.length > 0 && !filterYear.includes(n.year)) return false;
      if (filterSeries.length > 0 && !filterSeries.includes(n.series))
        return false;
      return true;
    });
  }, [search, filterType, filterYear, filterSeries, numberedNendoroids]);

  const modeCounts = useMemo(
    () => ({
      all: searchMatched.length,
      owned: searchMatched.filter((n) => collection[n.id]?.owned).length,
      favorited: searchMatched.filter((n) => collection[n.id]?.favorited)
        .length,
    }),
    [searchMatched, collection],
  );

  const filteredNendoroids = useMemo(() => {
    if (filterMode === "owned")
      return searchMatched.filter((n) => collection[n.id]?.owned);
    if (filterMode === "favorited")
      return searchMatched.filter((n) => collection[n.id]?.favorited);
    return searchMatched;
  }, [searchMatched, collection, filterMode]);

  const visibleNendoroids = useMemo(
    () => filteredNendoroids.slice(0, visibleCount),
    [filteredNendoroids, visibleCount],
  );

  const hasMore = visibleCount < filteredNendoroids.length;

  const handleOwnWithComment = useCallback((nendo) => {
    setCommentTarget(nendo);
  }, []);

  const handleCommentConfirm = useCallback(
    ({ comment, price }) => {
      if (!commentTarget) return;
      toggleOwned(commentTarget.id, { forceOwned: true, comment, price });
      setCommentTarget(null);
    },
    [commentTarget, toggleOwned],
  );

  const sentinelCallback = useCallback((el) => {
    sentinelRef.current = el;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + ITEMS_PER_PAGE);
        }
      },
      { rootMargin: "400px" },
    );
    observer.observe(el);
  }, []);

  if (auth.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader size={32} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="pt-16">
      {/* Sticky navbar */}
      <motion.nav className="fixed top-0 left-0 right-0 z-50 navbar-glass">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 h-16 flex items-start pt-4 justify-between gap-4">
          {/* Left — brand */}
          <div className="flex flex-col leading-none">
            <span className="text-gradient font-black text-xl tracking-tight">
              Nendex
            </span>
            <span className="text-zinc-600 text-[10px] tracking-wide">
              by Solarizer
            </span>
          </div>

          {/* Right — theme + auth */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center glass-panel p-1 gap-0.5 !rounded-xl h-10">
              {THEME_OPTIONS.map(({ value, icon }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  title={value.charAt(0).toUpperCase() + value.slice(1)}
                  className="relative z-10 flex items-center justify-center px-3 py-0 h-full rounded-lg transition-colors duration-200"
                >
                  {themePref === value && (
                    <motion.div
                      layoutId="theme-pill"
                      className="absolute inset-0 rounded-lg bg-gradient-modern shadow-md shadow-accent/30"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 35,
                      }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                  <span
                    className={
                      themePref === value ? "!text-white" : "text-zinc-400"
                    }
                  >
                    {icon}
                  </span>
                </button>
              ))}
            </div>
            {syncing && (
              <span className="text-zinc-600 text-xs flex items-center gap-1">
                <Loader size={12} className="animate-spin" /> Syncing…
              </span>
            )}
            {auth.user ? (
              <div className="flex items-center gap-2 glass-panel px-4 !rounded-xl h-10">
                <User size={14} className="text-accent" />
                <span className="text-zinc-400 text-sm truncate max-w-[160px]">
                  {auth.user.email}
                </span>
                <button
                  onClick={auth.signOut}
                  className="text-zinc-600 hover:text-red-400 transition-colors ml-1"
                  aria-label="Sign out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-modern !text-white shadow-lg shadow-accent/20 rounded-xl px-4 py-1.5 text-sm font-semibold"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </motion.nav>

      {/* Full-width fixed search + filter banner — extends up to cover navbar */}
      <div className="fixed top-0 left-0 right-0 z-40 search-banner">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-3 flex flex-col gap-2">
          {/* Row 1 — search bar always full width */}
          <div className="search-input-container flex items-center gap-2 px-3 min-w-0">
              <Search
                className="text-zinc-500 shrink-0 transition-colors"
                size={16}
              />

              {[
                ...filterType.map((v) => ({
                  label: v,
                  onRemove: () =>
                    setFilterType((prev) => prev.filter((x) => x !== v)),
                })),
                ...filterYear.map((v) => ({
                  label: v,
                  onRemove: () =>
                    setFilterYear((prev) => prev.filter((x) => x !== v)),
                })),
                ...filterSeries.map((v) => ({
                  label: v,
                  onRemove: () =>
                    setFilterSeries((prev) => prev.filter((x) => x !== v)),
                })),
              ].map(({ label, onRemove }) => (
                <span
                  key={label}
                  className="shrink-0 inline-flex items-center gap-1 pl-2 pr-1 py-0.5 rounded-lg text-[11px] font-medium bg-gradient-modern text-white whitespace-nowrap"
                >
                  {label}
                  <button
                    onClick={onRemove}
                    className="flex items-center justify-center w-3.5 h-3.5 rounded-full hover:bg-white/20 transition-colors"
                    aria-label={`Remove ${label}`}
                  >
                    <X size={8} strokeWidth={3} />
                  </button>
                </span>
              ))}

              <input
                type="text"
                placeholder={
                  filterType.length + filterYear.length + filterSeries.length >
                  0
                    ? ""
                    : "Search..."
                }
                className="flex-1 min-w-[4rem] bg-transparent outline-none placeholder:text-zinc-500 text-white text-sm h-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="shrink-0 text-zinc-500 hover:text-white transition-colors"
                  aria-label="Clear search"
                >
                  <X size={15} />
                </button>
              )}
            </div>

          {/* Row 2 — filters + tabs, horizontally scrollable on mobile */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <FilterDropdown
              label="Type"
              options={allTypes}
              selected={filterType}
              onChange={setFilterType}
            />
            <FilterDropdown
              label="Year"
              options={allYears}
              selected={filterYear}
              onChange={setFilterYear}
            />
            <FilterDropdown
              label="Series"
              options={allSeries}
              selected={filterSeries}
              onChange={setFilterSeries}
            />

            <div className="w-px h-5 bg-white/10 shrink-0" />

            {/* Mode tabs */}
            <div className="relative flex items-center glass-panel p-1 gap-0.5 !rounded-xl shrink-0 h-10">
              {["all", "owned", "favorited"].map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className="relative z-10 flex items-center gap-1.5 px-3 py-0 h-full text-xs font-semibold rounded-lg transition-colors duration-200"
                >
                  {filterMode === mode && (
                    <motion.div
                      layoutId="filter-pill"
                      className="absolute inset-0 rounded-lg bg-gradient-modern shadow-md shadow-accent/30"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 35,
                      }}
                      style={{ zIndex: -1 }}
                    />
                  )}
                  <span
                    className={
                      filterMode === mode ? "!text-white" : "text-zinc-400"
                    }
                  >
                    {FILTER_LABELS[mode]}
                  </span>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full transition-colors ${
                      filterMode === mode
                        ? "bg-white/20 !text-white"
                        : "bg-white/10 text-zinc-500"
                    }`}
                  >
                    {modeCounts[mode]}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 pt-32 pb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
          <AnimatePresence>
            {visibleNendoroids.map((nendo) => (
              <NendoroidCard
                key={nendo.id}
                nendo={nendo}
                isOwned={!!collection[nendo.id]?.owned}
                isFavorited={!!collection[nendo.id]?.favorited}
                collectionItem={collection[nendo.id]}
                currencySymbol={symbol}
                onToggleOwned={toggleOwned}
                onToggleFavorited={toggleFavorited}
                onOwnWithComment={handleOwnWithComment}
              />
            ))}
          </AnimatePresence>
        </div>

        {hasMore && (
          <div ref={sentinelCallback} className="flex justify-center py-12">
            <Loader size={24} className="animate-spin text-zinc-600" />
          </div>
        )}

        {filteredNendoroids.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 glass-panel mt-12"
          >
            <div className="text-zinc-400 text-xl font-medium mb-2">
              {search
                ? `No results for "${search}"`
                : filterMode === "owned"
                  ? "No collected items yet"
                  : filterMode === "favorited"
                    ? "No favorites yet"
                    : "You've collected everything!"}
            </div>
            <div className="text-zinc-600 text-sm mb-6">
              {search
                ? "Try a different search term"
                : "Try switching to a different filter"}
            </div>
            <div className="flex gap-3 justify-center">
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="btn bg-gradient-modern border-none text-white shadow-lg shadow-accent/20 btn-sm rounded-xl px-6"
                >
                  Clear Search
                </button>
              )}
              {filterMode !== "all" && (
                <button
                  onClick={() => setFilterMode("all")}
                  className="btn btn-ghost border border-white/10 text-zinc-400 hover:text-white btn-sm rounded-xl px-6"
                >
                  Show All
                </button>
              )}
              {(filterType.length > 0 ||
                filterYear.length > 0 ||
                filterSeries.length > 0) && (
                <button
                  onClick={() => {
                    setFilterType([]);
                    setFilterYear([]);
                    setFilterSeries([]);
                  }}
                  className="btn btn-ghost border border-white/10 text-zinc-400 hover:text-white btn-sm rounded-xl px-6"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {hasLocalData && !dismissedSyncBanner && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              className="fixed bottom-8 inset-x-0 mx-auto w-fit z-50 flex items-center gap-3 px-4 py-3 rounded-xl border border-white/10 shadow-xl text-sm"
              style={{ background: "var(--color-bg-core)" }}
            >
              <span className="text-zinc-400">
                Sign in to sync your collection across devices
              </span>
              <button
                onClick={() => setShowAuthModal(true)}
                className="shrink-0 px-3 py-1 rounded-xl text-xs font-semibold bg-gradient-modern !text-white shadow-md shadow-accent/20"
              >
                Sign in
              </button>
              <button
                onClick={() => setDismissedSyncBanner(true)}
                className="text-zinc-600 hover:text-white transition-colors"
              >
                <X size={14} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="fixed bottom-8 right-8 btn btn-circle bg-gradient-modern border-none shadow-lg shadow-accent/30 text-white z-50"
            >
              <ArrowUp size={20} />
            </motion.button>
          )}
        </AnimatePresence>

        {showAuthModal && (
          <AuthModal onClose={() => setShowAuthModal(false)} auth={auth} />
        )}
        {commentTarget && (
          <OwnedCommentModal
            nendo={commentTarget}
            currentComment={collection[commentTarget.id]?.comment ?? ""}
            currentPrice={collection[commentTarget.id]?.price ?? ""}
            currency={currency}
            symbol={symbol}
            onCurrencyChange={setCurrency}
            onConfirm={handleCommentConfirm}
            onClose={() => setCommentTarget(null)}
          />
        )}
      </div>
    </div>
  );
}

export default App;
