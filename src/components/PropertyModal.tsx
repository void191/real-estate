import React, { useState } from 'react';
import { Listing } from '../types';
import { useAppStore } from '../store/useStore';
import {
  X,
  MapPin,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Clock,
  Send,
  Phone,
  Mail,
  Heart,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

interface PropertyModalProps {
  listing: Listing | null;
  onClose: () => void;
  onViewingRequested: () => void;
}

export const PropertyModal: React.FC<PropertyModalProps> = ({
  listing,
  onClose,
  onViewingRequested,
}) => {
  const { users, favorites, toggleFavorite, requestViewing } = useAppStore();

  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState('14:00');
  const [inquiryNotes, setInquiryNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  if (!listing) return null;

  const agent = users.find((u) => u.id === listing.agent_id);
  const isFav = favorites.includes(listing.id);

  const formatPrice = (price: number, currency: 'USD' | 'GBP') => {
    return currency === 'USD'
      ? `$${price.toLocaleString()}`
      : `£${price.toLocaleString()}`;
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const fullDateTime = new Date(`${selectedDate}T${selectedTime}:00`).toISOString();
    requestViewing(listing.id, fullDateTime, inquiryNotes.trim() || undefined);

    setIsSubmitting(false);
    setBookingSuccess(true);

    setTimeout(() => {
      onClose();
      onViewingRequested();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-paper rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-stone-300 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-ink/70 hover:bg-ink text-white transition shadow-lg"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Photo Gallery Header */}
        <div className="relative w-full h-80 sm:h-96 bg-stone-900 overflow-hidden">
          <img
            src={listing.photos[activePhotoIndex]}
            alt={listing.title}
            className="w-full h-full object-cover transition duration-300"
          />

          {/* Photo navigation arrows */}
          {listing.photos.length > 1 && (
            <>
              <button
                onClick={() =>
                  setActivePhotoIndex((prev) =>
                    prev === 0 ? listing.photos.length - 1 : prev - 1
                  )
                }
                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-ink/60 hover:bg-ink text-white transition"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() =>
                  setActivePhotoIndex((prev) =>
                    prev === listing.photos.length - 1 ? 0 : prev + 1
                  )
                }
                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-ink/60 hover:bg-ink text-white transition"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}

          {/* Top badges */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono font-medium bg-ink/80 backdrop-blur text-stone-200 border border-stone/30">
                {listing.city} Portfolio
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-mono font-semibold bg-brass text-ink">
                {formatPrice(listing.price, listing.currency)}
              </span>
            </div>

            <button
              onClick={() => toggleFavorite(listing.id)}
              className="p-2.5 rounded-full bg-ink/80 backdrop-blur text-white hover:text-brass transition shadow"
            >
              <Heart
                className={`w-5 h-5 ${isFav ? 'fill-brass text-brass' : 'text-white'}`}
              />
            </button>
          </div>
        </div>

        {/* Thumbnail Strip */}
        {listing.photos.length > 1 && (
          <div className="flex gap-2 p-3 bg-stone-100 border-b border-stone-200 overflow-x-auto">
            {listing.photos.map((photo, idx) => (
              <button
                key={idx}
                onClick={() => setActivePhotoIndex(idx)}
                className={`relative w-20 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 transition ${
                  activePhotoIndex === idx ? 'border-brass ring-2 ring-brass/30' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={photo} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {/* Details & Booking Grid */}
        <div className="p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Architectural Particulars */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-muted mb-1">
                <MapPin className="w-3.5 h-3.5 text-brass" />
                {listing.address}
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ink leading-tight">
                {listing.title}
              </h2>
            </div>

            {/* Key Architectural Specs */}
            <div className="grid grid-cols-3 gap-4 py-4 border-y border-stone-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-brass">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-muted font-mono uppercase">Bedrooms</div>
                  <div className="font-semibold text-ink text-base">{listing.bedrooms} Beds</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-brass">
                  <Bath className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-muted font-mono uppercase">Bathrooms</div>
                  <div className="font-semibold text-ink text-base">{listing.bathrooms} Baths</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-brass">
                  <Maximize2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs text-muted font-mono uppercase">Interior Space</div>
                  <div className="font-semibold text-ink text-base font-mono">{listing.area_sqm} m²</div>
                </div>
              </div>
            </div>

            {/* Architectural Overview */}
            <div>
              <h3 className="font-serif text-lg font-semibold text-ink mb-2">
                Architectural Narrative
              </h3>
              <p className="text-stone-700 leading-relaxed text-sm whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Assigned Broker Card */}
            {agent && (
              <div className="p-4 rounded-xl bg-stone-100 border border-stone-200 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <img
                    src={agent.avatar_url || ''}
                    alt={agent.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-brass"
                  />
                  <div>
                    <div className="text-xs font-mono text-muted uppercase">Assigned Broker</div>
                    <div className="font-serif font-bold text-ink text-base">{agent.name}</div>
                    <div className="text-xs text-stone-600 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-live" /> Licensed Luxury Specialist
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  {agent.phone && (
                    <a
                      href={`tel:${agent.phone}`}
                      className="p-2.5 rounded-lg bg-paper hover:bg-stone-200 text-ink border border-stone-300 transition"
                      title="Call broker"
                    >
                      <Phone className="w-4 h-4 text-brass" />
                    </a>
                  )}
                  {agent.email && (
                    <a
                      href={`mailto:${agent.email}`}
                      className="p-2.5 rounded-lg bg-paper hover:bg-stone-200 text-ink border border-stone-300 transition"
                      title="Email broker"
                    >
                      <Mail className="w-4 h-4 text-brass" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Col: Private Viewing Request Card */}
          <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-stone-200">
                <Calendar className="w-5 h-5 text-brass" />
                <h3 className="font-serif font-bold text-lg text-ink">Schedule Viewing</h3>
              </div>

              {bookingSuccess ? (
                <div className="py-8 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-live mx-auto flex items-center justify-center font-bold text-xl">
                    ✓
                  </div>
                  <div className="font-serif font-semibold text-ink text-lg">
                    Appointment Requested
                  </div>
                  <p className="text-xs text-muted">
                    Your request has been routed to {agent?.name || 'the estate broker'}. Opening My Viewings...
                  </p>
                </div>
              ) : (
                <form onSubmit={handleBookingSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono text-muted mb-1 uppercase">
                      Select Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      required
                      className="w-full text-xs font-mono p-2.5 rounded-lg bg-paper border border-stone-300 focus:outline-none focus:border-brass"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted mb-1 uppercase">
                      Preferred Time
                    </label>
                    <div className="relative">
                      <Clock className="w-4 h-4 absolute left-3 top-3 text-muted" />
                      <select
                        value={selectedTime}
                        onChange={(e) => setSelectedTime(e.target.value)}
                        className="w-full text-xs font-mono pl-9 pr-3 py-2.5 rounded-lg bg-paper border border-stone-300 focus:outline-none focus:border-brass cursor-pointer"
                      >
                        <option value="10:00">10:00 AM (Morning)</option>
                        <option value="11:30">11:30 AM (Late Morning)</option>
                        <option value="14:00">02:00 PM (Afternoon)</option>
                        <option value="15:30">03:30 PM (Mid Afternoon)</option>
                        <option value="17:00">05:00 PM (Golden Hour)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-muted mb-1 uppercase">
                      Inquiry Notes (To Agent)
                    </label>
                    <textarea
                      value={inquiryNotes}
                      onChange={(e) => setInquiryNotes(e.target.value)}
                      placeholder="e.g. Please confirm parking access or terrace dimensions..."
                      rows={3}
                      className="w-full text-xs p-2.5 rounded-lg bg-paper border border-stone-300 focus:outline-none focus:border-brass"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-xl bg-brass hover:bg-brass-hover text-ink font-serif font-bold text-sm flex items-center justify-center gap-2 shadow-md transition disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    {isSubmitting ? 'Dispatching...' : 'Request Private Viewing'}
                  </button>
                </form>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-stone-200 text-[11px] text-muted text-center">
              Real-time GPS en route tracking activates once accepted.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
