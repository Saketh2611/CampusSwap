import React, { useState } from 'react';
import { Heart, MapPin, ShieldCheck, Tag, Eye } from 'lucide-react';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';

interface ListingCardProps {
  listing: Listing;
  onClick: () => void;
  onToggleFavorite: (e: React.MouseEvent, id: number) => void;
  onOpenProfile?: (userId: number) => void;
}

export const ListingCard: React.FC<ListingCardProps> = ({
  listing,
  onClick,
  onToggleFavorite,
  onOpenProfile,
}) => {
  const { user } = useAuth();
  const [imageIndex, setImageIndex] = useState(0);

  const discountPercent =
    listing.originalPrice && listing.originalPrice > listing.price
      ? Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100)
      : null;

  const conditionColors: Record<string, string> = {
    'Brand New': 'bg-emerald-100 text-emerald-800 border-emerald-200',
    'Like New': 'bg-teal-100 text-teal-800 border-teal-200',
    Good: 'bg-blue-100 text-blue-800 border-blue-200',
    Fair: 'bg-amber-100 text-amber-800 border-amber-200',
  };

  const images = listing.images && listing.images.length > 0 ? listing.images : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=600'];

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500/40 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-4/3 bg-slate-100 overflow-hidden">
        <img
          src={images[imageIndex] || images[0]}
          alt={listing.title}
          className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
          loading="lazy"
        />

        {/* Multi-image indicators if more than 1 image */}
        {images.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/40 backdrop-blur-xs px-2 py-0.5 rounded-full z-10">
            {images.map((_, idx) => (
              <button
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setImageIndex(idx);
                }}
                className={`w-1.5 h-1.5 rounded-full transition ${
                  imageIndex === idx ? 'bg-white scale-125' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}

        {/* Condition Chip */}
        <div className="absolute top-2.5 left-2.5 z-10 flex flex-col gap-1 items-start">
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
              conditionColors[listing.condition] || 'bg-slate-100 text-slate-800'
            }`}
          >
            {listing.condition}
          </span>
          {listing.status === 'sold' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-900 text-white uppercase">
              Sold
            </span>
          )}
          {listing.status === 'pending' && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500 text-white uppercase">
              Pending Meetup
            </span>
          )}
        </div>

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(e, listing.id);
          }}
          className={`absolute top-2.5 right-2.5 p-2 rounded-full backdrop-blur-md transition z-10 ${
            listing.isFavorited
              ? 'bg-rose-500 text-white shadow-md'
              : 'bg-white/80 text-slate-700 hover:bg-white hover:text-rose-500'
          }`}
          title={listing.isFavorited ? 'Remove from Saved' : 'Save to Favorites'}
        >
          <Heart className={`w-4 h-4 ${listing.isFavorited ? 'fill-current' : ''}`} />
        </button>

        {/* Category tag */}
        <div className="absolute bottom-2.5 left-2.5">
          <span className="bg-white/90 backdrop-blur-md text-slate-800 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-2xs flex items-center gap-1">
            <Tag className="w-2.5 h-2.5 text-emerald-600" />
            {listing.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Original Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
              ${listing.price}
            </span>
            {listing.originalPrice && listing.originalPrice > listing.price && (
              <span className="text-xs text-slate-400 line-through">
                ${listing.originalPrice}
              </span>
            )}
            {discountPercent && discountPercent > 0 && (
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded">
                -{discountPercent}%
              </span>
            )}
            {listing.isNegotiable && (
              <span className="text-[10px] text-slate-500 font-medium ml-auto">
                Negotiable
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-xs sm:text-sm text-slate-900 mt-1.5 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
            {listing.title}
          </h3>

          {/* Pickup spot on campus */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2">
            <MapPin className="w-3 h-3 text-emerald-600 shrink-0" />
            <span className="truncate">{listing.pickupLocation}</span>
          </div>
        </div>

        {/* Seller Bar */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <div
            onClick={(e) => {
              if (listing.seller && onOpenProfile) {
                e.stopPropagation();
                onOpenProfile(listing.seller.id);
              }
            }}
            className="flex items-center gap-1.5 hover:opacity-80 transition"
          >
            {listing.seller ? (
              <>
                <img
                  src={listing.seller.avatar}
                  alt={listing.seller.name}
                  className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                />
                <span className="text-xs font-medium text-slate-700 truncate max-w-[100px] sm:max-w-[120px]">
                  {listing.seller.name.split(' ')[0]}
                </span>
                {listing.seller.studentIdVerified && (
                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" title="Verified University Student" />
                )}
              </>
            ) : (
              <span className="text-xs text-slate-400">Campus Student</span>
            )}
          </div>

          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            <Eye className="w-3 h-3" />
            <span>{listing.views}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
