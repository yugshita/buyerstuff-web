'use client';

import { X, ShieldCheck, FileText, RefreshCw } from 'lucide-react';

interface PolicyModalProps {
  type: 'privacy' | 'terms' | 'refund' | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function PolicyModal({ type, isOpen, onClose }: PolicyModalProps) {
  if (!isOpen || !type) return null;

  const content = {
    privacy: {
      title: 'Privacy Policy',
      icon: ShieldCheck,
      text: (
        <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
          <p>At BuyerStuff.com, we prioritize user privacy. This policy outlines how we handle user information.</p>
          <h4 className="font-bold text-gray-800">1. Information Collection</h4>
          <p>We collect essential details provided during registration, including Full Name, Email, Mobile Number, Country, and State.</p>
          <h4 className="font-bold text-gray-800">2. Usage of Data</h4>
          <p>Seller contact details are shared only with authenticated Buyers to facilitate direct peer-to-peer transactions.</p>
          <h4 className="font-bold text-gray-800">3. Data Security</h4>
          <p>We use encrypted database storage powered by Supabase to protect your profile details and prevent unauthorized access.</p>
        </div>
      ),
    },
    terms: {
      title: 'Terms & Conditions',
      icon: FileText,
      text: (
        <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
          <p>By using BuyerStuff.com, you agree to adhere to the following marketplace rules:</p>
          <h4 className="font-bold text-gray-800">1. Peer-to-Peer Transactions</h4>
          <p>BuyerStuff.com acts as an listing directory. All negotiations, payments, and handovers occur directly between buyer and seller.</p>
          <h4 className="font-bold text-gray-800">2. Prohibited Content</h4>
          <p>Users are strictly prohibited from listing illegal items, fraudulent listings, or misleading product descriptions.</p>
          <h4 className="font-bold text-gray-800">3. Account Suspension</h4>
          <p>We reserve the right to remove any listing or terminate accounts that violate community safety guidelines.</p>
        </div>
      ),
    },
    refund: {
      title: 'Cancellation & Refund Policy',
      icon: RefreshCw,
      text: (
        <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
          <p>Guidelines regarding product handovers and deal cancellations:</p>
          <h4 className="font-bold text-gray-800">1. Direct Deal Verification</h4>
          <p>Because deals are peer-to-peer, buyers are urged to inspect items in person before transferring money to sellers.</p>
          <h4 className="font-bold text-gray-800">2. Platform Liability</h4>
          <p>BuyerStuff.com does not collect payment commissions or hold money in escrow; refunds must be settled directly with the seller.</p>
        </div>
      ),
    },
  }[type];

  const IconComponent = content.icon;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <IconComponent className="w-5 h-5 text-blue-600" />
          {content.title}
        </h3>

        <div className="max-h-[60vh] overflow-y-auto pr-2">{content.text}</div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition"
        >
          I Understand
        </button>
      </div>
    </div>
  );
}