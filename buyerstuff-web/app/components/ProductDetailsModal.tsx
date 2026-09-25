'use client';

import { useState } from 'react';
import { supabase } from '../supabase';
import { X, Phone, MapPin, Tag, User, FileText, CheckCircle2, Trash2, MessageCircle, ShieldAlert } from 'lucide-react';

interface ProductDetailsModalProps {
  item: any | null;
  isOpen: boolean;
  currentUser: any | null;
  onClose: () => void;
  onRefresh: () => void;
}

export default function ProductDetailsModal({
  item,
  isOpen,
  currentUser,
  onClose,
  onRefresh,
}: ProductDetailsModalProps) {
  const [actionLoading, setActionLoading] = useState(false);

  if (!isOpen || !item) return null;

  const isOwner = currentUser && currentUser.id === item.user_id;
  const isSold = item.status === 'sold';

  async function handleMarkAsSold() {
    if (!confirm('Are you sure you want to mark this item as SOLD?')) return;

    try {
      setActionLoading(true);
      const { error } = await supabase
        .from('listings')
        .update({ status: 'sold' })
        .eq('id', item.id);

      if (error) throw error;

      alert('Item marked as SOLD!');
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  }

  async function handleDeleteListing() {
    if (!confirm('Are you sure you want to permanently delete this listing?')) return;

    try {
      setActionLoading(true);

      if (item.images?.[0]) {
        const urlParts = item.images[0].split('/');
        const fileName = urlParts[urlParts.length - 1];
        if (fileName) {
          await supabase.storage.from('Buyerstuff_Product_Images').remove([fileName]);
        }
      }

      const { error } = await supabase.from('listings').delete().eq('id', item.id);
      if (error) throw error;

      alert('Listing deleted successfully!');
      onRefresh();
      onClose();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  }

  const cleanPhone = item.seller_phone ? item.seller_phone.replace(/\D/g, '') : '';
  const formattedWhatsappPhone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  const whatsappMessage = encodeURIComponent(
    `Hi, I saw your listing for "${item.title}" on BuyerStuff.com. Is it still available?`
  );
  const whatsappUrl = `https://wa.me/${formattedWhatsappPhone}?text=${whatsappMessage}`;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 relative my-8 animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="relative aspect-square w-full bg-gray-100 rounded-xl overflow-hidden border">
            <img
              src={item.images?.[0] || 'https://via.placeholder.com/400'}
              alt={item.title}
              className={`w-full h-full object-cover ${isSold ? 'grayscale' : ''}`}
            />
            {isSold && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <span className="bg-red-600 text-white font-black text-xl px-4 py-2 rounded-xl shadow-lg tracking-wider uppercase">
                  SOLD OUT
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col justify-between space-y-4">
            <div>
              <span
                className={`inline-block text-xs font-bold px-2.5 py-1 rounded-full mb-2 ${
                  isSold ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                }`}
              >
                {isSold ? 'Sold' : 'Available Item'}
              </span>
              <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
              <p className="text-3xl font-black text-blue-600 mt-1">
                {item.price ? `₹${item.price.toLocaleString('en-IN')}` : 'Contact for Price'}
              </p>
            </div>

            {item.description && (
              <div className="bg-gray-50 p-3 rounded-xl border text-sm text-gray-600">
                <p className="font-semibold text-gray-800 flex items-center gap-1 mb-1">
                  <FileText className="w-4 h-4 text-blue-600" /> Description
                </p>
                <p>{item.description}</p>
              </div>
            )}

            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400 shrink-0" />
                <span><strong>Product Age:</strong> {item.product_age}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400 shrink-0" />
                <span><strong>Seller:</strong> {item.seller_name || 'Verified Seller'}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Location:</strong> {item.full_address || `${item.local_area}, ${item.city} (${item.country})`}
                </span>
              </div>
            </div>

            {!isSold ? (
              <div className="space-y-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center shadow-md text-base"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat on WhatsApp
                </a>

                <a
                  href={`tel:${item.seller_phone}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center shadow-sm text-sm"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call Seller ({item.seller_phone})
                </a>
              </div>
            ) : (
              <div className="w-full bg-gray-200 text-gray-600 font-bold py-3 rounded-xl text-center cursor-not-allowed">
                Item Sold Out
              </div>
            )}

            {/* Seller Controls (Only Visible to Listing Owner) */}
            {isOwner ? (
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Seller Options (You Own This Listing)</p>
                <div className="grid grid-cols-2 gap-2">
                  {!isSold && (
                    <button
                      onClick={handleMarkAsSold}
                      disabled={actionLoading}
                      className="w-full bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 font-semibold py-2 rounded-xl text-xs transition flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1 text-amber-600" />
                      Mark as Sold
                    </button>
                  )}

                  <button
                    onClick={handleDeleteListing}
                    disabled={actionLoading}
                    className={`w-full bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-semibold py-2 rounded-xl text-xs transition flex items-center justify-center ${
                      isSold ? 'col-span-2' : ''
                    }`}
                  >
                    <Trash2 className="w-4 h-4 mr-1 text-red-600" />
                    Delete Listing
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}