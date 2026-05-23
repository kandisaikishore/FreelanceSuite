import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = 3000;

// Initialize Gemini Client safely
let ai: GoogleGenAI | null = null;
const api_key = process.env.GEMINI_API_KEY;

if (api_key && api_key !== "MY_GEMINI_API_KEY") {
  try {
    ai = new GoogleGenAI({
      apiKey: api_key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log("Gemini API initialized successfully.");
  } catch (err) {
    console.warn("Failed to initialize Gemini API client:", err);
  }
} else {
  console.log("No valid GEMINI_API_KEY detected. Running in mock/fallback mode.");
}

// Ensure api indicator endpoint
app.get("/api/status", (req, res) => {
  res.json({
    geminiActive: !!ai,
    localTime: new Date().toISOString(),
  });
});

// Endpoint 1: Proposal Generator
app.post("/api/proposal/generate", async (req, res) => {
  const { jobTitle, jobDescription, clientName, freelancerProfile } = req.body;

  if (!ai) {
    // Elegant fallback proposal builder in case Gemini isn't configured yet
    const fallbackDays = 7 + Math.floor(Math.random() * 8);
    const mockRate = freelancerProfile?.hourlyRate || 45;
    const coverLetter = `Hi ${clientName || 'Name'},\n\nI saw your listing for "${jobTitle}" and would love to work with you on this. With my skills in ${freelancerProfile?.skills?.join(", ") || 'Modern Fullstack Tools'}, I am highly confident in delivering top-notch work. I've designed and engineered similar projects with successful production outputs.\n\nHere is how I plan to approach your requirements:\n1. Discovery & Architecture Blueprint: Align on features and mock designs.\n2. Agile Core Implementation: Deliver functional drafts with frequent checks.\n3. Hardening & Release: Polish styles, optimize loading performance and test live features.\n\nMy hourly rate is $${mockRate}/hr which scales well for high-quality outcomes. I'm ready to begin immediately and establish secure milestone escrows.\n\nBest regards,\n${freelancerProfile?.name || 'Professional Freelancer'}`;

    return res.json({
      coverLetter,
      proposedRate: mockRate,
      estimatedDays: fallbackDays,
      engine: "Local Fallback"
    });
  }

  try {
    const prompt = `You are a professional freelancer with the following profile:
Name: ${freelancerProfile?.name || 'Expert Freelancer'}
Title: ${freelancerProfile?.title || 'Senior Software Engineer'}
Skills: ${freelancerProfile?.skills?.join(", ") || 'React, Tailwind, Node.js, TypeScript'}
Hourly Rate: $${freelancerProfile?.hourlyRate || 45}/hr
Bio: ${freelancerProfile?.bio || 'Passionate developer building clean layouts'}

Generate a professional, compelling, and fully-customized freelance proposal to pitch for this job listing:
Job Title: ${jobTitle}
Client: ${clientName || 'Valued Client'}
Job Description: ${jobDescription}

Important instructions:
- Address the client politely by name if provided.
- Showcase specific expertise that aligns with their requirements.
- Outline a 3-step action plan to accomplish their objectives.
- Be competitive yet highly professional.
- Do not use any placeholders like [Your Name] or [Insert skill] - output the finished proposal using the actual profile data supplied.
- Limit the total proposal content to 3-4 concise, engaging paragraphs.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an elite freelance pitch writer. You construct bids that are persuasive, technically brilliant, and directly focused on client value.",
      },
    });

    const proposalText = response.text || "";

    res.json({
      coverLetter: proposalText.trim(),
      proposedRate: freelancerProfile?.hourlyRate || 45,
      estimatedDays: 10,
      engine: "Gemini 3.5 Flash"
    });
  } catch (error: any) {
    console.error("Gemini proposal generation error:", error);
    res.status(500).json({ error: "Failed to generate proposal due to API error.", details: error.message });
  }
});

// Endpoint 2: Direct Client Communication Chat Simulator
app.post("/api/chat/respond", async (req, res) => {
  const { clientName, clientTitle, persona, jobTitle, currentMessage, chatHistory } = req.body;

  if (!ai) {
    // Generate realistic persona responses based on client status
    let fallbackText = `Let's make sure we are aligned on the upcoming milestones. Can we jump on a brief text sync to hash out the layout updates?`;
    
    const inputClean = currentMessage?.toLowerCase() || "";
    if (inputClean.includes("deliver") || inputClean.includes("status") || inputClean.includes("progress")) {
      fallbackText = `Thanks for the status update! The current progress looks solid. Please prepare a milestone submission so I can review on my end and initiate the escrow release.`;
    } else if (inputClean.includes("price") || inputClean.includes("budget") || inputClean.includes("cost") || inputClean.includes("money")) {
      fallbackText = `I appreciate your transparency on pricing. I've locked the agreed-upon funds into the safe milestone escrow on the Freelancer Suite. Let's make sure deliverables are clean before our release schedule.`;
    } else if (inputClean.includes("hello") || inputClean.includes("hi") || inputClean.includes("hey")) {
      fallbackText = `Hey there! Glad to connect on this. Looking forward to seeing the preliminary wireframes and getting the codebase set up on GitHub. How is the initial architecture looking?`;
    } else if (inputClean.includes("timeline") || inputClean.includes("delay") || inputClean.includes("sprint")) {
      fallbackText = `Timelines are key for us as we have an upcoming investor presentation. Let's prioritize the MVP dashboards first. Let me know if you run into any technical blockers!`;
    } else {
      fallbackText = `Great point. I support this approach. As a client, my priority is maintaining clean, legible interfaces and solid error handling. Let me know if you need any feedback on specific components!`;
    }

    return res.json({
      text: `[Client Simulation - ${clientName}]: ${fallbackText}`,
      engine: "Local Fallback"
    });
  }

  try {
    // Format chat history for the prompt
    const historyPrompt = chatHistory?.map((msg: any) => {
      const senderLabel = msg.sender === 'client' ? clientName : 'Freelancer';
      return `${senderLabel}: ${msg.text}`;
    }).join("\n") || "";

    const prompt = `You are a client simulating interactive Direct Chat communication on a Freelancing ecosystem.
Your profile is:
Name: ${clientName}
Title: ${clientTitle}
Personality Profile: ${persona}
Active Project Title: ${jobTitle}

Here is the chat ledger history:
${historyPrompt}

Now, the freelancer says:
"${currentMessage}"

Please respond in-character as ${clientName} (${persona}). Keep your response realistic, professional, and directly related to the active project context. 
Keep your response brief (1 to 3 sentences maximum, styled as an instant-message chat client would write). Do not use placeholders or speak outside of character.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: `You are simulating a realistic client in a freelance workspace. You maintain consistent, natural responses matching your provided persona. No prefix, no intro.`,
        temperature: 0.8,
      },
    });

    const reply = response.text || "";

    res.json({
      text: reply.trim(),
      engine: "Gemini 3.5 Flash"
    });
  } catch (error: any) {
    console.error("Gemini Chat response generated an error:", error);
    res.json({
      text: `Thanks for your message! Client simulation currently experiences a network bump. Let's continue testing our milestone releases.`,
      error: error.message
    });
  }
});

// Endpoint 3: Project Milestone Scoper
app.post("/api/project/generate-milestones", async (req, res) => {
  const { jobTitle, jobDescription, budget } = req.body;

  if (!ai) {
    // Mock robust fallback scoper
    const mockMilestones = [
      {
        id: "m-1",
        title: "Discovery, Designing & Project Architecture",
        amount: Math.round(budget * 0.25),
        status: "escrowed",
        description: "Delivery of initial figma designs, wireframes, and GitHub structural template.",
        dueDate: "In 4 Days"
      },
      {
        id: "m-2",
        title: "MVP Frontend & Core Simulated APIs",
        amount: Math.round(budget * 0.40),
        status: "pending",
        description: "All major visual dashboards, client simulator controls and task boards fully operational.",
        dueDate: "In 10 Days"
      },
      {
        id: "m-3",
        title: "Security Hardening, Payments Integration & Final Handover",
        amount: Math.round(budget * 0.35),
        status: "pending",
        description: "Milestone test sequences complete, transaction ledgers clean and project live validation.",
        dueDate: "In 16 Days"
      }
    ];

    return res.json({
      milestones: mockMilestones,
      engine: "Local Fallback"
    });
  }

  try {
    const prompt = `Analyze this freelance job title and description and break it down into a highly realistic 3-step project milestone deployment for security-conscious freelance escrows:
Job Title: ${jobTitle}
Total Project Budget: $${budget}
Description: ${jobDescription}

Generate the breakdown in a structured JSON object. The output must strictly follow this JSON schema format:
{
  "milestones": [
    {
      "id": "string (unique code like m-1, m-2, m-3)",
      "title": "string (succinct milestone title)",
      "amount": number (suggested budget allocated, must sum up to approximately ${budget}),
      "status": "string (either 'pending' or 'escrowed')",
      "description": "string (clear deliverables definition for this step)",
      "dueDate": "string (suggested timeline relative to project start, e.g. 'In 5 days')"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["milestones"],
          properties: {
            milestones: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                required: ["id", "title", "amount", "status", "description", "dueDate"],
                properties: {
                  id: { type: Type.STRING },
                  title: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  status: { type: Type.STRING },
                  description: { type: Type.STRING },
                  dueDate: { type: Type.STRING }
                }
              }
            }
          }
        },
        systemInstruction: "You are an expert technical product manager. You scope complex digital jobs into concrete, manageable agiley-structured milestones so work is released with high confidence."
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    res.json({
      milestones: parsed.milestones || [],
      engine: "Gemini 3.5 Flash"
    });
  } catch (error: any) {
    console.error("Gemini milestone error:", error);
    res.status(500).json({ error: "Failed to generate milestones.", details: error.message });
  }
});

// Serve Vite dev / Production router middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Import dynamically so production build doesn't require dev dependencies of Vite
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev middleware attached.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Express startup failed:", error);
});
