import React, { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar";
import DashboardOverview from "./components/DashboardOverview";
import BrowseJobs from "./components/BrowseJobs";
import MilestoneEscrow from "./components/MilestoneEscrow";
import ClientChat from "./components/ClientChat";
import ProjectBoard from "./components/ProjectBoard";

import { 
  FreelancerProfile, 
  Job, 
  Contract, 
  Chat, 
  ProjectTask, 
  Invoice, 
  Milestone,
  Message
} from "./types";

import { 
  initialProfile, 
  initialJobs, 
  initialContracts, 
  initialChats, 
  initialTasks, 
  initialInvoices 
} from "./mockData";
import { Sliders, X, ShieldCheck, CheckCircle, Award, Sparkles, Menu } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [geminiActive, setGeminiActive] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  // Core Global States
  const [profile, setProfile] = useState<FreelancerProfile>(initialProfile);
  const [jobs, setJobs] = useState<Job[]>(initialJobs);
  const [contracts, setContracts] = useState<Contract[]>(initialContracts);
  const [chats, setChats] = useState<Chat[]>(initialChats);
  const [tasks, setTasks] = useState<ProjectTask[]>(initialTasks);
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);
  const [earnings, setEarnings] = useState<number>(1450);

  // Profile Customizer Spec Drawer
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);
  const [profileFormName, setProfileFormName] = useState<string>(profile.name);
  const [profileFormTitle, setProfileFormTitle] = useState<string>(profile.title);
  const [profileFormRate, setProfileFormRate] = useState<number>(profile.hourlyRate);
  const [profileFormBio, setProfileFormBio] = useState<string>(profile.bio);
  const [profileFormSkills, setProfileFormSkills] = useState<string>(profile.skills.join(", "));

  // Automated notification banners
  const [systemAlert, setSystemAlert] = useState<{ type: 'success' | 'info'; title: string; desc: string } | null>(null);

  // Detect Gemini API status on mount
  useEffect(() => {
    fetch("/api/status")
      .then(r => r.json())
      .then(data => {
        setGeminiActive(data.geminiActive);
      })
      .catch(err => {
        console.warn("Could not check server API status:", err);
      });
  }, []);

  // Compute total locked escrow amount across all active contracts
  const escrowTotal = contracts.reduce((sum, c) => {
    if (c.status !== "active") return sum;
    const lockedMilestones = c.milestones.filter(m => m.status === "escrowed" || m.status === "submitted_review");
    return sum + lockedMilestones.reduce((mSum, m) => mSum + m.amount, 0);
  }, 0);

  // Trigger brief alert banners
  const triggerSystemAlert = (type: 'success' | 'info', title: string, desc: string) => {
    setSystemAlert({ type, title, desc });
    setTimeout(() => {
      setSystemAlert(null);
    }, 5500);
  };

  // Profile Editor Save
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedSkills = profileFormSkills.split(",").map(s => s.trim()).filter(s => s.length > 0);
    setProfile({
      ...profile,
      name: profileFormName,
      title: profileFormTitle,
      hourlyRate: profileFormRate,
      bio: profileFormBio,
      skills: updatedSkills
    });
    setIsProfileOpen(false);
    triggerSystemAlert("success", "Specification Updated", "Your freelance profile index has been successfully recalibrated.");
  };

  // Bid Applied Simulator Flow
  const handleApplyForJob = (jobId: string, coverLetter: string, rate: number, estDays: number) => {
    // 1. Update job status to 'applied'
    setJobs(prevJobs => prevJobs.map(job => {
      if (job.id === jobId) {
        return {
          ...job,
          status: "applied",
          proposal: {
            coverLetter,
            proposedRate: rate,
            estimatedDays: estDays,
            generatedAt: new Date().toISOString()
          }
        };
      }
      return job;
    }));

    const appliedJob = jobs.find(j => j.id === jobId);
    if (!appliedJob) return;

    triggerSystemAlert("info", "Bid Pitch Submitted", `Custom proposal dispatched successfully to ${appliedJob.clientName}.`);

    // 2. Cascade simulation: Client responds over chat in 3 seconds!
    setTimeout(() => {
      // Find or create chat sequence with this client
      const chatSlug = appliedJob.clientName.toLowerCase().split(" ")[0] || "client";
      
      const newChatMessage: Chat = {
        id: chatSlug,
        clientName: appliedJob.clientName,
        clientAvatar: appliedJob.clientAvatar,
        clientTitle: `Product Director, ${appliedJob.clientCompany}`,
        persona: `He is eager to collaborate, focused on details for the '${appliedJob.title}' project, and wants to lock milestones soon.`,
        messages: [
          {
            id: `sys-msg-${Date.now()}`,
            sender: "system",
            text: `🔒 Compliant handshake secure channel initiated regarding project "${appliedJob.title}".`,
            timestamp: new Date().toISOString()
          },
          {
            id: `client-msg-${Date.now()}`,
            sender: "client",
            text: `Hi ${profile.name}! Thanks for submitting your detailed pitch for the "${appliedJob.title}" project. I reviewed your proposal, and your action steps look perfect.\n\nI want to get started immediately. I have locked the total project budget of $${appliedJob.budget} into safe milestone escrows! Let's connect over chat to review the outline or assign sprint tasks!`,
            timestamp: new Date().toISOString()
          }
        ]
      };

      setChats(prev => {
        const index = prev.findIndex(c => c.id === chatSlug);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = {
            ...updated[index],
            messages: [...updated[index].messages, ...newChatMessage.messages]
          };
          return updated;
        } else {
          return [newChatMessage, ...prev];
        }
      });

      // 3. Create active Contract automatically!
      const newContractId = `contract-${Date.now()}`;
      const newContract: Contract = {
        id: newContractId,
        jobId: appliedJob.id,
        title: appliedJob.title,
        clientName: appliedJob.clientName,
        clientAvatar: appliedJob.clientAvatar,
        status: "active",
        totalAmount: appliedJob.budget,
        escrowBalance: appliedJob.budget,
        milestones: [
          {
            id: `ms-${Date.now()}-1`,
            title: "Discovery & Blueprint Strategy",
            amount: Math.round(appliedJob.budget * 0.3),
            status: "escrowed",
            dueDate: "In 3 Days"
          },
          {
            id: `ms-${Date.now()}-2`,
            title: "Core Implementation Deliverable",
            amount: Math.round(appliedJob.budget * 0.5),
            status: "escrowed",
            dueDate: "In 10 Days"
          },
          {
            id: `ms-${Date.now()}-3`,
            title: "Testing, Hardening & Handover",
            amount: Math.round(appliedJob.budget * 0.2),
            status: "escrowed",
            dueDate: "In 16 Days"
          }
        ]
      };

      setContracts(prev => [newContract, ...prev]);

      // 4. Update job to 'hired'
      setJobs(prevJobs => prevJobs.map(job => {
        if (job.id === jobId) {
          return { ...job, status: "hired" };
        }
        return job;
      }));

      // 5. Generate template invoices
      const newInvoices: Invoice[] = [
        {
          id: `inv-sim-${Date.now()}-1`,
          contractId: newContractId,
          milestoneId: `ms-${Date.now()}-1`,
          title: "Discovery & Blueprint Strategy",
          clientName: appliedJob.clientName,
          amount: Math.round(appliedJob.budget * 0.3),
          issuedDate: new Date().toISOString().split("T")[0],
          dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
          status: "pending"
        }
      ];
      setInvoices(prev => [...newInvoices, ...prev]);

      // 6. Generate starting sprint tasks on the board
      const starterTasks: ProjectTask[] = [
        {
          id: `task-sim-${Date.now()}-1`,
          contractId: newContractId,
          title: "Draft discovery system requirements specification",
          description: "Outline security protocols, API payloads, and database fields.",
          priority: "high",
          column: "todo"
        },
        {
          id: `task-sim-${Date.now()}-2`,
          contractId: newContractId,
          title: "Setup modern tailwind scaffold template",
          description: "Initialize client codebase repository with necessary typography rules.",
          priority: "medium",
          column: "in_progress"
        }
      ];
      setTasks(prev => [...starterTasks, ...prev]);

      triggerSystemAlert("success", "Hiring Contract Activated", `${appliedJob.clientName} approved your bid! Escrow locked and Slack chat initiated.`);
    }, 3800);
  };

  // Submit Deliverable for Review
  const handleMilestoneSubmit = (contractId: string, milestoneId: string) => {
    // 1. Update milestone status to 'submitted_review'
    setContracts(prevContracts => prevContracts.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          milestones: c.milestones.map(m => {
            if (m.id === milestoneId) {
              return { ...m, status: "submitted_review" };
            }
            return m;
          })
        };
      }
      return c;
    }));

    const contract = contracts.find(c => c.id === contractId);
    const ms = contract?.milestones.find(m => m.id === milestoneId);
    if (!contract || !ms) return;

    triggerSystemAlert("info", "Deliverable Submitted", `Milestone deliverables compiled and sent to ${contract.clientName} for verification.`);

    // 2. Client reviews and auto-releases in 4.5 seconds with text trigger!
    setTimeout(() => {
      const activeMsLatest = contracts.find(c => c.id === contractId)?.milestones.find(m => m.id === milestoneId);
      // safety check if already released manually
      if (activeMsLatest && activeMsLatest.status === "released") return;

      handleMilestoneRelease(contractId, milestoneId);

      // Add chat confirmation
      const chatSlug = contract.clientName.toLowerCase().split(" ")[0] || "client";
      const botMessage: Message = {
        id: `bot-msg-${Date.now()}`,
        sender: "client",
        text: `Hi Alex! Just reviewed your deliverables for "${ms.title}". Everything checks out beautifully. Excellent engineering quality!\n\nI have authorized the FreelanceSuite Vault to unlock and release the $${ms.amount} installment to your balance. Cheers!`,
        timestamp: new Date().toISOString()
      };

      setChats(prev => prev.map(ch => {
        if (ch.id === chatSlug) {
          return {
            ...ch,
            messages: [...ch.messages, botMessage]
          };
        }
        return ch;
      }));

    }, 4500);
  };

  // Unlock Escrow Milestone & payout
  const handleMilestoneRelease = (contractId: string, milestoneId: string) => {
    let releasedAmount = 0;
    
    // 1. Transition milestone status
    setContracts(prevContracts => prevContracts.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          milestones: c.milestones.map(m => {
            if (m.id === milestoneId && m.status !== "released") {
              releasedAmount = m.amount;
              return { ...m, status: "released" };
            }
            return m;
          })
        };
      }
      return c;
    }));

    if (releasedAmount > 0) {
      // 2. Increase earnings
      setEarnings(prev => prev + releasedAmount);
      
      // 3. Mark corresponding invoice as paid
      setInvoices(prevInvoices => prevInvoices.map(inv => {
        if (inv.contractId === contractId && inv.milestoneId === milestoneId) {
          return { ...inv, status: "paid" };
        }
        return inv;
      }));

      const activeC = contracts.find(c => c.id === contractId);
      const activeM = activeC?.milestones.find(m => m.id === milestoneId);

      triggerSystemAlert("success", "Payout Released Successfully", `$${releasedAmount} unlocked from Escrow Vault and posted to your balance.`);
    }
  };

  // Import custom AI Scoped milestones
  const handleImportMilestones = (contractId: string, newMilestones: Milestone[]) => {
    setContracts(prev => prev.map(c => {
      if (c.id === contractId) {
        return {
          ...c,
          totalAmount: newMilestones.reduce((s, m) => s + m.amount, 0),
          milestones: newMilestones
        };
      }
      return c;
    }));

    // Update invoices corresponding to these
    const newInvoices: Invoice[] = newMilestones.map((ms, index) => ({
      id: `inv-sc-new-${Date.now()}-${index}`,
      contractId,
      milestoneId: ms.id,
      title: ms.title,
      clientName: contracts.find(c => c.id === contractId)?.clientName || "Client",
      amount: ms.amount,
      issuedDate: new Date().toISOString().split("T")[0],
      dueDate: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      status: ms.status === "released" ? "paid" : "pending"
    }));

    setInvoices(prev => [...newInvoices, ...prev]);
    triggerSystemAlert("success", "Agile Roadmap Imported", "Vetted AI milestone values successfully mapped into active payment ledgers.");
  };

  // Task Handlers
  const handleAddTask = (newTask: Omit<ProjectTask, "id">) => {
    const task: ProjectTask = {
      ...newTask,
      id: `task-new-${Date.now()}`
    };
    setTasks(prev => [...prev, task]);
    triggerSystemAlert("success", "Task Created", "A new card has been posted to your Kanban sprint board.");
  };

  const handleMoveTask = (taskId: string, targetCol: ProjectTask["column"]) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return { ...t, column: targetCol };
      }
      return t;
    }));
  };

  const handleDeleteTask = (taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    triggerSystemAlert("info", "Task Discarded", "Task card has been purged from your board roster.");
  };

  // Direct Message Sending from chat form
  const handleSendMessage = (chatId: string, text: string) => {
    const freshMessage = {
      id: `msg-sent-${Date.now()}`,
      sender: "freelancer" as const,
      text,
      timestamp: new Date().toISOString()
    };

    setChats(prev => prev.map(ch => {
      if (ch.id === chatId) {
        return {
          ...ch,
          messages: [...ch.messages, freshMessage]
        };
      }
      return ch;
    }));
  };

  // Appending received API response from simulation
  const handleReceiveMessage = (chatId: string, text: string) => {
    const freshMessage = {
      id: `msg-received-${Date.now()}`,
      sender: "client" as const,
      text,
      timestamp: new Date().toISOString()
    };

    setChats(prev => prev.map(ch => {
      if (ch.id === chatId) {
        return {
          ...ch,
          messages: [...ch.messages, freshMessage]
        };
      }
      return ch;
    }));
  };

  // Withdraw transfer trigger
  const handleWithdrawFromBalance = (amount: number) => {
    setEarnings(prev => Math.max(0, prev - amount));
  };

  return (
    <div className="flex h-screen bg-slate-50 relative overflow-hidden">
      
      {/* Sidebar navigation */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setIsSidebarOpen(false);
        }} 
        profile={profile}
        earnings={earnings}
        escrowTotal={escrowTotal}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        onEditProfile={() => {
          // prefill form parameters
          setProfileFormName(profile.name);
          setProfileFormTitle(profile.title);
          setProfileFormRate(profile.hourlyRate);
          setProfileFormBio(profile.bio);
          setProfileFormSkills(profile.skills.join(", "));
          setIsProfileOpen(true);
        }}
      />

      {/* Main Workspace Scroll Area */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        
        {/* Main Content Dashboard Layout header */}
        <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-4 sm:px-8 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <button
              id="mobile-hud-menu-click"
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 hover:bg-slate-100 text-slate-600 hover:text-slate-850 rounded-lg transition mr-1 cursor-pointer"
              aria-label="Open modular menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 hidden lg:inline-block"></span>
            <h2 className="font-display font-bold text-xs sm:text-sm text-slate-800 uppercase tracking-tight">
              Active Panel: <span className="text-slate-500 lowercase font-medium font-mono">{activeTab}</span>
            </h2>
          </div>

          <div className="flex items-center gap-4">
            {/* Real-time system clocks */}
            <div className="text-right hidden sm:block">
              <span className="text-[10px] text-slate-400 block font-mono">UTILITY CLOCK UTC:</span>
              <span className="text-xs font-mono font-bold text-slate-800">
                {new Date().toISOString().slice(0, 19).replace('T', ' ')}
              </span>
            </div>

            <div className="h-4 w-[1px] bg-slate-200 hidden sm:block"></div>
            
            {/* Match rating badge */}
            <div className="bg-slate-900 text-white py-1 px-3 rounded-lg text-xs font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" /> Secure Sandbox V2
            </div>
          </div>
        </header>

        {/* Outer scrolling slot */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          
          {/* Global Alert Notification */}
          {systemAlert && (
            <div id="system-alert-banner" className="fixed top-20 right-8 bg-white border border-slate-350 shadow-2xl p-4 rounded-xl z-50 w-80 shrink-0 animate-scale-up border-l-4 border-l-emerald-500">
              <div className="flex items-start gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <h5 className="text-xs font-bold text-slate-800 truncate mb-0.5">{systemAlert.title}</h5>
                  <p className="text-[11px] text-slate-500 leading-snug">{systemAlert.desc}</p>
                </div>
                <button onClick={() => setSystemAlert(null)} className="text-slate-400 hover:text-slate-600 transition cursor-pointer">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Module Router views */}
          {activeTab === "overview" && (
            <DashboardOverview 
              profile={profile}
              contracts={contracts}
              invoices={invoices}
              earnings={earnings}
              escrowTotal={escrowTotal}
              onNavigate={(tab) => setActiveTab(tab)}
              onWithdraw={handleWithdrawFromBalance}
            />
          )}

          {activeTab === "jobs" && (
            <BrowseJobs 
              jobs={jobs.filter(j => j.status === 'open' || j.status === 'applied')}
              profile={profile}
              onApply={handleApplyForJob}
              geminiActive={geminiActive}
            />
          )}

          {activeTab === "escrow" && (
            <MilestoneEscrow 
              contracts={contracts}
              invoices={invoices}
              profile={profile}
              onMilestoneSubmit={handleMilestoneSubmit}
              onMilestoneRelease={handleMilestoneRelease}
              onImportMilestones={handleImportMilestones}
              geminiActive={geminiActive}
            />
          )}

          {activeTab === "chat" && (
            <ClientChat 
              chats={chats}
              onSendMessage={handleSendMessage}
              onReceiveMessage={handleReceiveMessage}
              profile={profile}
            />
          )}

          {activeTab === "tasks" && (
            <ProjectBoard 
              tasks={tasks}
              contracts={contracts}
              onAddTask={handleAddTask}
              onMoveTask={handleMoveTask}
              onDeleteTask={handleDeleteTask}
            />
          )}

        </div>
      </main>

      {/* Profiles drawer settings panel overlay */}
      {isProfileOpen && (
        <div id="profile-customizer-drawer" className="fixed inset-0 bg-slate-900/65 flex items-center justify-end z-50 p-0 animate-fade-in">
          <div className="bg-white h-full w-full max-w-md shadow-2xl relative border-l border-slate-200 flex flex-col animate-slide-left">
            
            <div className="p-6 border-b border-slate-150 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-indigo-600" />
                <h4 className="font-display font-extrabold text-sm text-slate-800">
                  Calibrate Freelance Profiles
                </h4>
              </div>
              <button 
                onClick={() => setIsProfileOpen(false)} 
                className="h-8 w-8 rounded-full hover:bg-slate-200 text-slate-500 hover:text-slate-700 flex items-center justify-center cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="flex-1 p-6 space-y-6 overflow-y-auto">
              
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 font-bold block uppercase">Freelancer Name</label>
                <input
                  id="profile-form-name"
                  type="text"
                  required
                  value={profileFormName}
                  onChange={(e) => setProfileFormName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 font-bold block uppercase">Professional Spec Title</label>
                <input
                  id="profile-form-title"
                  type="text"
                  required
                  value={profileFormTitle}
                  onChange={(e) => setProfileFormTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 font-bold block uppercase">Hourly Target Rate ($/hr)</label>
                <input
                  id="profile-form-rate"
                  type="number"
                  required
                  value={profileFormRate}
                  onChange={(e) => setProfileFormRate(parseInt(e.target.value) || 0)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 font-bold block uppercase">Technical Skills (Comma Separated)</label>
                <input
                  id="profile-form-skills"
                  type="text"
                  required
                  value={profileFormSkills}
                  onChange={(e) => setProfileFormSkills(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800"
                  placeholder="React, TypeScript, Node.js"
                />
                <span className="text-[10px] text-slate-400 block font-light">These skills will directly guide the AI Pitch generators.</span>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 font-bold block uppercase">Professional Abstract Bio</label>
                <textarea
                  id="profile-form-bio"
                  rows={5}
                  required
                  value={profileFormBio}
                  onChange={(e) => setProfileFormBio(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500 text-slate-800 leading-relaxed font-light"
                />
              </div>

              <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex items-start gap-2.5 text-indigo-900 text-xs">
                <Award className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong className="font-semibold block text-indigo-950">Credential Sync</strong>
                  Updating these specifications automatically aligns proposed rates on new project pitches.
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  id="profile-form-cancel"
                  type="button"
                  onClick={() => setIsProfileOpen(false)}
                  className="flex-1 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-700 text-xs font-semibold rounded-lg transition text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="profile-form-save"
                  type="submit"
                  className="flex-1 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition text-center cursor-pointer"
                >
                  Save Specification
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
