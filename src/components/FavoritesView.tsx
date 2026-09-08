import React from 'react';
import { Listing } from '../types';
import { useAppStore } from '../store/useStore';
import { MapPin, Bed, Bath, Maximize2, Heart, Building } from 'lucide-react';

interface FavoritesViewProps {
  onSelectListing: (listing: Listing) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ onSelectListing }) => {
  const { listings, favorites, toggleFavorite } = useAppStore();

  const favoriteListings = listings.filter((l) => favorites.includes(l.id));

  const formatPrice = (price: number, currency: 'USD' | 'GBP') => {
    return currency === 'USD'
      ? `$${price.toLocaleString()}`
      : `£${price.toLocaleString()}`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 pb-4 border-b border-stone-200">
        <h1 className="font-serif text-3xl font-bold text-ink">Saved Residences</h1>
        <p className="text-xs font-mono text-muted mt-1">
          Your curated luxury real estate shortlist ({favoriteListings.length})
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {favoriteListings.map((listing) => (
          <div
            key={listing.id}
            onClick={() => onSelectListing(listing)}
            className="group bg-paper rounded-2xl overflow-hidden border border-stone-200 shadow-sm hover:shadow-xl hover:border-brass/50 transition duration-300 cursor-pointer flex flex-col justify-between"
          >
            <div className="relative h-64 overflow-hidden bg-stone-900">
              <img
                src={listing.photos[0]}
                alt={listing.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-ink/80 backdrop-blur text-stone-200 border border-stone/30">
                  {listing.city}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavorite(listing.id);
                }}
                className="absolute top-3 right-3 p-2 rounded-full bg-ink/70 backdrop-blur text-brass hover:scale-110 transition shadow"
              >
                <Heart className="w-4 h-4 fill-brass text-brass" />
              </button>

              <div className="absolute bottom-3 left-3">
                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-brass text-ink shadow">
                  {formatPrice(listing.price, listing.currency)}
                </span>
              </div>
            </div>

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
            </div>
          </div>
        ))}
      </div>

      {favoriteListings.length === 0 && (
        <div className="py-20 text-center space-y-3 bg-stone-50 rounded-2xl border border-stone-200">
          <Building className="w-10 h-10 text-muted mx-auto" />
          <div className="font-serif text-lg font-semibold text-ink">No Saved Residences Yet</div>
          <p className="text-xs text-muted">
            Click the heart icon on any property in the feed to add it to your shortlist.
          </p>
        </div>
      )}
    </div>
  );
};
