import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Sliders, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Clock, 
  User, 
  TrendingUp,
  X
} from "lucide-react";
import { ProjectTask, Contract } from "../types";

interface ProjectBoardProps {
  tasks: ProjectTask[];
  contracts: Contract[];
  onAddTask: (task: Omit<ProjectTask, "id">) => void;
  onMoveTask: (taskId: string, targetCol: ProjectTask["column"]) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function ProjectBoard({
  tasks,
  contracts,
  onAddTask,
  onMoveTask,
  onDeleteTask
}: ProjectBoardProps) {
  const [selectedContractId, setSelectedContractId] = useState<string>(contracts[0]?.id || "");
  const [newTaskOpen, setNewTaskOpen] = useState<boolean>(false);
  
  // New task form fields
  const [taskTitle, setTaskTitle] = useState<string>("");
  const [taskDesc, setTaskDesc] = useState<string>("");
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [taskCol, setTaskCol] = useState<'todo' | 'in_progress' | 'in_review' | 'done'>('todo');

  const activeContract = contracts.find(c => c.id === selectedContractId);
  const activeContractTasks = tasks.filter(t => t.contractId === selectedContractId);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim() || !selectedContractId) return;

    onAddTask({
      contractId: selectedContractId,
      title: taskTitle,
      description: taskDesc,
      priority: taskPriority,
      column: taskCol
    });

    setTaskTitle("");
    setTaskDesc("");
    setNewTaskOpen(false);
  };

  const columns: { id: ProjectTask["column"]; label: string; bg: string; text: string }[] = [
    { id: "todo", label: "To Do Deliverables", bg: "bg-slate-100", text: "text-slate-700" },
    { id: "in_progress", label: "Active Development", bg: "bg-amber-50/50 border border-amber-100", text: "text-amber-800" },
    { id: "in_review", label: "Sign-Off / QA Review", bg: "bg-sky-50/50 border border-sky-100", text: "text-sky-800" },
    { id: "done", label: "Approved Handover", bg: "bg-emerald-50/40 border border-emerald-100", text: "text-emerald-800" }
  ];

  const getPriorityColor = (p: ProjectTask["priority"]) => {
    switch (p) {
      case "high": return "bg-red-50 text-red-700 border-red-200 font-bold";
      case "medium": return "bg-amber-50 text-amber-700 border-[#fed7aa]";
      default: return "bg-sky-50 text-sky-700 border-[#bae6fd]";
    }
  };

  return (
    <div id="project-board-tab-root" className="space-y-6 animate-fade-in">
      
      {/* Title Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-display font-extrabold text-2xl tracking-tight text-slate-800">
            Sprint Kanban Workspace
          </h2>
          <p className="text-xs text-slate-500">
            Track daily engineering tasks, organize priorities, and associate core cards with active client escrow milestones.
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Contracts dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-wider font-bold text-slate-400">BOARD CONTEXT:</span>
            <select 
              id="board-contract-view-selector"
              value={selectedContractId}
              onChange={(e) => setSelectedContractId(e.target.value)}
              className="bg-white border border-slate-200 text-xs text-slate-700 py-1.5 px-3 rounded-lg focus:outline-none"
            >
              {contracts.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>

          <button
            id="register-new-task-bullet"
            onClick={() => setNewTaskOpen(true)}
            className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1 cursor-pointer shadow-sm transition"
          >
            <Plus className="w-4 h-4 text-sky-400" /> New Task
          </button>
        </div>
      </div>

      {activeContract ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
          {columns.map(col => {
            const colTasks = activeContractTasks.filter(t => t.column === col.id);
            
            return (
              <div 
                id={`kanban-column-${col.id}`}
                key={col.id} 
                className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col min-h-[60vh] space-y-4"
              >
                {/* Column Title Header */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <span className={`text-xs font-bold font-display ${col.text}`}>
                    {col.label}
                  </span>
                  <span className="bg-slate-100 text-slate-500 text-[10px] font-mono px-2 py-0.5 rounded-full font-bold">
                    {colTasks.length}
                  </span>
                </div>

                {/* Tasks Cards Stack */}
                <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[55vh] pr-1">
                  {colTasks.length === 0 ? (
                    <div className="py-12 text-center text-[11px] text-slate-400 font-light border border-slate-100 rounded-lg border-dashed">
                      No active cards here.
                    </div>
                  ) : (
                    colTasks.map(task => (
                      <div 
                        id={`task-card-node-${task.id}`}
                        key={task.id} 
                        className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm space-y-3 hover:shadow-md transition duration-200"
                      >
                        <div className="flex justify-between items-start gap-2">
                          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                          
                          {/* Trash button */}
                          <button
                            id={`trash-task-btn-${task.id}`}
                            onClick={() => onDeleteTask(task.id)}
                            className="text-slate-400 hover:text-red-500 transition cursor-pointer p-0.5"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <strong className="text-xs font-semibold text-slate-800 block line-clamp-1 mb-1">{task.title}</strong>
                          <p className="text-[11px] text-slate-500 leading-normal line-clamp-2 font-light">
                            {task.description}
                          </p>
                        </div>

                        {/* Interactive state actions to shift columns */}
                        <div className="flex justify-end gap-1 border-t border-slate-100 pt-2.5">
                          {col.id !== "todo" && (
                            <button
                              id={`shift-left-${task.id}`}
                              onClick={() => {
                                const target = col.id === "in_progress" ? "todo" : col.id === "in_review" ? "in_progress" : "in_review";
                                onMoveTask(task.id, target);
                              }}
                              className="py-1 px-2 hover:bg-slate-55 rounded text-[9px] font-semibold text-slate-500 border border-slate-200 cursor-pointer"
                              title="Move back"
                            >
                              ←
                            </button>
                          )}
                          {col.id !== "done" && (
                            <button
                              id={`shift-right-${task.id}`}
                              onClick={() => {
                                const target = col.id === "todo" ? "in_progress" : col.id === "in_progress" ? "in_review" : "done";
                                onMoveTask(task.id, target);
                              }}
                              className="py-1 px-2 bg-slate-900 hover:bg-slate-800 text-white rounded text-[9px] font-semibold flex items-center gap-0.5 cursor-pointer"
                              title="Advance state"
                            >
                              Advance →
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center bg-white border border-slate-200 rounded-xl space-y-3">
          <Layers className="w-12 h-12 text-slate-350 mx-auto" />
          <p className="text-xs text-slate-650">Please choose a job contract representation from the dropdown above to manage boards.</p>
        </div>
      )}

      {/* Task Creation Modal overlay */}
      {newTaskOpen && (
        <div id="new-task-modal-overlay" className="fixed inset-0 bg-slate-900/65 flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl relative border border-slate-200 animate-scale-up">
            
            <div className="flex justify-between items-center pb-3 border-b border-slate-100 mb-4">
              <h4 className="font-display font-extrabold text-sm text-slate-800">
                Register New Sprint Task
              </h4>
              <button 
                onClick={() => setNewTaskOpen(false)} 
                className="text-slate-400 hover:text-slate-600 cursor-pointer transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 font-bold block uppercase">TASK TITLE</label>
                <input
                  id="new-task-field-title"
                  type="text"
                  required
                  placeholder="e.g. Implement bcrypt hashing"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 font-bold block uppercase">SPEC DETAILS</label>
                <textarea
                  id="new-task-field-desc"
                  rows={3}
                  placeholder="Outline parameters of work..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:bg-white focus:outline-none leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold block uppercase">Priority</label>
                  <select
                    id="new-task-field-priority"
                    value={taskPriority}
                    onChange={(e: any) => setTaskPriority(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 font-bold block uppercase">Initial Phase</label>
                  <select
                    id="new-task-field-column"
                    value={taskCol}
                    onChange={(e: any) => setTaskCol(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="in_review">In Review</option>
                    <option value="done">Done</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  id="cancel-register-task"
                  type="button"
                  onClick={() => setNewTaskOpen(false)}
                  className="flex-1 py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-700 text-xs font-semibold rounded-lg transition text-center cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  id="submit-register-task"
                  type="submit"
                  className="flex-1 py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition text-center cursor-pointer"
                >
                  Create Board Card
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
