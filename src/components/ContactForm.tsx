"use client";
import React, { useState } from "react";
import { Send, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore"; 
import { db } from "@/lib/firebase"; // Your existing firebase config
import { siteConfig } from "@/config/site";

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null); // Clear previous errors
    
    try {
      // Save directly to Firebase 'inquiries' collection
      await addDoc(collection(db, "inquiries"), {
        ...formData,
        createdAt: serverTimestamp(),
        status: "new"
      });
      setSuccess(true);
      setFormData({ name: "", phone: "", message: "" });
    } catch (err) {
      console.error(err);
      setError("Something went wrong securely submitting your request. Please try contacting us directly via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="text-center p-8 bg-green-50 rounded-2xl border border-green-100">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-800">Inquiry Received!</h3>
        <p className="text-green-600 mt-2">Our engineering team will call you within 24 hours.</p>
        <button onClick={() => setSuccess(false)} className="mt-6 text-sm text-green-700 underline hover:text-green-900 transition-colors">Send another</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">Request a Quotation</h3>
      
      {/* Inline Error UI */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div className="flex flex-col">
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <a 
              href={`https://wa.me/${siteConfig.whatsappNumber}?text=Hi, I am facing an issue submitting the form on the website.`} 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-red-600 underline mt-1 hover:text-red-800"
            >
              Message on WhatsApp instead
            </a>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Full Name</label>
          <input 
            required 
            type="text" 
            placeholder="e.g. Rahul Sharma"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Phone Number</label>
          <input 
            required 
            type="tel" 
            placeholder="+91 98765 43210"
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-1">Machine Requirement</label>
          <textarea 
            required 
            rows={4}
            placeholder="I am interested in the Automatic Brick Machine..."
            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition-all resize-none"
            value={formData.message}
            onChange={(e) => setFormData({...formData, message: e.target.value})}
          />
        </div>

        <button 
          disabled={loading}
          type="submit" 
          className="w-full py-4 bg-gradient-to-r from-teal-600 to-teal-800 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 transition-all flex items-center justify-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
          Get Best Price
        </button>
      </div>
    </form>
  );
}