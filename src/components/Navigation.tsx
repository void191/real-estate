import React from 'react';
import { useAppStore } from '../store/useStore';
import {
  Home,
  Calendar,
  Heart,
  LayoutGrid,
  ShieldAlert,
  RotateCcw,
  Sparkles,
  MapPin,
} from 'lucide-react';

interface NavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({ activeTab, setActiveTab }) => {
  const { currentUser, users, setCurrentUser, resetStateToDefault, viewings, favorites } =
    useAppStore();

  const buyerUpcomingCount = viewings.filter(
    (v) =>
      v.buyer_id === currentUser.id &&
      (v.status === 'requested' ||
        v.status === 'accepted' ||
        v.status === 'en_route' ||
        v.status === 'arrived')
  ).length;

  const agentQueueCount = viewings.filter(
    (v) =>
      v.status === 'requested' ||
      v.status === 'accepted' ||
      v.status === 'en_route'
  ).length;

  return (
    <header className="bg-ink text-white sticky top-0 z-40 border-b border-stone/20 shadow-md">
      {/* Top Brand Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('feed')}>
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brass to-brass-light flex items-center justify-center text-ink font-serif font-bold text-xl shadow-inner">
            E
          </div>
          <div>
            <div className="font-serif tracking-wider font-semibold text-base text-stone-100 flex items-center gap-2">
              ESTATE COORDINATOR
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-brass/20 text-brass border border-brass/30">
                Desktop
              </span>
            </div>
            <div className="text-[11px] font-mono text-stone-400 tracking-tight flex items-center gap-1.5">
              <MapPin className="w-3 h-3 text-brass" /> Erbil & London Luxury Residences
            </div>
          </div>
        </div>

        {/* User & Role Switcher */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-stone-900/80 px-3 py-1.5 rounded-full border border-stone-800">
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-brass"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-brass/20 text-brass flex items-center justify-center font-bold text-xs">
                {currentUser.name.charAt(0)}
              </div>
            )}
            <div className="ml-2 mr-3 text-left">
              <div className="text-xs font-medium text-stone-200">{currentUser.name}</div>
              <div className="text-[10px] font-mono capitalize text-brass tracking-wider">
                {currentUser.role === 'admin'
                  ? 'Managing Director'
                  : currentUser.role === 'agent'
                  ? 'Senior Broker'
                  : 'Private Client'}
              </div>
            </div>

            {/* Quick Switch Dropdown */}
            <select
              value={currentUser.id}
              onChange={(e) => {
                const selected = users.find((u) => u.id === e.target.value);
                if (selected) {
                  setCurrentUser(selected);
                  if (selected.role === 'agent') setActiveTab('agent_queue');
                  else if (selected.role === 'admin') setActiveTab('admin_dashboard');
                  else setActiveTab('feed');
                }
              }}
              className="bg-stone-800 text-stone-300 text-xs rounded border border-stone-700 py-1 px-2 focus:outline-none focus:border-brass cursor-pointer"
            >
              <optgroup label="Private Buyers">
                <option value="usr_buyer1">Oliver Sterling (Buyer)</option>
                <option value="usr_buyer2">Sophia Montgomery (Buyer)</option>
                <option value="usr_buyer3">Julian Thorne (Buyer)</option>
              </optgroup>
              <optgroup label="Licensed Agents">
                <option value="usr_alan">Alan Barzani (Erbil Senior)</option>
                <option value="usr_layla">Layla Hawrami (Erbil Broker)</option>
                <option value="usr_sarah">Sarah Jenkins (London Broker)</option>
                <option value="usr_marcus">Marcus Vance (London Broker)</option>
              </optgroup>
              <optgroup label="Executive Admin">
                <option value="usr_admin">Eleanor Kensington (Admin)</option>
              </optgroup>
            </select>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (confirm('Reset all viewing states and appointments to fresh seed defaults?')) {
                resetStateToDefault();
              }
            }}
            title="Reset to initial seed data"
            className="p-2 text-stone-400 hover:text-stone-200 hover:bg-stone-800/80 rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-1 overflow-x-auto border-t border-stone-800/80 text-xs font-medium">
        <button
          onClick={() => setActiveTab('feed')}
          className={`py-2.5 px-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'feed'
              ? 'border-brass text-brass bg-stone-900/50'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Home className="w-4 h-4" /> Property Feed
        </button>

        <button
          onClick={() => setActiveTab('my_viewings')}
          className={`py-2.5 px-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'my_viewings'
              ? 'border-brass text-brass bg-stone-900/50'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Calendar className="w-4 h-4" /> My Viewings
          {buyerUpcomingCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-brass text-ink font-bold">
              {buyerUpcomingCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('favorites')}
          className={`py-2.5 px-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'favorites'
              ? 'border-brass text-brass bg-stone-900/50'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <Heart className="w-4 h-4" /> Saved Residences
          {favorites.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-stone-800 text-stone-300 font-bold">
              {favorites.length}
            </span>
          )}
        </button>

        <div className="h-6 w-px bg-stone-800 self-center mx-2" />

        <button
          onClick={() => setActiveTab('agent_queue')}
          className={`py-2.5 px-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'agent_queue'
              ? 'border-brass text-brass bg-stone-900/50'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <LayoutGrid className="w-4 h-4" /> Agent Queue (4 Columns)
          {agentQueueCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-600 text-white font-bold animate-pulse">
              {agentQueueCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('admin_dashboard')}
          className={`py-2.5 px-4 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'admin_dashboard'
              ? 'border-brass text-brass bg-stone-900/50'
              : 'border-transparent text-stone-400 hover:text-stone-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" /> Agency Governance
        </button>
      </div>
    </header>
  );
};
