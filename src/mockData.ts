import { FreelancerProfile, Job, Contract, Chat, ProjectTask, Invoice } from "./types";

export const initialProfile: FreelancerProfile = {
  name: "Alex Rivera",
  title: "Senior Full-Stack Engineer & UI Artisan",
  skills: ["React", "TypeScript", "Tailwind CSS", "Express.js", "Node.js", "PostgreSQL", "REST APIs"],
  hourlyRate: 65,
  bio: "Creative software engineer crafting clean web applications with meticulous user experience. Specialized in high-performance dashboards, secure API architectures, and polished SVG visualizers.",
  location: "San Francisco, CA (GMT-7)",
  avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
  completedJobs: 24,
  earningRate: "100%"
};

export const initialJobs: Job[] = [
  {
    id: "job-1",
    title: "E-Commerce Customer Portal Refactoring",
    clientName: "Liam Sterling",
    clientAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    clientCompany: "Finova Commerce",
    budget: 4500,
    category: "web-dev",
    description: "Our current legacy checkout flow is seeing a 45% drop-off. We need an expert frontend engineer to overhaul our React checkout page, integrate safe API gateways, and implement standard credit card validator routines. Clean components and smooth Tailwind transitions are a must. High assurance milestone escrow is configured for payment.",
    skills: ["React", "Tailwind CSS", "TypeScript", "REST APIs"],
    status: "open"
  },
  {
    id: "job-2",
    title: "Mindfulness App UI Design & Prototyping",
    clientName: "Sophia Mercer",
    clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    clientCompany: "Aura Zen",
    budget: 3200,
    category: "design",
    description: "We are seeking a talented UI/UX designer to layout the primary wireframes, dashboard graphics, and high-fidelity mockups for our meditation application. Deliverables include user flows, dark-mode variations, and ready-to-code SVG assets. We work closely via direct text communications and verify milestones instantly.",
    skills: ["Figma", "UI/UX Design", "Tailwind CSS", "SVG Animation"],
    status: "open"
  },
  {
    id: "job-3",
    title: "Secure Payment Gateway Integration Guide",
    clientName: "Kenji Takahashi",
    clientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    clientCompany: "BentoBox Tech",
    budget: 1800,
    category: "writing",
    description: "We require a clear, comprehensive development guide documenting our transaction security architecture rules. The content needs to explain tokenization, webhook validation, and retry mechanics with crisp markdown diagrams. Ideal for fullstack engineers with solid tech writing experience.",
    skills: ["Technical Writing", "REST APIs", "Node.js", "Markdown"],
    status: "hired" // hired status means we have an active contract initialized for this one!
  },
  {
    id: "job-4",
    title: "iOS/Android Health Tracking Core Applet",
    clientName: "Marcus Vance",
    clientAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200",
    clientCompany: "Pulse Gyms",
    budget: 6800,
    category: "mobile",
    description: "Looking for an expert mobile engineer to build out our health analytics page, Bluetooth heart rate data parsing module, and daily caloric metrics widgets. Safe local databases (SQLite) and smooth frame rate animations are necessary. Funds are fully committed in our certified escrow drawer.",
    skills: ["React Native", "TypeScript", "SQLite", "Data Visualization"],
    status: "open"
  }
];

export const initialContracts: Contract[] = [
  {
    id: "contract-1",
    jobId: "job-3",
    title: "Secure Payment Gateway Integration Guide",
    clientName: "Kenji Takahashi",
    clientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    status: "active",
    totalAmount: 1800,
    escrowBalance: 1200,
    milestones: [
      {
        id: "ms-1",
        title: "Outline & Gateway Architecture Blueprint",
        amount: 600,
        status: "released",
        dueDate: "2026-05-20"
      },
      {
        id: "ms-2",
        title: "Webhooks Security & Validation Manual",
        amount: 600,
        status: "submitted_review",
        description: "Draft manual explaining secure SHA-256 HMAC signature validation across API nodes, including recovery logic.",
        dueDate: "2026-05-26"
      },
      {
        id: "ms-3",
        title: "Complete Handover & PDF Compilation",
        amount: 600,
        status: "escrowed",
        dueDate: "2026-06-02"
      }
    ]
  }
];

export const initialChats: Chat[] = [
  {
    id: "kenji",
    clientName: "Kenji Takahashi",
    clientAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200",
    clientTitle: "Engineering Lead, BentoBox Tech",
    persona: "He is detail-oriented, highly supportive, demands robust explanations for security flows, prefers bullet points, and appreciates concise development comments.",
    messages: [
      {
        id: "msg-1",
        sender: "client",
        text: "Hi Alex! Excited to have you aboard on designing this payment integration guide. Security is our absolute number one goal.",
        timestamp: "2026-05-22T09:12:00Z"
      },
      {
        id: "msg-2",
        sender: "freelancer",
        text: "Thanks Kenji! I appreciate it. I've drafted our initial milestone outlining the secure token exchange sequence. Let me know if you can check it.",
        timestamp: "2026-05-22T09:30:00Z"
      },
      {
        id: "msg-3",
        sender: "client",
        text: "Yes, I approved the first milestone and released the $600 yesterday! Next up is the Webhook safety chapter. Have you started drafting the signature validation models?",
        timestamp: "2026-05-23T10:15:00Z"
      },
      {
        id: "msg-4",
        sender: "freelancer",
        text: "Just completed that draft! I've officially submitted Milestone 2 for your review. It outlines HMAC validation with a fallback retry schedule.",
        timestamp: "2026-05-23T14:40:00Z"
      },
      {
        id: "msg-5",
        sender: "client",
        text: "Awesome, I see the notification. Give me a bit to double-check the code snippets, and I will release the escrow funds shortly!",
        timestamp: "2026-05-23T15:02:00Z"
      }
    ]
  },
  {
    id: "liam",
    clientName: "Liam Sterling",
    clientAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200",
    clientTitle: "Product Director, Finova Commerce",
    persona: "He is fast-paced, direct, conversion-focused, and loves sleek animations. He is eager to get the checkout page converted urgently.",
    messages: [
      {
        id: "m-liam-1",
        sender: "client",
        text: "Greetings Alex, saw your profile on the Hub! We are looking to build a high-performance checkout experience. Can you build reactive inputs and credit validators?",
        timestamp: "2026-05-23T11:00:00Z"
      }
    ]
  },
  {
    id: "sophia",
    clientName: "Sophia Mercer",
    clientAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    clientTitle: "Creative Director, Aura Zen",
    persona: "Highly design-conscious, elegant, polite, and focuses exclusively on color harmonies, layout ratios, and emotional tranquility of UI elements.",
    messages: [
      {
        id: "m-sophia-1",
        sender: "client",
        text: "Hello dear, the current branding draft looks beautiful. Are the SVG icons optimized for responsive retina scaling? Let me know.",
        timestamp: "2026-05-23T12:30:00Z"
      }
    ]
  }
];

export const initialTasks: ProjectTask[] = [
  {
    id: "task-1",
    contractId: "contract-1",
    title: "Draft Webhook Security Guide",
    description: "Write details explaining SHA-256 validation nodes, request verification buffers and token protection.",
    priority: "high",
    column: "done"
  },
  {
    id: "task-2",
    contractId: "contract-1",
    title: "Structure HMAC verification code blocks",
    description: "Prepare Node.js and Express validator algorithms as clean copy-pasteable files.",
    priority: "medium",
    column: "in_review"
  },
  {
    id: "task-3",
    contractId: "contract-1",
    title: "Incorporate Kenji's review adjustments",
    description: "Align text parameters with BentoBox naming styles and secure endpoint parameters.",
    priority: "medium",
    column: "in_progress"
  },
  {
    id: "task-4",
    contractId: "contract-1",
    title: "Design final layout PDF compilation pipeline",
    description: "Establish static CSS styles for printing markdown files elegant-looking for client delivery.",
    priority: "low",
    column: "todo"
  }
];

export const initialInvoices: Invoice[] = [
  {
    id: "inv-2001",
    contractId: "contract-1",
    milestoneId: "ms-1",
    title: "Outline & Gateway Architecture Blueprint",
    clientName: "Kenji Takahashi",
    amount: 600,
    issuedDate: "2026-05-18",
    dueDate: "2026-05-25",
    status: "paid"
  },
  {
    id: "inv-2002",
    contractId: "contract-1",
    milestoneId: "ms-2",
    title: "Webhooks Security & Validation Manual",
    clientName: "Kenji Takahashi",
    amount: 600,
    issuedDate: "2026-05-23",
    dueDate: "2026-05-30",
    status: "pending"
  }
];
