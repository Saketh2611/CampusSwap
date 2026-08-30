import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { CampusBanner } from './components/CampusBanner';
import { CategoryFilter } from './components/CategoryFilter';
import { ListingCard } from './components/ListingCard';
import { ListingDetailModal } from './components/ListingDetailModal';
import { CreateListingModal } from './components/CreateListingModal';
import { ChatModal } from './components/ChatModal';
import { UserProfileModal } from './components/UserProfileModal';
import { FavoritesModal } from './components/FavoritesModal';
import { MyTransactionsModal } from './components/MyTransactionsModal';
import { CampusSafetyModal } from './components/CampusSafetyModal';
import { AuthModal } from './components/AuthModal';
import { SwaggerModal } from './components/SwaggerModal';
import { Listing } from './types';
import { api } from './lib/api';
import { Package, Search, PlusCircle, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

function CampusMarketplace() {
  const { user, activeCampus } = useAuth();

  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCondition, setSelectedCondition] = useState('All');
  const [sortBy, setSortBy] = useState('newest');
  const [minPrice, setMinPrice] = useState<number | undefined>(undefined);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(undefined);

  // Listings Data State
  const [listings, setListings] = useState<Listing[]>([]);
  const [totalResults, setTotalResults] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals & Navigation State
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [createListingOpen, setCreateListingOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatTargetListing, setChatTargetListing] = useState<Listing | null>(null);
  const [profileUserId, setProfileUserId] = useState<number | null>(null);
  const [favoritesOpen, setFavoritesOpen] = useState(false);
  const [transactionsOpen, setTransactionsOpen] = useState(false);
  const [safetyOpen, setSafetyOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const [swaggerOpen, setSwaggerOpen] = useState(false);

  // Load marketplace listings from backend
  const fetchListings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.listings.getAll({
        search: searchQuery,
        category: selectedCategory,
        campus: activeCampus?.shortName || activeCampus?.name,
        condition: selectedCondition,
        sortBy,
        minPrice,
        maxPrice,
      });
      setListings(data.listings);
      setTotalResults(data.total);
    } catch (err: any) {
      console.error('Failed to load listings:', err);
      setError(err.message || 'Could not connect to marketplace API');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, activeCampus, selectedCondition, sortBy, minPrice, maxPrice]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  // Handle favorite toggle with instant optimistic update
  const handleToggleFavorite = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!user) {
      setAuthOpen(true);
      return;
    }

    // Optimistic UI update
    setListings((prev) =>
      prev.map((l) =>
        l.id === id
          ? {
              ...l,
              isFavorited: !l.isFavorited,
              favoritesCount: l.isFavorited ? l.favoritesCount - 1 : l.favoritesCount + 1,
            }
          : l
      )
    );

    if (selectedListing && selectedListing.id === id) {
      setSelectedListing((prev) =>
        prev
          ? {
              ...prev,
              isFavorited: !prev.isFavorited,
              favoritesCount: prev.isFavorited ? prev.favoritesCount - 1 : prev.favoritesCount + 1,
            }
          : null
      );
    }

    try {
      await api.listings.toggleFavorite(id);
    } catch (err) {
      console.error('Failed to toggle favorite:', err);
      // Revert if error
      fetchListings();
    }
  };

  // Open chat from listing detail
  const handleStartChatFromListing = (listing: Listing, initialMessage?: string) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setSelectedListing(null);
    setChatTargetListing(listing);
    setChatOpen(true);
  };

  const handleOpenListingDetail = async (id: number) => {
    try {
      const detailed = await api.listings.getById(id);
      setSelectedListing(detailed);
    } catch (err) {
      console.error('Failed to load listing details:', err);
    }
  };

  const favoritesCount = listings.filter((l) => l.isFavorited).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenCreateListing={() => setCreateListingOpen(true)}
        onOpenFavorites={() => (user ? setFavoritesOpen(true) : setAuthOpen(true))}
        onOpenMessages={() => setChatOpen(true)}
        onOpenProfile={(uid) => setProfileUserId(uid || user?.id || null)}
        onOpenAuth={() => setAuthOpen(true)}
        onOpenSafety={() => setSafetyOpen(true)}
        onOpenTransactions={() => setTransactionsOpen(true)}
        onOpenSwagger={() => setSwaggerOpen(true)}
        favoritesCount={favoritesCount}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* Campus Header & Info Banner */}
        <CampusBanner
          onOpenSafety={() => setSafetyOpen(true)}
          onOpenAuth={() => setAuthOpen(true)}
        />

        {/* Category & Sorting Filter Bar */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          selectedCondition={selectedCondition}
          setSelectedCondition={setSelectedCondition}
          sortBy={sortBy}
          setSortBy={setSortBy}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          totalResults={totalResults}
        />

        {/* Error State */}
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs sm:text-sm flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchListings}
              className="px-3 py-1.5 bg-rose-600 text-white font-semibold rounded-xl text-xs hover:bg-rose-700 transition"
            >
              Retry
            </button>
          </div>
        )}

        {/* Listings Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-3 animate-pulse space-y-3">
                <div className="aspect-4/3 bg-slate-200 rounded-xl"></div>
                <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                <div className="h-3 bg-slate-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center max-w-md mx-auto my-8 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <Package className="w-8 h-8" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">No campus listings found</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              No student items match your current filter or search criteria at {activeCampus?.shortName}. Try clearing filters or be the first to post!
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedCondition('All');
                  setSearchQuery('');
                  setMinPrice(undefined);
                  setMaxPrice(undefined);
                }}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition"
              >
                Clear all filters
              </button>
              <button
                onClick={() => (user ? setCreateListingOpen(true) : setAuthOpen(true))}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white transition flex items-center gap-1.5 shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Sell an Item</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {listings.map((item) => (
              <ListingCard
                key={item.id}
                listing={item}
                onClick={() => handleOpenListingDetail(item.id)}
                onToggleFavorite={handleToggleFavorite}
                onOpenProfile={(uid) => setProfileUserId(uid)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white mt-16 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
              CS
            </div>
            <span className="font-bold text-slate-800">CampusSwap</span>
            <span>• Hyperlocal C2C College Marketplace</span>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={() => setSafetyOpen(true)} className="hover:text-emerald-700 font-medium">
              Campus Safe Zones
            </button>
            <button onClick={() => setSwaggerOpen(true)} className="hover:text-emerald-700 font-medium">
              OpenAPI Swagger Docs
            </button>
            <span>© {new Date().getFullYear()} CampusSwap Inc.</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {selectedListing && (
        <ListingDetailModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onToggleFavorite={handleToggleFavorite}
          onStartChat={handleStartChatFromListing}
          onOpenProfile={(uid) => {
            setSelectedListing(null);
            setProfileUserId(uid);
          }}
          onOpenSafety={() => setSafetyOpen(true)}
        />
      )}

      {createListingOpen && (
        <CreateListingModal
          isOpen={createListingOpen}
          onClose={() => setCreateListingOpen(false)}
          onListingCreated={fetchListings}
        />
      )}

      {chatOpen && (
        <ChatModal
          isOpen={chatOpen}
          onClose={() => {
            setChatOpen(false);
            setChatTargetListing(null);
          }}
          targetListing={chatTargetListing}
          onOpenListing={handleOpenListingDetail}
        />
      )}

      {profileUserId !== null && (
        <UserProfileModal
          userId={profileUserId}
          isOpen={profileUserId !== null}
          onClose={() => setProfileUserId(null)}
          onOpenListing={handleOpenListingDetail}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {favoritesOpen && (
        <FavoritesModal
          isOpen={favoritesOpen}
          onClose={() => setFavoritesOpen(false)}
          onOpenListing={handleOpenListingDetail}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {transactionsOpen && (
        <MyTransactionsModal
          isOpen={transactionsOpen}
          onClose={() => setTransactionsOpen(false)}
          onOpenListing={handleOpenListingDetail}
          onListingUpdated={fetchListings}
        />
      )}

      {safetyOpen && (
        <CampusSafetyModal
          isOpen={safetyOpen}
          onClose={() => setSafetyOpen(false)}
        />
      )}

      {authOpen && (
        <AuthModal
          isOpen={authOpen}
          onClose={() => setAuthOpen(false)}
        />
      )}

      {swaggerOpen && (
        <SwaggerModal
          isOpen={swaggerOpen}
          onClose={() => setSwaggerOpen(false)}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CampusMarketplace />
    </AuthProvider>
  );
}
