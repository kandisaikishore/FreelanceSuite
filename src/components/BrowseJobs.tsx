import React, { useState } from "react";
import { 
  Search, 
  MapPin, 
  Sparkles, 
  Clock, 
  CheckCircle, 
  ArrowRight, 
  Loader2, 
  Briefcase, 
  ArrowUpRight,
  TrendingUp,
  AlertCircle,
  FileSignature,
  ChevronLeft
} from "lucide-react";
import { FreelancerProfile, Job } from "../types";

interface BrowseJobsProps {
  jobs: Job[];
  profile: FreelancerProfile;
  onApply: (jobId: string, coverLetter: string, rate: number, estDays: number) => void;
  geminiActive: boolean;
}

export default function BrowseJobs({ jobs, profile, onApply, geminiActive }: BrowseJobsProps) {
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0]?.id || "");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [mobileShowDetail, setMobileShowDetail] = useState<boolean>(false);
  
  // Proposal editor states
  const [loadingProposal, setLoadingProposal] = useState<boolean>(false);
  const [generatedLetter, setGeneratedLetter] = useState<string>("");
  const [customRate, setCustomRate] = useState<number>(profile.hourlyRate);
  const [estDays, setEstDays] = useState<number>(5);
  const [apiInfo, setApiInfo] = useState<string>("");

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  // Filters
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
                          
    const matchesCategory = activeCategory === "all" || 
                            (activeCategory === "web-dev" && job.category === "web-dev") ||
                            (activeCategory === "design" && job.category === "design") ||
                            (activeCategory === "writing" && job.category === "writing") ||
                            (activeCategory === "mobile" && job.category === "mobile");
                            
    return matchesSearch && matchesCategory;
  });

  const generateAIProposal = async () => {
    if (!selectedJob) return;
    setLoadingProposal(true);
    setApiInfo("");
    
    try {
      const response = await fetch("/api/proposal/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: selectedJob.title,
          jobDescription: selectedJob.description,
          clientName: selectedJob.clientName,
          freelancerProfile: profile
        })
      });
      
      const data = await response.json();
      if (data.coverLetter) {
        setGeneratedLetter(data.coverLetter);
        setCustomRate(data.proposedRate || profile.hourlyRate);
        setEstDays(data.estimatedDays || 8);
        setApiInfo(data.engine === "Gemini 3.5 Flash" 
          ? "Successfully drafted pitch with Gemini 3.5 Flash" 
          : "Drafted using high-fidelity Local Pitch template"
        );
      } else {
        setGeneratedLetter("Failed to generate custom blueprint. Fallback code failed.");
      }
    } catch (err) {
      console.error(err);
      setGeneratedLetter("Local server offline or timeout. Please check console logs.");
    } finally {
      setLoadingProposal(false);
    }
  };

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJob || !generatedLetter.trim()) return;
    
    onApply(selectedJob.id, generatedLetter, customRate, estDays);
    setGeneratedLetter("");
  };

  return (
    <div id="browse-jobs-tab-root" className="space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight text-slate-800">
            Find Work & Apply Instant Bids
          </h2>
          <p className="text-xs text-slate-500">
            Browse highly curated digital jobs matching your profile. Check alignment, draft safe escrows, and pitch using AI tools.
          </p>
        </div>
        
        {/* Gemini engine info tag */}
        <div className="flex items-center gap-1.5 self-start md:self-auto bg-slate-100 border border-slate-200/60 py-1.5 px-3 rounded-lg text-[11px] font-mono">
          <span className={`w-2 h-2 rounded-full ${geminiActive ? 'bg-emerald-500' : 'bg-amber-400'}`}></span>
          <span className="text-slate-600">Gemini 3.5 AI Coprocessor: </span>
          <strong className="text-slate-800 font-bold">{geminiActive ? "OPERATIONAL" : "SECURE FALLBACK"}</strong>
        </div>
      </div>

      {/* Filter Matrix */}
      <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            id="job-search-input"
            type="text" 
            placeholder="Search matching projects, client brands or skills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-lg"
          />
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          {[
            { id: "all", label: "All Categories" },
            { id: "web-dev", label: "Web Dev" },
            { id: "design", label: "UI/UX Design" },
            { id: "writing", label: "Writing" },
            { id: "mobile", label: "Mobile Apps" }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer transition ${
                activeCategory === cat.id 
                  ? "bg-slate-900 text-white shadow-sm" 
                  : "bg-slate-100 hover:bg-slate-200/70 text-slate-600 text-xs"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: 5 Cols - Job Cards List */}
        <div className={`lg:col-span-5 space-y-4 max-h-[70vh] overflow-y-auto pr-1 ${
          mobileShowDetail ? "hidden lg:block" : "block"
        }`}>
          <span className="px-1 text-[10px] font-mono uppercase tracking-widest text-slate-450 font-bold block">
            Matching Projects ({filteredJobs.length})
          </span>
          {filteredJobs.length === 0 ? (
            <div className="text-center py-12 bg-white border border-slate-200 rounded-xl">
              <p className="text-xs text-slate-500">No jobs match your active filters or query. Try another keyword!</p>
            </div>
          ) : (
            filteredJobs.map(job => {
              const matchedCount = job.skills.filter(s => profile.skills.includes(s)).length;
              const matchPercent = Math.round((matchedCount / job.skills.length) * 100);
              const isSelected = selectedJobId === job.id;
              
              return (
                <div 
                  id={`job-card-${job.id}`}
                  key={job.id}
                  onClick={() => {
                    setSelectedJobId(job.id);
                    setGeneratedLetter(""); // clean states
                    setApiInfo("");
                    setMobileShowDetail(true);
                  }}
                  className={`p-5 bg-white border rounded-xl cursor-pointer transition-all ${
                    isSelected 
                      ? "ring-2 ring-sky-500/85 border-sky-400 shadow-md shadow-sky-50/20" 
                      : "border-slate-200 hover:border-slate-350 hover:shadow-sm"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-display font-semibold text-sm text-slate-800 line-clamp-1">{job.title}</h3>
                      <span className="text-[10px] text-slate-400 block font-mono">{job.clientCompany}</span>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-700 bg-slate-50 border border-slate-200/60 px-2 py-0.5 rounded">
                      ${job.budget.toLocaleString()}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-500 leading-normal line-clamp-2 mb-4">
                    {job.description}
                  </p>

                  <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
                    <div className="flex gap-1 overflow-hidden">
                      {job.skills.slice(0, 2).map(skill => (
                        <span key={skill} className="bg-slate-100 text-slate-600 text-[9px] px-1.5 py-0.5 rounded">
                          {skill}
                        </span>
                      ))}
                      {job.skills.length > 2 && (
                        <span className="text-[9px] text-slate-400 px-1 py-0.5">+{job.skills.length - 2}</span>
                      )}
                    </div>
                    
                    <div className="flex items-end flex-col shrink-0">
                      {job.status === "open" ? (
                        <span className="text-[9px] font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded font-bold">
                          {matchPercent > 50 ? `★ ${matchPercent}% MATCH` : "OPEN"}
                        </span>
                      ) : (
                        <span className="text-[9px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded font-bold uppercase">
                          • {job.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Side: 7 Cols - Detailed Selected Job Operations */}
        <div id="detailed-job-view-pane" className={`lg:col-span-7 ${
          mobileShowDetail ? "block" : "hidden lg:block"
        }`}>
          {selectedJob ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-6">
              
              {/* Back button on mobile */}
              <div className="lg:hidden px-6 pt-6">
                <button
                  id="mobile-proposal-back-btn"
                  type="button"
                  onClick={() => setMobileShowDetail(false)}
                  className="bg-slate-150 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 px-4 rounded-lg inline-flex items-center gap-1.5 cursor-pointer transition w-full justify-center border border-slate-200"
                >
                  <ChevronLeft className="w-4 h-4" /> Back to matching list ({filteredJobs.length})
                </button>
              </div>

              {/* Header Info */}
              <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="space-y-1">
                    <h3 className="font-display font-extrabold text-base text-slate-800 leading-tight">
                      {selectedJob.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">{selectedJob.clientCompany}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-sky-500" /> Remote (U.S.)
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-right shrink-0">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono font-bold block mb-0.5">Contract Budget</span>
                    <span className="text-lg font-mono font-bold text-slate-900">${selectedJob.budget.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  {selectedJob.skills.map(skill => {
                    const matched = profile.skills.includes(skill);
                    return (
                      <span 
                        key={skill} 
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                          matched 
                            ? "bg-sky-50 text-sky-700 border-sky-200 font-bold" 
                            : "bg-slate-100 text-slate-500 border-slate-200"
                        }`}
                      >
                        {skill} {matched && "✓"}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Job Details and AI Bidding Tab */}
              <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                
                <div>
                  <h4 className="text-xs font-mono uppercase font-bold tracking-wider text-slate-400 mb-2">Project Overview</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-light">
                    {selectedJob.description}
                  </p>
                </div>

                {/* Client Profile Context */}
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img 
                      src={selectedJob.clientAvatar} 
                      alt={selectedJob.clientName} 
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-250"
                    />
                    <div>
                      <span className="text-xs font-semibold text-slate-800 block">{selectedJob.clientName}</span>
                      <span className="text-[10px] text-slate-400 block">Verified Fiduciary Depositor</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-800 font-bold block">★★★★★ 5.0</span>
                    <span className="text-[9px] text-slate-400 block">3 Completed projects</span>
                  </div>
                </div>

                {/* AI Bid Interface */}
                {selectedJob.status === "open" && (
                  <div id="ai-bid-composer-container" className="pt-6 border-t border-slate-100 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4.5 h-4.5 text-sky-500 shrink-0" />
                        <h5 className="font-display font-semibold text-xs text-slate-800">
                          Copilot Freelance Proposal Spec Generator
                        </h5>
                      </div>
                      
                      {!generatedLetter && (
                        <button
                          id="trigger-ai-generator-btn"
                          onClick={generateAIProposal}
                          disabled={loadingProposal}
                          className="py-1.5 px-3 bg-sky-50 hover:bg-sky-100 text-sky-700 hover:text-sky-800 border border-sky-200 rounded-lg text-[10px] font-bold font-mono transition flex items-center gap-1 cursor-pointer"
                        >
                          {loadingProposal ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" /> Composing...
                            </>
                          ) : (
                            <>
                              Generate Custom Bid <Sparkles className="w-3 h-3 text-sky-500" />
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {loadingProposal ? (
                      <div className="p-8 bg-slate-50 border border-slate-200 border-dashed rounded-xl space-y-3 flex flex-col items-center">
                        <Loader2 className="w-7 h-7 text-sky-500 animate-spin" />
                        <div className="text-center">
                          <p className="text-xs font-semibold text-slate-700 mb-0.5">Gemini Coprocessor drafting pitch...</p>
                          <span className="text-[10px] text-slate-400">Merging skill indices and scoping optimal milestones.</span>
                        </div>
                      </div>
                    ) : generatedLetter ? (
                      <form onSubmit={handleApplySubmit} className="space-y-4 animate-fade-in">
                        {apiInfo && (
                          <div id="proposal-meta-alert" className="text-[10px] bg-slate-100 border border-slate-200 p-2 rounded-lg font-mono flex items-center gap-1.5 text-slate-600">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            {apiInfo}
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <label className="text-[10px] font-mono text-slate-400 font-bold block uppercase">Custom cover letter pitch</label>
                          <textarea
                            id="cover-letter-textarea"
                            value={generatedLetter}
                            onChange={(e) => setGeneratedLetter(e.target.value)}
                            rows={8}
                            className="w-full bg-slate-50 border border-slate-200 p-3.5 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-lg leading-relaxed font-sans"
                            placeholder="Draft cover letter..."
                            required
                          />
                        </div>

                        {/* Financial and time estimates */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-mono text-slate-400 font-bold block uppercase mb-1">Bid Hourly Rate ($)</label>
                            <input 
                              id="bid-rate-input"
                              type="number"
                              value={customRate}
                              onChange={(e) => setCustomRate(parseInt(e.target.value) || profile.hourlyRate)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white"
                              required
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-mono text-slate-400 font-bold block uppercase mb-1">Estimated Days</label>
                            <input 
                              id="bid-days-input"
                              type="number"
                              value={estDays}
                              onChange={(e) => setEstDays(parseInt(e.target.value) || 5)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono text-slate-800 focus:bg-white"
                              required
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                          <button
                            id="reset-proposal-btn"
                            type="button"
                            onClick={() => setGeneratedLetter("")}
                            className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200/85 text-slate-600 text-xs font-semibold rounded-lg transition cursor-pointer"
                          >
                            Reset Draft
                          </button>
                          
                          <button
                            id="apply-for-job-submit"
                            type="submit"
                            className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-850 text-white font-semibold text-xs rounded-lg transition inline-flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                          >
                            Submit Lock Bid & Start Negotiation <ArrowRight className="w-4 h-4 text-sky-400" />
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="p-6 bg-slate-50 border border-slate-200 border-dashed rounded-xl text-center space-y-3">
                        <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                          You haven't initiated a pitch blueprint for this job yet. Let the built-in Gemini AI build a custom, security-compliant proposal based on your skills!
                        </p>
                        <button
                          id="trigger-proposal-scoper-btn"
                          onClick={generateAIProposal}
                          className="py-2 px-4 bg-slate-900 hover:bg-slate-850 text-white font-semibold text-xs rounded-lg inline-flex items-center gap-1.5 transition cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-sky-400" /> Auto-Compose Pitch Blueprint
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* Applied status details */}
                {selectedJob.status === "applied" && (
                  <div id="applied-state-notice" className="pt-6 border-t border-slate-100 space-y-4">
                    <div className="p-4 bg-emerald-50 border border-emerald-150 rounded-xl flex items-start gap-3 text-emerald-800 text-xs">
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                      <div className="space-y-1 leading-normal">
                        <strong className="font-semibold block text-emerald-900">Bid Submitted Successfully!</strong>
                        <p className="font-light">Negotiation protocol is warm. We simulated an incoming interview trigger. Click below to enter the direct chat or adapt your milestones matrix!</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="py-24 text-center bg-white border border-slate-200 rounded-xl space-y-3">
              <Briefcase className="w-12 h-12 text-slate-350 mx-auto" />
              <p className="text-xs text-slate-600">Please choose a job contract code representation from the roster to view details.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
