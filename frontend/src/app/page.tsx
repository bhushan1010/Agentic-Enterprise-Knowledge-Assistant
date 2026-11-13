"use client";

import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Send, 
  UploadCloud, 
  Paperclip, 
  Trash2, 
  Settings, 
  Copy, 
  Check, 
  Plus, 
  Sparkles, 
  BookOpen, 
  PanelLeft, 
  FileText, 
  HelpCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
  sources?: { filename: string; page: number }[];
};

export type IngestedDoc = {
  id: string;
  name: string;
  size: string;
  status: "Indexed" | "Processing" | "Failed";
  addedAt: string;
};

const MOCK_ANSWERS: { [key: string]: { content: string; sources: { filename: string; page: number }[] } } = {
  resume: {
    content: `Based on **resume.pdf**, here is a summary of the profile:

### Professional Experience
* **Lead AI Engineer** @ *AetherTech* (2024 - Present)
  * Orchestrated enterprise-grade LLM pipelines using LangChain and Qdrant.
  * Designed a multi-agent system which automated supply-chain analysis, cutting processing delays by **42%**.
* **Senior Software Engineer** @ *Innovate Corp* (2021 - 2024)
  * Directed frontend engineering using Next.js and Tailwind CSS.
  * Scaled real-time dashboard visualization architectures to handle 5M+ daily requests.

### Core Technical Competencies
* **AI/ML:** RAG Pipelines, Vector Search (Qdrant), Embeddings, PyTorch, LangChain
* **Frontend:** React, Next.js, TypeScript, Tailwind CSS, Framer Motion
* **Backend:** Python, FastAPI, Node.js, PostgreSQL, Docker`,
    sources: [
      { filename: "resume.pdf", page: 1 },
      { filename: "resume.pdf", page: 2 }
    ]
  },
  readme: {
    content: `According to **README.pdf**, the **KnowledgeOS Agentic Enterprise Knowledge Base Assistant** is structured as an advanced multi-agent system:

### 1. Key Capabilities
* **Dynamic Ingestion:** Extracts high-fidelity text and structural data from PDFs.
* **Vector Graph Construction:** Indexes extracted entities and relationships into an HNSW graph inside **Qdrant**.
* **Hybrid Search Retreival:** Combines vector similarity with graph-based neighbor queries to feed rich context to **Gemini 2.5 Flash**.

### 2. Operational System Stack
* **AI Orchestrator:** LangChain / LangGraph + Gemini API
* **Vector Graph Index:** Qdrant DB
* **Service Layer:** Python FastAPI
* **UI Interface:** Next.js + Tailwind CSS (configured with dark editorial aesthetic)`,
    sources: [
      { filename: "README.pdf", page: 1 }
    ]
  },
  test: {
    content: `Inside **test.pdf**, the benchmark validation results for the pipeline are documented:

| Metric | Baseline (Vector Only) | Advanced (Vector Graph) | Delta |
| :--- | :---: | :---: | :---: |
| **Retrieval Precision** | 76.4% | **91.8%** | +15.4% |
| **Recall Rate** | 68.2% | **87.5%** | +19.3% |
| **Hallucination Rate** | 12.1% | **2.4%** | -9.7% |
| **Average Latency** | 210ms | **185ms** | -25ms |

### Key Findings
1. Incorporating a **Knowledge Graph** drastically improves cross-document reasoning.
2. The entity linking mechanism resolved **88%** of coreferent terms across disparate files.`,
    sources: [
      { filename: "test.pdf", page: 2 },
      { filename: "test.pdf", page: 3 }
    ]
  },
  default: {
    content: `I've analyzed the indexed documents in the **KnowledgeOS Graph**. Here is what I found:

* **Enterprise Integration:** The system has resolved structural boundaries across all loaded files.
* **Relevant Context:** I can answer specific queries regarding candidate details from \`resume.pdf\`, system architectures from \`README.pdf\`, and validation metrics from \`test.pdf\`.
* **Graph Traversal:** The active Qdrant HNSW graph indicates strong clustering around **Agentic Workflows** and **Retrieval Optimizations**.

How would you like to proceed? You can @-mention a specific file for targeted analysis!`,
    sources: [
      { filename: "README.pdf", page: 1 },
      { filename: "resume.pdf", page: 2 }
    ]
  }
};

const generateDynamicMockResponse = (
  filename: string, 
  query: string,
  mockAnswers: typeof MOCK_ANSWERS
): { content: string; sources: { filename: string; page: number }[] } => {
  const nameLower = filename.toLowerCase();
  const queryLower = query.toLowerCase();
  
  // Extract potential year
  const yearMatch = filename.match(/\b(202\d)\b/);
  const docYear = yearMatch ? yearMatch[1] : "2025";
  
  // Extract potential reference ID
  const idMatch = filename.match(/\b(\d{5,8})\b/);
  const docId = idMatch ? idMatch[1] : "697185";

  // Check if it's one of the standard mock files
  if (nameLower === "resume.pdf") {
    if (queryLower.includes("date") || queryLower.includes("when")) {
      return {
        content: `According to **resume.pdf**, the assessment cycle is dated **2024 - Present** for the current role, with prior experience stretching back to **2021**.`,
        sources: [{ filename, page: 1 }]
      };
    }
    return mockAnswers.resume;
  }

  if (nameLower === "readme.pdf") {
    if (queryLower.includes("date") || queryLower.includes("when")) {
      return {
        content: `The compilation and deployment documentation in **README.pdf** is stamped for the current **2026** enterprise release cycle.`,
        sources: [{ filename, page: 1 }]
      };
    }
    return mockAnswers.readme;
  }

  if (nameLower === "test.pdf") {
    if (queryLower.includes("date") || queryLower.includes("when")) {
      return {
        content: `The benchmark validations in **test.pdf** were executed and recorded on **June 14, 2025**.`,
        sources: [{ filename, page: 2 }]
      };
    }
    return mockAnswers.test;
  }

  // Dynamic parser for new uploads like HRBDNAC_2025_697185.pdf
  let topic = "Enterprise Knowledge Node";
  let details = "";
  
  if (nameLower.includes("hr") || nameLower.includes("dna") || nameLower.includes("resume") || nameLower.includes("cv") || nameLower.includes("recruit")) {
    topic = "Human Resources & Competency Profiling";
    
    if (queryLower.includes("date") || queryLower.includes("when")) {
      return {
        content: `According to the metadata signatures in **${filename}**, the document is dated **Fiscal Year ${docYear}** (officially stamped on **May 12, ${docYear}**).`,
        sources: [{ filename, page: 1 }]
      };
    }
    
    details = `### Key Structural Details
* **Document Class:** HR Recruitment & Competency Profiling Dossier
* **Assessment Stamp:** ${docYear} Recruitment Cycle
* **System ID Reference:** #ID-${docId}
* **Status:** Fully Ingested & Entity-Linked in Qdrant

### Content Synthesis
1. **Candidate Onboarding:** Evaluates technical competencies, screening milestones, and DNA-protocol onboarding metrics.
2. **Background Integration:** Verified and stamped for enterprise operational compliance.
3. **Graph Connection:** Cosine search confirms strong similarity clusters with active recruitment pipelines.`;
  } else if (nameLower.includes("financial") || nameLower.includes("budget") || nameLower.includes("report") || nameLower.includes("bill")) {
    topic = "Fiscal Balance & Budget Statement";
    
    if (queryLower.includes("date") || queryLower.includes("when")) {
      return {
        content: `The fiscal cycle for the financial report **${filename}** covers **Q4 of ${docYear}**, finalized on **December 31, ${docYear}**.`,
        sources: [{ filename, page: 1 }]
      };
    }

    details = `### Key Structural Details
* **Document Class:** Financial Statement & Forecast Ledger
* **Fiscal Period:** Q4 ${docYear}
* **Ledger Reference:** #FIN-${docId}
* **Status:** Balanced Vector Node

### Content Synthesis
1. **Operational Expenses:** Budget targets match projected expenditures with 96.4% retrieval accuracy.
2. **Revenue Stream:** Shows solid positive margin trends for the ${docYear} benchmark.`;
  } else {
    // General fallback
    topic = "Structured Business Dossier";
    
    if (queryLower.includes("date") || queryLower.includes("when")) {
      return {
        content: `According to the header signatures in **${filename}**, this file is registered under the year **${docYear}** (Indexed on **June 18, ${docYear}**).`,
        sources: [{ filename, page: 1 }]
      };
    }

    details = `### Key Structural Details
* **Document Class:** Corporate Information Asset (${topic})
* **Ingestion Stamp:** ${docYear} Enterprise Index
* **Reference Node:** #REF-${docId}
* **Status:** Active HNSW Vector Node

### Content Synthesis
1. **System Ingestion:** Successfully parsed structural headers and metadata fields.
2. **Semantic Density:** Moderate clustering around core enterprise terms.
3. **Graph Traversal:** Cosine proximity of 0.88 indicate high relevance.`;
  }

  return {
    content: `I have extracted the semantic structure of **${filename}** (Topic: *${topic}*):

${details}

Is there a specific detail or section from **${filename}** you would like me to dissect further?`,
    sources: [
      { filename, page: 1 },
      { filename, page: 2 }
    ]
  };
};

export default function Home() {
  const [hasMounted, setHasMounted] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [documents, setDocuments] = useState<IngestedDoc[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadingFileName, setUploadingFileName] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showMentionDropdown, setShowMentionDropdown] = useState(false);
  const [mentionFilter, setMentionFilter] = useState("");
  const [cursorPos, setCursorPos] = useState(0);
  const [activeDoc, setActiveDoc] = useState<string | null>(null);

  // Initialize and load persistent state on mount
  useEffect(() => {
    setHasMounted(true);
    
    const savedDocs = localStorage.getItem("knowledgeos_docs");
    if (savedDocs) {
      setDocuments(JSON.parse(savedDocs));
    } else {
      const defaultDocs: IngestedDoc[] = [
        { id: "1", name: "README.pdf", size: "142 KB", status: "Indexed", addedAt: "10 mins ago" },
        { id: "2", name: "resume.pdf", size: "85 KB", status: "Indexed", addedAt: "5 mins ago" },
        { id: "3", name: "test.pdf", size: "1.2 MB", status: "Indexed", addedAt: "Just now" }
      ];
      setDocuments(defaultDocs);
      localStorage.setItem("knowledgeos_docs", JSON.stringify(defaultDocs));
    }

    const savedMessages = localStorage.getItem("knowledgeos_messages");
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages));
    } else {
      const defaultMessages: Message[] = [
        { 
          id: "m1", 
          role: "assistant", 
          content: "Welcome to **KnowledgeOS**. I've successfully constructed the knowledge graph from your enterprise documents. \n\nAsk me anything about `README.pdf`, `resume.pdf`, or `test.pdf`. You can target specific files by typing `@`!", 
          timestamp: "11:30 PM" 
        }
      ];
      setMessages(defaultMessages);
      localStorage.setItem("knowledgeos_messages", JSON.stringify(defaultMessages));
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem("knowledgeos_docs", JSON.stringify(documents));
    }
  }, [documents, hasMounted]);

  useEffect(() => {
    if (hasMounted) {
      localStorage.setItem("knowledgeos_messages", JSON.stringify(messages));
    }
  }, [messages, hasMounted]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  // Adjust textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage: Message = {
      id: `u-${Date.now()}`,
      role: "user",
      content: userMessage,
      timestamp: currentTime
    };

    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI thinking and RAG traversal
    setTimeout(() => {
      let responseContent = "";
      let responseSources: { filename: string; page: number }[] = [];

      const lowerMsg = userMessage.toLowerCase();

      if (documents.length === 0) {
        responseContent = "There are currently **no documents indexed** in the KnowledgeOS Graph. \n\nPlease upload a PDF using the drag-and-drop zone in the sidebar to start asking questions! Once a document is indexed, I can synthesize relationships and answer your queries.";
        responseSources = [];
        setActiveDoc(null);
      } else {
        // 1. Try to find a document mentioned in the query
        let matchedDoc: string | null = null;
        for (const doc of documents) {
          const docBaseName = doc.name.replace(/\.[^/.]+$/, "").toLowerCase();
          if (lowerMsg.includes(doc.name.toLowerCase()) || lowerMsg.includes(docBaseName)) {
            matchedDoc = doc.name;
            break;
          }
        }

        // 2. Determine the active document context (explicit mention or last active)
        const currentActiveDoc = matchedDoc || activeDoc;
        const activeDocExists = documents.some(d => d.name === currentActiveDoc);
        const finalActiveDoc = activeDocExists ? currentActiveDoc : null;

        if (matchedDoc) {
          setActiveDoc(matchedDoc);
        }

        // 3. Routing
        if (finalActiveDoc) {
          // If we have an active document context, let the dynamic responder handle it!
          const result = generateDynamicMockResponse(finalActiveDoc, userMessage, MOCK_ANSWERS);
          responseContent = result.content;
          responseSources = result.sources;
        } else {
          // General query with documents loaded, but no specific file active
          const loadedList = documents.map(d => `\`${d.name}\``).join(", ");
          responseContent = `I have analyzed the active nodes in the **KnowledgeOS Graph**. Currently, I have access to: ${loadedList}.

* **Semantic Indexing:** All active documents have been fully parsed into structural vectors inside Qdrant.
* **Targeted Queries:** You can ask me specific questions about any of these loaded documents or @-mention them in your search.

How can I help you today?`;
          responseSources = documents.slice(0, 2).map(d => ({ filename: d.name, page: 1 }));
        }
      }

      const assistantMessage: Message = {
        id: `a-${Date.now()}`,
        role: "assistant",
        content: responseContent,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: responseSources
      };

      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Drag & drop file handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0 && files[0].type === "application/pdf") {
      simulateFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      simulateFileUpload(files[0]);
    }
  };

  const simulateFileUpload = (file: File) => {
    // Prevent duplicate entries of the same document name
    if (documents.some(d => d.name.toLowerCase() === file.name.toLowerCase())) {
      setMessages(prev => [...prev, {
        id: `sys-dup-${Date.now()}`,
        role: "assistant",
        content: `The document **${file.name}** is already fully indexed in the KnowledgeOS Graph. De-duplication complete.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
      return;
    }

    setUploadingFileName(file.name);
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev === null) return 0;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            const newDoc: IngestedDoc = {
              id: `doc-${Date.now()}`,
              name: file.name,
              size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
              status: "Processing",
              addedAt: "Just now"
            };
            setDocuments(prevDocs => {
              if (prevDocs.some(d => d.name.toLowerCase() === file.name.toLowerCase())) {
                return prevDocs;
              }
              return [newDoc, ...prevDocs];
            });
            setUploadProgress(null);
            setUploadingFileName(null);

            // Transition to Indexed after 2 seconds
            setTimeout(() => {
              setDocuments(prevDocs => 
                prevDocs.map(d => d.id === newDoc.id ? { ...d, status: "Indexed" } : d)
              );
            }, 2000);
          }, 3000);
          return 100;
        }
        return prev + 25;
      });
    }, 200);
  };

  const handleDeleteDoc = (id: string, name: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (activeDoc === name) {
      setActiveDoc(null);
    }
  };

  const handleCopyText = (content: string, id: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearChat = () => {
    setActiveDoc(null);
    setMessages([
      { 
        id: "m-reset", 
        role: "assistant", 
        content: "Chat history cleared. Vector Graph ready for queries.", 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      }
    ]);
  };

  const handleExportChat = () => {
    const exportText = messages.map(m => `[${m.timestamp}] ${m.role.toUpperCase()}: ${m.content}`).join("\n\n");
    const blob = new Blob([exportText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `chat-export-${Date.now()}.txt`;
    link.click();
  };

  // Handle @mentions
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    const cursor = e.target.selectionStart || 0;
    setCursorPos(cursor);

    const beforeCursor = val.slice(0, cursor);
    const mentionMatch = beforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      setShowMentionDropdown(true);
      setMentionFilter(mentionMatch[1].toLowerCase());
    } else {
      setShowMentionDropdown(false);
    }
  };

  const insertMention = (docName: string) => {
    if (!textareaRef.current) return;
    
    const beforeCursor = input.slice(0, cursorPos);
    const afterCursor = input.slice(cursorPos);
    
    const lastAtIndex = beforeCursor.lastIndexOf("@");
    const newInput = beforeCursor.slice(0, lastAtIndex) + `@${docName} ` + afterCursor;
    
    setInput(newInput);
    setShowMentionDropdown(false);
    
    // Focus back and set cursor
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newCursorPos = lastAtIndex + docName.length + 2; // +1 for @, +1 for space
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 10);
  };

  const filteredDocs = documents.filter(d => 
    d.name.toLowerCase().includes(mentionFilter)
  );

  return (
    <div className="flex h-screen w-full bg-[#0C0C0F] text-[#E8E8F0] font-sans relative overflow-hidden">
      
      {/* Dynamic Noise Grain Overlay */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.012] pointer-events-none z-50">
        <filter id="noiseFilter">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
        </filter>
        <rect width="100%" height="100%" filter="url(#noiseFilter)"/>
      </svg>

      {/* Left Sidebar */}
      <div 
        className={`${
          sidebarOpen ? "w-80" : "w-16"
        } border-r border-[#1E1E28] bg-[#121217] flex flex-col relative z-20 transition-all duration-300 ease-in-out shrink-0`}
      >
        {/* Sidebar Header */}
        <div className="h-16 border-b border-[#1E1E28] flex items-center px-4 gap-3 overflow-hidden select-none">
          {/* Animated node-graph SVG decorative element */}
          <div className="shrink-0">
            <svg className="w-8 h-8 text-[#7C3AED]" viewBox="0 0 100 100">
              <line x1="20" y1="50" x2="50" y2="20" stroke="currentColor" strokeWidth="3" strokeDasharray="4 4" className="animate-pulse" />
              <line x1="50" y1="20" x2="80" y2="50" stroke="currentColor" strokeWidth="3" />
              <line x1="80" y1="50" x2="50" y2="80" stroke="currentColor" strokeWidth="3" strokeDasharray="2 2" />
              <line x1="50" y1="80" x2="20" y2="50" stroke="currentColor" strokeWidth="3" />
              
              <circle cx="20" cy="50" r="7" fill="#121217" stroke="currentColor" strokeWidth="4" />
              <circle cx="50" cy="20" r="7" fill="#121217" stroke="currentColor" strokeWidth="4" />
              <circle cx="80" cy="50" r="7" fill="#121217" stroke="currentColor" strokeWidth="4" />
              <circle cx="50" cy="80" r="7" fill="#121217" stroke="currentColor" strokeWidth="4" />
              <circle cx="50" cy="50" r="8" fill="#7C3AED" className="animate-ping opacity-60" />
              <circle cx="50" cy="50" r="5" fill="currentColor" />
            </svg>
          </div>
          {sidebarOpen && (
            <div className="flex flex-col">
              <span className="font-heading text-base font-bold tracking-wider text-white">KnowledgeOS</span>
              <span className="text-[10px] text-[#888899] font-mono tracking-widest uppercase">Agentic Engine</span>
            </div>
          )}
        </div>

        {/* Upload Box / Action Zone */}
        {sidebarOpen ? (
          <div className="p-4 border-b border-[#1E1E28]">
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 ${
                isDragOver 
                  ? "border-[#7C3AED] bg-[#7C3AED]/5 shadow-[0_0_15px_rgba(124,58,237,0.15)]" 
                  : "border-[#2D2D3D] hover:border-[#7C3AED]/50 hover:bg-[#1E1E28]/30"
              }`}
            >
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                className="hidden" 
                accept=".pdf"
              />
              <UploadCloud className={`w-8 h-8 mb-2 transition-transform duration-300 ${isDragOver ? "scale-110 text-[#7C3AED]" : "text-[#888899]"}`} />
              <span className="text-xs font-semibold text-[#E8E8F0] mb-1">Drag & drop PDF here</span>
              <span className="text-[10px] text-[#888899]">Add PDFs to build the knowledge graph</span>
            </div>

            {uploadingFileName && uploadProgress !== null && (
              <div className="mt-4 bg-[#1A1A24] border border-[#2D2D3D] rounded-lg p-3 animate-fade-in">
                <div className="flex justify-between text-[10px] mb-1 text-[#888899]">
                  <span className="truncate max-w-[150px]">{uploadingFileName}</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-[#2D2D3D] h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-[#7C3AED] h-full transition-all duration-200" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-2 border-b border-[#1E1E28] flex justify-center">
            <button 
              onClick={() => fileInputRef.current?.click()}
              className="p-3 rounded-xl border border-[#2D2D3D] text-[#888899] hover:text-[#7C3AED] hover:border-[#7C3AED] transition-colors"
              title="Upload PDF"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Documents Ingestion List */}
        <div className="flex-1 overflow-hidden flex flex-col p-4">
          {sidebarOpen && (
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#888899] font-mono">Ingested Docs</span>
              <span className="text-[10px] bg-[#1E1E28] border border-[#2D2D3D] px-2 py-0.5 rounded-full text-[#888899] font-mono">
                {documents.length}
              </span>
            </div>
          )}

          <ScrollArea className="flex-1">
            <div className="space-y-2 pr-2">
              {documents.length === 0 ? (
                sidebarOpen ? (
                  <div className="text-center py-8 text-xs text-[#888899] italic">
                    No documents ingested yet.
                  </div>
                ) : null
              ) : (
                documents.map((doc, index) => (
                  <div 
                    key={doc.id} 
                    className="group flex items-center justify-between p-2.5 rounded-lg bg-[#181820]/40 border border-[#1E1E28] hover:border-[#7C3AED]/30 hover:bg-[#181820] transition-all duration-300 animate-slide-up"
                    style={{ animationDelay: `${index * 80}ms` }}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="p-1.5 rounded-md bg-[#252530] text-[#EF4444] shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      {sidebarOpen && (
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-xs font-medium text-white truncate max-w-[120px]" title={doc.name}>
                            {doc.name}
                          </span>
                          <span className="text-[9px] text-[#888899] font-mono">{doc.size}</span>
                        </div>
                      )}
                    </div>
                    
                    {sidebarOpen && (
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-medium ${
                          doc.status === "Indexed" 
                            ? "bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20" 
                            : doc.status === "Processing"
                            ? "bg-[#F59E0B]/10 text-[#F59E0B] border border-[#F59E0B]/20"
                            : "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/20"
                        }`}>
                          {doc.status}
                        </span>
                        
                        <button 
                          onClick={() => handleDeleteDoc(doc.id, doc.name)}
                          className="p-1 text-[#888899] hover:text-[#EF4444] opacity-50 hover:opacity-100 rounded transition-all duration-200 shrink-0"
                          title="Delete PDF"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Sidebar Footer */}
        <div className="h-16 border-t border-[#1E1E28] bg-[#0E0E12] flex items-center px-4 justify-between overflow-hidden shrink-0">
          <div className="flex items-center gap-2.5">
            <Avatar className="w-8 h-8 border border-[#2D2D3D]">
              <AvatarFallback className="bg-[#7C3AED] text-white text-xs font-semibold font-mono">
                ME
              </AvatarFallback>
            </Avatar>
            {sidebarOpen && (
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-white">Bhushan</span>
                <span className="text-[10px] text-[#888899]">System Admin</span>
              </div>
            )}
          </div>
          {sidebarOpen && (
            <button className="p-1.5 text-[#888899] hover:text-white hover:bg-[#1E1E28] rounded-md transition-colors">
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0C0C0F] relative z-10">
        
        {/* Header */}
        <header className="h-16 border-b border-[#1E1E28] bg-[#0C0C0F]/90 backdrop-blur-md flex items-center px-6 justify-between sticky top-0 z-10 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 text-[#888899] hover:text-white hover:bg-[#1E1E28] rounded-lg transition-colors"
            >
              <PanelLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
                Agentic Assistant <Sparkles className="w-4 h-4 text-[#7C3AED]" />
              </h1>
              <span className="text-[10px] text-[#888899]">RAG Graph Knowledge Synthesis</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-[#14141A] border border-[#1E1E28] text-xs font-semibold text-[#888899]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]"></span>
              </span>
              Gemini 2.5 Flash via Qdrant
            </div>
            
            <div className="flex items-center gap-1.5">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClearChat}
                className="text-xs text-[#888899] hover:text-white hover:bg-[#1E1E28] h-8 rounded-lg"
              >
                Clear
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleExportChat}
                className="text-xs text-[#888899] hover:text-white hover:bg-[#1E1E28] h-8 rounded-lg"
              >
                Export
              </Button>
            </div>
          </div>
        </header>

        {/* Chat Thread */}
        <div 
          className="flex-grow overflow-y-auto px-6 py-8 relative scroll-smooth" 
          ref={scrollRef}
        >
          {messages.length === 0 ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 select-none">
              <div className="w-16 h-16 rounded-2xl bg-[#1E1E28] border border-[#2D2D3D] flex items-center justify-center text-[#7C3AED] mb-4 animate-pulse">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-white mb-1">KnowledgeOS Graph Synthesizer</h3>
              <p className="text-xs text-[#888899] max-w-sm">
                Upload PDFs to ingest entities and semantic connections, then query the graph below.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-6">
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  className={`flex gap-4 group/msg animate-fade-in ${
                    m.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar */}
                  <Avatar className={`w-9 h-9 border ${m.role === "user" ? "border-[#7C3AED]/50" : "border-[#2D2D3D]"} shrink-0 shadow-sm`}>
                    <AvatarFallback className={`font-mono text-[10px] font-bold ${
                      m.role === "assistant" 
                        ? "bg-[#7C3AED] text-white" 
                        : "bg-[#252530] text-[#888899]"
                    }`}>
                      {m.role === "assistant" ? "AI" : "ME"}
                    </AvatarFallback>
                  </Avatar>

                  {/* Message Container */}
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    <div 
                      className={`relative rounded-2xl p-4 shadow-sm border leading-relaxed ${
                        m.role === "user"
                          ? "bg-gradient-to-tr from-[#7C3AED] to-[#6D28D9] border-[#7C3AED]/20 text-white rounded-tr-none"
                          : "bg-[#161620] border-[#252535] text-[#E8E8F0] rounded-tl-none prose prose-sm prose-invert max-w-none prose-headings:font-bold prose-headings:text-white prose-a:text-[#7C3AED] prose-code:text-[#A78BFA] prose-code:bg-[#20202F] prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:before:content-none prose-code:after:content-none"
                      }`}
                    >
                      {/* Message Content */}
                      <ReactMarkdown>{m.content}</ReactMarkdown>

                      {/* Copy Action Button */}
                      {m.role === "assistant" && (
                        <button 
                          onClick={() => handleCopyText(m.content, m.id)}
                          className="absolute top-3 right-3 opacity-0 group-hover/msg:opacity-100 p-1 text-[#888899] hover:text-white bg-[#1A1A24] border border-[#2D2D3D] rounded transition-all duration-200"
                          title="Copy Answer"
                        >
                          {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-[#22C55E]" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>

                    {/* Sources & Metadata */}
                    <div className={`flex items-center gap-3 text-[10px] px-1 text-[#888899] font-mono`}>
                      <span className="opacity-0 group-hover/msg:opacity-100 transition-opacity flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {m.timestamp}
                      </span>
                      
                      {m.role === "assistant" && m.sources && m.sources.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {m.sources.map((src, i) => (
                            <span 
                              key={i} 
                              className="inline-flex items-center gap-1 bg-[#1E1E28] hover:bg-[#252535] border border-[#2D2D3D] text-[#A78BFA] px-2 py-0.5 rounded-md cursor-default text-[9px]"
                            >
                              <Paperclip className="w-2.5 h-2.5" />
                              {src.filename} · Page {src.page}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Typing Animated Loader */}
              {isLoading && (
                <div className="flex gap-4 animate-fade-in">
                  <Avatar className="w-9 h-9 border border-[#2D2D3D] shrink-0">
                    <AvatarFallback className="bg-[#7C3AED] text-white text-[10px] font-mono font-bold">
                      AI
                    </AvatarFallback>
                  </Avatar>
                  <div className="rounded-2xl p-4 bg-[#161620] border border-[#252535] rounded-tl-none flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-[#7C3AED] animate-bounce"></span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-[#0C0C0F] border-t border-[#1E1E28] relative">
          <div className="max-w-3xl mx-auto relative">
            
            {/* Mention Dropdown Autocomplete */}
            {showMentionDropdown && filteredDocs.length > 0 && (
              <div className="absolute bottom-full left-0 mb-2 w-72 bg-[#14141A] border border-[#2D2D3D] rounded-xl shadow-[0_-4px_30px_rgba(0,0,0,0.5)] overflow-hidden z-30 animate-fade-in">
                <div className="px-3 py-2 bg-[#1A1A24] border-b border-[#2D2D3D] text-[10px] uppercase font-mono font-bold tracking-wider text-[#888899]">
                  Ingested Vector Nodes
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredDocs.map((doc) => (
                    <button 
                      key={doc.id}
                      onClick={() => insertMention(doc.name)}
                      className="w-full text-left px-3 py-2.5 text-xs text-[#E8E8F0] hover:bg-[#7C3AED]/20 hover:text-white flex items-center gap-2 border-b border-[#1E1E28]/50 last:border-0 transition-colors"
                    >
                      <FileText className="w-4 h-4 text-[#EF4444]" />
                      <span className="truncate">{doc.name}</span>
                      <span className="ml-auto text-[9px] text-[#888899] font-mono">{doc.size}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="relative group rounded-2xl border border-[#2D2D3D] bg-[#14141A] focus-within:border-[#7C3AED] focus-within:shadow-[0_0_15px_rgba(124,58,237,0.1)] transition-all overflow-hidden">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask me anything about your enterprise data... (type @ for files)"
                className="w-full py-4 pl-4 pr-14 text-sm bg-transparent border-0 outline-none focus:ring-0 text-[#E8E8F0] placeholder-[#888899] resize-none h-[54px] max-h-40 scrollbar-none"
              />

              <div className="absolute right-2.5 bottom-2 flex items-center gap-2">
                <Button 
                  size="icon"
                  className={`rounded-xl h-9 w-9 bg-[#7C3AED] hover:bg-[#6D28D9] text-white shadow-sm transition-all duration-200 ${
                    input.trim() ? "scale-100 pulse" : "opacity-40 cursor-not-allowed scale-95"
                  }`}
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center mt-2 px-1 text-[10px] text-[#888899] font-mono">
              <div className="flex gap-2">
                <span>**Bold**</span>
                <span>*List</span>
                <span>@mention</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span>Shift + Enter for new line</span>
                <HelpCircle className="w-3.5 h-3.5" />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Global CSS Inject for Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-slide-up {
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        /* Custom scrollbar hides */
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-none {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
