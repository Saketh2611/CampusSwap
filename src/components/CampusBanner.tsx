import React from 'react';
import { ShieldCheck, MapPin, Users, PackageCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CampusBannerProps {
  onOpenSafety: () => void;
  onOpenAuth: () => void;
}

export const CampusBanner: React.FC<CampusBannerProps> = ({ onOpenSafety, onOpenAuth }) => {
  const { activeCampus, user } = useAuth();

  if (!activeCampus) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 mb-8 shadow-lg relative overflow-hidden">
      {/* Decorative campus ambient glow */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-1/3 -mb-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <MapPin className="w-3.5 h-3.5" />
              {activeCampus.name}
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-white/10 text-slate-200">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              .edu Student Verified Only
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-1">
            Buy & sell on campus with fellow students
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-2xl leading-relaxed">
            Skip expensive bookstore markups and shipping fees. Hand-off textbooks, dorm gear, tech, and bikes safely at campus library lobbies and dining quads.
          </p>

          {/* Micro stats */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-4 pt-3 border-t border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-400" />
              <span><strong className="text-white font-bold">{activeCampus.verifiedStudents.toLocaleString()}</strong> verified students</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PackageCheck className="w-4 h-4 text-emerald-400" />
              <span><strong className="text-white font-bold">{activeCampus.activeListings}</strong> active listings</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span><strong className="text-white font-bold">{activeCampus.safePickupZones.length}</strong> monitored safe spots</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 shrink-0">
          <button
            id="banner-safe-spots-btn"
            onClick={onOpenSafety}
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/20 text-white text-xs sm:text-sm font-semibold transition flex items-center justify-center gap-2 border border-white/20 backdrop-blur-sm"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>Campus Safe Zones</span>
          </button>
          {!user && (
            <button
              onClick={onOpenAuth}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs sm:text-sm font-bold transition flex items-center justify-center gap-2 shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Sign Up with .edu</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
