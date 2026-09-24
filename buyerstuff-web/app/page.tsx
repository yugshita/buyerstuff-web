'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import AuthModal from './components/AuthModal';
import ContactModal from './components/ContactModal';
import { ShoppingCart, Upload, Store, User, Search, MapPin, Tag, LogOut, PackageCheck } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller' | 'my-listings'>('buyer');
  const [listings, setListings] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // User State
  const [user, setUser] = useState<any>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Form State for Sellers
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [productAge, setProductAge] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [country] = useState('India');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [localArea, setLocalArea] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    checkUserSession();
    fetchListings();
  }, []);

  async function checkUserSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      setSellerPhone(session.user.phone || '');
      fetchUserListings(session.user.id);
    } else {
      setUser(null);
    }
  }

  async function fetchListings() {
    setLoading(true);
    const { data } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
    if (data) setListings(data);
    setLoading(false);
  }

  async function fetchUserListings(userId: string) {
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    if (data) setMyListings(data);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setUser(null);
    setMyListings([]);
    setActiveTab('buyer');
  }

  async function handleCreateListing(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }

    if (!imageFile) {
      alert('Please select an image for your product.');
      return;
    }

    try {
      setLoading(true);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('Buyerstuff_Product_Images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('Buyerstuff_Product_Images')
        .getPublicUrl(fileName);

      const { error: insertError } = await supabase.from('listings').insert([
        {
          user_id: user.id,
          title,
          description,
          price: parseFloat(price),
          product_age: productAge,
          images: [publicUrlData.publicUrl],
          seller_name: sellerName,
          seller_phone: sellerPhone,
          country,
          state,
          city,
          pincode,
          local_area: localArea,
          full_address: fullAddress,
        },
      ]);

      if (insertError) throw insertError;

      alert('Product listed successfully!');
      setTitle('');
      setDescription('');
      setPrice('');
      setProductAge('');
      setImageFile(null);
      fetchUserListings(user.id);
      setActiveTab('my-listings');
      fetchListings();
    } catch (err: any) {
      alert(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }

  const filteredListings = listings.filter((item) =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-blue-600 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('buyer')}>
            <Store className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-tight">BuyerStuff.com</h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('buyer')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                activeTab === 'buyer' ? 'bg-white text-blue-600 shadow' : 'hover:bg-blue-700'
              }`}
            >
              Browse Products
            </button>

            <button
              onClick={() => {
                if (!user) setIsAuthModalOpen(true);
                else setActiveTab('seller');
              }}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition flex items-center ${
                activeTab === 'seller' ? 'bg-white text-blue-600 shadow' : 'hover:bg-blue-700'
              }`}
            >
              <Upload className="w-4 h-4 mr-1" />
              Sell Item
            </button>

            {user ? (
              <div className="flex items-center space-x-2 border-l border-blue-500 pl-3">
                <button
                  onClick={() => setActiveTab('my-listings')}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium flex items-center ${
                    activeTab === 'my-listings' ? 'bg-white text-blue-600 shadow' : 'bg-blue-700 hover:bg-blue-800'
                  }`}
                >
                  <PackageCheck className="w-4 h-4 mr-1" />
                  My Listings ({myListings.length})
                </button>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1.5 hover:bg-blue-700 rounded-lg text-gray-200"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-4 py-1.5 rounded-lg text-sm shadow transition flex items-center"
              >
                <User className="w-4 h-4 mr-1" />
                Login / Signup
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full">
        {/* BUYER VIEW */}
        {activeTab === 'buyer' && (
          <div>
            <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm">
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search products or city..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <p className="text-gray-500 text-sm">Showing {filteredListings.length} products available</p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading catalog...</div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
                <p className="text-gray-500 text-lg">No active listings match your search.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredListings.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
                    <img src={item.images?.[0] || 'https://via.placeholder.com/300'} alt={item.title} className="w-full h-48 object-cover" />
                    <div className="p-4">
                      <h3 className="font-bold text-gray-800 text-lg truncate">{item.title}</h3>
                      <p className="text-xl font-extrabold text-blue-600 mt-1">₹{item.price}</p>
                      <div className="flex items-center text-xs text-gray-500 mt-2">
                        <Tag className="w-3 h-3 mr-1" />
                        <span>Age: {item.product_age}</span>
                      </div>
                      <div className="flex items-center text-xs text-gray-500 mt-1">
                        <MapPin className="w-3 h-3 mr-1" />
                        <span>{item.local_area}, {item.city} ({item.pincode})</span>
                      </div>
                      <button
                        onClick={() => alert(`Initiating Razorpay checkout for ₹${item.price}`)}
                        className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium flex items-center justify-center"
                      >
                        <ShoppingCart className="w-4 h-4 mr-1" />
                        Buy Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MY LISTINGS VIEW (AUTHENTICATED SELLER PROFILE) */}
        {activeTab === 'my-listings' && user && (
          <div>
            <div className="bg-white p-6 rounded-xl shadow-sm border mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">My Seller Profile</h2>
                <p className="text-sm text-gray-500">Logged in as: {user.phone}</p>
              </div>
              <button
                onClick={() => setActiveTab('seller')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg text-sm flex items-center"
              >
                <Upload className="w-4 h-4 mr-1" /> Add New Listing
              </button>
            </div>

            <h3 className="text-lg font-semibold text-gray-700 mb-4">Your Listed Products ({myListings.length})</h3>

            {myListings.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border">
                <p className="text-gray-500">You haven't listed any items for sale yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl border p-4 shadow-sm flex space-x-4">
                    <img src={item.images?.[0]} alt={item.title} className="w-24 h-24 object-cover rounded-lg" />
                    <div className="flex-grow">
                      <h4 className="font-bold text-gray-800">{item.title}</h4>
                      <p className="text-blue-600 font-bold">₹{item.price}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.local_area}, {item.city}</p>
                      <span className="inline-block mt-2 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                        Active on Marketplace
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SELLER UPLOAD FORM */}
        {activeTab === 'seller' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-md border">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">List Your Item for Sale</h2>
            <form onSubmit={handleCreateListing} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. iPhone 13 128GB Blue"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="35000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Age</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 6 Months old"
                    value={productAge}
                    onChange={(e) => setProductAge(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border rounded-lg text-gray-600"
                />
              </div>

              <hr className="my-6" />
              <h3 className="font-semibold text-gray-700">Seller & Location Details</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Seller Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={sellerName}
                    onChange={(e) => setSellerName(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Contact</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={sellerPhone}
                    onChange={(e) => setSellerPhone(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                  <input type="text" disabled value={country} className="w-full p-2.5 border bg-gray-100 text-gray-600 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maharashtra"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-gray-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                  <input
                    type="text"
                    required
                    placeholder="400001"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-gray-800"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Local Area</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Andheri West"
                    value={localArea}
                    onChange={(e) => setLocalArea(e.target.value)}
                    className="w-full p-2.5 border rounded-lg text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Flat No, Building, Street Name"
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  className="w-full p-2.5 border rounded-lg text-gray-800"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow transition"
              >
                {loading ? 'Publishing...' : 'Publish Listing'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={checkUserSession}
      />

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-300 py-6 border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>© 2026 BuyerStuff.com. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms & Conditions</a>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="hover:text-white underline cursor-pointer"
            >
              Contact Us
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}