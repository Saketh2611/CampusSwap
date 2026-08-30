import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Star,
  Calendar,
  MapPin,
  Package,
  Award,
  CheckCircle,
  MessageSquare,
  Edit3,
} from 'lucide-react';
import { User, Listing, Review } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';
import { ListingCard } from './ListingCard';

interface UserProfileModalProps {
  userId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenListing: (listingId: number) => void;
  onToggleFavorite: (e: React.MouseEvent, id: number) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  userId,
  isOpen,
  onClose,
  onOpenListing,
  onToggleFavorite,
}) => {
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews' | 'about'>('listings');
  const [loading, setLoading] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      const loadProfile = async () => {
        setLoading(true);
        try {
          const data = await api.users.getProfile(userId);
          setProfile(data);
        } catch (err) {
          console.error('Failed to load user profile:', err);
        } finally {
          setLoading(false);
        }
      };
      loadProfile();
    }
  }, [isOpen, userId]);

  if (!isOpen || !userId) return null;

  const isSelf = currentUser?.id === userId;

  const handlePostReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      await api.reviews.createReview({
        targetUserId: userId,
        rating: reviewRating,
        comment: reviewComment.trim(),
        role: 'buyer',
      });
      // Refresh profile to see new review and updated rating
      const updated = await api.users.getProfile(userId);
      setProfile(updated);
      setReviewComment('');
    } catch (err) {
      console.error('Failed to post review:', err);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Student Profile</span>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 flex-1">
          {loading || !profile ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading student profile...</div>
          ) : (
            <div>
              {/* Profile Card Banner */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-md">
                <img
                  src={profile.avatar}
                  alt={profile.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-white/10 shrink-0"
                />
                <div className="flex-1 text-center sm:text-left">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-xl sm:text-2xl font-extrabold">{profile.name}</h2>
                    {profile.studentIdVerified && (
                      <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold px-2.5 py-0.5 rounded-full">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Verified Student
                      </span>
                    )}
                  </div>

                  <p className="text-slate-300 text-xs sm:text-sm mt-1">
                    {profile.university} • {profile.campus}
                  </p>

                  {profile.dorm && (
                    <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-slate-300 mt-2">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Dorm: {profile.dorm}</span>
                    </div>
                  )}

                  {/* Rating score badge */}
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 mt-4 pt-3 border-t border-white/10 text-xs">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <strong className="font-bold text-white text-sm">{profile.rating || 5.0}</strong>
                      <span className="text-slate-400">({profile.reviewCount || 0} reviews)</span>
                    </div>
                    {profile.graduationYear && (
                      <div className="flex items-center gap-1 text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Class of {profile.graduationYear}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-slate-200 mt-6 gap-6 text-xs sm:text-sm font-semibold">
                <button
                  onClick={() => setActiveTab('listings')}
                  className={`pb-3 border-b-2 transition ${
                    activeTab === 'listings' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Active Campus Listings ({profile.listings?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('reviews')}
                  className={`pb-3 border-b-2 transition ${
                    activeTab === 'reviews' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Student Reviews ({profile.receivedReviews?.length || 0})
                </button>
                <button
                  onClick={() => setActiveTab('about')}
                  className={`pb-3 border-b-2 transition ${
                    activeTab === 'about' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  About & Badges
                </button>
              </div>

              {/* Tab Content */}
              <div className="pt-6">
                {activeTab === 'listings' && (
                  <div>
                    {!profile.listings || profile.listings.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 text-xs">
                        No active campus listings from this student right now.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {profile.listings.map((item) => (
                          <ListingCard
                            key={item.id}
                            listing={{ ...item, seller: profile }}
                            onClick={() => onOpenListing(item.id)}
                            onToggleFavorite={onToggleFavorite}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'reviews' && (
                  <div className="space-y-6">
                    {/* Add Review Box if authenticated and not self */}
                    {currentUser && !isSelf && (
                      <form onSubmit={handlePostReview} className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
                        <h4 className="text-xs font-bold text-slate-900 mb-2">Leave a Verified Campus Trade Review</h4>
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs text-slate-600">Rating:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                type="button"
                                key={star}
                                onClick={() => setReviewRating(star)}
                                className="p-1"
                              >
                                <Star
                                  className={`w-5 h-5 ${
                                    star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                  }`}
                                />
                              </button>
                            ))}
                          </div>
                        </div>

                        <textarea
                          rows={2}
                          required
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="How was your meetup? Was the item in good condition? Fast responder?"
                          className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 outline-hidden focus:border-emerald-500"
                        />

                        <div className="flex justify-end mt-2">
                          <button
                            type="submit"
                            disabled={submittingReview}
                            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition disabled:opacity-50"
                          >
                            {submittingReview ? 'Submitting...' : 'Post Review'}
                          </button>
                        </div>
                      </form>
                    )}

                    {/* Review List */}
                    {!profile.receivedReviews || profile.receivedReviews.length === 0 ? (
                      <div className="text-center py-10 text-slate-400 text-xs">
                        No reviews yet for this student.
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {profile.receivedReviews.map((rev) => (
                          <div key={rev.id} className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <img
                                  src={rev.reviewer?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150'}
                                  alt=""
                                  className="w-7 h-7 rounded-lg object-cover"
                                />
                                <div>
                                  <span className="font-bold text-xs text-slate-900">{rev.reviewer?.name || 'Verified Student'}</span>
                                  <span className="text-[10px] text-slate-400 block">{new Date(rev.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>
                              <div className="flex text-amber-400">
                                {[...Array(rev.rating)].map((_, i) => (
                                  <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                ))}
                              </div>
                            </div>
                            <p className="text-xs text-slate-700 leading-relaxed italic">"{rev.comment}"</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'about' && (
                  <div className="space-y-4 text-xs text-slate-700">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <h4 className="font-bold text-slate-900 mb-1">Student Bio</h4>
                      <p className="leading-relaxed">{profile.bio || 'No custom bio set yet.'}</p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                        <Award className="w-8 h-8 text-emerald-600 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">University Verification</div>
                          <div className="text-slate-500 text-[11px]">Validated with official university .edu domain</div>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl border border-slate-200 flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-indigo-600 shrink-0" />
                        <div>
                          <div className="font-bold text-slate-900">Safe Meetup Badge</div>
                          <div className="text-slate-500 text-[11px]">Meets exclusively at designated campus safe zones</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
