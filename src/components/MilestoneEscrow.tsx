import React, { useState } from "react";
import { 
  Lock, 
  Unlock, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  FileText, 
  Sparkles, 
  Loader2, 
  Layers, 
  DollarSign, 
  ShieldCheck, 
  Printer, 
  ArrowDownToLine, 
  ChevronRight,
  TrendingUp,
  X
} from "lucide-react";
import { Contract, Milestone, Invoice, FreelancerProfile } from "../types";

interface MilestoneEscrowProps {
  contracts: Contract[];
  invoices: Invoice[];
  profile: FreelancerProfile;
  onMilestoneSubmit: (contractId: string, milestoneId: string) => void;
  onMilestoneRelease: (contractId: string, milestoneId: string) => void;
  onImportMilestones: (contractId: string, newMilestones: Milestone[]) => void;
  geminiActive: boolean;
}

export default function MilestoneEscrow({
  contracts,
  invoices,
  profile,
  onMilestoneSubmit,
  onMilestoneRelease,
  onImportMilestones,
  geminiActive
}: MilestoneEscrowProps) {
  const [selectedContractId, setSelectedContractId] = useState<string>(contracts[0]?.id || "");
  const [scoperTitle, setScoperTitle] = useState<string>("");
  const [scoperBudget, setScoperBudget] = useState<number>(3000);
  const [scoperDesc, setScoperDesc] = useState<string>("");
  const [loadingScope, setLoadingScope] = useState<boolean>(false);
  const [scopedMilestones, setScopedMilestones] = useState<Milestone[]>([]);
  const [scoperEngine, setScoperEngine] = useState<string>("");

  // Invoice view states
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const selectedContract = contracts.find(c => c.id === selectedContractId);
  const activeInvoices = invoices.filter(inv => inv.contractId === selectedContractId);

  const totalContractScopePrice = selectedContract 
    ? selectedContract.milestones.reduce((sum, m) => sum + m.amount, 0)
    : 0;

  const releasedSum = selectedContract
    ? selectedContract.milestones.filter(m => m.status === "released").reduce((sum, m) => sum + m.amount, 0)
    : 0;

  const escrowLockedSum = selectedContract
    ? selectedContract.milestones.filter(m => m.status === "escrowed" || m.status === "submitted_review").reduce((sum, m) => sum + m.amount, 0)
    : 0;

  const handleScopeMilestones = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scoperTitle || !scoperDesc || scoperBudget <= 0) return;
    setLoadingScope(true);
    setScopedMilestones([]);
    setScoperEngine("");

    try {
      const resp = await fetch("/api/project/generate-milestones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: scoperTitle,
          jobDescription: scoperDesc,
          budget: scoperBudget
        })
      });

      const data = await resp.json();
      if (data.milestones) {
        setScopedMilestones(data.milestones);
        setScoperEngine(data.engine === "Gemini 3.5 Flash" 
          ? "Scoped with Gemini 3.5 Flash" 
          : "Scoped using Local Project Blueprint template"
        );
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingScope(false);
    }
  };

  const handleImportScope = () => {
    if (!selectedContractId || scopedMilestones.length === 0) return;
    onImportMilestones(selectedContractId, scopedMilestones);
    setScopedMilestones([]);
    setScoperTitle("");
    setScoperDesc("");
  };

  return (
    <div id="escrow-management-root" className="space-y-8 animate-fade-in">
      
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight text-slate-800">
            Fiduciary Payment Escrow Dashboard
          </h2>
          <p className="text-xs text-slate-500">
            Lock secure funds, submit intermediate code revisions, and request vetted milestone releases under neutral escrow bounds.
          </p>
        </div>
        
        {/* Selector of Contract */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono tracking-wider font-bold text-slate-400">SELECT CONTRACT:</span>
          <select 
            id="contracts-dropdown-selector"
            value={selectedContractId}
            onChange={(e) => setSelectedContractId(e.target.value)}
            className="bg-white border border-slate-200 text-xs text-slate-700 py-1.5 px-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            {contracts.map(c => (
              <option key={c.id} value={c.id}>{c.title} ({c.clientName})</option>
            ))}
          </select>
        </div>
      </div>

      {selectedContract ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Columns: 2 Cols - Milestones Operations and Invoices */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Visual Contract Summary Stats */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block mb-1">
                    ACTIVE ESCROW SECURITY CODES
                  </span>
                  <h3 className="font-display font-extrabold text-lg text-slate-800 leading-tight">
                    {selectedContract.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Assuring payment safety with <span className="font-semibold text-slate-700">{selectedContract.clientName}</span>
                  </p>
                </div>
                
                <span className="text-xs font-semibold py-1 px-2.5 bg-emerald-50 text-emerald-800 border border-emerald-150 rounded font-mono">
                  🔒 DEPOSIT RECORD GUARANTEED
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-150/60">
                  <span className="text-[10px] uppercase font-mono font-bold text-slate-400 block mb-1">CONTRACT VALUE</span>
                  <span className="text-xl font-mono font-bold text-slate-800">${totalContractScopePrice.toLocaleString()}</span>
                </div>
                <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-150/50">
                  <span className="text-[10px] uppercase font-mono font-bold text-amber-500 block mb-1">HELD IN VAULT LOCK</span>
                  <span className="text-xl font-mono font-bold text-amber-800">${escrowLockedSum.toLocaleString()}</span>
                </div>
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-150/50">
                  <span className="text-[10px] uppercase font-mono font-bold text-emerald-500 block mb-1">RELEASED BALANCE</span>
                  <span className="text-xl font-mono font-bold text-emerald-850">${releasedSum.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Milestones Escrow Transitions Layout */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <h4 className="font-display font-semibold text-sm text-slate-800">
                  Interactive Milestone Escrow Matrix
                </h4>
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <ShieldCheck className="w-4 h-4 text-sky-500" />
                  <span>3-Way Handshake Escrow</span>
                </div>
              </div>

              <div className="divide-y divide-slate-100">
                {selectedContract.milestones.map((ms, index) => {
                  return (
                    <div id={`milestone-row-${ms.id}`} key={ms.id} className="p-5 flex flex-col sm:flex-row/60 justify-between items-start sm:items-center gap-4 hover:bg-slate-50/50 transition">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="w-5 h-5 rounded-full bg-slate-250 text-slate-600 flex items-center justify-center text-[10px] font-mono font-bold shrink-0">
                            M{index + 1}
                          </span>
                          <strong className="text-sm font-semibold text-slate-800 truncate">{ms.title}</strong>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-relaxed font-light mb-1.5">
                          {ms.description || "Agile contract deliverables specifications designated upon scoping integration."}
                        </p>
                        <span className="text-[10px] font-mono text-slate-400 block">Due payout date: {ms.dueDate}</span>
                      </div>

                      <div className="flex flex-col items-end gap-2.5 shrink-0 w-full sm:w-auto">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-800">${ms.amount}</span>
                          
                          {/* Rich Status labels */}
                          {ms.status === "released" && (
                            <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-0.5 rounded font-mono font-semibold flex items-center gap-1">
                              <Unlock className="w-3.5 h-3.5 text-emerald-600" /> UNLOCKED
                            </span>
                          )}
                          {ms.status === "submitted_review" && (
                            <span className="text-[10px] bg-sky-50 text-sky-800 border border-sky-200 px-2.5 py-0.5 rounded font-mono font-semibold flex items-center gap-1 animate-pulse">
                              <Clock className="w-3.5 h-3.5 text-sky-600" /> REVIEWING
                            </span>
                          )}
                          {ms.status === "escrowed" && (
                            <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded font-mono font-semibold flex items-center gap-1">
                              <Lock className="w-3.5 h-3.5 text-amber-600" /> DEPOSITED
                            </span>
                          )}
                          {ms.status === "pending" && (
                            <span className="text-[10px] bg-slate-100 text-slate-500 border border-slate-200 px-2.5 py-0.5 rounded font-mono">
                              UNFUNDED
                            </span>
                          )}
                        </div>

                        {/* Interactive Buttons for State Transitions */}
                        {ms.status === "escrowed" && (
                          <button
                            id={`submit-deliverable-${ms.id}`}
                            onClick={() => onMilestoneSubmit(selectedContract.id, ms.id)}
                            className="w-full sm:w-auto py-1.5 px-3 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded transition cursor-pointer"
                          >
                            Submit Deliverables for Review
                          </button>
                        )}
                        
                        {ms.status === "submitted_review" && (
                          <div className="flex gap-1.5 w-full sm:w-auto">
                            <button
                              id={`force-release-client-simulation-${ms.id}`}
                              onClick={() => onMilestoneRelease(selectedContract.id, ms.id)}
                              className="w-full sm:w-auto py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold rounded transition cursor-pointer flex items-center gap-1"
                            >
                              <Unlock className="w-3 h-3 text-emerald-350" /> Simulate Client Release
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Invoicing Center */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-display font-semibold text-sm text-slate-800">
                  Verified Invoicing Ledger
                </h3>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded font-mono">
                  0.00% PLATFORM FLAT FEES
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-55 border-b border-slate-150">
                      <th className="p-4 font-semibold text-slate-600">INVOICE SPEC</th>
                      <th className="p-4 font-semibold text-slate-600">MILESTONE CATEGORY</th>
                      <th className="p-4 font-semibold text-slate-600">TOTAL BILL</th>
                      <th className="p-4 font-semibold text-slate-600">DUE DATE</th>
                      <th className="p-4 font-semibold text-slate-600">STATUS</th>
                      <th className="p-4 font-semibold text-slate-600">AUDIT TOOL</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activeInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-xs text-slate-500">
                          No generated invoices logged for this contract pipeline yet.
                        </td>
                      </tr>
                    ) : (
                      activeInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50">
                          <td className="p-4 font-mono font-bold text-slate-800">{inv.id}</td>
                          <td className="p-4">
                            <span className="font-medium text-slate-800 block">{inv.title}</span>
                            <span className="text-[10px] text-slate-400 block font-light">Client: {inv.clientName}</span>
                          </td>
                          <td className="p-4 font-mono font-semibold text-slate-800">${inv.amount}</td>
                          <td className="p-4 font-mono text-slate-500">{inv.dueDate}</td>
                          <td className="p-4">
                            <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                              inv.status === "paid" 
                                ? "bg-emerald-50 border border-emerald-100 text-emerald-700" 
                                : "bg-amber-50 border border-amber-100 text-amber-700 animate-pulse"
                            }`}>
                              • {inv.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <button
                              id={`open-audited-invoice-${inv.id}`}
                              onClick={() => setSelectedInvoice(inv)}
                              className="py-1 px-2.5 hover:bg-slate-100 rounded border border-slate-250 text-[10px] font-semibold text-slate-600 transition flex items-center gap-1 cursor-pointer"
                            >
                              <FileText className="w-3 h-3 text-slate-400" /> Inspect Visual Invoice
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* Right Column: 1 Col - AI Milestone Scoper Widget */}
          <div className="lg:col-span-1 space-y-6">
            
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-slate-100 rounded-xl p-6 shadow-md border border-slate-800 space-y-5">
              <div className="flex items-center gap-1.5 border-b border-indigo-800 pb-3">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <h4 className="font-display font-bold text-xs uppercase tracking-wider text-white">
                  Gemini Agile Contract Scoper
                </h4>
              </div>

              <p className="text-xs text-slate-300 font-light leading-relaxed">
                Enter your prospective project details. Our AI scoper will automatically break down the overall budget into secure milestones and structure precise agiley-compliant scopes representing healthy payment stages.
              </p>

              <form onSubmit={handleScopeMilestones} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-indigo-300 font-bold block uppercase">PROSPECTIVE TITLE</label>
                  <input
                    id="scoper-job-title"
                    type="text"
                    required
                    placeholder="e.g. E-Commerce Redesign"
                    value={scoperTitle}
                    onChange={(e) => setScoperTitle(e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 border border-indigo-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs font-sans focus:outline-none placeholder-indigo-100/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-indigo-300 font-bold block uppercase">TOTAL RAW BUDGET ($)</label>
                  <input
                    id="scoper-budget-amount"
                    type="number"
                    required
                    placeholder="3000"
                    value={scoperBudget}
                    onChange={(e) => setScoperBudget(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-950 text-slate-100 border border-indigo-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs font-mono focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono text-indigo-300 font-bold block uppercase">DELIVERABLES SCOPE DETAILS</label>
                  <textarea
                    id="scoper-job-desc"
                    required
                    rows={4}
                    placeholder="What does the client expect you to develop and compile..."
                    value={scoperDesc}
                    onChange={(e) => setScoperDesc(e.target.value)}
                    className="w-full bg-slate-950 text-slate-100 border border-indigo-800 focus:border-indigo-500 rounded-lg p-2.5 text-xs font-sans focus:outline-none placeholder-indigo-100/20 leading-relaxed"
                  />
                </div>

                <button
                  id="submit-ai-scoper-btn"
                  type="submit"
                  disabled={loadingScope || !scoperTitle || !scoperDesc}
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-5050 text-white hover:bg-indigo-500 text-xs font-semibold rounded-lg font-mono transition flex items-center justify-center gap-1.5 cursor-pointer disabled:bg-slate-800 disabled:text-slate-500"
                >
                  {loadingScope ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-indigo-300" /> Computing Roadmaps...
                    </>
                  ) : (
                    <>
                      Deconstruct and Struct <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
                    </>
                  )}
                </button>
              </form>

              {/* Scope Breakdown Result displays dynamically */}
              {scopedMilestones.length > 0 && (
                <div id="ai-preset-milestone-panel" className="mt-4 pt-4 border-t border-indigo-800 space-y-3.5 animate-fade-in text-xs">
                  {scoperEngine && (
                    <span className="text-[9px] font-mono text-indigo-300 bg-indigo-950/75 p-1 rounded border border-indigo-900 block text-center">
                      {scoperEngine}
                    </span>
                  )}
                  
                  <span className="font-semibold text-white block">Suggested Escrow Roadmap:</span>
                  <div className="space-y-2">
                    {scopedMilestones.map((ms, id) => (
                      <div key={ms.id || id} className="bg-slate-950/80 p-2.5 rounded border border-indigo-900">
                        <div className="flex justify-between font-mono font-bold text-white mb-1">
                          <span className="truncate max-w-[120px]">{ms.title}</span>
                          <span>${ms.amount}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-light leading-normal line-clamp-2">{ms.description}</p>
                        <span className="text-[9px] font-mono text-indigo-400 block mt-1">Estim: {ms.dueDate}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    id="import-scoped-milestones-btn"
                    onClick={handleImportScope}
                    className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] uppercase font-bold rounded transit flex items-center justify-center gap-1 cursor-pointer font-mono"
                  >
                    Import Scope into Active Contract →
                  </button>
                </div>
              )}

            </div>

          </div>

        </div>
      ) : (
        <div className="py-24 text-center bg-white border border-slate-200 rounded-xl space-y-3">
          <Layers className="w-12 h-12 text-slate-350 mx-auto" />
          <p className="text-xs text-slate-600">Please choose a job contract code representation from the dropdown list above.</p>
        </div>
      )}

      {/* Printable visual modal representing detailed invoice (PDF styling) */}
      {selectedInvoice && (
        <div id="invoice-modal-backdrop" className="fixed inset-0 bg-slate-900/65 flex items-center justify-center z-50 p-4 transition-all">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl relative border border-slate-250 animate-scale-up">
            
            {/* Header Controls */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <span className="text-xs font-mono font-semibold text-slate-500 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                SECURED INVOICE SYSTEM ID: {selectedInvoice.id}
              </span>
              <div className="flex items-center gap-2">
                <button
                  id="print-invoice-btn"
                  onClick={() => window.print()}
                  className="py-1 px-2.5 bg-slate-100 hover:bg-slate-200 hover:text-slate-800 text-slate-600 rounded text-[11px] font-semibold transition inline-flex items-center gap-1 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Layout
                </button>
                <button
                  id="close-invoice-modal"
                  onClick={() => setSelectedInvoice(null)}
                  className="h-7 w-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center cursor-pointer transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Print Area Material */}
            <div className="p-8 space-y-8 text-xs text-slate-700 print:text-black print:p-0">
              
              {/* Header Invoice Meta */}
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-display font-extrabold text-lg text-slate-900 tracking-tight leading-none mb-1">
                    FREELANCESUITE
                  </h5>
                  <span className="text-[9px] font-mono uppercase tracking-widest text-slate-400 font-bold block">
                    Secured Operations Node
                  </span>
                </div>
                <div className="text-right">
                  <h4 className="font-display font-extrabold text-xl text-slate-900 tracking-tight mb-1">INVOICE</h4>
                  <span className="text-xs font-mono block text-slate-500 font-semibold">{selectedInvoice.id}</span>
                </div>
              </div>

              {/* Addresses section */}
              <div className="grid grid-cols-2 gap-8 border-t border-b border-slate-150 py-6">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase mb-1.5">FROM: (Freelance Tech partner)</span>
                  <strong className="text-sm font-semibold text-slate-800 block mb-0.5">{profile.name}</strong>
                  <span className="text-slate-500 block font-light">{profile.title}</span>
                  <span className="text-slate-500 block font-light">{profile.location}</span>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 font-bold block uppercase mb-1.5">BILL TO: (Client Partner)</span>
                  <strong className="text-sm font-semibold text-slate-800 block mb-0.5">{selectedInvoice.clientName}</strong>
                  <span className="text-slate-500 block font-light">{selectedContract?.title}</span>
                  <span className="text-slate-500 block font-light">Escrow Account Verified</span>
                </div>
              </div>

              {/* Dates Row */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block mb-0.5">DATE OF ISSUE:</span>
                  <strong className="font-mono text-slate-800">{selectedInvoice.issuedDate}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block mb-0.5">DUE DATE:</span>
                  <strong className="font-mono text-slate-800">{selectedInvoice.dueDate}</strong>
                </div>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block mb-0.5">PAYMENT CONDITION:</span>
                  <strong className="font-mono text-indigo-600 font-bold">Secure Escrow Lock</strong>
                </div>
              </div>

              {/* Line items table */}
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b-2 border-slate-200">
                    <th className="py-2.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px]">Description</th>
                    <th className="py-2.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px] text-right">Quantity / Unit</th>
                    <th className="py-2.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px] text-right">Raw Rate</th>
                    <th className="py-2.5 font-semibold text-slate-400 uppercase tracking-wider text-[10px] text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-4">
                      <strong className="font-semibold text-slate-800 block">{selectedInvoice.title}</strong>
                      <span className="text-[11px] text-slate-400 font-light mt-0.5">Approved production deliverables verified in Freelance Workspace</span>
                    </td>
                    <td className="py-4 text-right font-mono">1.0 Scope</td>
                    <td className="py-4 text-right font-mono">${selectedInvoice.amount}</td>
                    <td className="py-4 text-right font-mono font-bold text-slate-800">${selectedInvoice.amount}</td>
                  </tr>
                </tbody>
              </table>

              {/* Calculations block */}
              <div className="flex justify-end pt-4 border-t border-slate-150">
                <div className="w-64 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-light">Subtotal Amount:</span>
                    <span className="font-mono font-semibold">${selectedInvoice.amount}</span>
                  </div>
                  <div className="flex justify-between text-emerald-600">
                    <span className="font-medium">Platform Fee Discount (0%):</span>
                    <span className="font-mono font-bold">-$0.00</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 pt-2 text-sm">
                    <strong className="font-extrabold text-slate-900">Total Invoice Bill:</strong>
                    <strong className="font-mono font-black text-slate-900">${selectedInvoice.amount}</strong>
                  </div>
                </div>
              </div>

              {/* Instructions and Bank Seal details */}
              <div className="pt-6 border-t border-slate-150 space-y-3">
                <p className="text-[11px] text-slate-500 font-light leading-relaxed">
                  Notice: This invoice serves as a receipt of fiduciary funds held inside neutrality vaults. Invoiced payouts are released directly into your checking account instantly via local transaction interfaces.
                </p>
                <div className="flex justify-between items-center bg-slate-50 p-4 border border-slate-150 rounded-xl">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-mono">FINANCIAL ESCROW STATUS:</span>
                    <strong className={`text-xs uppercase font-mono font-bold ${selectedInvoice.status === "paid" ? "text-emerald-600" : "text-amber-500 font-semibold"}`}>
                      {selectedInvoice.status === "paid" ? "✓ ESCROWED PAYMENT DISPATCHED SUCCESSFULLY" : "PENDING EXPLICIT TRANSIT LOCK REVISIONS"}
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-mono">PAYMENT AGENT:</span>
                    <strong className="text-xs text-slate-800 font-semibold">FreelanceSuite Vault Routing</strong>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
