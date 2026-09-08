import React, { useState } from 'react';
import { Navigation } from './components/Navigation';
import { PropertyFeed } from './components/PropertyFeed';
import { PropertyModal } from './components/PropertyModal';
import { MyViewings } from './components/MyViewings';
import { FavoritesView } from './components/FavoritesView';
import { AgentQueue } from './components/AgentQueue';
import { AdminDashboard } from './components/AdminDashboard';
import { Listing } from './types';
import { MapPin, ShieldCheck, Zap } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('feed');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

  return (
    <div className="min-h-screen bg-paper flex flex-col justify-between selection:bg-brass selection:text-ink">
      <div>
        <Navigation activeTab={activeTab} setActiveTab={setActiveTab} />

        <main className="pb-16">
          {activeTab === 'feed' && (
            <PropertyFeed onSelectListing={(listing) => setSelectedListing(listing)} />
          )}

          {activeTab === 'my_viewings' && <MyViewings />}

          {activeTab === 'favorites' && (
            <FavoritesView onSelectListing={(listing) => setSelectedListing(listing)} />
          )}

          {activeTab === 'agent_queue' && <AgentQueue />}

          {activeTab === 'admin_dashboard' && <AdminDashboard />}
        </main>
      </div>

      {/* Property Details & Booking Modal */}
      {selectedListing && (
        <PropertyModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
          onViewingRequested={() => setActiveTab('my_viewings')}
        />
      )}

      {/* Luxury Desktop Footer */}
      <footer className="bg-ink text-stone-400 border-t border-stone-800/80 py-6 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-semibold text-stone-200">
              ESTATE COORDINATOR
            </span>
            <span>• Native Electron Desktop v1.0.0</span>
          </div>

          <div className="flex items-center space-x-4 text-[11px] font-mono">
            <span className="flex items-center gap-1 text-stone-300">
              <MapPin className="w-3.5 h-3.5 text-brass" /> Erbil & London
            </span>
            <span className="flex items-center gap-1 text-live">
              <Zap className="w-3.5 h-3.5 text-live" /> Real-time GPS Radar
            </span>
            <span className="flex items-center gap-1 text-stone-300">
              <ShieldCheck className="w-3.5 h-3.5 text-brass" /> Offline Standalone Store
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
