import React from "react";
import { 
  Briefcase, 
  MessageSquare, 
  Layers, 
  Wallet, 
  User, 
  ShieldCheck, 
  MapPin, 
  CheckCircle2,
  TrendingUp,
  X
} from "lucide-react";
import { FreelancerProfile } from "../types";

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  profile: FreelancerProfile;
  earnings: number;
  escrowTotal: number;
  onEditProfile: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ 
  activeTab, 
  setActiveTab, 
  profile, 
  earnings, 
  escrowTotal,
  onEditProfile,
  isOpen = false,
  onClose
}: SidebarProps) {
  
  const menuItems = [
    { id: "overview", label: "Dashboard Overview", icon: Layers },
    { id: "jobs", label: "Find Jobs & Bid", icon: Briefcase },
    { id: "escrow", label: "Payments & Escrow", icon: Wallet },
    { id: "chat", label: "Direct Workspace Chat", icon: MessageSquare },
    { id: "tasks", label: "Kanban Board", icon: ShieldCheck },
  ];

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/40 z-35 lg:hidden animate-fade-in"
        />
      )}

      <aside 
        id="sidebar-container" 
        className={`fixed lg:sticky top-0 left-0 z-40 bg-white border-r border-slate-200 flex flex-col h-screen w-80 shrink-0 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-100">
              <ShieldCheck className="w-6 h-6" id="brand-shield-icon" />
            </div>
            <div>
              <h1 className="font-display font-extrabold text-lg text-slate-900 tracking-tight leading-none">
                FreelanceSuite
              </h1>
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">
                Secure Operations
              </span>
            </div>
          </div>

          {onClose && (
            <button 
              id="mobile-sidebar-close"
              onClick={onClose}
              className="lg:hidden p-1.5 hover:bg-slate-100 text-slate-500 hover:text-slate-700 rounded-lg transition shrink-0"
              aria-label="Close layout"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Profile Summary Card */}
        <div className="p-5 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-start gap-3">
            <img 
              id="freelancer-profile-avatar"
              src={profile.avatar} 
              alt={profile.name} 
              className="w-12 h-12 rounded-full ring-2 ring-sky-100 object-cover"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold text-sm text-slate-800 truncate">{profile.name}</h3>
              <p className="text-xs text-slate-500 truncate">{profile.title}</p>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-slate-400">
                <MapPin className="w-3 h-3 text-sky-500 shrink-0" />
                <span className="truncate">{profile.location}</span>
              </div>
            </div>
          </div>

          <button 
            id="edit-profile-btn"
            onClick={onEditProfile}
            className="w-full mt-4 py-2 px-3 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <User className="w-3.5 h-3.5 text-slate-400" />
            Customize Profile Specs
          </button>
        </div>

        {/* Navigation Matrix */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          <span className="px-3 text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-2">
            Management Modules
          </span>
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                id={`nav-tab-${item.id}`}
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition cursor-pointer ${
                  isActive 
                    ? "bg-slate-900 text-white font-semibold shadow-sm" 
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-sky-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.id === "escrow" && escrowTotal > 0 && (
                  <span className="bg-amber-100 text-amber-800 text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold animate-pulse">
                    $P
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Ledgers Indicator */}
        <div className="p-5 border-t border-slate-100 bg-slate-50">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-3">
            Instant Financial Ledger
          </span>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm col-span-1">
              <span className="text-[10px] text-slate-400 block font-medium">My Earnings</span>
              <span className="text-sm font-mono font-bold text-emerald-600">${earnings.toLocaleString()}</span>
            </div>
            <div className="bg-white p-3 rounded-lg border border-slate-200/60 shadow-sm col-span-1">
              <span className="text-[10px] text-slate-400 block font-medium">In Escrow Lock</span>
              <span className="text-sm font-mono font-bold text-amber-600">${escrowTotal.toLocaleString()}</span>
            </div>
          </div>
          
          {/* Verification seal */}
          <div className="mt-4 flex items-center gap-1.5 justify-center text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Fiduciary Escrow Guarantee Active</span>
          </div>
        </div>
      </aside>
    </>
  );
}
