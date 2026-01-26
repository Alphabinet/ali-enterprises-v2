"use client";

import React, { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { 
  Loader2, Mail, Phone, Calendar, Trash2, 
  CheckCircle2, Clock, AlertCircle, MessageSquare 
} from "lucide-react";

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Real-time listener for new leads
  useEffect(() => {
    const q = query(collection(db, "inquiries"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setInquiries(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "inquiries", id), { 
        status: newStatus,
        read: true 
      });
    } catch (e) { console.error(e); }
  };

  const deleteInquiry = async (id: string) => {
    if(!confirm("Delete this lead?")) return;
    try { await deleteDoc(doc(db, "inquiries", id)); } catch (e) { console.error(e); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-teal-600" size={40}/></div>;

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8 font-sans text-slate-900 pb-20">
      
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Lead Inquiries</h1>
            <p className="text-slate-500 text-sm">Manage and track your customer requests.</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600">
            Total: {inquiries.length}
          </div>
        </div>

        <div className="grid gap-4">
          {inquiries.map((lead) => (
            <div key={lead.id} className={`bg-white rounded-xl p-5 border shadow-sm transition-all hover:shadow-md ${lead.status === 'New' ? 'border-l-4 border-l-teal-500' : 'border-slate-200'}`}>
              
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                
                {/* Header Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-bold text-lg text-slate-800">{lead.name}</h3>
                    {lead.status === 'New' && <span className="bg-teal-100 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">New</span>}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                      lead.urgency === 'High' ? 'bg-red-50 text-red-600 border-red-100' : 
                      lead.urgency === 'Medium' ? 'bg-amber-50 text-amber-600 border-amber-100' : 
                      'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                      {lead.urgency} Priority
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-slate-500 mb-3">
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 hover:text-teal-600"><Mail size={14}/> {lead.email}</a>
                    <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 hover:text-teal-600"><Phone size={14}/> {lead.phone}</a>
                    <span className="flex items-center gap-1.5"><Calendar size={14}/> {lead.createdAt?.toDate().toLocaleDateString()}</span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-slate-700 text-sm">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-1">Interested in: {lead.interest}</p>
                    "{lead.message}"
                  </div>
                </div>

                {/* Actions */}
                <div className="flex lg:flex-col gap-2 shrink-0">
                  <select 
                    value={lead.status} 
                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                    className="bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-lg px-3 py-2 outline-none focus:border-teal-500 cursor-pointer"
                  >
                    <option value="New">Status: New</option>
                    <option value="Contacted">Status: Contacted</option>
                    <option value="Converted">Status: Converted</option>
                    <option value="Closed">Status: Closed</option>
                  </select>
                  
                  <button 
                    onClick={() => deleteInquiry(lead.id)}
                    className="flex items-center justify-center gap-2 px-3 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-xs font-bold transition-colors"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>

              </div>
            </div>
          ))}

          {inquiries.length === 0 && (
            <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
              <MessageSquare className="mx-auto text-slate-300 mb-2" size={32}/>
              <p className="text-slate-500">No inquiries yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}