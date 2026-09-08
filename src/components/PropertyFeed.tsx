import React, { useState, useMemo } from 'react';
import { Listing } from '../types';
import { useAppStore } from '../store/useStore';
import {
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Heart,
  Search,
  Filter,
  Building,
} from 'lucide-react';

interface PropertyFeedProps {
  onSelectListing: (listing: Listing) => void;
}

export const PropertyFeed: React.FC<PropertyFeedProps> = ({ onSelectListing }) => {
  const { listings, users, favorites, toggleFavorite } = useAppStore();

  const [selectedCity, setSelectedCity] = useState<'All' | 'Erbil' | 'London'>('All');
  const [minBedrooms, setMinBedrooms] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      if (selectedCity !== 'All' && l.city !== selectedCity) return false;
      if (minBedrooms > 0 && l.bedrooms < minBedrooms) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          l.title.toLowerCase().includes(q) ||
          l.address.toLowerCase().includes(q) ||
          l.description.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [listings, selectedCity, minBedrooms, searchQuery]);

  const formatPrice = (price: number, currency: 'USD' | 'GBP') => {
    return currency === 'USD'
      ? `$${price.toLocaleString()}`
      : `£${price.toLocaleString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Filter Bar */}
      <div className="mb-8 p-4 rounded-2xl bg-paper border border-stone-300 shadow-sm flex flex-wrap items-center justify-between gap-4">
        {/* City Filter Pills */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-muted uppercase mr-1">Region:</span>
          {(['All', 'Erbil', 'London'] as const).map((city) => (
            <button
              key={city}
              onClick={() => setSelectedCity(city)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition ${
                selectedCity === city
                  ? 'bg-ink text-stone-100 shadow'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {city === 'All' ? 'Worldwide' : city}
            </button>
          ))}
        </div>

        {/* Search Input & Bedroom Filter */}
        <div className="flex items-center space-x-3 flex-grow sm:flex-grow-0">
          <div className="relative flex-grow sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address, villa, penthouse..."
              className="w-full text-xs pl-9 pr-3 py-2 rounded-lg bg-stone-50 border border-stone-200 focus:outline-none focus:border-brass"
            />
          </div>

          <select
            value={minBedrooms}
            onChange={(e) => setMinBedrooms(Number(e.target.value))}
            className="text-xs py-2 px-3 rounded-lg bg-stone-50 border border-stone-200 focus:outline-none focus:border-brass cursor-pointer"
          >
            <option value={0}>Any Beds</option>
            <option value={3}>3+ Bedrooms</option>
            <option value={4}>4+ Bedrooms</option>
            <option value={5}>5+ Bedrooms</option>
          </select>
        </div>
      </div>

      {/* Property Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredListings.map((listing) => {
          const agent = users.find((u) => u.id === listing.agent_id);
          const isFav = favorites.includes(listing.id);

          return (
            <div
              key={listing.id}
              onClick={() => onSelectListing(listing)}
              className="group bg-paper rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl hover:border-brass/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
            >
              {/* Image & Overlay Badges */}
              <div className="relative h-64 overflow-hidden bg-stone-900">
                <img
                  src={listing.photos[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                <div className="absolute top-3 left-3 flex gap-2">
                  <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-ink/80 backdrop-blur text-stone-200 border border-stone/30">
                    {listing.city}
                  </span>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(listing.id);
                  }}
                  className="absolute top-3 right-3 p-2 rounded-full bg-ink/70 backdrop-blur text-white hover:text-brass transition"
                >
                  <Heart
                    className={`w-4 h-4 ${isFav ? 'fill-brass text-brass' : 'text-white'}`}
                  />
                </button>

                <div className="absolute bottom-3 left-3">
                  <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-brass text-ink shadow">
                    {formatPrice(listing.price, listing.currency)}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex flex-col justify-between flex-grow">
                <div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-muted mb-1 truncate">
                    <MapPin className="w-3 h-3 text-brass flex-shrink-0" />
                    <span className="truncate">{listing.address}</span>
                  </div>

                  <h3 className="font-serif font-bold text-lg text-ink line-clamp-1 group-hover:text-brass transition">
                    {listing.title}
                  </h3>

                  <p className="mt-2 text-xs text-stone-600 line-clamp-2 leading-relaxed">
                    {listing.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-muted">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5 text-brass" /> {listing.bedrooms} Beds
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="w-3.5 h-3.5 text-brass" /> {listing.bathrooms} Baths
                    </span>
                    <span className="flex items-center gap-1 font-mono">
                      <Maximize2 className="w-3.5 h-3.5 text-brass" /> {listing.area_sqm} m²
                    </span>
                  </div>

                  {agent && (
                    <div className="flex items-center space-x-1.5" title={`Broker: ${agent.name}`}>
                      <img
                        src={agent.avatar_url || ''}
                        alt={agent.name}
                        className="w-5 h-5 rounded-full object-cover border border-brass"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredListings.length === 0 && (
        <div className="py-20 text-center space-y-3 bg-stone-100 rounded-2xl border border-stone-200">
          <Building className="w-10 h-10 text-muted mx-auto" />
          <div className="font-serif text-lg font-semibold text-ink">No residences match your criteria</div>
          <p className="text-xs text-muted">Try relaxing your bedroom count or searching a different term.</p>
        </div>
      )}
    </div>
  );
};
