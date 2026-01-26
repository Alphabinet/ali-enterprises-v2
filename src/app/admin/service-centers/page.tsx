"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, serverTimestamp } from "firebase/firestore";
import { MapPin, Plus, Trash2, Loader2, Save, X, Database } from "lucide-react";
import DeleteModal from "@/components/admin/DeleteModal";

// --- Types ---
interface ServiceCenter {
  id: string;
  city: string;
  address: string;
  coordinates: [number, number]; // [lat, lng]
  phone: string;
}

// --- PRE-FILLED DATA FOR BULK UPLOAD ---
const SEED_DATA = [
  // Punjab
  { city: "Gurdaspur", address: "G.T. Road, Near Bus Stand, Gurdaspur, Punjab", lat: 32.0419, lng: 75.4053, phone: "+91 97563 00040" },
  { city: "Moga", address: "Ferozepur Road, Moga Industrial Area, Punjab", lat: 30.8138, lng: 75.1735, phone: "+91 97563 00040" },
  { city: "Amritsar", address: "Majitha Road, Bypass Chowk, Amritsar, Punjab", lat: 31.6340, lng: 74.8723, phone: "+91 97563 00040" },

  // Haryana
  { city: "Sonipat", address: "Murthal Road, Industrial Estate, Sonipat, Haryana", lat: 28.9931, lng: 77.0151, phone: "+91 97563 00040" },
  { city: "Panipat", address: "G.T. Road, Panipat Textile Market, Haryana", lat: 29.3909, lng: 76.9635, phone: "+91 97563 00040" },
  { city: "Kaithal", address: "Ambala Road, Near New Grain Market, Kaithal", lat: 29.8015, lng: 76.3996, phone: "+91 97563 00040" },
  { city: "Jind", address: "Rohtak Road, Urban Estate, Jind, Haryana", lat: 29.3198, lng: 76.3123, phone: "+91 97563 00040" },

  // Rajasthan
  { city: "Hanumangarh", address: "Rawatsar Road, Hanumangarh Junction, Rajasthan", lat: 29.5842, lng: 74.3263, phone: "+91 97563 00040" },
  { city: "Sri Ganganagar", address: "Suratgarh Road, Ganganagar, Rajasthan", lat: 29.9038, lng: 73.8772, phone: "+91 97563 00040" },
  { city: "Ajmer", address: "Jaipur Road, Near Madar Gate, Ajmer, Rajasthan", lat: 26.4499, lng: 74.6399, phone: "+91 97563 00040" },

  // Uttar Pradesh
  { city: "Prayagraj", address: "Civil Lines, Near High Court, Prayagraj, UP", lat: 25.4358, lng: 81.8463, phone: "+91 97563 00040" },
  { city: "Gorakhpur", address: "Medical College Road, Gorakhpur, UP", lat: 26.7606, lng: 83.3732, phone: "+91 97563 00040" },
  { city: "Varanasi (Banaras)", address: "Lanka Road, Near BHU Gate, Varanasi, UP", lat: 25.3176, lng: 82.9739, phone: "+91 97563 00040" },
  { city: "Ghazipur", address: "Station Road, Ghazipur City, UP", lat: 25.5836, lng: 83.5656, phone: "+91 97563 00040" },
  { city: "Sultanpur", address: "Lucknow-Varanasi Highway, Sultanpur, UP", lat: 26.2625, lng: 82.0727, phone: "+91 97563 00040" },
  { city: "Fatehpur", address: "G.T. Road, Near Bus Stop, Fatehpur, UP", lat: 25.9268, lng: 80.8080, phone: "+91 97563 00040" },

  // Maharashtra
  { city: "Nashik", address: "Satpur MIDC, Nashik, Maharashtra", lat: 19.9975, lng: 73.7898, phone: "+91 97563 00040" },
  { city: "Nagpur", address: "Wardha Road, Sitabuldi, Nagpur, Maharashtra", lat: 21.1458, lng: 79.0882, phone: "+91 97563 00040" },
  { city: "Chhatrapati Sambhajinagar", address: "Jalna Road, Aurangabad, Maharashtra", lat: 19.8762, lng: 75.3433, phone: "+91 97563 00040" },
  { city: "Amravati", address: "Badnera Road, Amravati, Maharashtra", lat: 20.9320, lng: 77.7523, phone: "+91 97563 00040" },

  // South India
  { city: "Chennai", address: "Anna Salai, Guindy Industrial Estate, Chennai, TN", lat: 13.0827, lng: 80.2707, phone: "+91 97563 00040" },
  { city: "Hyderabad", address: "Hitech City, Madhapur, Hyderabad, Telangana", lat: 17.3850, lng: 78.4867, phone: "+91 97563 00040" },

  // East India
  { city: "Kolkata (West Bengal)", address: "Park Street, Kolkata, West Bengal", lat: 22.5726, lng: 88.3639, phone: "+91 97563 00040" }
];

export default function AdminServiceCenters() {
  const [centers, setCenters] = useState<ServiceCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [phone, setPhone] = useState("");

  // Delete Modal
  const [deleteItem, setDeleteItem] = useState<ServiceCenter | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      const q = query(collection(db, "service_centers"), orderBy("city"));
      const snapshot = await getDocs(q);
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as ServiceCenter[];
      setCenters(data);
    } catch (e) {
      console.error("Error fetching centers:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || !address || !lat || !lng || !phone) return alert("All fields are required");
    
    setSubmitting(true);
    try {
      await addDoc(collection(db, "service_centers"), {
        city,
        address,
        phone,
        coordinates: [parseFloat(lat), parseFloat(lng)],
        createdAt: serverTimestamp(),
      });
      
      // Reset
      setCity(""); setAddress(""); setLat(""); setLng(""); setPhone("");
      setIsFormOpen(false);
      fetchCenters();
    } catch (e) {
      console.error(e);
      alert("Failed to add center");
    } finally {
      setSubmitting(false);
    }
  };

  // --- NEW: BULK UPLOAD FUNCTION ---
  const handleBulkUpload = async () => {
    if (!confirm("This will add 23 predefined locations to your map. Continue?")) return;
    
    setLoading(true);
    try {
      const promises = SEED_DATA.map(async (item) => {
        await addDoc(collection(db, "service_centers"), {
          city: item.city,
          address: item.address,
          phone: item.phone,
          coordinates: [item.lat, item.lng],
          createdAt: serverTimestamp(),
        });
      });
      
      await Promise.all(promises);
      alert("All locations added successfully!");
      fetchCenters();
    } catch (error) {
      console.error("Bulk upload failed", error);
      alert("Error adding data.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteItem) return;
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "service_centers", deleteItem.id));
      setCenters(prev => prev.filter(c => c.id !== deleteItem.id));
    } catch (e) {
      console.error(e);
    } finally {
      setIsDeleting(false);
      setDeleteItem(null);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-teal-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      
      <DeleteModal 
        isOpen={!!deleteItem} 
        onClose={() => setDeleteItem(null)} 
        onConfirm={handleDelete} 
        title="Delete Center?" 
        message={`Remove ${deleteItem?.city} from the map?`} 
        isDeleting={isDeleting}
      />

      <div className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Service Centers</h1>
            <p className="text-slate-500 text-sm">Manage locations displayed on the map.</p>
          </div>
          
          <div className="flex gap-3">
             {/* Bulk Button */}
             <button 
                onClick={handleBulkUpload}
                className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold text-sm transition-colors"
             >
                <Database size={18} /> Bulk Upload
             </button>

             <button 
                onClick={() => setIsFormOpen(true)}
                className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold text-sm transition-colors shadow-sm"
             >
                <Plus size={18} /> Add Center
             </button>
          </div>
        </div>

        {/* Add Form (Collapsible) */}
        {isFormOpen && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 animate-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-slate-800">Add New Location</h3>
               <button onClick={() => setIsFormOpen(false)} className="text-slate-400 hover:text-red-500"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <div className="md:col-span-2">
                 <label className="block text-xs font-bold text-slate-500 mb-1">City Name</label>
                 <input required value={city} onChange={e => setCity(e.target.value)} className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. Mumbai" />
               </div>
               
               <div className="md:col-span-2">
                 <label className="block text-xs font-bold text-slate-500 mb-1">Full Address</label>
                 <input required value={address} onChange={e => setAddress(e.target.value)} className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. 123 Industrial Area, Andheri East" />
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Latitude</label>
                 <input required type="number" step="any" value={lat} onChange={e => setLat(e.target.value)} className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. 19.0760" />
               </div>

               <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Longitude</label>
                 <input required type="number" step="any" value={lng} onChange={e => setLng(e.target.value)} className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. 72.8777" />
               </div>

               <div className="md:col-span-2">
                 <label className="block text-xs font-bold text-slate-500 mb-1">Contact Phone</label>
                 <input required value={phone} onChange={e => setPhone(e.target.value)} className="w-full p-2 border rounded-lg text-sm focus:ring-2 focus:ring-teal-500 outline-none" placeholder="e.g. +91 98765 43210" />
               </div>

               <div className="md:col-span-2 flex justify-end gap-3 mt-2">
                 <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg text-sm font-bold hover:bg-slate-200">Cancel</button>
                 <button disabled={submitting} type="submit" className="px-6 py-2 bg-teal-600 text-white rounded-lg text-sm font-bold hover:bg-teal-700 flex items-center gap-2 disabled:opacity-50">
                    {submitting ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} Save
                 </button>
               </div>
            </form>
          </div>
        )}

        {/* List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {centers.map((center) => (
            <div key={center.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col group relative hover:shadow-md transition-shadow">
               <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                     <div className="p-2 bg-teal-50 text-teal-600 rounded-lg"><MapPin size={18} /></div>
                     <h3 className="font-bold text-slate-800">{center.city}</h3>
                  </div>
                  <button onClick={() => setDeleteItem(center)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
               </div>
               
               <p className="text-xs text-slate-500 mb-3 flex-1 leading-relaxed">{center.address}</p>
               
               <div className="text-xs font-mono bg-slate-50 p-2 rounded text-slate-600 mb-2 border border-slate-100">
                  {center.coordinates[0].toFixed(4)}, {center.coordinates[1].toFixed(4)}
               </div>
               
               <div className="text-xs font-bold text-teal-700 pt-2 border-t border-slate-100">
                  📞 {center.phone}
               </div>
            </div>
          ))}
          
          {centers.length === 0 && (
            <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-xl border-2 border-dashed border-slate-200">
               <MapPin className="mx-auto mb-2 opacity-50" size={32} />
               <p className="text-sm">No service centers added yet.</p>
               <p className="text-xs mt-1 text-slate-300">Click "Bulk Upload" to auto-fill locations.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}