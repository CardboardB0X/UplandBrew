import React, { useState } from 'react';
import {
  X,
  Image as ImageIcon,
  UtensilsCrossed,
  Star,
  ChevronLeft,
  ChevronRight,
  Snowflake,
  Flame,
} from 'lucide-react';
import { MenuItem, Venue } from '../types/venue';

interface VenueGalleryModalProps {
  venue: Venue;
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'photos' | 'menu';
}

export const VenueGalleryModal: React.FC<VenueGalleryModalProps> = ({
  venue,
  isOpen,
  onClose,
  initialTab = 'menu',
}) => {
  const [activeTab, setActiveTab] = useState<'photos' | 'menu'>(initialTab);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  if (!isOpen) return null;

  const photos = venue.gallery_photos && venue.gallery_photos.length > 0
    ? venue.gallery_photos
    : [{ url: venue.image_url, caption: venue.name, tag: 'Ambiance' as const }];

  const menu = venue.menu || [];
  const categories = ['ALL', ...Array.from(new Set(menu.map((m) => m.category)))];

  const filteredMenu =
    selectedCategory === 'ALL'
      ? menu
      : menu.filter((m) => m.category === selectedCategory);

  const handlePrevPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleNextPhoto = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchEndX - touchStartX;
    if (deltaX > 40) {
      handlePrevPhoto();
    } else if (deltaX < -40) {
      handleNextPhoto();
    }
    setTouchStartX(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${venue.name} Gallery and Menu`}
      className="fixed inset-0 z-[1200] flex items-center justify-center p-2.5 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200 pb-safe"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 border border-white/60 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh] max-h-[88dvh] animate-in zoom-in-95 duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-zinc-900 dark:text-zinc-50 truncate">
                {venue.name}
              </h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300">
                {venue.price_level}
              </span>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">
              {venue.address}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-2 rounded-full text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher: Photos vs Menu */}
        <div className="flex border-b border-zinc-200/80 dark:border-zinc-800 px-4 bg-zinc-50/50 dark:bg-zinc-800/40">
          <button
            type="button"
            onClick={() => setActiveTab('menu')}
            className={`py-2.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'menu'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <UtensilsCrossed className="w-4 h-4" />
            <span>Curated Menu ({menu.length} Items)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('photos')}
            className={`py-2.5 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'photos'
                ? 'border-sky-500 text-sky-600 dark:text-sky-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Photos & Ambiance ({photos.length})</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'photos' ? (
            /* Photos Tab: Interactive Carousel & Grid */
            <div className="space-y-4">
              <div
                className="relative w-full h-64 sm:h-80 rounded-2xl overflow-hidden bg-zinc-900 shadow-md touch-pan-y"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                <img
                  src={photos[photoIndex].url}
                  alt={photos[photoIndex].caption}
                  className="w-full h-full object-cover transition-opacity duration-300"
                />

                {photos.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={handlePrevPhoto}
                      aria-label="Previous photo"
                      className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 backdrop-blur-md transition-all"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      onClick={handleNextPhoto}
                      aria-label="Next photo"
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/50 text-white hover:bg-black/75 backdrop-blur-md transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </>
                )}

                <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/65 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
                  {photos[photoIndex].tag}
                </div>

                <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/85 via-black/50 to-transparent text-white text-xs font-medium">
                  {photos[photoIndex].caption}
                </div>
              </div>

              {/* Thumbnails Row */}
              {photos.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {photos.map((p, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setPhotoIndex(idx)}
                      className={`relative w-20 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all ${
                        photoIndex === idx
                          ? 'border-sky-500 scale-105'
                          : 'border-transparent opacity-60 hover:opacity-100'
                      }`}
                    >
                      <img src={p.url} alt={p.caption} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Menu Tab */
            <div className="space-y-3.5">
              {/* Category Pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-full text-xs font-bold shrink-0 transition-all ${
                      selectedCategory === cat
                        ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-sm'
                        : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                    }`}
                  >
                    {cat === 'ALL' ? 'All Items' : cat}
                  </button>
                ))}
              </div>

              {/* Menu Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {filteredMenu.map((item: MenuItem) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200/70 dark:border-zinc-700/60 flex flex-col justify-between transition-all hover:border-sky-500/40"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h4 className="font-extrabold text-xs text-zinc-900 dark:text-zinc-50">
                            {item.name}
                          </h4>
                          {item.is_signature && (
                            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[9px] font-extrabold">
                              <Star className="w-2.5 h-2.5 fill-current" />
                              House Pick
                            </span>
                          )}
                          {item.is_cold !== undefined && (
                            <span
                              className={`p-0.5 rounded ${
                                item.is_cold
                                  ? 'text-sky-500 bg-sky-500/10'
                                  : 'text-amber-500 bg-amber-500/10'
                              }`}
                              title={item.is_cold ? 'Cold / Iced' : 'Hot Brew'}
                            >
                              {item.is_cold ? (
                                <Snowflake className="w-3 h-3" />
                              ) : (
                                <Flame className="w-3 h-3" />
                              )}
                            </span>
                          )}
                        </div>

                        <span className="font-mono font-black text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-lg shrink-0">
                          ₱{item.price_php}
                        </span>
                      </div>

                      <p className="mt-1 text-[11px] leading-relaxed text-zinc-500 dark:text-zinc-400">
                        {item.description}
                      </p>
                    </div>

                    <div className="mt-2 text-[9px] font-semibold text-zinc-400 uppercase tracking-wider">
                      {item.category}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
