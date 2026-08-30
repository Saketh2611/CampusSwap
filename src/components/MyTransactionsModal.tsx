import React, { useState, useEffect } from 'react';
import { X, PackageCheck, CheckCircle2, Clock, Trash2, Tag, ArrowUpRight } from 'lucide-react';
import { Listing } from '../types';
import { useAuth } from '../context/AuthContext';
import { api } from '../lib/api';

interface MyTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenListing: (listingId: number) => void;
  onListingUpdated: () => void;
}

export const MyTransactionsModal: React.FC<MyTransactionsModalProps> = ({
  isOpen,
  onClose,
  onOpenListing,
  onListingUpdated,
}) => {
  const { user } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [activeTab, setActiveTab] = useState<'active' | 'sold'>('active');
  const [loading, setLoading] = useState(false);

  const loadListings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await api.users.getUserListings(user.id);
      setListings(data);
    } catch (err) {
      console.error('Failed to load user listings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && user) {
      loadListings();
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleUpdateStatus = async (id: number, status: 'active' | 'pending' | 'sold') => {
    try {
      await api.listings.updateStatus(id, status);
      await loadListings();
      onListingUpdated();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDeleteListing = async (id: number) => {
    if (!confirm('Are you sure you want to remove this listing?')) return;
    try {
      await api.listings.delete(id);
      await loadListings();
      onListingUpdated();
    } catch (err) {
      console.error('Failed to delete listing:', err);
    }
  };

  const filteredListings = listings.filter((l) =>
    activeTab === 'active' ? l.status !== 'sold' : l.status === 'sold'
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900">My Campus Listings & Orders</h3>
            <p className="text-xs text-slate-500">Manage status of items you are selling</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('active')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'active' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Active & Pending ({listings.filter((l) => l.status !== 'sold').length})
          </button>
          <button
            onClick={() => setActiveTab('sold')}
            className={`pb-3 border-b-2 transition ${
              activeTab === 'sold' ? 'border-emerald-600 text-emerald-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Completed & Sold ({listings.filter((l) => l.status === 'sold').length})
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 flex-1">
          {loading ? (
            <div className="text-center py-12 text-slate-400 text-xs">Loading items...</div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No items in this tab.
            </div>
          ) : (
            <div className="space-y-3">
              {filteredListings.map((item) => (
                <div
                  key={item.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs hover:border-slate-300 transition"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    <img
                      src={item.images?.[0] || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=150'}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 truncate">{item.title}</span>
                        <span className="text-xs font-extrabold text-emerald-700">${item.price}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-700">{item.category}</span>
                        <span>•</span>
                        <span>{item.pickupLocation}</span>
                      </div>
                    </div>
                  </div>

                  {/* Status Action Buttons */}
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                    {item.status !== 'sold' ? (
                      <>
                        <button
                          onClick={() => handleUpdateStatus(item.id, 'sold')}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Mark as Sold</span>
                        </button>

                        <button
                          onClick={() => handleUpdateStatus(item.id, item.status === 'pending' ? 'active' : 'pending')}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100 text-xs font-semibold transition"
                        >
                          {item.status === 'pending' ? 'Set Active' : 'Mark Pending'}
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleUpdateStatus(item.id, 'active')}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 text-xs font-semibold transition"
                      >
                        Relist Item
                      </button>
                    )}

                    <button
                      onClick={() => onOpenListing(item.id)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
                      title="View Details"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDeleteListing(item.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Delete Listing"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
