export interface FreelancerProfile {
  name: string;
  title: string;
  skills: string[];
  hourlyRate: number;
  bio: string;
  location: string;
  avatar: string;
  completedJobs: number;
  earningRate: string;
}

export interface Job {
  id: string;
  title: string;
  clientName: string;
  clientAvatar: string;
  clientCompany: string;
  budget: number;
  category: 'web-dev' | 'design' | 'writing' | 'mobile';
  description: string;
  skills: string[];
  status: 'open' | 'applied' | 'negotiating' | 'hired';
  proposal?: {
    coverLetter: string;
    proposedRate: number;
    estimatedDays: number;
    generatedAt: string;
  };
}

export interface Milestone {
  id: string;
  title: string;
  amount: number;
  status: 'pending' | 'escrowed' | 'submitted_review' | 'released';
  description?: string;
  dueDate: string;
}

export interface Contract {
  id: string;
  jobId: string;
  title: string;
  clientName: string;
  clientAvatar: string;
  status: 'active' | 'completed' | 'paused';
  totalAmount: number;
  milestones: Milestone[];
  escrowBalance: number;
}

export interface Message {
  id: string;
  sender: 'freelancer' | 'client' | 'system';
  text: string;
  timestamp: string;
}

export interface Chat {
  id: string; // client name or id
  clientName: string;
  clientAvatar: string;
  clientTitle: string;
  persona: string;
  messages: Message[];
  isTyping?: boolean;
}

export interface ProjectTask {
  id: string;
  contractId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  column: 'todo' | 'in_progress' | 'in_review' | 'done';
  dueDate?: string;
}

export interface Invoice {
  id: string;
  contractId: string;
  milestoneId: string;
  title: string;
  clientName: string;
  amount: number;
  issuedDate: string;
  dueDate: string;
  status: 'draft' | 'pending' | 'paid' | 'cancelled';
}
