"use client";

import React, { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut, User } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  LayoutDashboard,
  Package,
  Image as ImageIcon,
  LogOut,
  ChevronRight,
  ShieldCheck,
  User as UserIcon,
  Loader2,
  MapPin,
  MessageSquare,
  Star,
  Scale,
  Video // <--- 1. Import Video Icon
} from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  // Constants for positioning
  const GLOBAL_NAV_HEIGHT = "72px"; 

  // 1. Hide Layout for Login Page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // 2. Auth Check & User Fetch
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        router.push("/admin/login");
      } else {
        setUser(currentUser);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    if (confirm("Are you sure you want to log out?")) {
      await signOut(auth);
      router.push("/admin/login");
    }
  };

  const navItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Products", href: "/admin/products", icon: Package },
    { name: "Product Demos", href: "/admin/product-demo", icon: Video }, // <--- 2. Added Product Demos
    { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
    { name: "Comparison", href: "/admin/comparison", icon: Scale },
    { name: "Service Centers", href: "/admin/service-centers", icon: MapPin },
    { name: "Inquiries", href: "/admin/inquiries", icon: MessageSquare },
    { name: "Reviews", href: "/admin/re", icon: Star },
  ];

  if (loading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-400 gap-3 z-50 relative">
        <Loader2 className="animate-spin text-teal-600" size={40} />
        <p className="text-sm font-medium animate-pulse">Verifying Access...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900 relative">

      {/* --- Sidebar (Desktop) --- */}
      <aside 
        className="hidden md:flex flex-col w-72 bg-teal-950 text-white fixed z-30 shadow-2xl border-r border-slate-800/50 transition-all duration-300"
        style={{ top: GLOBAL_NAV_HEIGHT, height: `calc(100vh - ${GLOBAL_NAV_HEIGHT})` }}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-800/50 flex items-center gap-3 bg-teal-950">
          <div className="bg-gradient-to-br from-teal-500 to-teal-700 p-2.5 rounded-xl text-white shadow-lg shadow-teal-900/30">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-tight">Admin Portal</h1>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Management Console</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto custom-scrollbar">
          <p className="px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Main Menu</p>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? "bg-teal-600/10 text-teal-400 font-semibold border border-teal-600/20"
                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                }`}
              >
                {isActive && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500 rounded-l-xl"></div>
                )}
                <item.icon
                  size={20}
                  className={`transition-colors ${isActive ? "text-teal-400" : "text-slate-500 group-hover:text-slate-300"}`}
                />
                <span className="text-sm tracking-wide">{item.name}</span>
                {isActive && (
                  <ChevronRight size={16} className="ml-auto opacity-80" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-700/50 bg-teal-950">
          <div className="flex items-center gap-3 mb-4 px-2 p-2 bg-teal-900/50 rounded-lg border border-teal-800">
            <div className="w-8 h-8 rounded-lg bg-teal-800 flex items-center justify-center text-teal-500 border border-teal-700/50">
               <UserIcon size={16} />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.displayName || "Admin Access"}</p>
              <p className="text-[10px] text-slate-400 truncate" title={user?.email || ""}>{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-lg transition-colors text-xs font-bold uppercase tracking-wider border border-transparent hover:border-red-900/30"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* --- Mobile Scrollable Nav (Horizontal) --- */}
      <div 
        className="md:hidden fixed left-0 right-0 bg-slate-950/95 backdrop-blur-md text-white z-30 flex items-center px-4 shadow-xl border-b border-slate-800/50 h-16 transition-all duration-300 overflow-x-auto no-scrollbar gap-3"
        style={{ top: GLOBAL_NAV_HEIGHT }}
      >
        {/* Brand Icon */}
        <div className="shrink-0 bg-teal-600 p-1.5 rounded-lg mr-2 shadow-lg shadow-teal-900/50">
           <ShieldCheck size={18} className="text-white" />
        </div>

        {/* Nav Items */}
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all border ${
                isActive
                  ? "bg-teal-600 text-white border-teal-500 shadow-md"
                  : "bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800"
              }`}
            >
              <item.icon size={14} />
              {item.name}
            </Link>
          );
        })}

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          className="shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wide bg-red-900/20 text-red-400 border border-red-900/30 ml-auto"
        >
          <LogOut size={14} />
        </button>
      </div>

      {/* --- Main Content Area --- */}
      <main className="flex-1 md:ml-72 p-4 md:p-8 pt-24 md:pt-8 min-h-screen transition-all duration-300 w-full overflow-x-hidden bg-slate-50/50 relative z-0">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}