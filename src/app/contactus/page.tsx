"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  MessageCircle
} from "lucide-react";

// --- Centralized Contact Info ---
const CONTACT_INFO = {
  phoneDisplay: "+91 97563 00040",
  phoneRaw: "+919756300040",
  whatsapp: "919756300040",
  email: "alienterprises54@yahoo.com",
  address: "Khatauli, Muzaffarnagar, Uttar Pradesh - 251201",
};

export default function ContactUsPage() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [products, setProducts] = useState<string[]>([]);

  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", interest: "", urgency: "Medium", message: ""
  });

  // --- SEO: Structured Data ---
  const jsonLd = {
    "@context": "[https://schema.org](https://schema.org)",
    "@type": "ManufacturingBusiness",
    "name": "Ali Enterprises",
    "image": "[https://alienterprises.in/machines/default.png](https://alienterprises.in/machines/default.png)",
    "telephone": CONTACT_INFO.phoneRaw,
    "email": CONTACT_INFO.email,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Khatauli",
      "addressLocality": "Muzaffarnagar",
      "addressRegion": "Uttar Pradesh",
      "postalCode": "251201",
      "addressCountry": "IN"
    },
    "url": "[https://alienterprises.in/contactus](https://alienterprises.in/contactus)",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
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
    setLoading(true);
    setError("");

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
      setError("Something went wrong securely submitting your request. Please try contacting us directly via WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  // Upgraded Input Styles
  const inputClasses = "w-full p-3.5 bg-slate-50/50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white text-slate-800 text-sm font-medium transition-all duration-200 placeholder:text-slate-400 focus:shadow-md";

  const contacts = [
    { icon: PhoneCall, title: "Sales Support", val: CONTACT_INFO.phoneDisplay, href: `tel:${CONTACT_INFO.phoneRaw}`, color: "text-teal-600", bg: "bg-teal-50", hover: "hover:border-teal-200" },
    { icon: MessageCircle, title: "WhatsApp Chat", val: "Chat Now", href: `https://wa.me/${CONTACT_INFO.whatsapp}`, color: "text-green-600", bg: "bg-green-50", hover: "hover:border-green-200" },
    { icon: Mail, title: "Official Email", val: CONTACT_INFO.email, href: `mailto:${CONTACT_INFO.email}`, color: "text-amber-600", bg: "bg-amber-50", hover: "hover:border-amber-200" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-8 pb-12 px-4 lg:pt-32 relative overflow-hidden">
      {/* Decorative Background Blur */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-teal-100/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none z-0"></div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative z-10">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10 lg:mb-16">
          <h1 className="text-3xl lg:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Contact <span className="text-teal-600">Ali Enterprises</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-sm lg:text-base leading-relaxed">
            Leading manufacturers of heavy-duty brick machinery. Whether you have a custom requirement or need technical support, our team is ready to assist you.
          </p>
        </motion.div>

        {/* Upgraded Grid System: 5 cols for Info, 7 cols for Form on desktop */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
          
          {/* LEFT: Info & Map (5 Cols) */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-5 space-y-6 order-last lg:order-first">
            
            {/* Contact Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols1 gap-2">
              {contacts.map((c, i) => (
                <a 
                  key={i} 
                  href={c.href} 
                  target={c.title.includes("WhatsApp") ? "_blank" : undefined}
                  rel="noreferrer"
                  className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start gap-4 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 ${c.hover} group`}
                >
                  <div className={`w-12 h-12 ${c.bg} ${c.color} rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110`}>
                    <c.icon size={22} />
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide mb-1">{c.title}</h3>
                    <p className={`text-sm xl:text-base font-bold ${c.color} truncate block`}>{c.val}</p>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-wider">Available Tuesday To Sunday</p>
                  </div>
                </a>
              ))}
            </div>

            {/* SEO Text Block */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex items-center gap-3 mb-4 border-b border-slate-50 pb-4">
                  <div className="p-2 bg-slate-50 rounded-lg text-teal-600"><Building2 size={20} /></div>
                  <h3 className="font-bold text-slate-900">Manufacturing Facility</h3>
               </div>
               <p className="text-slate-600 text-sm leading-relaxed mb-4">
                 Located in <strong>Khatauli, Uttar Pradesh</strong>, we specialize in high-quality automated, hydraulic, and industrial machinery. Visit our workshop for a live demonstration.
               </p>
               <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-teal-50 text-teal-700 border border-teal-100 text-xs rounded-full font-bold">Khatauli, UP</span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs rounded-full font-medium">Pin: 251201</span>
               </div>
            </div>

            {/* Responsive Map Card */}
            <div className="bg-slate-900 text-white p-1 rounded-2xl shadow-xl overflow-hidden relative group">
              <div className="p-5 relative z-10 flex flex-col h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <MapPin className="text-teal-400 shrink-0 mt-1" size={20} />
                    <div>
                        <p className="font-bold text-base">Ali Enterprises Head Office</p>
                        <p className="text-xs text-slate-300 mt-0.5">Khatauli, Muzaffarnagar, U.P.</p>
                    </div>
                  </div>
                  <a 
                    href="https://maps.google.com/maps?q=Ali+Enterprises+Khatauli+Uttar+Pradesh" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-white/10 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-white/20 flex items-center gap-2 transition-colors shrink-0"
                  >
                    <span className="hidden sm:inline">Directions</span> <ExternalLink size={14} />
                  </a>
                </div>
                
                {/* Responsive Aspect Ratio for Map */}
                <div className="w-full aspect-video sm:aspect-[21/9] lg:aspect-video rounded-xl overflow-hidden">
                  <iframe 
                    src="https://maps.google.com/maps?q=Ali+Enterprises+Khatauli+Uttar+Pradesh&t=&z=14&ie=UTF8&iwloc=&output=embed"
                    className="w-full h-full border-0 grayscale-[0.2] group-hover:grayscale-0 transition-all duration-500"
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Ali Enterprises Location Map"
                  />
                </div>
              </div>
            </div>
          </motion.div>

          {/* RIGHT: Form (7 Cols) */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-[2rem] shadow-xl border border-teal-100 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-emerald-500"></div>
            
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-50 pb-6">
               <div>
                 <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Request a Quote</h3>
                 <p className="text-sm text-slate-500 mt-1">Fill out the form below and we will contact you shortly.</p>
               </div>
               <div className="inline-flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100 shrink-0">
                 <Clock size={14} className="text-teal-600" /> 
                 <span className="text-xs font-bold text-slate-600 uppercase">Tue - Sun</span>
               </div>
            </div>

            <AnimatePresence mode="wait">
              {success ? (
                <motion.div 
                  key="success"
                  initial={{ scale: 0.9, opacity: 0, y: 20 }}
                  animate={{ scale: 1, opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="text-center py-16 bg-emerald-50/50 rounded-2xl border border-emerald-100"
                >
                  <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                     <CheckCircle2 size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-800 mb-2 tracking-tight">Inquiry Sent Successfully!</h3>
                  <p className="text-slate-600 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
                    Thank you for reaching out to Ali Enterprises. One of our engineers will review your requirements and call you back within 24 hours.
                  </p>
                  <button 
                    onClick={() => setSuccess(false)} 
                    className="px-8 py-3 bg-white text-teal-700 text-sm font-bold rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all active:scale-95"
                  >
                    Submit Another Request
                  </button>
                </motion.div>
              ) : (
                <motion.form 
                  key="form"
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  onSubmit={handleSubmit} 
                  className="space-y-5"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                       <label htmlFor="name" className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wider">Your Name <span className="text-red-500">*</span></label>
                       <input id="name" required name="name" value={formData.name} onChange={handleChange} className={inputClasses} placeholder="e.g. Rahul Sharma" />
                    </div>
                    <div className="space-y-1.5">
                       <label htmlFor="phone" className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wider">Phone Number <span className="text-red-500">*</span></label>
                       <input id="phone" required type="tel" name="phone" value={formData.phone} onChange={handleChange} className={inputClasses} placeholder="+91 98765 43210" />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                     <label htmlFor="email" className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wider">Email Address <span className="text-red-500">*</span></label>
                     <input id="email" required type="email" name="email" value={formData.email} onChange={handleChange} className={inputClasses} placeholder="name@company.com" />
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                        <label htmlFor="interest" className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wider">Interested Product</label>
                        <select id="interest" name="interest" value={formData.interest} onChange={handleChange} className={`${inputClasses} cursor-pointer appearance-none`}>
                          <option value="">Select a Machine...</option>
                          {products.map((p, i) => <option key={i} value={p}>{p}</option>)}
                          <option value="Custom Order">Custom Requirement</option>
                          <option value="Spares">Spare Parts</option>
                          <option value="Services">Service & Support</option>
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label htmlFor="urgency" className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wider">Timeline</label>
                        <select id="urgency" name="urgency" value={formData.urgency} onChange={handleChange} className={`${inputClasses} cursor-pointer appearance-none`}>
                          <option value="Medium">Standard Delivery</option>
                          <option value="High">Urgent / Immediate Setup</option>
                          <option value="Low">Just Researching</option>
                        </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                     <label htmlFor="message" className="text-xs font-bold text-slate-600 ml-1 uppercase tracking-wider">Your Message <span className="text-red-500">*</span></label>
                     <textarea id="message" required name="message" value={formData.message} onChange={handleChange} rows={4} className={`${inputClasses} resize-y min-h-[100px]`} placeholder="Tell us about your production requirements or ask a question..." />
                  </div>

                  <AnimatePresence>
                    {error && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                        <div className="flex items-start gap-3 text-red-700 text-sm bg-red-50 p-4 rounded-xl border border-red-200">
                          <AlertCircle size={18} className="shrink-0 mt-0.5" /> 
                          <div>
                            <span className="font-bold block mb-1">Submission Failed</span>
                            {error}
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <button 
                    disabled={loading} 
                    type="submit" 
                    className="w-full py-4 bg-gradient-to-r from-teal-600 to-teal-700 text-white font-bold rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg shadow-teal-600/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-4"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />} 
                    {loading ? "Securely Sending..." : "Submit Inquiry"}
                  </button>
                  
                  <p className="text-center text-xs text-slate-400 mt-6 pt-4 border-t border-slate-100">
                    Your data is secure. By submitting, you agree to our <a href="/terms" className="underline hover:text-teal-600 transition-colors">Terms of Service</a>.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

        </div>
      </div>
    </div>
  );
}