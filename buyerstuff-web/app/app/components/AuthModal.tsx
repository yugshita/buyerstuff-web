'use client';

import { useState } from 'react';
import { supabase } from '../supabase';
import { Phone, KeyRound, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userPhone: string) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Step A: Send OTP
  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      phone: phone.trim(),
    });

    setLoading(false);
    if (error) {
      alert(`Error sending OTP: ${error.message}`);
    } else {
      setStep('otp');
      alert(`OTP sent to ${phone}`);
    }
  }

  // Step B: Verify OTP
  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    const { data, error } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: otp.trim(),
      type: 'sms',
    });

    setLoading(false);
    if (error) {
      alert(`Invalid OTP: ${error.message}`);
    } else {
      alert('Login successful!');
      onSuccess(phone);
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-gray-800 mb-2">
          {step === 'phone' ? 'Mobile Verification' : 'Enter Verification Code'}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {step === 'phone'
            ? 'Enter your mobile number to receive a one-time OTP password.'
            : `We sent a 6-digit code to ${phone}`}
        </p>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit OTP</label>
              <div className="relative">
                <KeyRound className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 letter-spacing-2"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { supabase } from '../supabase';
import { Phone, KeyRound, X } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: () => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [phone, setPhone] = useState('+91');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({ phone: phone.trim() });
    setLoading(false);

    if (error) {
      alert(`Error: ${error.message}`);
    } else {
      setStep('otp');
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.verifyOtp({
      phone: phone.trim(),
      token: otp.trim(),
      type: 'sms',
    });
    setLoading(false);

    if (error) {
      alert(`Invalid OTP: ${error.message}`);
    } else {
      alert('Login successful!');
      onAuthSuccess();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-gray-800 mb-1">
          {step === 'phone' ? 'Buyer & Seller Login' : 'Enter OTP Verification Code'}
        </h3>
        <p className="text-sm text-gray-500 mb-6">
          {step === 'phone'
            ? 'Sign in using your mobile number to manage your listings and purchases.'
            : `We sent a 6-digit verification code to ${phone}`}
        </p>

        {step === 'phone' ? (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <div className="relative">
                <Phone className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition"
            >
              {loading ? 'Sending Code...' : 'Send OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">6-Digit Code</label>
              <div className="relative">
                <KeyRound className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="123456"
                  className="w-full pl-10 pr-4 py-2.5 border rounded-lg text-gray-800 focus:ring-2 focus:ring-blue-500 letter-spacing-2"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
