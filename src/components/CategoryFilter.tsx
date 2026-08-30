import React from 'react';
import {
  BookOpen,
  Laptop,
  Home,
  Bike,
  Shirt,
  PenTool,
  Sparkles,
  SlidersHorizontal,
  ArrowDownUp,
  X,
} from 'lucide-react';

export const CATEGORIES = [
  { id: 'All', label: 'All Items', icon: Sparkles },
  { id: 'Textbooks', label: 'Textbooks', icon: BookOpen },
  { id: 'Electronics', label: 'Tech & Electronics', icon: Laptop },
  { id: 'Dorm & Living', label: 'Dorm & Living', icon: Home },
  { id: 'Bikes & Scooters', label: 'Bikes & Scooters', icon: Bike },
  { id: 'Apparel', label: 'Apparel & Merch', icon: Shirt },
  { id: 'School Supplies', label: 'School Supplies', icon: PenTool },
];

export const CONDITIONS = ['All', 'Brand New', 'Like New', 'Good', 'Fair'];

interface CategoryFilterProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedCondition: string;
  setSelectedCondition: (cond: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  minPrice?: number;
  setMinPrice: (p?: number) => void;
  maxPrice?: number;
  setMaxPrice: (p?: number) => void;
  totalResults: number;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedCondition,
  setSelectedCondition,
  sortBy,
  setSortBy,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  totalResults,
}) => {
  const [showFiltersModal, setShowFiltersModal] = React.useState(false);

  const activeFilterCount =
    (selectedCondition !== 'All' ? 1 : 0) +
    (minPrice !== undefined && minPrice > 0 ? 1 : 0) +
    (maxPrice !== undefined ? 1 : 0);

  return (
    <div className="mb-6 space-y-4">
      {/* Category Pills Carousel / Scroll */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                isSelected
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter and Sort Subbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">
            Showing <strong className="text-slate-900">{totalResults}</strong> campus item{totalResults === 1 ? '' : 's'}
          </span>
          {activeFilterCount > 0 && (
            <button
              onClick={() => {
                setSelectedCondition('All');
                setMinPrice(undefined);
                setMaxPrice(undefined);
              }}
              className="text-xs text-rose-600 hover:underline flex items-center gap-1 font-medium ml-2"
            >
              <X className="w-3 h-3" />
              Reset filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Condition selector on larger screens */}
          <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            {CONDITIONS.map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCondition(c)}
                className={`px-2.5 py-1 rounded-lg font-medium transition ${
                  selectedCondition === c ? 'bg-white text-slate-900 shadow-xs font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200/80 rounded-xl px-2.5 py-1.5 text-xs text-slate-700 shadow-xs">
            <ArrowDownUp className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent font-medium text-slate-800 outline-hidden cursor-pointer"
            >
              <option value="newest">Recently Listed</option>
              <option value="popular">Most Favorited</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>

          {/* Filter Popover Toggle */}
          <button
            onClick={() => setShowFiltersModal(!showFiltersModal)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition ${
              activeFilterCount > 0
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Price Filter</span>
            {activeFilterCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center font-bold">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Expanded Price Filter Drawer */}
      {showFiltersModal && (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm animate-in fade-in flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Min Price ($)</label>
            <input
              type="number"
              min="0"
              placeholder="0"
              value={minPrice !== undefined ? minPrice : ''}
              onChange={(e) => setMinPrice(e.target.value ? Number(e.target.value) : undefined)}
              className="w-28 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-hidden"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Max Price ($)</label>
            <input
              type="number"
              min="0"
              placeholder="500"
              value={maxPrice !== undefined ? maxPrice : ''}
              onChange={(e) => setMaxPrice(e.target.value ? Number(e.target.value) : undefined)}
              className="w-28 px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:bg-white focus:border-emerald-500 outline-hidden"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                setMinPrice(undefined);
                setMaxPrice(undefined);
              }}
              className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              Clear
            </button>
            <button
              onClick={() => setShowFiltersModal(false)}
              className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
            >
              Apply Filter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
