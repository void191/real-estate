'use client';

import React, { useState } from 'react';
import { Calendar, Clock, X, AlertCircle } from 'lucide-react';

interface ProposeTimeModalProps {
  viewingId: string;
  buyerName: string;
  listingTitle: string;
  currentRequestedTime: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedViewing: any) => void;
}

export function ProposeTimeModal({
  viewingId,
  buyerName,
  listingTitle,
  currentRequestedTime,
  isOpen,
  onClose,
  onSuccess,
}: ProposeTimeModalProps) {
  const currentDate = new Date(currentRequestedTime);
  const defaultDate = !isNaN(currentDate.getTime())
    ? currentDate.toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('15:00');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const proposedDateTime = new Date(`${date}T${time}:00`);
      const res = await fetch(`/api/agent/viewings/${viewingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposed_time: proposedDateTime.toISOString(),
          notes: note || 'Agent proposed an alternative time.',
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to propose new time');
      }

      const data = await res.json();
      onSuccess(data.viewing);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error updating proposed time');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-stone relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-muted hover:text-ink transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-brass font-semibold">
              Reschedule Appointment
            </span>
            <h3 className="font-headline text-2xl font-medium text-ink mt-0.5">
              Propose New Time
            </h3>
            <p className="text-xs text-muted mt-1">
              For {buyerName} • {listingTitle}
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
              <label className="block text-xs font-semibold text-ink mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-brass" />
                Proposed Date
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full text-sm bg-stone/20 border border-stone-dim rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-brass"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink mb-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-brass" />
                Proposed Time
              </label>
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full text-sm bg-stone/20 border border-stone-dim rounded-lg px-3 py-2 text-ink focus:outline-none focus:border-brass"
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
              <label className="block text-xs font-semibold text-ink mb-1">
                Note to Buyer (Optional)
              </label>
              <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Previous vendor appointment running late, proposing 3:00 PM instead."
                className="w-full text-xs bg-stone/20 border border-stone-dim rounded-lg p-2.5 text-ink focus:outline-none focus:border-brass resize-none"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-stone-dim flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 text-xs uppercase tracking-wider font-semibold rounded-lg border border-stone-dim text-ink hover:bg-stone/30"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2 text-xs uppercase tracking-wider font-semibold rounded-lg bg-ink text-white hover:bg-ink/90 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Submitting...' : 'Send Proposal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
