'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AdminNav } from '@/components/navigation/AdminNav';
import { useAuth } from '@/components/auth/AuthProvider';
import { Plus, Edit2, Trash2, Building2, MapPin, User, Check, X, AlertCircle } from 'lucide-react';

export default function AdminListingsPage() {
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [listings, setListings] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<any | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    latitude: '51.5074',
    longitude: '-0.1278',
    price: '',
    bedrooms: '3',
    bathrooms: '2.5',
    area_sqm: '220',
    description: '',
    photoUrl: '',
    agent_id: '',
    status: 'available',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchListings = async () => {
    try {
      const res = await fetch('/api/admin/listings');
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await fetch('/api/admin/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data.agents || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/agent/login');
      } else if (user.role !== 'admin') {
        router.push('/agent/queue');
      } else {
        fetchListings();
        fetchAgents();
      }
    }
  }, [user, authLoading]);

  const openCreateModal = () => {
    setEditingListing(null);
    setFormData({
      title: '',
      address: '',
      latitude: '51.5074',
      longitude: '-0.1278',
      price: '4500000',
      bedrooms: '3',
      bathrooms: '2.5',
      area_sqm: '220',
      description: 'Exceptional lateral residence crafted with exquisite architectural details and bespoke finishes throughout.',
      photoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
      agent_id: agents.length > 0 ? agents[0].id : '',
      status: 'available',
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (listing: any) => {
    setEditingListing(listing);
    setFormData({
      title: listing.title,
      address: listing.address,
      latitude: String(listing.latitude),
      longitude: String(listing.longitude),
      price: String(listing.price),
      bedrooms: String(listing.bedrooms),
      bathrooms: String(listing.bathrooms),
      area_sqm: String(listing.area_sqm),
      description: listing.description,
      photoUrl: listing.photos && listing.photos.length > 0 ? listing.photos[0] : '',
      agent_id: listing.agent_id,
      status: listing.status,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to remove "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/listings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setListings((prev) => prev.filter((l) => l.id !== id));
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to remove listing');
      }
    } catch {
      alert('Error deleting listing');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      const payload: any = {
        title: formData.title,
        address: formData.address,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        price: parseInt(formData.price, 10),
        bedrooms: parseInt(formData.bedrooms, 10),
        bathrooms: parseFloat(formData.bathrooms),
        area_sqm: parseInt(formData.area_sqm, 10),
        description: formData.description,
        photos: formData.photoUrl ? [formData.photoUrl] : [],
        agent_id: formData.agent_id,
        status: formData.status,
      };

      let res: Response;
      if (editingListing) {
        res = await fetch(`/api/admin/listings/${editingListing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/admin/listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Failed to save listing');
      }

      setIsModalOpen(false);
      fetchListings();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-stone/10 text-ink pb-16">
      <AdminNav />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-stone-dim/80 gap-4">
          <div>
            <span className="text-[11px] uppercase tracking-widest text-brass font-semibold">
              Portfolio Management
            </span>
            <h1 className="font-headline text-2xl sm:text-3xl font-medium text-ink">
              Agency Residences
            </h1>
            <p className="text-xs text-muted mt-0.5">
              Create, modify, reassign, and manage luxury agency listings.
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="text-xs uppercase tracking-wider font-semibold px-4 py-2.5 rounded-lg bg-ink text-white hover:bg-ink/90 transition-colors shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 text-brass" />
            <span>Add New Residence</span>
          </button>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-xl border border-stone shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone/30 border-b border-stone-dim text-muted uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Residence</th>
                  <th className="py-3 px-4">Price</th>
                  <th className="py-3 px-4">Specs</th>
                  <th className="py-3 px-4">Assigned Agent</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-dim/50">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted animate-pulse">
                      Loading residence catalog...
                    </td>
                  </tr>
                ) : listings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-muted">
                      No listings currently found. Click "Add New Residence" to create one.
                    </td>
                  </tr>
                ) : (
                  listings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-stone/10 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {listing.photos && listing.photos[0] && (
                            <img
                              src={listing.photos[0]}
                              alt=""
                              className="w-12 h-10 object-cover rounded bg-stone-dim shrink-0"
                            />
                          )}
                          <div>
                            <div className="font-headline text-sm font-medium text-ink">
                              {listing.title}
                            </div>
                            <div className="text-[11px] text-muted line-clamp-1">
                              {listing.address}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 font-headline text-sm font-semibold text-brass">
                        {formatPrice(listing.price)}
                      </td>

                      <td className="py-3 px-4 font-sans text-ink/80">
                        {listing.bedrooms} bed • {listing.bathrooms} bath • {listing.area_sqm} sqm
                      </td>

                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {listing.agent?.avatar_url && (
                            <img
                              src={listing.agent.avatar_url}
                              alt=""
                              className="w-5 h-5 rounded-full object-cover"
                            />
                          )}
                          <span className="font-medium text-ink">{listing.agent?.name}</span>
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-stone text-ink">
                          {listing.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-[11px] text-muted">
                        <span>{listing._count?.favorites || 0} saved</span> •{' '}
                        <span>{listing._count?.viewings || 0} viewings</span>
                      </td>

                      <td className="py-3 px-4 text-right space-x-1">
                        <button
                          onClick={() => openEditModal(listing)}
                          className="p-1.5 rounded hover:bg-stone text-ink transition-colors"
                          title="Edit / Reassign"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(listing.id, listing.title)}
                          className="p-1.5 rounded hover:bg-red-50 text-red-600 transition-colors"
                          title="Remove Listing"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-xl max-w-xl w-full p-6 shadow-2xl border border-stone relative my-8">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-muted hover:text-ink"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-brass font-semibold">
                  {editingListing ? 'Update Particulars' : 'New Offering'}
                </span>
                <h3 className="font-headline text-2xl font-medium text-ink mt-0.5">
                  {editingListing ? 'Edit Residence' : 'Add Residence to Portfolio'}
                </h3>
              </div>

              {formError && (
                <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-ink mb-1">Residence Title</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-stone/20 border border-stone-dim rounded px-3 py-2 text-ink"
                    placeholder="The Belgravia Crescent Villa"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Full Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full bg-stone/20 border border-stone-dim rounded px-3 py-2 text-ink"
                    placeholder="12 Wilton Crescent, Belgravia, London SW1X"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-ink mb-1">Price (£ GBP)</label>
                    <input
                      type="number"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full bg-stone/20 border border-stone-dim rounded px-3 py-2 text-ink"
                      placeholder="6500000"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-ink mb-1">Assigned Agent (Reassign)</label>
                    <select
                      required
                      value={formData.agent_id}
                      onChange={(e) => setFormData({ ...formData, agent_id: e.target.value })}
                      className="w-full bg-stone/20 border border-stone-dim rounded px-3 py-2 text-ink"
                    >
                      <option value="">Select Responsible Agent</option>
                      {agents.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.email})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-semibold text-ink mb-1">Bedrooms</label>
                    <input
                      type="number"
                      value={formData.bedrooms}
                      onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                      className="w-full bg-stone/20 border border-stone-dim rounded px-3 py-2 text-ink"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-ink mb-1">Bathrooms</label>
                    <input
                      type="number"
                      step="0.5"
                      value={formData.bathrooms}
                      onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                      className="w-full bg-stone/20 border border-stone-dim rounded px-3 py-2 text-ink"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-ink mb-1">Area (sqm)</label>
                    <input
                      type="number"
                      value={formData.area_sqm}
                      onChange={(e) => setFormData({ ...formData, area_sqm: e.target.value })}
                      className="w-full bg-stone/20 border border-stone-dim rounded px-3 py-2 text-ink"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-ink mb-1">Latitude</label>
                    <input
                      type="text"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="w-full bg-stone/20 border border-stone-dim rounded px-3 py-2 text-ink font-mono"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-ink mb-1">Longitude</label>
                    <input
                      type="text"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="w-full bg-stone/20 border border-stone-dim rounded px-3 py-2 text-ink font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Primary Photograph URL</label>
                  <input
                    type="url"
                    value={formData.photoUrl}
                    onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                    className="w-full bg-stone/20 border border-stone-dim rounded px-3 py-2 text-ink"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Architectural Description</label>
                  <textarea
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-stone/20 border border-stone-dim rounded p-2.5 text-ink resize-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-ink mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full bg-stone/20 border border-stone-dim rounded px-3 py-2 text-ink"
                  >
                    <option value="available">Available</option>
                    <option value="under_offer">Under Offer</option>
                    <option value="sold">Sold</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-dim flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2 text-xs uppercase tracking-wider font-semibold rounded border border-stone-dim text-ink hover:bg-stone/30"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2 text-xs uppercase tracking-wider font-semibold rounded bg-ink text-white hover:bg-ink/90 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : editingListing ? 'Save Changes' : 'Create Residence'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
