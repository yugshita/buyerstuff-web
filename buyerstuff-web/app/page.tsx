'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import AuthModal from './components/AuthModal';
import ContactModal from './components/ContactModal';
import {
  ShoppingCart,
  Upload,
  Store,
  User,
  Search,
  MapPin,
  Tag,
  LogOut,
  PackageCheck,
  Heart,
  Sparkles,
  Smartphone,
  Car,
  Sofa,
  Shirt,
  BookOpen,
  Grid,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller' | 'my-listings'>('buyer');
  const [listings, setListings] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [wishlist, setWishlist] = useState<string[]>([]);

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

  function toggleWishlist(id: string) {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
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

  const categories = [
    { name: 'All', icon: Grid },
    { name: 'Electronics', icon: Smartphone },
    { name: 'Vehicles', icon: Car },
    { name: 'Furniture', icon: Sofa },
    { name: 'Fashion', icon: Shirt },
    { name: 'Books', icon: BookOpen },
  ];

  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === 'All' ||
      item.title?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      item.description?.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-blue-600 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setActiveTab('buyer')}>
            <Store className="w-8 h-8 text-yellow-300" />
            <h1 className="text-2xl font-extrabold tracking-tight">BuyerStuff<span className="text-yellow-300">.com</span></h1>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('buyer')}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition ${
                activeTab === 'buyer' ? 'bg-white text-blue-600 shadow-sm' : 'hover:bg-blue-700'
              }`}
            >
              Browse Products
            </button>

            <button
              onClick={() => {
                if (!user) setIsAuthModalOpen(true);
                else setActiveTab('seller');
              }}
              className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition flex items-center ${
                activeTab === 'seller' ? 'bg-white text-blue-600 shadow-sm' : 'hover:bg-blue-700'
              }`}
            >
              <Upload className="w-4 h-4 mr-1.5" />
              Sell Item
            </button>

            {user ? (
              <div className="flex items-center space-x-2 border-l border-blue-500 pl-3">
                <button
                  onClick={() => setActiveTab('my-listings')}
                  className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center ${
                    activeTab === 'my-listings' ? 'bg-white text-blue-600 shadow-sm' : 'bg-blue-700 hover:bg-blue-800'
                  }`}
                >
                  <PackageCheck className="w-4 h-4 mr-1.5" />
                  My Listings ({myListings.length})
                </button>
                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-2 hover:bg-blue-700 rounded-xl text-gray-200 transition"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-4 py-2 rounded-xl text-sm shadow transition flex items-center"
              >
                <User className="w-4 h-4 mr-1.5" />
                Login / Signup
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow w-full">
        {activeTab === 'buyer' && (
          <>
            {/* Classy Hero Banner */}
            <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white py-12 px-4 shadow-inner">
              <div className="max-w-5xl mx-auto text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/30 rounded-full text-xs font-semibold text-yellow-300 border border-blue-400/30">
                  <Sparkles className="w-3.5 h-3.5" /> Verified India Peer-to-Peer Marketplace
                </div>
                <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                  Buy & Sell Great Items Near You
                </h2>
                <p className="text-blue-100 text-sm md:text-base max-w-2xl mx-auto">
                  Discover local deals on electronics, vehicles, furniture, and more. Direct seller contacts, zero listing fees.
                </p>

                {/* Search Bar inside Hero */}
                <div className="max-w-2xl mx-auto pt-2">
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search phones, laptops, city, pincode..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-300 transition"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Category Filter Pills */}
            <section className="max-w-7xl mx-auto px-4 pt-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-gray-800 text-lg">Browse Categories</h3>
                <span className="text-xs font-medium text-gray-500">
                  Showing {filteredListings.length} available items
                </span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition border ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Product Catalog Grid */}
            <section className="max-w-7xl mx-auto px-4 py-8">
              {loading ? (
                <div className="text-center py-20 text-gray-500 font-medium">Loading catalog...</div>
              ) : filteredListings.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl shadow-sm border p-8 max-w-md mx-auto">
                  <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-800 text-lg">No Listings Found</h4>
                  <p className="text-gray-500 text-sm mt-1">Try searching for a different item or city name.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredListings.map((item) => {
                    const isLiked = wishlist.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col relative group"
                      >
                        {/* Image + Wishlist Heart */}
                        <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                          <img
                            src={item.images?.[0] || 'https://via.placeholder.com/300'}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <button
                            onClick={() => toggleWishlist(item.id)}
                            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full shadow hover:bg-white transition"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'
                              }`}
                            />
                          </button>
                          <span className="absolute bottom-3 left-3 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            Verified Seller
                          </span>
                        </div>

                        {/* Content */}
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-bold text-gray-900 text-base truncate">{item.title}</h3>
                          <p className="text-2xl font-black text-blue-600 mt-1">₹{item.price.toLocaleString('en-IN')}</p>

                          <div className="space-y-1 mt-3 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Tag className="w-3.5 h-3.5 mr-1.5 text-gray-400 shrink-0" />
                              <span className="truncate">Age: {item.product_age}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400 shrink-0" />
                              <span className="truncate">
                                {item.local_area}, {item.city} ({item.pincode})
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={() => alert(`Initiating Razorpay checkout for ₹${item.price}`)}
                            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center shadow-sm"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Buy Now
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}

        {/* MY LISTINGS VIEW */}
        {activeTab === 'my-listings' && user && (
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border mb-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">My Seller Profile</h2>
                <p className="text-sm text-gray-500">Logged in account: {user.phone}</p>
              </div>
              <button
                onClick={() => setActiveTab('seller')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2.5 rounded-xl text-sm flex items-center transition shadow-sm"
              >
                <Upload className="w-4 h-4 mr-2" /> Add New Listing
              </button>
            </div>

            <h3 className="text-lg font-semibold text-gray-700 mb-4">Your Active Listings ({myListings.length})</h3>

            {myListings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border">
                <p className="text-gray-500">You haven't listed any items for sale yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {myListings.map((item) => (
                  <div key={item.id} className="bg-white rounded-2xl border p-4 shadow-sm flex space-x-4">
                    <img src={item.images?.[0]} alt={item.title} className="w-24 h-24 object-cover rounded-xl shrink-0" />
                    <div className="flex-grow">
                      <h4 className="font-bold text-gray-900">{item.title}</h4>
                      <p className="text-blue-600 font-extrabold mt-0.5">₹{item.price.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.local_area}, {item.city}</p>
                      <span className="inline-block mt-2 px-2.5 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-semibold">
                        Live on Store
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SELLER FORM */}
        {activeTab === 'seller' && (
          <div className="max-w-2xl mx-auto px-4 py-8">
            <div className="bg-white p-8 rounded-2xl shadow-md border">
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
                    className="w-full p-3 border rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500"
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
                      className="w-full p-3 border rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500"
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
                      className="w-full p-3 border rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500"
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
                    className="w-full p-2.5 border rounded-xl text-gray-600"
                  />
                </div>

                <hr className="my-6" />
                <h3 className="font-semibold text-gray-800">Seller & Location Details</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Seller Name</label>
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      value={sellerName}
                      onChange={(e) => setSellerName(e.target.value)}
                      className="w-full p-3 border rounded-xl text-gray-800"
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
                      className="w-full p-3 border rounded-xl text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <input type="text" disabled value={country} className="w-full p-3 border bg-gray-100 text-gray-600 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Uttar Pradesh"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-3 border rounded-xl text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ghaziabad"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-3 border rounded-xl text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      placeholder="201002"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full p-3 border rounded-xl text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Local Area</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Pratap Nagar"
                      value={localArea}
                      onChange={(e) => setLocalArea(e.target.value)}
                      className="w-full p-3 border rounded-xl text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Address</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House No, Street Name"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    className="w-full p-3 border rounded-xl text-gray-800"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow transition"
                >
                  {loading ? 'Publishing...' : 'Publish Listing'}
                </button>
              </form>
            </div>
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
      <footer className="bg-gray-900 text-gray-300 py-8 border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-sm">
          <p>© 2026 BuyerStuff.com. All rights reserved.</p>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms & Conditions</a>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="hover:text-white underline cursor-pointer transition"
            >
              Contact Us
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}