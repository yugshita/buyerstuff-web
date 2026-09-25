'use client';

import { X, Phone, MapPin, Tag, User, Calendar, FileText } from 'lucide-react';

interface ProductDetailsModalProps {
  item: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailsModal({ item, isOpen, onClose }: ProductDetailsModalProps) {
  if (!isOpen || !item) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 relative my-8 animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition z-10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="aspect-square w-full bg-gray-100 rounded-xl overflow-hidden border">
            <img
              src={item.images?.[0] || 'https://via.placeholder.com/400'}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details Column */}
          <div className="flex flex-col justify-between space-y-4">
            <div>
              <span className="inline-block bg-blue-100 text-blue-800 text-xs font-bold px-2.5 py-1 rounded-full mb-2">
                Available Item
              </span>
              <h2 className="text-2xl font-bold text-gray-900">{item.title}</h2>
              <p className="text-3xl font-black text-blue-600 mt-1">₹{item.price?.toLocaleString('en-IN')}</p>
            </div>

            {/* Description */}
            {item.description && (
              <div className="bg-gray-50 p-3 rounded-xl border text-sm text-gray-600">
                <p className="font-semibold text-gray-800 flex items-center gap-1 mb-1">
                  <FileText className="w-4 h-4 text-blue-600" /> Description
                </p>
                <p>{item.description}</p>
              </div>
            )}

            {/* Product Specs */}
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-gray-400 shrink-0" />
                <span><strong>Product Age:</strong> {item.product_age}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400 shrink-0" />
                <span><strong>Seller Name:</strong> {item.seller_name || 'Verified Seller'}</span>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
                <span>
                  <strong>Location:</strong> {item.full_address || `${item.local_area}, ${item.city} (${item.pincode})`}
                </span>
              </div>
            </div>

            {/* Call Seller Button */}
            <a
              href={`tel:${item.seller_phone}`}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center shadow-md text-base"
            >
              <Phone className="w-5 h-5 mr-2" />
              Call Seller ({item.seller_phone})
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}