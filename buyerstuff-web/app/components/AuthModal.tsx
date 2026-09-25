'use client';

import { useState } from 'react';
import { supabase } from '../supabase';
import { Mail, Lock, X, LogIn, UserPlus, User, Phone, Globe, MapPin } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  role: 'buyer' | 'seller';
  onClose: () => void;
  onAuthSuccess: () => void;
}

export default function AuthModal({ isOpen, role, onClose, onAuthSuccess }: AuthModalProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const fullCountryList = [
    'India',
    'United States',
    'United Kingdom',
    'Canada',
    'Australia',
    'United Arab Emirates',
    'Germany',
    'France',
    'Singapore',
    'Japan',
    'Other',
  ];

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password: password.trim(),
          options: {
            data: {
              full_name: fullName.trim(),
              mobile_number: mobileNumber.trim(),
              country,
              state: state.trim(),
              user_role: role,
            },
          },
        });
        if (error) throw error;
        alert(`${role === 'seller' ? 'Seller' : 'Buyer'} profile created successfully!`);
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: password.trim(),
        });
        if (error) throw error;
        alert('Signed in successfully!');
      }

      onAuthSuccess();
      onClose();
    } catch (err: any) {
      alert(`Authentication Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 relative animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 p-1.5 rounded-full hover:bg-gray-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          {isSignUp ? <UserPlus className="w-5 h-5 text-blue-600" /> : <LogIn className="w-5 h-5 text-blue-600" />}
          {role === 'seller'
            ? isSignUp ? 'Create Seller Profile' : 'Seller Login'
            : isSignUp ? 'Create Buyer Account' : 'Buyer Login'}
        </h3>
        <p className="text-xs text-gray-500 mb-5">
          {role === 'seller'
            ? 'Sign in or register to publish and manage your product listings.'
            : 'Sign in or register to view seller contact details and purchase items.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {isSignUp && (
            <>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full pl-9 pr-3 py-2 border rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Mobile Number</label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full pl-9 pr-3 py-2 border rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Country</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 absolute left-2.5 top-3 text-gray-400 pointer-events-none" />
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full pl-8 pr-2 py-2 border rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 text-xs bg-white"
                    >
                      {fullCountryList.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">State / Region</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 absolute left-2.5 top-3 text-gray-400" />
                    <input
                      type="text"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      placeholder="e.g. California / UP"
                      className="w-full pl-8 pr-2 py-2 border rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 text-xs"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@example.com"
                className="w-full pl-9 pr-3 py-2 border rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2 border rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition shadow-md text-xs mt-2"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t text-center text-xs text-gray-600">
          {isSignUp ? 'Already have an account?' : `Don't have a ${role} account?`}{' '}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-600 font-bold underline hover:text-blue-700 ml-1"
          >
            {isSignUp ? 'Log In' : 'Register Now'}
          </button>
        </div>
      </div>
    </div>
  );
}