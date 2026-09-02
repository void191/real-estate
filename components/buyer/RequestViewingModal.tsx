'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, X, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';

interface RequestViewingModalProps {
  listingId: string;
  listingTitle: string;
  agentName: string;
  isOpen: boolean;
  onClose: () => void;
}

export function RequestViewingModal({
  listingId,
  listingTitle,
  agentName,
  isOpen,
  onClose,
}: RequestViewingModalProps) {
  const { user } = useAuth();
  const router = useRouter();

  // Tomorrow by default
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('14:00');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const requestedDateTime = new Date(`${date}T${time}:00`);

      const res = await fetch('/api/viewings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listing_id: listingId,
          requested_time: requestedDateTime.toISOString(),
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to submit viewing request');
      }

      setSuccess(true);
      setTimeout(() => {
        onClose();
        router.push('/viewings');
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'An error occurred while requesting viewing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-stone relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-muted hover:text-ink transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {success ? (
          <div className="py-8 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-live mx-auto" />
            <h3 className="font-headline text-2xl font-medium text-ink">Request Submitted</h3>
            <p className="text-sm text-muted">
              Your viewing request for <span className="font-semibold text-ink">{listingTitle}</span> has been transmitted to {agentName}.
            </p>
            <p className="text-xs text-brass font-medium">Redirecting to My Viewings...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-brass font-semibold">
                Private Appointment
              </span>
              <h3 className="font-headline text-2xl font-medium text-ink mt-0.5">
                Request Viewing
              </h3>
              <p className="text-xs text-muted mt-1">
                {listingTitle} • Coordinated by {agentName}
              </p>
            </div>

            {error && (
              <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-brass" />
                  Proposed Date
                </label>
                <input
                  type="date"
                  required
                  min={new Date().toISOString().split('T')[0]}
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-sm bg-stone/20 border border-stone-dim rounded-lg px-3 py-2.5 text-ink focus:outline-none focus:border-brass"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-brass" />
                  Proposed Time
                </label>
                <select
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full text-sm bg-stone/20 border border-stone-dim rounded-lg px-3 py-2.5 text-ink focus:outline-none focus:border-brass"
                >
                  <option value="09:00">09:00 AM</option>
                  <option value="10:00">10:00 AM</option>
                  <option value="11:00">11:00 AM</option>
                  <option value="12:00">12:00 PM</option>
                  <option value="13:00">01:00 PM</option>
                  <option value="14:00">02:00 PM</option>
                  <option value="15:00">03:00 PM</option>
                  <option value="16:00">04:00 PM</option>
                  <option value="17:00">05:00 PM</option>
                  <option value="18:00">06:00 PM</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-ink mb-1.5">
                  Message / Special Requests for Agent (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Inquiring about private parking and garden access..."
                  className="w-full text-xs bg-stone/20 border border-stone-dim rounded-lg p-2.5 text-ink focus:outline-none focus:border-brass resize-none"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-stone-dim flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-lg border border-stone-dim text-ink hover:bg-stone/30 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 text-xs uppercase tracking-wider font-semibold rounded-lg bg-ink text-white hover:bg-ink/90 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Transmitting...' : 'Confirm Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
