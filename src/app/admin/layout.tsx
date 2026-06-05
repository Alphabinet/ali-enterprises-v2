"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  LayoutDashboard, Package, LogOut, ShieldCheck,
  User as UserIcon, Loader2, MessageSquare, Menu, X,
  ChevronRight, Image as ImageIcon, Video, Scale, MapPin, Star
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin/login") return <>{children}</>;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) router.push("/admin/login");
      else { setUser(u); setLoading(false); }
    });
    return () => unsub();
  }, [router]);

  const handleLogout = async () => {
    if (confirm("Sign out?")) { await signOut(auth); router.push("/admin/login"); }
  };

  // Unified nav - media merged, comparison merged into products
  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard, desc: "Overview & hero slides" },
    { name: "Products", href: "/admin/products", icon: Package, desc: "Products & comparison" },
    { name: "Media", href: "/admin/media", icon: ImageIcon, desc: "Gallery & demo videos" },
    { name: "Inquiries", href: "/admin/inquiries", icon: MessageSquare, desc: "Leads & exports" },
    { name: "Service Centers", href: "/admin/service-centers", icon: MapPin, desc: "Locations" },
    { name: "Reviews", href: "/admin/reviews", icon: Star, desc: "Testimonials" },
  ];

  if (loading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-slate-400 gap-3">
      <Loader2 className="animate-spin text-teal-500" size={32} />
      <p className="text-xs font-medium tracking-widest uppercase">Verifying Access</p>
    </div>
  );

  return (
    <div className="min-h-screen flex font-sans text-slate-100">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/70 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        {/* Logo */}
        <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-800">
          <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center">
            <ShieldCheck size={18} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">Admin Panel</p>
            <p className="text-[10px] text-slate-500 mt-0.5 tracking-wider uppercase">Management</p>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto md:hidden text-slate-500 hover:text-white">
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group ${
                  isActive ? "bg-teal-600/20 text-teal-400 border border-teal-600/30" : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                }`}>
                {isActive && <div className="absolute left-0 w-0.5 h-8 bg-teal-500 rounded-r" />}
                <item.icon size={18} className={isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-none">{item.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5 truncate">{item.desc}</p>
                </div>
                {isActive && <ChevronRight size={14} className="text-teal-500 shrink-0" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-slate-800">
          <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-800/50 rounded-lg mb-2 border border-slate-700/50">
            <div className="w-7 h-7 rounded-md bg-teal-900 flex items-center justify-center text-teal-400 border border-teal-800">
              <UserIcon size={14} />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.displayName || "Admin"}</p>
              <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-3 py-2 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider">
            <LogOut size={14} /> Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Mobile Top Bar */}
        <header className="md:hidden h-14 bg-slate-900 border-b border-slate-800 flex items-center px-4 gap-3 sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-400 hover:text-white p-1">
            <Menu size={20} />
          </button>
          <div className="w-6 h-6 rounded-md bg-teal-600 flex items-center justify-center">
            <ShieldCheck size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold text-white">Admin Panel</span>
        </header>

        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}