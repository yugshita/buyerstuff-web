'use client';

import { useState, useEffect } from 'react';
import { supabase } from './supabase';
import { ShoppingCart, Upload, Store, User, Search, MapPin, Tag } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'buyer' | 'seller'>('buyer');
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  useEffect(() => {
    fetchListings();
  }, []);

  async function fetchListings() {
    setLoading(true);
    const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
    if (!error && data) {
      setListings(data);
    }
    setLoading(false);
  }

  async function handleCreateListing(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile) {
      alert('Please select an image for your product.');
      return;
    }

    try {
      setLoading(true);
      // 1. Upload image to Supabase Storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('Buyerstuff_Product_Images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('Buyerstuff_Product_Images')
        .getPublicUrl(fileName);

      const imageUrl = publicUrlData.publicUrl;

      // 2. Insert record into database
      const { error: insertError } = await supabase.from('listings').insert([
        {
          title,
          description,
          price: parseFloat(price),
          product_age: productAge,
          images: [imageUrl],
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
      // Reset form
      setTitle('');
      setDescription('');
      setPrice('');
      setProductAge('');
      setImageFile(null);
      setActiveTab('buyer');
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
      {/* Header Navigation */}
      <header className="bg-blue-600 text-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Store className="w-8 h-8" />
            <h1 className="text-2xl font-bold tracking-tight">BuyerStuff.com</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setActiveTab('buyer')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                activeTab === 'buyer' ? 'bg-white text-blue-600 shadow' : 'hover:bg-blue-700'
              }`}
            >
              Buyer Portal
            </button>
            <button
              onClick={() => setActiveTab('seller')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center space-x-1 ${
                activeTab === 'seller' ? 'bg-white text-blue-600 shadow' : 'hover:bg-blue-700'
              }`}
            >
              <Upload className="w-4 h-4 mr-1" />
              Sell Product
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-8 flex-grow w-full">
        {/* BUYER PORTAL */}
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
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>
              <p className="text-gray-500 text-sm">Showing {filteredListings.length} products available</p>
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading listings...</div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border">
                <p className="text-gray-500 text-lg">No products found yet.</p>
                <button
                  onClick={() => setActiveTab('seller')}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Be the first to list an item!
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredListings.map((item) => (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border overflow-hidden hover:shadow-md transition">
                    <img
                      src={item.images?.[0] || 'https://via.placeholder.com/300'}
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
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
                        onClick={() => alert(`Proceeding to checkout with Razorpay for ₹${item.price}`)}
                        className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium flex items-center justify-center space-x-1"
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

        {/* SELLER PORTAL */}
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
                  className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 35000"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
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
                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full p-2 border rounded-lg text-gray-600"
                />
              </div>

              <hr className="my-6" />
              <h3 className="font-semibold text-gray-700">Seller & Location Information</h3>

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
                  <input
                    type="text"
                    disabled
                    value={country}
                    className="w-full p-2.5 border bg-gray-100 text-gray-600 rounded-lg"
                  />
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
                {loading ? 'Submitting Product...' : 'Publish Listing'}
              </button>
            </form>
          </div>
        )}
      </main>

      {/* Footer Required by Razorpay */}
      <footer className="bg-gray-800 text-gray-300 py-8 border-t mt-auto">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm">© 2026 BuyerStuff.com. All rights reserved.</p>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="hover:text-white">Privacy Policy</a>
            <a href="#" className="hover:text-white">Terms & Conditions</a>
            <a href="#" className="hover:text-white">Cancellation & Refund</a>
            <a href="#" className="hover:text-white">Contact Us</a>
          </div>
        </div>
      </footer>
    </div>
  );
}