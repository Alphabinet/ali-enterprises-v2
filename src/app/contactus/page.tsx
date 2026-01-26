"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import { PhoneCall, Mail, MapPin, Send, CheckCircle2, AlertCircle, Loader2, ExternalLink } from "lucide-react";

export default function ContactUsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", interest: "", urgency: "Medium", message: ""
  });

  useEffect(() => {
    getDocs(query(collection(db, "products"), orderBy("name")))
      .then(snap => setProducts(snap.docs.map(doc => doc.data().name)))
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");

    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
       setError("Required fields missing."); setLoading(false); return;
    }

    try {
      await addDoc(collection(db, "inquiries"), {
        ...formData, interest: formData.interest || "General Inquiry", status: "New", createdAt: serverTimestamp(), read: false
      });
      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", interest: "", urgency: "Medium", message: "" });
    } catch {
      setError("Failed to send. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Shared Styles for Inputs
  const inputClasses = "w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 text-sm transition-all";
  
  // Contact Data
  const contacts = [
    { icon: PhoneCall, title: "Call Us", val: "+91 9756300040", href: "tel:+919756300040", color: "text-teal-600", bg: "bg-teal-50" },
    { icon: Mail, title: "Email Us", val: "alienterprises54@yahoo.com", href: "mailto:alienterprises54@yahoo.com", color: "text-amber-600", bg: "bg-amber-50" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-12 px-4 lg:pt-32">
      
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-2">
        <h1 className="text-2xl lg:text-5xl font-extrabold text-slate-900">Let's Build <span className="text-teal-600">Together</span></h1>
      </motion.div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6 lg:gap-12 items-start">
        
        {/* LEFT: Info & Map (Reordered for better Mobile Flow) */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4 lg:space-y-6 order-last lg:order-first">
          
          {/* Contact Cards Loop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {contacts.map((c, i) => (
              <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-3">
                <div className={`w-10 h-10 ${c.bg} ${c.color} rounded-full flex items-center justify-center shrink-0`}>
                  <c.icon size={18} />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide">{c.title}</h3>
                  <a href={c.href} className={`text-sm font-bold ${c.color} hover:underline truncate block`}>{c.val}</a>
                </div>
              </div>
            ))}
          </div>

          {/* Map Card */}
          <div className="bg-teal-900 text-white p-1 rounded-2xl shadow-lg overflow-hidden relative">
            <div className="p-5 relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <MapPin className="text-teal-300 shrink-0" size={20} />
                  <div>
                     <p className="font-bold text-sm">Ali Enterprises</p>
                     <p className="text-xs text-teal-100 opacity-80">Khatauli, Uttar Pradesh 251201</p>
                  </div>
                </div>
                <a href="https://maps.google.com/?q=Ali+Enterprises+Khatauli" target="_blank" className="bg-white/10 p-2 rounded-lg hover:bg-white/20"><ExternalLink size={16} /></a>
              </div>
              <iframe 
                src="https://maps.google.com/maps?q=Ali%20Enterprises%2C%20Khatauli%2C%20Uttar%20Pradesh&t=&z=13&ie=UTF8&iwloc=&output=embed"
                className="w-full h-48 rounded-xl opacity-90 hover:opacity-100 transition-opacity border-0"
                allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-800 rounded-full blur-3xl -mr-10 -mt-10 opacity-50"></div>
          </div>
        </motion.div>

        {/* RIGHT: Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl shadow-xl border border-slate-100">
          {success ? (
            <div className="text-center py-12">
              <CheckCircle2 size={48} className="text-green-500 mx-auto mb-3" />
              <h3 className="text-xl font-bold text-slate-800">Inquiry Sent!</h3>
              <button onClick={() => setSuccess(false)} className="mt-4 text-teal-600 text-sm font-bold hover:underline">Send Another</button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input required name="name" value={formData.name} onChange={handleChange} className={inputClasses} placeholder="Name *" />
                <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClasses} placeholder="Phone *" />
              </div>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses} placeholder="Email *" />
              
              <div className="grid grid-cols-2 gap-3">
                <select name="interest" value={formData.interest} onChange={handleChange} className={inputClasses}>
                  <option value="">Interest...</option>
                  {products.map((p, i) => <option key={i} value={p}>{p}</option>)}
                  <option value="Services">Services</option>
                </select>
                <select name="urgency" value={formData.urgency} onChange={handleChange} className={inputClasses}>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>

              <textarea required name="message" value={formData.message} onChange={handleChange} rows={4} className={inputClasses} placeholder="How can we help? *" />

              {error && <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-2 rounded-lg"><AlertCircle size={14} /> {error}</div>}

              <button disabled={loading} type="submit" className="w-full py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70">
                {loading ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Send Inquiry
              </button>
            </form>
          )}
        </motion.div>

      </div>
    </div>
  );
}