import React, { useState, useEffect } from 'react';
import { X, Heart, ShoppingBag, ArrowRight } from 'lucide-react';
import { Listing } from '../types';
import { api } from '../lib/api';
import { ListingCard } from './ListingCard';

interface FavoritesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenListing: (listingId: number) => void;
  onToggleFavorite: (e: React.MouseEvent, id: number) => void;
}

export const FavoritesModal: React.FC<FavoritesModalProps> = ({
  isOpen,
  onClose,
  onOpenListing,
  onToggleFavorite,
}) => {
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loadFavorites = async () => {
        setLoading(true);
        try {
          const list = await api.listings.getFavorites();
          setFavorites(list);
        } catch (err) {
          console.error('Failed to load favorites:', err);
        } finally {
          setLoading(false);
        }
      };
      loadFavorites();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />
            <h3 className="font-bold text-base sm:text-lg text-slate-900">Saved Campus Listings ({favorites.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 flex-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading saved items...</div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-16">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h4 className="font-bold text-slate-800 text-sm">No saved items yet</h4>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Click the heart icon on any textbook, desk lamp, or bike to save it for quick reference later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {favorites.map((item) => (
                <ListingCard
                  key={item.id}
                  listing={item}
                  onClick={() => onOpenListing(item.id)}
                  onToggleFavorite={(e, id) => {
                    onToggleFavorite(e, id);
                    setFavorites((prev) => prev.filter((f) => f.id !== id));
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
