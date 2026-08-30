import React, { useState } from 'react';
import { X, Upload, Plus, Image as ImageIcon, MapPin, Tag, DollarSign, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { CATEGORIES, CONDITIONS } from './CategoryFilter';
import { api } from '../lib/api';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onListingCreated: () => void;
}

const PRESET_DEMO_IMAGES = [
  { label: 'Textbook', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=800' },
  { label: 'Calculator', url: 'https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&q=80&w=800' },
  { label: 'Headphones', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800' },
  { label: 'Desk Lamp', url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&q=80&w=800' },
  { label: 'Campus Bike', url: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800' },
  { label: 'Keyboard', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&q=80&w=800' },
  { label: 'Tumbler', url: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?auto=format&fit=crop&q=80&w=800' },
  { label: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&q=80&w=800' },
];

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onListingCreated,
}) => {
  const { user, activeCampus } = useAuth();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [originalPrice, setOriginalPrice] = useState('');
  const [category, setCategory] = useState('Textbooks');
  const [condition, setCondition] = useState<'Brand New' | 'Like New' | 'Good' | 'Fair'>('Like New');
  const [pickupLocation, setPickupLocation] = useState(
    activeCampus?.safePickupZones[0]?.name || 'Campus Library / Student Union'
  );
  const [isNegotiable, setIsNegotiable] = useState(true);
  const [imageUrlInput, setImageUrlInput] = useState('');
  const [images, setImages] = useState<string[]>([PRESET_DEMO_IMAGES[0].url]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddImage = (urlToAdd?: string) => {
    const url = urlToAdd || imageUrlInput.trim();
    if (!url) return;
    if (!images.includes(url)) {
      setImages([...images, url]);
    }
    setImageUrlInput('');
  };

  const handleRemoveImage = (indexToRemove: number) => {
    setImages(images.filter((_, idx) => idx !== indexToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a title');
      return;
    }
    if (!price || Number(price) < 0) {
      setError('Please enter a valid price');
      return;
    }
    if (images.length === 0) {
      setError('Please attach at least one photo');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await api.listings.create({
        title: title.trim(),
        description: description.trim(),
        price: Number(price),
        originalPrice: originalPrice ? Number(originalPrice) : undefined,
        category,
        condition,
        pickupLocation: pickupLocation.trim(),
        campus: activeCampus?.name || user?.campus || 'Stanford Main Campus',
        isNegotiable,
        images,
      });

      onListingCreated();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to publish listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div>
            <h3 className="font-bold text-lg text-slate-900">Post Item on Campus</h3>
            <p className="text-xs text-slate-500">Reach thousands of students at {activeCampus?.shortName || 'your university'}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 flex-1 space-y-5">
          {error && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-semibold rounded-xl border border-rose-200">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. TI-84 Plus CE Graphing Calculator or Stewart Calculus 8th Ed"
              className="w-full px-3.5 py-2.5 bg-slate-50 text-xs sm:text-sm text-slate-900 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden"
            />
          </div>

          {/* Category & Condition */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 text-xs sm:text-sm text-slate-900 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden cursor-pointer"
              >
                {CATEGORIES.filter((c) => c.id !== 'All').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Condition *
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as any)}
                className="w-full px-3.5 py-2.5 bg-slate-50 text-xs sm:text-sm text-slate-900 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden cursor-pointer"
              >
                {CONDITIONS.filter((c) => c !== 'All').map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Price & Original Price */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Selling Price ($) *
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="25"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 text-xs sm:text-sm text-slate-900 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Original Retail Price ($) <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(e.target.value)}
                  placeholder="50 (shows discount badge)"
                  className="w-full pl-8 pr-3.5 py-2.5 bg-slate-50 text-xs sm:text-sm text-slate-900 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Negotiable Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isNegotiableCheckbox"
              checked={isNegotiable}
              onChange={(e) => setIsNegotiable(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500"
            />
            <label htmlFor="isNegotiableCheckbox" className="text-xs font-semibold text-slate-700 cursor-pointer">
              Price is negotiable with fellow students
            </label>
          </div>

          {/* Campus & Pickup Spot */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Campus Pickup Location *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-emerald-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={pickupLocation}
                onChange={(e) => setPickupLocation(e.target.value)}
                placeholder="e.g. Green Library Rotunda, Student Center, Wilbur Dining"
                className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 text-xs sm:text-sm text-slate-900 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden"
              />
            </div>
            {activeCampus?.safePickupZones && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-[11px] text-slate-400 self-center">Safe spots:</span>
                {activeCampus.safePickupZones.slice(0, 3).map((z) => (
                  <button
                    key={z.name}
                    type="button"
                    onClick={() => setPickupLocation(z.name)}
                    className="text-[11px] bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-600 px-2 py-0.5 rounded-md transition"
                  >
                    {z.name.split(' (')[0]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Description *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="State the course name/code, edition, condition, battery health, or why you are selling..."
              className="w-full px-3.5 py-2.5 bg-slate-50 text-xs sm:text-sm text-slate-900 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden resize-none"
            />
          </div>

          {/* Photos Upload / URLs */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Item Photos *
            </label>

            {/* Current Images Preview */}
            <div className="flex flex-wrap gap-3 mb-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-200 group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-rose-600 transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Add Image via URL */}
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="Paste image URL..."
                className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 outline-hidden"
              />
              <button
                type="button"
                onClick={() => handleAddImage()}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
              >
                Add Image
              </button>
            </div>

            {/* Quick Demo Item Photo Presets */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[11px] font-bold text-slate-500 block mb-1.5">Or choose a preset sample photo:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_DEMO_IMAGES.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => handleAddImage(preset.url)}
                    className="text-[11px] bg-white border border-slate-200 hover:border-emerald-500 hover:text-emerald-700 px-2 py-1 rounded-lg text-slate-700 transition"
                  >
                    + {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-xs transition disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Publish Campus Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
