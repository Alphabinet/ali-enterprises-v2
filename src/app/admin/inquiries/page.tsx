"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { db } from "@/lib/firebase";
import {
  collection, query, orderBy, onSnapshot,
  doc, updateDoc, deleteDoc,
} from "firebase/firestore";
import {
  Loader2, Mail, Phone, Trash2, CheckCircle2, AlertCircle,
  MessageSquare, Download, Search, ChevronDown, X,
  FileSpreadsheet, FileText, TrendingUp, Star, Calendar,
  Clock, Zap, BookOpen, Package, Wrench, Settings,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
type Status   = "New" | "Contacted" | "Converted" | "Closed";
type Timeline = "Urgent / Immediate Setup" | "Standard Delivery" | "Just Researching" | "";
type SortKey  = "newest" | "oldest" | "this-week" | "this-month";

interface Inquiry {
  id: string;
  name: string;
  email: string;
  phone: string;
  interest: string;
  timeline: Timeline;
  message: string;
  status: Status;
  read: boolean;
  createdAt: any;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const STATUS_STYLE: Record<Status, string> = {
  New:       "text-teal-400 bg-teal-500/10 border-teal-500/30",
  Contacted: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  Converted: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  Closed:    "text-slate-400 bg-slate-500/10 border-slate-500/30",
};

const TIMELINE_STYLE: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  "Urgent / Immediate Setup": { icon: Zap,      color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30"    },
  "Standard Delivery":        { icon: Clock,     color: "text-amber-400",  bg: "bg-amber-500/10 border-amber-500/30" },
  "Just Researching":         { icon: BookOpen,  color: "text-slate-400",  bg: "bg-slate-500/10 border-slate-500/30" },
};

const PRODUCT_ICON: Record<string, React.ElementType> = {
  "Five Die Brick Machine":   Package,
  "Triple Die Brick Machine": Package,
  "Custom Requirement":       Settings,
  "Spare Parts":              Wrench,
  "Service & Support":        Wrench,
};

// ─── Export Helpers ───────────────────────────────────────────────────────────
const exportCSV = (data: Inquiry[]) => {
  const headers = ["Name","Email","Phone","Product Interest","Timeline","Message","Status","Date"];
  const rows = data.map(d => [
    d.name, d.email, d.phone, d.interest, d.timeline || "—",
    `"${(d.message||"").replace(/"/g,'""')}"`,
    d.status,
    d.createdAt?.toDate?.()?.toLocaleDateString() || "",
  ]);
  const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
  const a = Object.assign(document.createElement("a"), {
    href: URL.createObjectURL(new Blob([csv], { type:"text/csv" })),
    download: `inquiries_${new Date().toISOString().slice(0,10)}.csv`,
  });
  a.click();
};

const exportPDF = (data: Inquiry[]) => {
  const timelineLabel = (t: string) => t || "—";
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:11.5px;color:#1e293b;padding:28px}
    header{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:20px;padding-bottom:14px;border-bottom:2px solid #0f766e}
    h1{font-size:18px;font-weight:700;color:#0f766e}
    .meta{font-size:11px;color:#64748b;text-align:right;line-height:1.7}
    table{width:100%;border-collapse:collapse;margin-top:4px}
    th{background:#0f766e;color:#fff;padding:8px 10px;text-align:left;font-size:10.5px;font-weight:600;letter-spacing:.4px}
    td{padding:8px 10px;border-bottom:1px solid #e2e8f0;vertical-align:top;line-height:1.5}
    tr:nth-child(even) td{background:#f8fafc}
    .badge{display:inline-block;padding:2px 7px;border-radius:99px;font-size:9.5px;font-weight:700;letter-spacing:.3px}
    .New{background:#ccfbf1;color:#0f766e}.Contacted{background:#dbeafe;color:#1d4ed8}
    .Converted{background:#dcfce7;color:#15803d}.Closed{background:#f1f5f9;color:#64748b}
    .tl-urgent{color:#dc2626;font-weight:600}.tl-standard{color:#d97706}.tl-research{color:#64748b}
    .msg{color:#475569;font-size:10.5px}
    @media print{body{padding:0}header{break-after:avoid}}
  </style></head><body>
    <header>
      <div><h1>Lead Inquiries Report</h1><div style="font-size:11px;color:#64748b;margin-top:3px">${data.length} leads exported</div></div>
      <div class="meta">Generated: ${new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"})}<br/>Ali Enterprises — Admin</div>
    </header>
    <table><thead><tr>
      <th style="width:120px">Name</th><th style="width:140px">Contact</th>
      <th style="width:130px">Product</th><th style="width:100px">Timeline</th>
      <th>Message</th><th style="width:75px">Status</th><th style="width:70px">Date</th>
    </tr></thead><tbody>
    ${data.map(d=>{
      const tClass = d.timeline==="Urgent / Immediate Setup"?"tl-urgent":d.timeline==="Standard Delivery"?"tl-standard":"tl-research";
      return `<tr>
        <td><strong>${d.name}</strong></td>
        <td style="font-size:10.5px">${d.email}<br/><span style="color:#64748b">${d.phone}</span></td>
        <td style="font-size:10.5px">${d.interest||"—"}</td>
        <td class="${tClass}" style="font-size:10.5px">${timelineLabel(d.timeline)}</td>
        <td class="msg">${d.message||"—"}</td>
        <td><span class="badge ${d.status}">${d.status}</span></td>
        <td style="font-size:10.5px;color:#64748b">${d.createdAt?.toDate?.()?.toLocaleDateString()||"—"}</td>
      </tr>`;
    }).join("")}
    </tbody></table>
  </body></html>`;
  const w = window.open("","_blank");
  if (w) { w.document.write(html); w.document.close(); setTimeout(()=>w.print(),400); }
};

// ─── Sub-components ───────────────────────────────────────────────────────────
const Toast = ({ message, type, onClose }: { message:string; type:"success"|"error"; onClose:()=>void }) => (
  <div className={`fixed bottom-6 right-6 z-[200] flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 max-w-sm border ${
    type==="success" ? "bg-slate-900 border-teal-600/50 text-white" : "bg-red-950 border-red-700 text-white"
  }`}>
    {type==="success" ? <CheckCircle2 size={17} className="text-teal-400 shrink-0"/> : <AlertCircle size={17} className="text-red-400 shrink-0"/>}
    <p className="text-sm font-medium flex-1">{message}</p>
    <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={15}/></button>
  </div>
);

const TimelineBadge = ({ value }: { value: string }) => {
  const cfg = TIMELINE_STYLE[value];
  if (!cfg) return null;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.color} ${cfg.bg}`}>
      <Icon size={10}/>{value}
    </span>
  );
};

// ─── Date helpers ─────────────────────────────────────────────────────────────
const startOfDay = (d: Date) => { const x=new Date(d); x.setHours(0,0,0,0); return x; };
const isThisWeek = (d: Date) => {
  const now=new Date(), start=new Date(now); start.setDate(now.getDate()-now.getDay()); startOfDay(start);
  return d>=start;
};
const isThisMonth = (d: Date) => {
  const now=new Date(); return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
};

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AdminInquiriesPage() {
  const [inquiries, setInquiries]       = useState<Inquiry[]>([]);
  const [loading, setLoading]           = useState(true);
  const [toast, setToast]               = useState<{msg:string;type:"success"|"error"}|null>(null);
  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<Status|"All">("All");
  const [timelineFilter, setTimelineFilter] = useState<Timeline|"All">("All");
  const [sortBy, setSortBy]             = useState<SortKey>("newest");
  const [dateFrom, setDateFrom]         = useState("");
  const [dateTo, setDateTo]             = useState("");
  const [expanded, setExpanded]         = useState<string|null>(null);
  const [exportOpen, setExportOpen]     = useState(false);
  const exportRef                       = useRef<HTMLDivElement>(null);

  // close export dropdown on outside click
  useEffect(() => {
    const h = (e:MouseEvent) => { if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false); };
    document.addEventListener("mousedown",h); return ()=>document.removeEventListener("mousedown",h);
  },[]);

  useEffect(() => {
    const q = query(collection(db,"inquiries"), orderBy("createdAt","desc"));
    return onSnapshot(q, snap => {
      setInquiries(snap.docs.map(d=>({id:d.id,...d.data()} as Inquiry)));
      setLoading(false);
    });
  }, []);

  const showToast = (msg:string,type:"success"|"error") => {
    setToast({msg,type}); setTimeout(()=>setToast(null),3000);
  };

  const updateStatus = async (id:string, status:string) => {
    await updateDoc(doc(db,"inquiries",id),{status,read:true}).catch(()=>showToast("Update failed","error"));
  };

  const deleteInquiry = async (id:string) => {
    if (!confirm("Delete this lead permanently?")) return;
    await deleteDoc(doc(db,"inquiries",id))
      .then(()=>showToast("Lead deleted","success"))
      .catch(()=>showToast("Delete failed","error"));
  };

  // ── Filtering + Sorting ──────────────────────────────────────────────────
  const filtered = useMemo(()=>{
    const fromDate = dateFrom ? new Date(dateFrom) : null;
    const toDate   = dateTo   ? new Date(dateTo+"T23:59:59") : null;

    return inquiries
      .filter(i => {
        const blob = `${i.name} ${i.email} ${i.phone} ${i.interest} ${i.message}`.toLowerCase();
        if (!blob.includes(search.toLowerCase())) return false;
        if (statusFilter!=="All" && i.status!==statusFilter) return false;
        if (timelineFilter!=="All" && (i.timeline||"")!==timelineFilter) return false;
        const d = i.createdAt?.toDate?.();
        if (d) {
          if (sortBy==="this-week"  && !isThisWeek(d))  return false;
          if (sortBy==="this-month" && !isThisMonth(d)) return false;
          if (fromDate && d < fromDate) return false;
          if (toDate   && d > toDate)   return false;
        }
        return true;
      })
      .sort((a,b)=>{
        const aMs = a.createdAt?.toMillis?.()||0;
        const bMs = b.createdAt?.toMillis?.()||0;
        return sortBy==="oldest" ? aMs-bMs : bMs-aMs;
      });
  },[inquiries,search,statusFilter,timelineFilter,sortBy,dateFrom,dateTo]);

  // ── Stats ────────────────────────────────────────────────────────────────
  const stats = useMemo(()=>({
    total:    inquiries.length,
    newLeads: inquiries.filter(i=>i.status==="New").length,
    converted:inquiries.filter(i=>i.status==="Converted").length,
    urgent:   inquiries.filter(i=>i.timeline==="Urgent / Immediate Setup").length,
  }),[inquiries]);

  const clearFilters = () => {
    setSearch(""); setStatusFilter("All"); setTimelineFilter("All");
    setSortBy("newest"); setDateFrom(""); setDateTo("");
  };
  const hasFilters = search||statusFilter!=="All"||timelineFilter!=="All"||dateFrom||dateTo||sortBy!=="newest";

  if (loading) return (
    <div className="flex justify-center items-center py-40">
      <Loader2 className="animate-spin text-teal-500" size={32}/>
    </div>
  );

  return (
    <div className="pb-20 space-y-6">
      {toast && <Toast message={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Lead Inquiries</h1>
          <p className="text-slate-500 text-sm mt-0.5">Real-time customer requests from the website</p>
        </div>
        <div className="relative" ref={exportRef}>
          <button
            onClick={()=>setExportOpen(!exportOpen)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 border border-slate-700 hover:bg-slate-700 text-white rounded-xl text-sm font-bold transition-all"
          >
            <Download size={15}/> Export
            <ChevronDown size={13} className={`transition-transform ${exportOpen?"rotate-180":""}`}/>
          </button>
          {exportOpen && (
            <div className="absolute right-0 top-12 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-30 min-w-[170px] overflow-hidden">
              <button onClick={()=>{exportCSV(filtered);setExportOpen(false);}}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-200 hover:bg-slate-700 transition-colors">
                <FileSpreadsheet size={15} className="text-emerald-400"/> Export CSV
              </button>
              <div className="h-px bg-slate-700"/>
              <button onClick={()=>{exportPDF(filtered);setExportOpen(false);}}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-200 hover:bg-slate-700 transition-colors">
                <FileText size={15} className="text-red-400"/> Export PDF
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label:"Total Leads",    value:stats.total,     icon:MessageSquare, accent:"text-slate-400",  ring:"border-slate-700" },
          { label:"New",            value:stats.newLeads,  icon:Star,          accent:"text-teal-400",   ring:"border-teal-700/40" },
          { label:"Converted",      value:stats.converted, icon:TrendingUp,    accent:"text-emerald-400",ring:"border-emerald-700/40" },
          { label:"Urgent Leads",   value:stats.urgent,    icon:Zap,           accent:"text-red-400",    ring:"border-red-700/40" },
        ].map(s=>(
          <div key={s.label} className={`bg-slate-900 border ${s.ring} rounded-xl p-4 flex items-center gap-3`}>
            <div className={`p-2.5 rounded-lg bg-slate-800 ${s.accent}`}><s.icon size={17}/></div>
            <div>
              <p className="text-2xl font-bold text-white leading-none">{s.value}</p>
              <p className="text-[11px] text-slate-500 mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
        {/* Row 1: search + status + timeline */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"/>
            <input
              value={search} onChange={e=>setSearch(e.target.value)}
              placeholder="Search name, email, phone, interest, message…"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white outline-none focus:border-teal-500 transition-colors placeholder:text-slate-600"
            />
            {search && <button onClick={()=>setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"><X size={14}/></button>}
          </div>
          <select
            value={statusFilter} onChange={e=>setStatusFilter(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-teal-500 min-w-[130px]"
          >
            <option value="All">All Status</option>
            {(["New","Contacted","Converted","Closed"] as Status[]).map(s=><option key={s}>{s}</option>)}
          </select>
          <select
            value={timelineFilter} onChange={e=>setTimelineFilter(e.target.value as any)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-teal-500 min-w-[160px]"
          >
            <option value="All">All Timelines</option>
            <option value="Urgent / Immediate Setup">⚡ Urgent</option>
            <option value="Standard Delivery">📦 Standard</option>
            <option value="Just Researching">📖 Researching</option>
          </select>
        </div>

        {/* Row 2: sort + date range */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <select
            value={sortBy} onChange={e=>setSortBy(e.target.value as SortKey)}
            className="bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2.5 outline-none focus:border-teal-500 min-w-[150px]"
          >
            <option value="newest">↓ Newest First</option>
            <option value="oldest">↑ Oldest First</option>
            <option value="this-week">📅 This Week</option>
            <option value="this-month">🗓 This Month</option>
          </select>

          <div className="flex items-center gap-2 flex-1">
            <Calendar size={14} className="text-slate-500 shrink-0"/>
            <span className="text-xs text-slate-500 shrink-0">From</span>
            <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-teal-500 [color-scheme:dark]"/>
            <span className="text-xs text-slate-500 shrink-0">to</span>
            <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}
              className="flex-1 bg-slate-800 border border-slate-700 text-slate-300 text-sm rounded-xl px-3 py-2 outline-none focus:border-teal-500 [color-scheme:dark]"/>
          </div>

          {hasFilters && (
            <button onClick={clearFilters}
              className="text-xs text-slate-400 hover:text-white flex items-center gap-1 whitespace-nowrap px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl hover:border-slate-600 transition-all">
              <X size={12}/> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Result count ── */}
      <div className="flex items-center justify-between -mt-2">
        <p className="text-xs text-slate-500">
          {filtered.length} lead{filtered.length!==1?"s":""} shown
          {filtered.length!==inquiries.length && <span className="text-slate-600"> of {inquiries.length}</span>}
        </p>
      </div>

      {/* ── Lead List ── */}
      <div className="space-y-2.5">
        {filtered.map(lead => {
          const isExpanded = expanded === lead.id;
          const statusClass = STATUS_STYLE[lead.status] || STATUS_STYLE.New;
          const ProductIcon = PRODUCT_ICON[lead.interest] || Package;
          const dateStr = lead.createdAt?.toDate?.()?.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}) || "";

          return (
            <div key={lead.id}
              className={`bg-slate-900 border rounded-2xl transition-all duration-200 overflow-hidden ${
                lead.status==="New" && !lead.read
                  ? "border-teal-600/40 shadow-[0_0_0_1px_rgba(20,184,166,0.1)]"
                  : "border-slate-800 hover:border-slate-700"
              }`}
            >
              {/* ─ Collapsed row ─ */}
              <div
                className="px-4 py-3.5 flex items-center gap-3 cursor-pointer select-none"
                onClick={()=>setExpanded(isExpanded ? null : lead.id)}
              >
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-sm font-bold text-slate-400 shrink-0">
                  {lead.name?.charAt(0).toUpperCase()}
                </div>

                {/* Main info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-white text-sm leading-none">{lead.name}</span>
                    {lead.status==="New" && !lead.read &&
                      <span className="text-[9px] font-black bg-teal-500 text-white px-1.5 py-0.5 rounded tracking-wide">NEW</span>}
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusClass}`}>{lead.status}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-[11px] text-slate-500 flex items-center gap-1">
                      <ProductIcon size={10}/> {lead.interest||"—"}
                    </span>
                    {lead.timeline && <TimelineBadge value={lead.timeline}/>}
                  </div>
                </div>

                {/* Right: date + chevron */}
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11px] text-slate-600 hidden sm:block">{dateStr}</span>
                  <ChevronDown size={15} className={`text-slate-600 transition-transform duration-200 ${isExpanded?"rotate-180":""}`}/>
                </div>
              </div>

              {/* ─ Expanded detail ─ */}
              {isExpanded && (
                <div className="border-t border-slate-800 px-4 py-4 space-y-4 animate-in slide-in-from-top-1 duration-150">

                  {/* Info grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-slate-800/60 rounded-xl p-3 space-y-0.5">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Email</p>
                      <a href={`mailto:${lead.email}`} className="text-xs text-teal-400 hover:underline flex items-center gap-1 break-all">
                        <Mail size={11} className="shrink-0"/>{lead.email}
                      </a>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-3 space-y-0.5">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Phone</p>
                      <a href={`tel:${lead.phone}`} className="text-xs text-white hover:text-teal-400 flex items-center gap-1">
                        <Phone size={11} className="shrink-0"/>{lead.phone}
                      </a>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-3 space-y-0.5">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Product</p>
                      <p className="text-xs text-white">{lead.interest||"—"}</p>
                    </div>
                    <div className="bg-slate-800/60 rounded-xl p-3 space-y-0.5">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Received</p>
                      <p className="text-xs text-white flex items-center gap-1"><Calendar size={11}/>{dateStr}</p>
                    </div>
                  </div>

                  {/* Timeline highlight */}
                  {lead.timeline && (
                    <div className={`rounded-xl px-4 py-2.5 flex items-center gap-2 border ${
                      lead.timeline==="Urgent / Immediate Setup"
                        ? "bg-red-500/5 border-red-500/20"
                        : lead.timeline==="Standard Delivery"
                        ? "bg-amber-500/5 border-amber-500/20"
                        : "bg-slate-800/50 border-slate-700"
                    }`}>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Delivery Timeline:</span>
                      <TimelineBadge value={lead.timeline}/>
                    </div>
                  )}

                  {/* Message */}
                  <div className="bg-slate-800/60 rounded-xl p-3">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mb-2">Message</p>
                    <p className="text-sm text-slate-300 leading-relaxed">{lead.message||"No message provided."}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Status:</span>
                      <select
                        value={lead.status}
                        onChange={e=>updateStatus(lead.id, e.target.value)}
                        className="bg-slate-800 border border-slate-700 text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:border-teal-500"
                      >
                        {(["New","Contacted","Converted","Closed"] as Status[]).map(s=>(
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <a href={`mailto:${lead.email}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-600/10 hover:bg-teal-600/20 border border-teal-600/30 text-teal-400 rounded-lg text-xs font-bold transition-colors">
                        <Mail size={12}/> Reply
                      </a>
                      <a href={`tel:${lead.phone}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded-lg text-xs font-bold transition-colors">
                        <Phone size={12}/> Call
                      </a>
                      <button onClick={()=>deleteInquiry(lead.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-lg text-xs font-bold transition-colors">
                        <Trash2 size={12}/> Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filtered.length===0 && (
          <div className="py-24 text-center bg-slate-900 border border-dashed border-slate-800 rounded-2xl">
            <MessageSquare className="mx-auto text-slate-700 mb-3" size={36}/>
            <p className="text-slate-400 font-semibold">
              {hasFilters ? "No leads match your filters" : "No inquiries yet"}
            </p>
            {hasFilters && (
              <button onClick={clearFilters} className="mt-3 text-xs text-teal-400 hover:underline">Clear all filters</button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
