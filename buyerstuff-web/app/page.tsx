'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import AuthModal from './components/AuthModal';
import ContactModal from './components/ContactModal';
import ProductDetailsModal from './components/ProductDetailsModal';
import {
  Upload,
  Store,
  Search,
  MapPin,
  Tag,
  Heart,
  Sparkles,
  Smartphone,
  Car,
  Sofa,
  Shirt,
  BookOpen,
  Grid,
  Eye,
  ChevronDown,
  Globe,
  User,
  LogOut,
  PackageCheck,
  ShoppingBag,
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller-dashboard'>('buyer');
  const [listings, setListings] = useState<any[]>([]);
  const [myListings, setMyListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All Countries');
  const [wishlist, setWishlist] = useState<string[]>([]);

  // User & Auth States
  const [user, setUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'buyer' | 'seller' | null>(null);
  const [authRoleTarget, setAuthRoleTarget] = useState<'buyer' | 'seller'>('buyer');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Seller Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [productAge, setProductAge] = useState('');
  const [sellerName, setSellerName] = useState('');
  const [sellerPhone, setSellerPhone] = useState('');
  const [country, setCountry] = useState('India');
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');
  const [localArea, setLocalArea] = useState('');
  const [fullAddress, setFullAddress] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const majorCountries = [
    'All Countries',
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
  ];

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

  useEffect(() => {
    checkUserSession();
    fetchListings();
  }, []);

  async function checkUserSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUser(session.user);
      const role = session.user.user_metadata?.user_role || 'buyer';
      setUserRole(role);
      setSellerName(session.user.user_metadata?.full_name || '');
      setSellerPhone(session.user.user_metadata?.mobile_number || '');

      if (role === 'seller') {
        fetchUserListings(session.user.id);
      }
    } else {
      setUser(null);
      setUserRole(null);
      setMyListings([]);
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
    setUserRole(null);
    setMyListings([]);
    setActiveTab('buyer');
  }

  function toggleWishlist(id: string) {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }

  function openProductDetails(item: any) {
    setSelectedProduct(item);
    setIsDetailsModalOpen(true);
  }

  function openAuth(targetRole: 'buyer' | 'seller') {
    setAuthRoleTarget(targetRole);
    setIsAuthModalOpen(true);
  }

  async function handleCreateListing(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      openAuth('seller');
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
          seller_name: sellerName || user.user_metadata?.full_name,
          seller_phone: sellerPhone || user.user_metadata?.mobile_number,
          country,
          state,
          city,
          pincode,
          local_area: localArea,
          full_address: fullAddress,
          status: 'active',
        },
      ]);

      if (insertError) throw insertError;

      alert('Product published successfully!');
      setTitle('');
      setDescription('');
      setPrice('');
      setProductAge('');
      setImageFile(null);
      fetchUserListings(user.id);
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
      item.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.country?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      item.title?.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      item.description?.toLowerCase().includes(selectedCategory.toLowerCase());

    const matchesCountry =
      selectedCountry === 'All Countries' ||
      item.country?.toLowerCase().includes(selectedCountry.toLowerCase());

    return matchesSearch && matchesCategory && matchesCountry;
  });

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-blue-600 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center gap-2">
          <div className="flex items-center space-x-2 cursor-pointer shrink-0" onClick={() => setActiveTab('buyer')}>
            <Store className="w-7 h-7 text-yellow-300" />
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
              BuyerStuff<span className="text-yellow-300">.com</span>
            </h1>
          </div>

          <div className="relative flex items-center bg-blue-700/80 hover:bg-blue-700 rounded-xl px-3 py-1.5 border border-blue-400/40 text-xs md:text-sm font-semibold cursor-pointer">
            <Globe className="w-4 h-4 text-yellow-300 mr-1.5 shrink-0" />
            <select
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
              className="bg-transparent text-white cursor-pointer focus:outline-none pr-4 font-semibold appearance-none"
            >
              {majorCountries.map((countryName) => (
                <option key={countryName} value={countryName} className="text-gray-900 bg-white font-medium">
                  {countryName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-blue-200 absolute right-2 pointer-events-none" />
          </div>

          {/* Nav Items */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setActiveTab('buyer')}
              className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-semibold transition ${
                activeTab === 'buyer' ? 'bg-white text-blue-600 shadow-sm' : 'hover:bg-blue-700'
              }`}
            >
              Browse
            </button>

            {user ? (
              <div className="flex items-center space-x-2 border-l border-blue-500 pl-2">
                {userRole === 'seller' && (
                  <button
                    onClick={() => setActiveTab('seller-dashboard')}
                    className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-bold flex items-center ${
                      activeTab === 'seller-dashboard' ? 'bg-yellow-400 text-gray-900 shadow-sm' : 'bg-blue-700 hover:bg-blue-800'
                    }`}
                  >
                    <PackageCheck className="w-3.5 h-3.5 mr-1" />
                    Seller Dashboard ({myListings.length})
                  </button>
                )}

                <span className="text-xs bg-blue-700 px-2.5 py-1 rounded-xl hidden md:inline-block font-medium">
                  {user.user_metadata?.full_name || user.email}
                </span>

                <button
                  onClick={handleSignOut}
                  title="Sign Out"
                  className="p-1.5 hover:bg-blue-700 rounded-xl text-gray-200 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-1.5">
                <button
                  onClick={() => openAuth('buyer')}
                  className="bg-white/20 hover:bg-white/30 text-white font-bold px-3 py-1.5 rounded-xl text-xs md:text-sm transition flex items-center"
                >
                  <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                  Buyer Login
                </button>

                <button
                  onClick={() => openAuth('seller')}
                  className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-bold px-3 py-1.5 rounded-xl text-xs md:text-sm transition flex items-center shadow-sm"
                >
                  <User className="w-3.5 h-3.5 mr-1" />
                  Seller Login
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow w-full">
        {activeTab === 'buyer' && (
          <>
            <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white py-10 px-4 shadow-inner">
              <div className="max-w-5xl mx-auto text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/30 rounded-full text-xs font-semibold text-yellow-300 border border-blue-400/30">
                  <Globe className="w-3.5 h-3.5" /> Worldwide Peer-to-Peer Marketplace
                </div>
                <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
                  Buy & Sell Great Items in {selectedCountry}
                </h2>
                <p className="text-blue-100 text-xs md:text-sm max-w-2xl mx-auto">
                  Browse deals on electronics, vehicles, furniture, and more. Log in as a buyer to contact sellers directly.
                </p>

                <div className="max-w-2xl mx-auto pt-2">
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={`Search items in ${selectedCountry}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-300 transition text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            <section className="max-w-7xl mx-auto px-4 pt-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-gray-800 text-base">Browse Categories</h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-200/60 px-2.5 py-1 rounded-full">
                  Location: <strong className="text-blue-600">{selectedCountry}</strong> ({filteredListings.length} items)
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
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs md:text-sm font-semibold whitespace-nowrap transition border ${
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

            <section className="max-w-7xl mx-auto px-4 py-6">
              {loading ? (
                <div className="text-center py-20 text-gray-500 font-medium">Loading catalog...</div>
              ) : filteredListings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border p-8 max-w-md mx-auto">
                  <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-800 text-lg">No Items in {selectedCountry}</h4>
                  <p className="text-gray-500 text-sm mt-1">Try selecting "All Countries".</p>
                  <button
                    onClick={() => setSelectedCountry('All Countries')}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition"
                  >
                    View All Worldwide Items
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredListings.map((item) => {
                    const isLiked = wishlist.includes(item.id);
                    const isSold = item.status === 'sold';

                    return (
                      <div
                        key={item.id}
                        onClick={() => openProductDetails(item)}
                        className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col relative group cursor-pointer"
                      >
                        <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                          <img
                            src={item.images?.[0] || 'https://via.placeholder.com/300'}
                            alt={item.title}
                            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${
                              isSold ? 'grayscale' : ''
                            }`}
                          />
                          {isSold && (
                            <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider z-10">
                              SOLD OUT
                            </span>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleWishlist(item.id);
                            }}
                            className="absolute top-3 right-3 p-2 bg-white/80 backdrop-blur-md rounded-full shadow hover:bg-white transition z-10"
                          >
                            <Heart
                              className={`w-4 h-4 ${
                                isLiked ? 'text-red-500 fill-red-500' : 'text-gray-600'
                              }`}
                            />
                          </button>
                        </div>

                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-bold text-gray-900 text-base truncate">{item.title}</h3>
                          <p className="text-2xl font-black text-blue-600 mt-1">
                            {item.price ? `₹${item.price.toLocaleString('en-IN')}` : 'Contact for Price'}
                          </p>

                          <div className="space-y-1 mt-3 text-xs text-gray-500">
                            <div className="flex items-center">
                              <Tag className="w-3.5 h-3.5 mr-1.5 text-gray-400 shrink-0" />
                              <span className="truncate">Age: {item.product_age}</span>
                            </div>
                            <div className="flex items-center">
                              <MapPin className="w-3.5 h-3.5 mr-1.5 text-gray-400 shrink-0" />
                              <span className="truncate font-medium text-gray-700">
                                {item.city ? `${item.city}, ` : ''}{item.country || 'Global'}
                              </span>
                            </div>
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openProductDetails(item);
                            }}
                            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl transition flex items-center justify-center shadow-sm"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
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

        {/* SELLER DASHBOARD & PUBLISH FORM */}
        {activeTab === 'seller-dashboard' && user && userRole === 'seller' && (
          <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Seller Dashboard</h2>
                <p className="text-xs text-gray-500 mt-1">
                  Name: <strong>{user.user_metadata?.full_name}</strong> | Email: <strong>{user.email}</strong> | Phone: <strong>{user.user_metadata?.mobile_number}</strong>
                </p>
              </div>
            </div>

            {/* List New Item Form */}
            <div className="bg-white p-8 rounded-2xl shadow-md border">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Upload className="w-5 h-5 text-blue-600" /> Publish New Item to Catalog
              </h3>

              <form onSubmit={handleCreateListing} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 13 128GB or Leather Sofa"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 border rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 text-xs"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Price (₹)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 35000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full p-3 border rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Product Age</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 6 Months old"
                      value={productAge}
                      onChange={(e) => setProductAge(e.target.value)}
                      className="w-full p-3 border rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Product Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                    className="w-full p-2 border rounded-xl text-gray-600 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe item condition, working order, original bill..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border rounded-xl text-gray-800 text-xs"
                  ></textarea>
                </div>

                <hr className="my-4" />
                <h4 className="font-semibold text-gray-800 text-sm">Location Info</h4>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full p-2.5 border rounded-xl text-gray-800 text-xs bg-white"
                    >
                      {fullCountryList.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">State</label>
                    <input
                      type="text"
                      required
                      placeholder="State / Region"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full p-2.5 border rounded-xl text-gray-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">City</label>
                    <input
                      type="text"
                      required
                      placeholder="City Name"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-2.5 border rounded-xl text-gray-800 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Pincode</label>
                    <input
                      type="text"
                      required
                      placeholder="Postal Code"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full p-2.5 border rounded-xl text-gray-800 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Local Area</label>
                    <input
                      type="text"
                      required
                      placeholder="Area / Suburb"
                      value={localArea}
                      onChange={(e) => setLocalArea(e.target.value)}
                      className="w-full p-2.5 border rounded-xl text-gray-800 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Full Address</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House No, Street Name"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    className="w-full p-2.5 border rounded-xl text-gray-800 text-xs"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow transition text-xs"
                >
                  {loading ? 'Publishing...' : 'Publish Listing'}
                </button>
              </form>
            </div>

            {/* My Active Listings List */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4">Your Active Catalog ({myListings.length})</h3>
              {myListings.length === 0 ? (
                <div className="text-center py-10 bg-white rounded-2xl border text-xs text-gray-500">
                  No products published yet. Use the form above to add your first item!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {myListings.map((item) => (
                    <div key={item.id} className="bg-white rounded-2xl border p-4 shadow-sm flex space-x-4 items-center">
                      <img src={item.images?.[0]} alt={item.title} className="w-16 h-16 object-cover rounded-xl shrink-0" />
                      <div className="flex-grow min-w-0">
                        <h4 className="font-bold text-gray-900 text-sm truncate">{item.title}</h4>
                        <p className="text-blue-600 font-extrabold text-xs">₹{item.price?.toLocaleString('en-IN')}</p>
                        <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          item.status === 'sold' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                        }`}>
                          {item.status === 'sold' ? 'SOLD' : 'ACTIVE'}
                        </span>
                      </div>
                      <button
                        onClick={() => openProductDetails(item)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs rounded-xl transition shrink-0"
                      >
                        Manage
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <AuthModal
        isOpen={isAuthModalOpen}
        role={authRoleTarget}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={checkUserSession}
      />

      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      <ProductDetailsModal
        item={selectedProduct}
        isOpen={isDetailsModalOpen}
        currentUser={user}
        onClose={() => setIsDetailsModalOpen(false)}
        onRefresh={fetchListings}
        onRequireBuyerAuth={() => {
          setIsDetailsModalOpen(false);
          openAuth('buyer');
        }}
      />

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