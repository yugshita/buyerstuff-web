'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
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
} from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCountry, setSelectedCountry] = useState<string>('All Countries');
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Selected Product Modal State
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  // Form State for Sellers
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

  // Major World Countries List for Filtering & Listing
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
    'Saudi Arabia',
    'Qatar',
    'Malaysia',
    'Netherlands',
    'Italy',
    'Spain',
    'Brazil',
    'Mexico',
    'South Africa',
    'New Zealand',
    'Other',
  ];

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    setLoading(true);
    const { data } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
    if (data) setListings(data);
    setLoading(false);
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

  async function handleCreateListing(e: React.FormEvent) {
    e.preventDefault();

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
          status: 'active',
        },
      ]);

      if (insertError) throw insertError;

      alert('Product listed successfully!');
      setTitle('');
      setDescription('');
      setPrice('');
      setProductAge('');
      setSellerName('');
      setSellerPhone('');
      setState('');
      setCity('');
      setPincode('');
      setLocalArea('');
      setFullAddress('');
      setImageFile(null);
      setActiveTab('buyer');
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

  // Combined Filter Logic: Search + Category + Country
  const filteredListings = listings.filter((item) => {
    const matchesSearch =
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.country?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.local_area?.toLowerCase().includes(searchQuery.toLowerCase());

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
          {/* Logo */}
          <div className="flex items-center space-x-2 cursor-pointer shrink-0" onClick={() => setActiveTab('buyer')}>
            <Store className="w-7 h-7 text-yellow-300" />
            <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
              BuyerStuff<span className="text-yellow-300">.com</span>
            </h1>
          </div>

          {/* Global Country Filter Dropdown */}
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

          {/* Nav Action Buttons */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={() => setActiveTab('buyer')}
              className={`px-3 py-1.5 rounded-xl text-xs md:text-sm font-semibold transition ${
                activeTab === 'buyer' ? 'bg-white text-blue-600 shadow-sm' : 'hover:bg-blue-700'
              }`}
            >
              Browse
            </button>

            <button
              onClick={() => setActiveTab('seller')}
              className={`px-3.5 py-1.5 rounded-xl text-xs md:text-sm font-bold transition flex items-center ${
                activeTab === 'seller' ? 'bg-yellow-400 text-gray-900 shadow-sm' : 'bg-yellow-400 hover:bg-yellow-500 text-gray-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5 mr-1" />
              Sell Item
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-grow w-full">
        {activeTab === 'buyer' && (
          <>
            {/* Hero Banner */}
            <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white py-10 px-4 shadow-inner">
              <div className="max-w-5xl mx-auto text-center space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-500/30 rounded-full text-xs font-semibold text-yellow-300 border border-blue-400/30">
                  <Globe className="w-3.5 h-3.5" /> Worldwide Peer-to-Peer Marketplace
                </div>
                <h2 className="text-2xl md:text-4xl font-black tracking-tight leading-tight">
                  Buy & Sell Great Items in {selectedCountry}
                </h2>
                <p className="text-blue-100 text-xs md:text-sm max-w-2xl mx-auto">
                  Discover local and global deals on electronics, vehicles, furniture, and more. Direct seller contacts, zero listing fees.
                </p>

                {/* Search Bar */}
                <div className="max-w-2xl mx-auto pt-2">
                  <div className="relative flex items-center">
                    <Search className="absolute left-4 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder={`Search items, city, or postal code in ${selectedCountry}...`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-gray-900 bg-white shadow-lg focus:outline-none focus:ring-4 focus:ring-yellow-300 transition text-sm"
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Category Filter Pills */}
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

            {/* Product Catalog Grid */}
            <section className="max-w-7xl mx-auto px-4 py-6">
              {loading ? (
                <div className="text-center py-20 text-gray-500 font-medium">Loading catalog...</div>
              ) : filteredListings.length === 0 ? (
                <div className="text-center py-16 bg-white rounded-2xl shadow-sm border p-8 max-w-md mx-auto">
                  <Store className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <h4 className="font-bold text-gray-800 text-lg">No Items in {selectedCountry}</h4>
                  <p className="text-gray-500 text-sm mt-1">
                    Try selecting "All Countries" or change your category filter.
                  </p>
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
                        {/* Image + Wishlist Heart + Sold Badge */}
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

                        {/* Content */}
                        <div className="p-4 flex flex-col flex-grow">
                          <h3 className="font-bold text-gray-900 text-base truncate">{item.title}</h3>
                          <p className="text-2xl font-black text-blue-600 mt-1">
                            {item.price ? `${item.price.toLocaleString()}` : 'Contact for Price'}
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
                    placeholder="e.g. iPhone 13 128GB or Vintage Watch"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-3 border rounded-xl text-gray-800 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. 500"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Description</label>
                  <textarea
                    rows={2}
                    placeholder="Describe condition, features, warranty, shipping terms..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-3 border rounded-xl text-gray-800"
                  ></textarea>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Contact (With Country Code)</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +1 5550123 or +91 9876543210"
                      value={sellerPhone}
                      onChange={(e) => setSellerPhone(e.target.value)}
                      className="w-full p-3 border rounded-xl text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full p-3 border rounded-xl text-gray-800 bg-white"
                    >
                      {fullCountryList.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. California / UP"
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
                      placeholder="e.g. London / New York"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full p-3 border rounded-xl text-gray-800"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP / Postal Code</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 10001 or 201002"
                      value={pincode}
                      onChange={(e) => setPincode(e.target.value)}
                      className="w-full p-3 border rounded-xl text-gray-800"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Local Area / District</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Manhattan / Downtown"
                      value={localArea}
                      onChange={(e) => setLocalArea(e.target.value)}
                      className="w-full p-3 border rounded-xl text-gray-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Address / Location</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Street, Building / Neighborhood details"
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
                  {loading ? 'Publishing...' : 'Publish Global Listing'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>

      {/* Contact Modal */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
      />

      {/* Product Details Modal */}
      <ProductDetailsModal
        item={selectedProduct}
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        onRefresh={fetchListings}
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