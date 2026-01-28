"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp, getDocs, query, orderBy } from "firebase/firestore";
import { 
  PhoneCall, 
  Mail, 
  MapPin, 
  Send, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  Clock,
  Building2,
  MessageCircle // Imported for WhatsApp
} from "lucide-react";

export default function ContactUsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", interest: "", urgency: "Medium", message: ""
  });

  // --- SEO: Structured Data for Local Business ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ManufacturingBusiness",
    "name": "Ali Enterprises",
    "image": "https://alienterprises.in/machines/default.png",
    "telephone": "+919756300040",
    "email": "alienterprises54@yahoo.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Khatauli",
      "addressLocality": "Muzaffarnagar",
      "addressRegion": "Uttar Pradesh",
      "postalCode": "251201",
      "addressCountry": "IN"
    },
    "url": "https://alienterprises.in/contactus",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": [
        "Tuesday", // Updated Days
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday"
      ],
      "opens": "09:00",
      "closes": "18:00"
    }
  };

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
       setError("Please fill in all required fields marked with *"); 
       setLoading(false); 
       return;
    }

    try {
      await addDoc(collection(db, "inquiries"), {
        ...formData, 
        interest: formData.interest || "General Inquiry", 
        status: "New", 
        createdAt: serverTimestamp(), 
        read: false,
        source: "Contact Page"
      });
      setSuccess(true);
      setFormData({ name: "", email: "", phone: "", interest: "", urgency: "Medium", message: "" });
    } catch {
      setError("Something went wrong. Please verify your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  // Shared Styles for Inputs
  const inputClasses = "w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800 text-sm font-medium transition-all placeholder:text-slate-400";
  
  // Contact Data - Added WhatsApp
  const contacts = [
    { icon: PhoneCall, title: "Sales Support", val: "+91 97563 00040", href: "tel:+919756300040", color: "text-teal-600", bg: "bg-teal-50" },
    { icon: MessageCircle, title: "WhatsApp Chat", val: "Chat Now", href: "https://wa.me/919756300040", color: "text-green-600", bg: "bg-green-50" },
    { icon: Mail, title: "Official Email", val: "alienterprises54@yahoo.com", href: "mailto:alienterprises54@yahoo.com", color: "text-amber-600", bg: "bg-amber-50" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-12 px-4 lg:pt-32">
      
      {/* Inject JSON-LD for Google */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 lg:mb-16">
        <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-900 mb-4">
          Contact <span className="text-teal-600">Ali Enterprises</span>
        </h1>
        <p className="text-slate-500 max-w-2xl mx-auto text-sm lg:text-base">
          Leading manufacturers of brick machinery. Whether you have a custom requirement or need technical support, our team in Khatauli is ready to assist you.
        </p>
      </motion.div>

      <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12 items-start">
        
        {/* LEFT: Info & Map */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6 order-last lg:order-first">
          
          {/* Contact Cards Loop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contacts.map((c, i) => (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-shadow">
                <div className={`w-12 h-12 ${c.bg} ${c.color} rounded-xl flex items-center justify-center shrink-0`}>
                  <c.icon size={22} />
                </div>
                <div className="overflow-hidden">
                  <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-1">{c.title}</h3>
                  <a href={c.href} target={c.title.includes("WhatsApp") ? "_blank" : undefined} className={`text-base font-bold ${c.color} hover:underline truncate block`}>{c.val}</a>
                  <p className="text-xs text-slate-400 mt-1">Available Tue-Sun</p>
                </div>
              </div>
            ))}
          </div>

          {/* SEO Text Block */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
             <div className="flex items-center gap-2 mb-3">
                <Building2 className="text-teal-600" size={20} />
                <h3 className="font-bold text-slate-900">Visit Our Manufacturing Facility</h3>
             </div>
             <p className="text-slate-600 text-sm leading-relaxed mb-4">
               Ali Enterprises is located in the heart of <strong>Khatauli, Uttar Pradesh</strong>. 
               We specialize in high-quality automated, hydraulic, and industrial machinery. 
               Visit our workshop to see our pavers, mixers, and brick-making machines in action.
             </p>
             <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">Khatauli, UP</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">Pin: 251201</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">Heavy Machinery</span>
             </div>
          </div>

          {/* Map Card */}
          <div className="bg-slate-900 text-white p-1 rounded-2xl shadow-xl overflow-hidden relative group">
            <div className="p-5 relative z-10">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-3">
                  <MapPin className="text-teal-400 shrink-0" size={24} />
                  <div>
                      <p className="font-bold text-base">Ali Enterprises HQ</p>
                      <p className="text-sm text-slate-300">Khatauli, Muzaffarnagar, U.P.</p>
                  </div>
                </div>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Ali+Enterprises+Khatauli+Uttar+Pradesh" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="bg-white/10 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-white/20 flex items-center gap-2 transition-colors"
                >
                  Get Directions <ExternalLink size={14} />
                </a>
              </div>
              {/* Working Google Maps Embed */}
              <iframe 
                src="https://maps.google.com/maps?q=Ali+Enterprises+Khatauli+Uttar+Pradesh&t=&z=14&ie=UTF8&iwloc=&output=embed"
                className="w-full h-56 rounded-xl border-0 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                allowFullScreen 
                loading="lazy" 
                referrerPolicy="no-referrer-when-downgrade"
                title="Ali Enterprises Location Map"
              />
            </div>
          </div>
        </motion.div>

        {/* RIGHT: Form */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-8 rounded-[2rem] shadow-xl border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
          
          <div className="mb-6">
             <h3 className="text-xl font-bold text-slate-900">Send an Inquiry</h3>
             <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
               <Clock size={14} className="text-teal-600" /> Working Days: Tuesday - Sunday
             </p>
          </div>

          {success ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center py-16 bg-green-50 rounded-2xl border border-green-100"
            >
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                 <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Message Received!</h3>
              <p className="text-slate-600 text-sm mb-6 max-w-xs mx-auto">
                Thank you for contacting Ali Enterprises. Our team will review your request and get back to you shortly.
              </p>
              <button 
                onClick={() => setSuccess(false)} 
                className="px-6 py-2 bg-white text-teal-700 text-sm font-bold rounded-lg border border-slate-200 shadow-sm hover:bg-slate-50 transition-colors"
              >
                Send Another Message
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-700 ml-1">Your Name *</label>
                   <input required name="name" value={formData.name} onChange={handleChange} className={inputClasses} placeholder="e.g. Rahul Sharma" />
                </div>
                <div className="space-y-1.5">
                   <label className="text-xs font-bold text-slate-700 ml-1">Phone Number *</label>
                   <input required type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClasses} placeholder="+91 98765..." />
                </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-700 ml-1">Email Address *</label>
                 <input required type="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses} placeholder="name@company.com" />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">Interested Product</label>
                    <select name="interest" value={formData.interest} onChange={handleChange} className={`${inputClasses} cursor-pointer`}>
                      <option value="">Select a Machine...</option>
                      {products.map((p, i) => <option key={i} value={p}>{p}</option>)}
                      <option value="Custom Order">Custom Requirement</option>
                      <option value="Services">Service & Support</option>
                    </select>
                </div>
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 ml-1">Urgency</label>
                    <select name="urgency" value={formData.urgency} onChange={handleChange} className={`${inputClasses} cursor-pointer`}>
                      <option value="Medium">Standard</option>
                      <option value="High">Urgent / Immediate</option>
                      <option value="Low">Just Inquiring</option>
                    </select>
                </div>
              </div>

              <div className="space-y-1.5">
                 <label className="text-xs font-bold text-slate-700 ml-1">Your Message *</label>
                 <textarea required name="message" value={formData.message} onChange={handleChange} rows={4} className={inputClasses} placeholder="Tell us about your requirements..." />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl border border-red-100">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <button 
                disabled={loading} 
                type="submit" 
                className="w-full py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg shadow-teal-500/20 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />} 
                {loading ? "Sending..." : "Submit Inquiry"}
              </button>
              
              <p className="text-center text-xs text-slate-400 mt-4">
                By submitting, you agree to our <a href="/terms" className="underline hover:text-teal-600">Terms of Service</a>.
              </p>
            </form>
          )}
        </motion.div>

      </div>
    </div>
  );
}