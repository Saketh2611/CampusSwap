import React, { useState } from 'react';
import {
  X,
  Heart,
  Share2,
  MapPin,
  ShieldCheck,
  MessageSquare,
  DollarSign,
  Tag,
  Star,
  CheckCircle2,
  Calendar,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';

interface ListingDetailModalProps {
  listing: Listing | null;
  onClose: () => void;
  onToggleFavorite: (e: React.MouseEvent, id: number) => void;
  onStartChat: (listing: Listing, initialMessage?: string) => void;
  onOpenProfile: (userId: number) => void;
  onOpenSafety: () => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  onToggleFavorite,
  onStartChat,
  onOpenProfile,
  onOpenSafety,
}) => {
  const { user } = useAuth();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [offerAmount, setOfferAmount] = useState<string>('');
  const [showOfferInput, setShowOfferInput] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  if (!listing) return null;

  const images = listing.images && listing.images.length > 0 ? listing.images : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800'];
  const isOwner = user?.id === listing.sellerId;

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSendOffer = () => {
    if (!offerAmount || Number(offerAmount) <= 0) return;
    onStartChat(listing, `Hi ${listing.seller?.name?.split(' ')[0] || 'there'}! Would you accept an offer of $${offerAmount} for "${listing.title}"?`);
    setShowOfferInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
              {listing.category}
            </span>
            <span className="text-xs font-semibold text-slate-500">• {listing.campus}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition relative"
              title="Share Link"
            >
              <Share2 className="w-4 h-4" />
              {copiedLink && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap">
                  Link Copied!
                </span>
              )}
            </button>

            <button
              onClick={(e) => onToggleFavorite(e, listing.id)}
              className={`p-2 rounded-xl transition ${
                listing.isFavorited ? 'text-rose-500 bg-rose-50' : 'text-slate-600 hover:bg-slate-100'
              }`}
              title={listing.isFavorited ? 'Saved to Favorites' : 'Save Item'}
            >
              <Heart className={`w-4 h-4 ${listing.isFavorited ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-6 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            
            {/* Image Gallery Column */}
            <div className="md:col-span-7 flex flex-col gap-3">
              <div className="relative aspect-4/3 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200/60 shadow-inner group">
                <img
                  src={images[activeImageIndex] || images[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />

                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md backdrop-blur-xs transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveImageIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 hover:bg-white text-slate-800 shadow-md backdrop-blur-xs transition"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}

                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                    Condition: {listing.condition}
                  </span>
                  {listing.isNegotiable && (
                    <span className="bg-emerald-600/90 backdrop-blur-md text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                      Price Negotiable
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition ${
                        activeImageIndex === idx ? 'border-emerald-600 ring-2 ring-emerald-600/20' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Description */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">Item Description</h4>
                <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
                  {listing.description}
                </p>
              </div>

              {/* Safe Campus Meetup Box */}
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/80 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <div className="font-bold text-emerald-950 flex items-center justify-between">
                    <span>Campus Safe Pickup Location</span>
                    <button
                      onClick={onOpenSafety}
                      className="text-emerald-700 underline font-semibold hover:text-emerald-900"
                    >
                      Safety Guide
                    </button>
                  </div>
                  <p className="text-emerald-800 mt-0.5">
                    Suggested exchange spot: <strong className="font-semibold">{listing.pickupLocation}</strong>
                  </p>
                  <p className="text-[11px] text-emerald-700/80 mt-1">
                    Always meet in well-lit public campus zones like library lobbies, student unions, or dining halls.
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar Column: Price, Seller Card, Actions */}
            <div className="md:col-span-5 flex flex-col justify-between">
              <div>
                {/* Price block */}
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 mb-5">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                      ${listing.price}
                    </span>
                    {listing.originalPrice && listing.originalPrice > listing.price && (
                      <span className="text-sm text-slate-400 line-through font-medium">
                        Original: ${listing.originalPrice}
                      </span>
                    )}
                  </div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900 mt-2 leading-snug">
                    {listing.title}
                  </h2>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Listed on {new Date(listing.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                </div>

                {/* Seller Profile Card */}
                {listing.seller && (
                  <div
                    onClick={() => onOpenProfile(listing.seller!.id)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-emerald-500/50 transition cursor-pointer bg-white mb-5 group shadow-2xs"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={listing.seller.avatar}
                        alt={listing.seller.name}
                        className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-sm text-slate-900 truncate group-hover:text-emerald-700 transition">
                            {listing.seller.name}
                          </span>
                          {listing.seller.studentIdVerified && (
                            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" title="Verified .edu Student" />
                          )}
                        </div>
                        <div className="text-xs text-slate-500 truncate">{listing.seller.university}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded">
                            <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                            <span>{listing.seller.rating || 5.0}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-medium">({listing.seller.reviewCount || 0} reviews)</span>
                        </div>
                      </div>
                    </div>

                    {listing.seller.dorm && (
                      <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Dorm / Quad: <strong>{listing.seller.dorm}</strong></span>
                      </div>
                    )}
                  </div>
                )}

                {/* Seller Reviews Preview */}
                {listing.reviews && listing.reviews.length > 0 && (
                  <div className="mb-5">
                    <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">Student Reviews</h5>
                    <div className="space-y-2">
                      {listing.reviews.slice(0, 2).map((rev) => (
                        <div key={rev.id} className="p-3 bg-slate-50 rounded-xl text-xs border border-slate-100">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-slate-800">{rev.reviewer?.name || 'Fellow Student'}</span>
                            <div className="flex text-amber-500">
                              {[...Array(rev.rating)].map((_, i) => (
                                <Star key={i} className="w-3 h-3 fill-current" />
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-600 italic">"{rev.comment}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-4 border-t border-slate-100">
                {!isOwner ? (
                  <>
                    <button
                      onClick={() => onStartChat(listing)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-xs transition flex items-center justify-center gap-2 text-sm"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Message Seller to Meetup</span>
                    </button>

                    {listing.isNegotiable && (
                      <div>
                        {showOfferInput ? (
                          <div className="flex gap-2 mt-2">
                            <div className="relative flex-1">
                              <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                              <input
                                type="number"
                                value={offerAmount}
                                onChange={(e) => setOfferAmount(e.target.value)}
                                placeholder="Enter offer ($)"
                                className="w-full pl-8 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden"
                              />
                            </div>
                            <button
                              onClick={handleSendOffer}
                              className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition"
                            >
                              Send Offer
                            </button>
                            <button
                              onClick={() => setShowOfferInput(false)}
                              className="px-2 py-2 text-slate-400 hover:text-slate-600 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowOfferInput(true)}
                            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-2.5 px-4 rounded-xl transition flex items-center justify-center gap-2 text-xs"
                          >
                            <DollarSign className="w-4 h-4 text-slate-500" />
                            <span>Make an Offer</span>
                          </button>
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800 text-center font-medium border border-emerald-200">
                    This is your campus listing. Manage inquiries via your In-App Messages.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
