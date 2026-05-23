import React, { useState } from "react";
import { 
  TrendingUp, 
  Wallet, 
  Lock, 
  Unlock, 
  FileCheck2, 
  ArrowUpRight, 
  Clock, 
  Bell, 
  HelpCircle,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ShieldCheck
} from "lucide-react";
import { Contract, FreelancerProfile, Invoice } from "../types";

interface DashboardOverviewProps {
  profile: FreelancerProfile;
  contracts: Contract[];
  invoices: Invoice[];
  earnings: number;
  escrowTotal: number;
  onNavigate: (tab: string) => void;
  onWithdraw: (amount: number) => void;
}

export default function DashboardOverview({
  profile,
  contracts,
  invoices,
  earnings,
  escrowTotal,
  onNavigate,
  onWithdraw
}: DashboardOverviewProps) {
  const [withdrawAmount, setWithdrawAmount] = useState<string>("");
  const [withdrawStatus, setWithdrawStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [withdrawError, setWithdrawError] = useState<string>("");

  const activeContract = contracts.find(c => c.status === "active");
  const pendingMilestonesReview = contracts.flatMap(c => 
    c.milestones.filter(m => m.status === "submitted_review")
  );

  const handleWithdrawSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = parseFloat(withdrawAmount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setWithdrawError("Specify a valid dollar amount to withdraw.");
      return;
    }
    if (parsedAmount > earnings) {
      setWithdrawError("Requested amount exceeds your available balance ledger.");
      return;
    }
    
    setWithdrawError("");
    setWithdrawStatus('processing');
    
    setTimeout(() => {
      onWithdraw(parsedAmount);
      setWithdrawStatus('success');
      setWithdrawAmount("");
      setTimeout(() => {
        setWithdrawStatus('idle');
      }, 3500);
    }, 1500);
  };

  const dashboardNotifications = [
    { 
      id: "n-1", 
      title: "Secure Escrow Locked", 
      message: "Kenji locked $600 USD into Escrow for Milestone 3 (Complete Handover).", 
      time: "2 hours ago", 
      type: "escrow" 
    },
    { 
      id: "n-2", 
      title: "Milestone Work Submitted", 
      message: "Your submission for 'Webhooks Security & Validation Manual' is under client review.", 
      time: "1 day ago", 
      type: "action" 
    },
    { 
      id: "n-3", 
      title: "Direct Chat Message", 
      message: "Liam Sterling from Finova Commerce left you a negotiation inquiry.", 
      time: "4 hours ago", 
      type: "chat" 
    }
  ];

  return (
    <div id="overview-tab-root" className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-sky-950 text-white rounded-2xl p-6 sm:p-8 relative overflow-hidden shadow-lg border border-slate-800">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-400 via-sky-600 to-transparent"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-sky-500/20 text-sky-300 font-mono text-[10px] uppercase font-bold py-1 px-2.5 rounded-full mb-4 border border-sky-400/20">
            <ShieldCheck className="w-3.5 h-3.5" /> Checked & Authenticated
          </div>
          <h2 className="font-display font-black text-2xl sm:text-3xl tracking-tight mb-2">
            Welcome back, {profile.name}!
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6 font-light">
            You are currently operating in full-assurance mode. All payments are protected by smart cryptographic escrows, and direct chats are simulated using state-of-the-art Gemini LLM engines.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <button 
              id="dash-browse-jobs-btn"
              onClick={() => onNavigate("jobs")}
              className="py-2.5 px-5 bg-sky-600 hover:bg-sky-500 font-semibold text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-sky-900/30 w-full sm:w-auto"
            >
              Search Open Projects 
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button 
              id="dash-view-escrow-btn"
              onClick={() => onNavigate("escrow")}
              className="py-2.5 px-5 bg-white/10 hover:bg-white/15 border border-white/10 font-semibold text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 cursor-pointer w-full sm:w-auto"
            >
              Manage Escrow Locks 
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary Financial Ledger Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div id="stat-earnings" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono font-bold block">Available Balance</span>
            <span className="text-2xl font-mono font-bold text-slate-800">${earnings.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-600 block flex items-center gap-1 mt-1">
              <TrendingUp className="w-3.5 h-3.5 shrink-0" /> Fast-transfer ready
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div id="stat-escrow" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono font-bold block">Escrow Vault Held</span>
            <span className="text-2xl font-mono font-bold text-slate-800">${escrowTotal.toLocaleString()}</span>
            <span className="text-[10px] text-amber-600 block flex items-center gap-1 mt-1">
              <Lock className="w-3.5 h-3.5 shrink-0" /> Fiduciary bond locked
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
        </div>

        <div id="stat-review-count" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono font-bold block">In Invoice Review</span>
            <span className="text-2xl font-mono font-bold text-slate-800">{pendingMilestonesReview.length}</span>
            <span className="text-[10px] text-sky-600 block flex items-center gap-1 mt-1">
              <Clock className="w-3.5 h-3.5 shrink-0" /> Awaiting client signoff
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
        </div>

        <div id="stat-success-rate" className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex items-start justify-between">
          <div className="space-y-1">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-mono font-bold block">Success Score</span>
            <span className="text-2xl font-mono font-bold text-slate-800">{profile.earningRate}</span>
            <span className="text-[10px] text-indigo-600 block flex items-center gap-1 mt-1">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" /> {profile.completedJobs} Verified Project Deliveries
            </span>
          </div>
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Active Workspace and Withdrawal */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Active Contract Quick View */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-display font-semibold text-sm text-slate-800">
                Active Project Operations
              </h3>
              {activeContract && (
                <span className="bg-sky-50 text-sky-700 border border-sky-100 py-1 px-2.5 rounded-md text-[11px] font-mono font-semibold">
                  ACTIVE PIPELINE
                </span>
              )}
            </div>

            <div className="p-6">
              {activeContract ? (
                <div className="space-y-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-semibold text-base text-slate-800 mb-1">{activeContract.title}</h4>
                      <p className="text-xs text-slate-500">Client Partner: <span className="text-slate-800 font-medium">{activeContract.clientName}</span></p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-mono font-bold block">Total Contract Budget</span>
                      <span className="text-lg font-mono font-bold text-slate-900">${activeContract.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Milestones Flow in Active Contract */}
                  <div className="space-y-3.5 pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block mb-2">Milestones Roadmap</span>
                    {activeContract.milestones.map((ms, index) => (
                      <div key={ms.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200/50 bg-slate-50">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600 font-mono">
                            {index + 1}
                          </span>
                          <div>
                            <span className="text-xs font-semibold text-slate-800 block">{ms.title}</span>
                            <span className="text-[10px] text-slate-400 block font-mono">Due date: {ms.dueDate}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-semibold text-slate-700">${ms.amount}</span>
                          {ms.status === "released" && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 py-0.5 px-2 rounded font-medium inline-flex items-center gap-1">
                              <Unlock className="w-3 h-3 text-emerald-600" /> Released
                            </span>
                          )}
                          {ms.status === "submitted_review" && (
                            <span className="text-[10px] bg-sky-50 text-sky-700 border border-sky-200 py-0.5 px-2 rounded font-medium inline-flex items-center gap-1 animate-pulse">
                              <Clock className="w-3 h-3 text-sky-600" /> Under Review
                            </span>
                          )}
                          {ms.status === "escrowed" && (
                            <span className="text-[10px] bg-amber-50 text-amber-700 border border-amber-200 py-0.5 px-2 rounded font-medium inline-flex items-center gap-1">
                              <Lock className="w-3 h-3 text-amber-600" /> Locked Escrow
                            </span>
                          )}
                          {ms.status === "pending" && (
                            <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 py-0.5 px-2 rounded font-medium">
                              Awaiting Deposit
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <button 
                      id="active-go-escrow-btn"
                      onClick={() => onNavigate("escrow")}
                      className="flex-1 py-2 px-4 bg-sky-50 hover:bg-sky-100 border border-sky-200 hover:border-sky-300 text-sky-700 text-xs font-semibold rounded-lg transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Process Payment Releases
                    </button>
                    <button 
                      id="active-go-chat-btn"
                      onClick={() => onNavigate("chat")}
                      className="flex-1 py-2 px-4 bg-slate-900 hover:bg-slate-850 text-white text-xs font-semibold rounded-lg transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Chat with Client
                    </button>
                  </div>
                </div>
              ) : (
                <div className="py-12 px-6 text-center space-y-3">
                  <p className="text-sm text-slate-500 max-w-sm mx-auto">
                    You do not have any active project contracts running currently. Bid on available projects or generate a customized proposal to secure work!
                  </p>
                  <button 
                    id="no-active-browse-btn"
                    onClick={() => onNavigate("jobs")}
                    className="py-2.5 px-5 bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs rounded-lg transition cursor-pointer inline-flex items-center gap-1.5"
                  >
                    Browse Project Bids <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Balance Liquidity Simulator */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <h3 className="font-display font-semibold text-sm text-slate-800">
                Fiduciary Direct-to-Bank Transfer Simulator
              </h3>
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
            </div>
            
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Whenever a client releases payment escrow, funds land instantly in your available ledger. You can transfer funds directly to any verified routing number. Transfers are simulated with dynamic visual timelines.
            </p>

            <form onSubmit={handleWithdrawSimulate} className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-mono text-slate-400 font-bold">$</span>
                  <input 
                    id="withdraw-amount-input"
                    type="number" 
                    placeholder="Specify transfer amount..." 
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    disabled={withdrawStatus === "processing" || earnings === 0}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-lg text-sm text-slate-800 font-mono disabled:opacity-50"
                  />
                </div>
                <button
                  id="submit-withdraw-btn"
                  type="submit"
                  disabled={withdrawStatus === "processing" || earnings === 0 || !withdrawAmount}
                  className="py-2.5 px-6 font-semibold bg-emerald-600 hover:bg-emerald-500 text-white text-xs rounded-lg transition disabled:bg-slate-300 disabled:text-slate-500 cursor-pointer w-44 shrink-0 justify-center flex items-center gap-1.5 shadow-sm"
                >
                  {withdrawStatus === 'idle' && (
                    <>
                      Execute Transfer <ArrowUpRight className="w-3.5 h-3.5" />
                    </>
                  )}
                  {withdrawStatus === 'processing' && (
                    <>
                      <Clock className="w-3.5 h-3.5 animate-spin" /> Moving Secures...
                    </>
                  )}
                  {withdrawStatus === 'success' && (
                    <>
                      ✓ Transfer Dispatched
                    </>
                  )}
                </button>
              </div>

              {withdrawError && (
                <div id="transfer-error" className="p-3 bg-red-50 text-red-700 text-xs rounded-lg font-medium leading-normal">
                  ⚠ {withdrawError}
                </div>
              )}

              {withdrawStatus === "success" && (
                <div id="transfer-success" className="p-3 bg-emerald-50 text-emerald-850 text-xs rounded-lg font-medium flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  Your fast-transfer is on its way to your routing checking account! Available ledger decreased instantly.
                </div>
              )}
            </form>
          </div>

        </div>

        {/* Right 1 Col: Notifications Ledger & How it Works */}
        <div id="right-col-onboard" className="space-y-8">
          
          {/* Operations Broadcast Feed */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-slate-400" />
                <h3 className="font-display font-semibold text-sm text-slate-800">
                  Operations Broadcast
                </h3>
              </div>
              <span className="h-2 w-2 rounded-full bg-sky-600 animate-ping"></span>
            </div>

            <div className="space-y-4">
              {dashboardNotifications.map((n) => (
                <div key={n.id} className="flex gap-3 text-xs border-b border-slate-50 pb-3 last:border-none last:pb-0">
                  <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center font-bold bg-slate-100">
                    {n.type === "escrow" ? "🔒" : n.type === "chat" ? "💬" : "✓"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="font-semibold text-slate-800 block mb-0.5">{n.title}</span>
                    <p className="text-slate-500 leading-normal text-[11px] mb-1">{n.message}</p>
                    <span className="text-[10px] font-mono text-slate-400 block">{n.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Escrow System Tutorial Onboard */}
          <div className="bg-slate-900 text-white rounded-xl shadow-md p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-sky-400 pb-2 border-b border-slate-800">
              <HelpCircle className="w-4 h-4" />
              <h4 className="font-display font-bold text-xs uppercase tracking-wider">
                Platform Escrow Rules
              </h4>
            </div>

            <div className="space-y-3.5 text-xs text-slate-300 font-light">
              <div className="flex gap-2">
                <span className="font-bold text-sky-400 font-mono">STEP 1</span>
                <p><strong className="text-white font-medium">Bidding/Hiring:</strong> Client and Freelancer align on deliverables and budget, or generate an interactive milestones table with Gemini scoping.</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-sky-400 font-mono">STEP 2</span>
                <p><strong className="text-white font-medium">Secure Escrow:</strong> Client deposits milestone funds into the secure neutral vault. Funds cannot be retrieved until work is approved or arbitrated.</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-sky-400 font-mono">STEP 3</span>
                <p><strong className="text-white font-medium">Submission & Review:</strong> Freelancer uploads mock files or final chapters instantly. Status switches to Under Review.</p>
              </div>
              <div className="flex gap-2">
                <span className="font-bold text-sky-400 font-mono">STEP 4</span>
                <p><strong className="text-white font-medium">Safe Release:</strong> Client authorizes payment. Funds drop straight into your Available Balance instantly for free withdrawal!</p>
              </div>
            </div>
            
            <div className="pt-2 flex justify-center">
              <a 
                href="#escrow-how" 
                onClick={(e) => { e.preventDefault(); onNavigate("escrow"); }}
                className="text-[11px] font-mono text-sky-400 hover:text-sky-300 underline inline-flex items-center gap-1"
              >
                Go to Escrow dashboard <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
