import React from 'react';
import { X, ShieldCheck, MapPin, AlertTriangle, PhoneCall, CheckCircle, Info } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface CampusSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CampusSafetyModal: React.FC<CampusSafetyModalProps> = ({ isOpen, onClose }) => {
  const { activeCampus } = useAuth();

  if (!isOpen || !activeCampus) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col border border-slate-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-emerald-900 text-white">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
            <div>
              <h3 className="font-bold text-base sm:text-lg">Campus Safety & Safe Pickup Zones</h3>
              <p className="text-xs text-emerald-200">Monitored student exchange spots at {activeCampus.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="overflow-y-auto p-6 flex-1 space-y-6">
          
          {/* Official Monitored Safe Zones */}
          <div>
            <h4 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" />
              <span>Designated Exchange Zones at {activeCampus.shortName}</span>
            </h4>

            <div className="space-y-2.5">
              {activeCampus.safePickupZones.map((zone, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start justify-between gap-3"
                >
                  <div>
                    <span className="font-bold text-xs sm:text-sm text-slate-900">{zone.name}</span>
                    <span className="text-xs text-slate-500 block mt-0.5">{zone.landmark}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg shrink-0">
                    {zone.safeZoneHours}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Golden Rules for Campus Trading */}
          <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-200">
            <h4 className="font-bold text-emerald-950 text-xs sm:text-sm mb-2 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-700" />
              <span>CampusSwap Trading Guidelines</span>
            </h4>
            <ul className="text-xs text-emerald-900 space-y-1.5 list-disc pl-4 leading-relaxed">
              <li><strong>Always meet in public:</strong> High foot-traffic areas like student centers and libraries.</li>
              <li><strong>Inspect before paying:</strong> Test calculators, verify textbook ISBNs, and check electronics functionality in person.</li>
              <li><strong>Verified students only:</strong> Only trade with members holding a verified .edu student badge.</li>
              <li><strong>Cash or Instant App:</strong> Use Venmo, Zelle, or cash only when you have physically received and inspected the item.</li>
            </ul>
          </div>

          {/* Emergency Contact */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <PhoneCall className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="font-bold text-xs">Campus Police & Escort Service</div>
                <div className="text-[11px] text-slate-400">Available 24/7 for safe walking escorts across campus</div>
              </div>
            </div>
            <span className="text-xs font-mono font-bold bg-white/10 px-3 py-1.5 rounded-xl text-emerald-300">
              911 / Blue Light
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
