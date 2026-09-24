'use client';

import { X, MapPin, Phone, Mail, FileText, Building2 } from 'lucide-react';

interface ContactModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ContactModal({ isOpen, onClose }: ContactModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-2xl font-bold text-gray-800 mb-1 flex items-center">
          <Building2 className="w-6 h-6 mr-2 text-blue-600" />
          Contact Us
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          Have questions or need support? Reach out to us using the details below.
        </p>

        <div className="space-y-4 text-gray-700 text-sm">
          {/* Company Name */}
          <div className="flex items-start bg-gray-50 p-3 rounded-lg border">
            <Building2 className="w-5 h-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Company Name</p>
              <p>Buyerstuff</p>
            </div>
          </div>

          {/* Address */}
          <div className="flex items-start bg-gray-50 p-3 rounded-lg border">
            <MapPin className="w-5 h-5 text-blue-600 mr-3 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Registered Office Address</p>
              <p>
                House No 129, Street No 3, Avantika Ext Rd, Police Line, Pratap Nagar, Ghaziabad, Uttar Pradesh 201002
              </p>
            </div>
          </div>

          {/* Phone */}
          <div className="flex items-center bg-gray-50 p-3 rounded-lg border">
            <Phone className="w-5 h-5 text-blue-600 mr-3 shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Phone Support</p>
              <a href="tel:+918527788325" className="text-blue-600 hover:underline font-medium">
                +91 8527788325
              </a>
            </div>
          </div>

          {/* Email */}
          <div className="flex items-center bg-gray-50 p-3 rounded-lg border">
            <Mail className="w-5 h-5 text-blue-600 mr-3 shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">Support Email</p>
              <a href="mailto:support@buyerstuff.com" className="text-blue-600 hover:underline font-medium">
                support@buyerstuff.com
              </a>
            </div>
          </div>

          {/* GSTIN */}
          <div className="flex items-center bg-gray-50 p-3 rounded-lg border">
            <FileText className="w-5 h-5 text-blue-600 mr-3 shrink-0" />
            <div>
              <p className="font-semibold text-gray-900">GSTIN</p>
              <p className="font-mono font-medium text-gray-800">07CVYPK5714N1ZO</p>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition"
        >
          Close
        </button>
      </div>
    </div>
  );
}