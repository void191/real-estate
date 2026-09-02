'use client';

import React, { useState } from 'react';
import { CheckCircle, X, AlertCircle } from 'lucide-react';

interface CompleteViewingModalProps {
  viewingId: string;
  buyerName: string;
  listingTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedViewing: any) => void;
}

export function CompleteViewingModal({
  viewingId,
  buyerName,
  listingTitle,
  isOpen,
  onClose,
  onSuccess,
}: CompleteViewingModalProps) {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/agent/viewings/${viewingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'completed',
          notes: notes.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to complete viewing');
      }

      const data = await res.json();
      onSuccess(data.viewing);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error completing viewing');
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
            <span className="text-[11px] uppercase tracking-widest text-live font-semibold">
              Viewing Conclusion
            </span>
            <h3 className="font-headline text-2xl font-medium text-ink mt-0.5">
              Conclude Viewing
            </h3>
            <p className="text-xs text-muted mt-1">
              Mark viewing with {buyerName} for {listingTitle} as completed.
            </p>
          </div>

          {error && (
            <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-ink mb-1.5">
              Viewing & Feedback Notes (Optional)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Client requested floor plans and was keen on second viewing with architect..."
              className="w-full text-xs bg-stone/20 border border-stone-dim rounded-lg p-3 text-ink focus:outline-none focus:border-brass resize-none"
            />
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
              className="flex-1 py-2 text-xs uppercase tracking-wider font-semibold rounded-lg bg-live text-white hover:bg-live/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Finalizing...' : 'Complete Viewing'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
