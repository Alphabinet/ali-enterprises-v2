"use client";

import React, { useState, useEffect } from "react";
import { 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "firebase/storage";
import { db, storage } from "@/lib/firebase";
import { 
  Plus, 
  Trash2, 
  Edit, 
  Loader2, 
  Star, 
  UploadCloud, 
  Image as ImageIcon 
} from "lucide-react";
import Image from "next/image";

// --- Types ---
type Review = {
  id: string;
  name: string;
  role: string;
  quote: string;
  image: string;
  rating: number;
};

// --- DEFAULT EXPORT COMPONENT ---
export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    quote: "",
    image: "", 
    rating: 5
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  // --- Fetch Reviews ---
  const fetchReviews = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "reviews"));
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Review[];
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  // --- Handlers ---
  const handleImageUpload = async (file: File) => {
    const storageRef = ref(storage, `reviews/${Date.now()}_${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      let imageUrl = formData.image;
      
      // Upload new image if selected
      if (imageFile) {
        imageUrl = await handleImageUpload(imageFile);
      } else if (!imageUrl) {
        // Default avatar if no image provided
        imageUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.name)}&background=0D9488&color=fff`;
      }

      const payload = {
        name: formData.name,
        role: formData.role,
        quote: formData.quote,
        rating: Number(formData.rating),
        image: imageUrl,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        // Update existing
        await updateDoc(doc(db, "reviews", editingId), payload);
      } else {
        // Create new
        await addDoc(collection(db, "reviews"), {
          ...payload,
          createdAt: serverTimestamp(),
        });
      }

      // Refresh list
      await fetchReviews();
      closeModal();
    } catch (error) {
      console.error("Error saving review:", error);
      alert("Failed to save review.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    
    try {
      await deleteDoc(doc(db, "reviews", id));
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const openEditModal = (review: Review) => {
    setFormData({
      name: review.name,
      role: review.role,
      quote: review.quote,
      image: review.image,
      rating: review.rating || 5
    });
    setEditingId(review.id);
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({ name: "", role: "", quote: "", image: "", rating: 5 });
    setImageFile(null);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-slate-800">Client Reviews</h1>
           <p className="text-slate-500">Manage customer testimonials shown on the website</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-teal-600 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 hover:bg-teal-700 transition-colors shadow-lg"
        >
          <Plus size={20} /> Add Review
        </button>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-teal-600 w-10 h-10" />
        </div>
      ) : (
        /* Reviews Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col h-full">
              
              <div className="flex items-center gap-4 mb-4">
                 <div className="relative w-14 h-14 rounded-full overflow-hidden border border-slate-100 shrink-0">
                    <Image src={review.image} alt={review.name} fill className="object-cover" unoptimized />
                 </div>
                 <div className="overflow-hidden">
                    <h3 className="font-bold text-slate-900 truncate">{review.name}</h3>
                    <p className="text-xs font-semibold text-teal-600 uppercase truncate">{review.role}</p>
                 </div>
              </div>
              
              <div className="flex gap-1 mb-3">
                 {[...Array(5)].map((_, i) => (
                   <Star key={i} size={14} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                 ))}
              </div>

              <p className="text-slate-600 text-sm italic leading-relaxed mb-4 line-clamp-4 flex-grow">
                "{review.quote}"
              </p>

              <div className="flex gap-2 mt-auto pt-4 border-t border-slate-50">
                 <button 
                    onClick={() => openEditModal(review)}
                   className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-bold flex items-center justify-center gap-2 hover:bg-slate-100 transition-colors"
                 >
                   <Edit size={14} /> Edit
                 </button>
                 <button 
                    onClick={() => handleDelete(review.id)}
                   className="py-2 px-3 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                 >
                   <Trash2 size={16} />
                 </button>
              </div>
            </div>
          ))}
          
          {reviews.length === 0 && (
            <div className="col-span-full text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-500 mb-4">No reviews added yet.</p>
                <button onClick={() => setIsModalOpen(true)} className="text-teal-600 font-bold underline hover:text-teal-700">
                    Add your first review
                </button>
            </div>
          )}
        </div>
      )}

      {/* --- MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
             
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <h2 className="text-xl font-bold text-slate-800">{editingId ? 'Edit Review' : 'New Review'}</h2>
               <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                   <Plus size={24} className="rotate-45" />
               </button>
            </div>
             
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Client Name</label>
                  <input 
                    required
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    placeholder="e.g. Rahul Singh"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Role / Designation</label>
                  <input 
                    required
                    type="text" 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    placeholder="e.g. Owner"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Testimonial Quote</label>
                <textarea 
                  required
                  rows={4}
                  value={formData.quote}
                  onChange={(e) => setFormData({...formData, quote: e.target.value})}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none resize-none transition-all"
                  placeholder="What did they say about the machine?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                 {/* Rating Input */}
                 <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Rating (1-5)</label>
                    <input 
                         type="number" 
                         min="1" 
                         max="5"
                        value={formData.rating}
                        onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
                    />
                 </div>

                 {/* Image Upload */}
                 <div>
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Photo</label>
                     <div className="border-2 border-dashed border-slate-200 rounded-xl h-[50px] flex items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative overflow-hidden">
                        <input 
                           type="file" 
                           accept="image/*"
                          onChange={(e) => {
                             if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        {imageFile ? (
                           <div className="text-teal-600 text-xs font-bold truncate px-2">{imageFile.name}</div>
                        ) : (
                           <div className="text-slate-400 flex items-center gap-1">
                              <UploadCloud size={16} />
                              <span className="text-xs font-bold">Upload</span>
                           </div>
                        )}
                     </div>
                 </div>
              </div>

              <div className="flex gap-3 pt-2">
                 <button 
                     type="button" 
                     onClick={closeModal}
                     className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-100 rounded-xl transition-colors"
                 >
                    Cancel
                 </button>
                 <button 
                    type="submit" 
                    disabled={isSubmitting}
                   className="flex-1 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 shadow-lg disabled:opacity-70 flex items-center justify-center gap-2 transition-all active:scale-95"
                 >
                   {isSubmitting && <Loader2 className="animate-spin" size={18} />}
                   {editingId ? "Update Review" : "Save Review"}
                 </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}