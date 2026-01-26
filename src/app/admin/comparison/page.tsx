"use client";

import React, { useState, useEffect } from "react";
import { auth, db, storage } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Save, Loader2, UploadCloud, X, Plus,
  Trash2, CheckCircle2, AlertCircle, ArrowLeft,
  LayoutTemplate, Table2, ShieldAlert, CheckSquare
} from "lucide-react";

// --- Types ---
interface ComparisonPoint {
  text: string;
}

interface MetricRow {
  name: string;
  old: string;
  new: string;
}

interface ComparisonData {
  headerTitle: string;
  headerDesc: string;
  
  // Old Card
  oldImage: string;
  oldTitle: string;
  oldDesc: string;
  oldPoints: string[];

  // New Card
  newImage: string;
  newTitle: string;
  newDesc: string;
  newPoints: string[];

  // Table
  metrics: MetricRow[];
}

const INITIAL_DATA: ComparisonData = {
  headerTitle: "Traditional vs. Modern Technology",
  headerDesc: "See exactly how switching saves you money and multiplies output.",
  oldImage: "",
  oldTitle: "Manual / Old Method",
  oldDesc: "Labor intensive, slow, and expensive.",
  oldPoints: ["High dependency on manual labor.", "Inconsistent quality.", "Cannot operate during rain."],
  newImage: "",
  newTitle: "Ali Enterprises",
  newDesc: "Automated, fast, and high-profit.",
  newPoints: ["10x Production Speed.", "Hydraulic Pressure (Zero Breakage).", "Operates 24/7 in all weather."],
  metrics: [
    { name: "Daily Production", old: "1,500 Bricks", new: "15,000+ Bricks" },
    { name: "Labor Required", old: "10-12 Workers", new: "3-4 Workers" },
    { name: "Production Cost", old: "₹4.50 / Brick", new: "₹3.20 / Brick" },
  ]
};

// --- Components ---
const Toast = ({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) => (
  <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-5 ${type === "success" ? "bg-teal-900 text-white" : "bg-red-600 text-white"}`}>
    {type === "success" ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
    <p className="font-medium text-sm">{message}</p>
    <button onClick={onClose}><X size={16} /></button>
  </div>
);

export default function AdminComparisonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ComparisonData>(INITIAL_DATA);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  
  // File States
  const [oldFile, setOldFile] = useState<File | null>(null);
  const [newFile, setNewFile] = useState<File | null>(null);

  // Auth & Fetch
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/admin/login");
      } else {
        try {
          const docRef = doc(db, "site_content", "comparison_page");
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setData(docSnap.data() as ComparisonData);
          }
        } catch (error) {
          console.error("Error fetching data", error);
        } finally {
          setLoading(false);
        }
      }
    });
    return () => unsub();
  }, [router]);

  // --- Handlers ---
  const showToast = (msg: string, type: "success" | "error") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const uploadImage = async (file: File, path: string) => {
    const storageRef = ref(storage, path);
    await uploadBytesResumable(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      let finalOldImage = data.oldImage;
      let finalNewImage = data.newImage;

      // Parallel Uploads
      const uploadPromises = [];
      if (oldFile) uploadPromises.push(uploadImage(oldFile, `comparison/old_${Date.now()}`).then(url => finalOldImage = url));
      if (newFile) uploadPromises.push(uploadImage(newFile, `comparison/new_${Date.now()}`).then(url => finalNewImage = url));
      
      await Promise.all(uploadPromises);

      const payload = { ...data, oldImage: finalOldImage, newImage: finalNewImage };
      
      await setDoc(doc(db, "site_content", "comparison_page"), payload);
      setData(payload);
      setOldFile(null); setNewFile(null);
      showToast("Comparison page updated successfully!", "success");
    } catch (error) {
      console.error(error);
      showToast("Failed to save changes.", "error");
    } finally {
      setSaving(false);
    }
  };

  // --- Dynamic List Helpers ---
  const updatePoint = (side: 'old' | 'new', index: number, val: string) => {
    const points = side === 'old' ? [...data.oldPoints] : [...data.newPoints];
    points[index] = val;
    setData({ ...data, [side === 'old' ? 'oldPoints' : 'newPoints']: points });
  };

  const addPoint = (side: 'old' | 'new') => {
    const points = side === 'old' ? [...data.oldPoints, ""] : [...data.newPoints, ""];
    setData({ ...data, [side === 'old' ? 'oldPoints' : 'newPoints']: points });
  };

  const removePoint = (side: 'old' | 'new', index: number) => {
    const points = side === 'old' ? data.oldPoints.filter((_, i) => i !== index) : data.newPoints.filter((_, i) => i !== index);
    setData({ ...data, [side === 'old' ? 'oldPoints' : 'newPoints']: points });
  };

  // --- Table Helpers ---
  const updateMetric = (index: number, field: keyof MetricRow, val: string) => {
    const metrics = [...data.metrics];
    metrics[index][field] = val;
    setData({ ...data, metrics });
  };

  const addMetric = () => setData({ ...data, metrics: [...data.metrics, { name: "", old: "", new: "" }] });
  const removeMetric = (index: number) => setData({ ...data, metrics: data.metrics.filter((_, i) => i !== index) });

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-teal-600" /></div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={() => setToast(null)} />}

      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-20 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 hover:bg-slate-100 rounded-full"><ArrowLeft size={20}/></button>
          <h1 className="text-xl font-bold text-slate-900">Edit Comparison Page</h1>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Changes
        </button>
      </div>

      <div className="max-w-5xl mx-auto p-6 space-y-8">
        
        {/* Section 1: Page Header */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
              <LayoutTemplate size={18} className="text-teal-600" />
              <h3 className="font-bold text-slate-700">Page Header</h3>
           </div>
           <div className="grid md:grid-cols-2 gap-4">
              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Main Title</label>
                 <input value={data.headerTitle} onChange={(e) => setData({...data, headerTitle: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-500 mb-1">Subtitle / Description</label>
                 <input value={data.headerDesc} onChange={(e) => setData({...data, headerDesc: e.target.value})} className="w-full p-2 border rounded-lg text-sm" />
              </div>
           </div>
        </div>

        {/* Section 2: Battle Cards */}
        <div className="grid md:grid-cols-2 gap-8">
           
           {/* OLD CARD (Red) */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-red-500"></div>
              <div className="flex items-center gap-2 mb-4">
                 <ShieldAlert className="text-red-500" size={20} />
                 <h3 className="font-bold text-slate-800">Old Method Card</h3>
              </div>

              {/* Image Upload */}
              <div className="mb-4">
                 <label className="block text-xs font-bold text-slate-500 mb-1">Image</label>
                 <div className="relative h-40 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-50">
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 z-10" onChange={(e) => setOldFile(e.target.files?.[0] || null)} />
                    {oldFile ? (
                       <Image src={URL.createObjectURL(oldFile)} alt="Preview" fill className="object-cover" />
                    ) : data.oldImage ? (
                       <Image src={data.oldImage} alt="Current" fill className="object-cover" />
                    ) : (
                       <div className="text-center text-slate-400"><UploadCloud className="mx-auto"/> <span className="text-xs">Upload</span></div>
                    )}
                 </div>
              </div>

              <div className="space-y-3 mb-4">
                 <input value={data.oldTitle} onChange={(e) => setData({...data, oldTitle: e.target.value})} className="w-full p-2 border rounded-lg text-sm font-bold" placeholder="Card Title" />
                 <input value={data.oldDesc} onChange={(e) => setData({...data, oldDesc: e.target.value})} className="w-full p-2 border rounded-lg text-sm" placeholder="Short Description" />
              </div>

              {/* Bullet Points */}
              <div className="space-y-2">
                 <label className="block text-xs font-bold text-slate-500">Negative Points</label>
                 {data.oldPoints.map((point, idx) => (
                    <div key={idx} className="flex gap-2">
                       <input value={point} onChange={(e) => updatePoint('old', idx, e.target.value)} className="flex-1 p-2 border border-red-100 bg-red-50/50 rounded-lg text-xs" />
                       <button onClick={() => removePoint('old', idx)} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                    </div>
                 ))}
                 <button onClick={() => addPoint('old')} className="text-xs text-red-600 font-bold hover:underline">+ Add Point</button>
              </div>
           </div>

           {/* NEW CARD (Green) */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-teal-500"></div>
              <div className="flex items-center gap-2 mb-4">
                 <CheckSquare className="text-teal-500" size={20} />
                 <h3 className="font-bold text-slate-800">New Method Card</h3>
              </div>

              {/* Image Upload */}
              <div className="mb-4">
                 <label className="block text-xs font-bold text-slate-500 mb-1">Image</label>
                 <div className="relative h-40 bg-slate-100 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-50">
                    <input type="file" accept="image/*" className="absolute inset-0 opacity-0 z-10" onChange={(e) => setNewFile(e.target.files?.[0] || null)} />
                    {newFile ? (
                       <Image src={URL.createObjectURL(newFile)} alt="Preview" fill className="object-cover" />
                    ) : data.newImage ? (
                       <Image src={data.newImage} alt="Current" fill className="object-cover" />
                    ) : (
                       <div className="text-center text-slate-400"><UploadCloud className="mx-auto"/> <span className="text-xs">Upload</span></div>
                    )}
                 </div>
              </div>

              <div className="space-y-3 mb-4">
                 <input value={data.newTitle} onChange={(e) => setData({...data, newTitle: e.target.value})} className="w-full p-2 border rounded-lg text-sm font-bold" placeholder="Card Title" />
                 <input value={data.newDesc} onChange={(e) => setData({...data, newDesc: e.target.value})} className="w-full p-2 border rounded-lg text-sm" placeholder="Short Description" />
              </div>

              {/* Bullet Points */}
              <div className="space-y-2">
                 <label className="block text-xs font-bold text-slate-500">Positive Points</label>
                 {data.newPoints.map((point, idx) => (
                    <div key={idx} className="flex gap-2">
                       <input value={point} onChange={(e) => updatePoint('new', idx, e.target.value)} className="flex-1 p-2 border border-teal-100 bg-teal-50/50 rounded-lg text-xs" />
                       <button onClick={() => removePoint('new', idx)} className="text-red-400 hover:text-red-600"><X size={14}/></button>
                    </div>
                 ))}
                 <button onClick={() => addPoint('new')} className="text-xs text-teal-600 font-bold hover:underline">+ Add Point</button>
              </div>
           </div>

        </div>

        {/* Section 3: Comparison Table */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
           <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                 <Table2 size={18} className="text-teal-600" />
                 <h3 className="font-bold text-slate-700">Comparison Table Data</h3>
              </div>
              <button onClick={addMetric} className="text-xs bg-slate-100 px-3 py-1 rounded hover:bg-slate-200 font-bold flex items-center gap-1"><Plus size={12}/> Add Row</button>
           </div>

           <div className="space-y-3">
              <div className="grid grid-cols-12 gap-2 text-xs font-bold text-slate-400 uppercase px-2">
                 <div className="col-span-4">Feature Name</div>
                 <div className="col-span-3">Old Value</div>
                 <div className="col-span-4">New Value</div>
                 <div className="col-span-1"></div>
              </div>
              
              {data.metrics.map((row, idx) => (
                 <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                       <input value={row.name} onChange={(e) => updateMetric(idx, 'name', e.target.value)} className="w-full p-2 border rounded text-sm font-medium" placeholder="Feature" />
                    </div>
                    <div className="col-span-3">
                       <input value={row.old} onChange={(e) => updateMetric(idx, 'old', e.target.value)} className="w-full p-2 border border-red-100 bg-red-50/30 rounded text-sm text-red-800" placeholder="Old stat" />
                    </div>
                    <div className="col-span-4">
                       <input value={row.new} onChange={(e) => updateMetric(idx, 'new', e.target.value)} className="w-full p-2 border border-teal-100 bg-teal-50/30 rounded text-sm text-teal-800" placeholder="New stat" />
                    </div>
                    <div className="col-span-1 text-center">
                       <button onClick={() => removeMetric(idx)} className="p-2 text-slate-300 hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                    </div>
                 </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  );
}