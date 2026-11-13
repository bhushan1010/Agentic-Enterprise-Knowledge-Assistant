import { Message } from "@/app/page";

// Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

// API Service Layer
export const apiService = {
  // Chat endpoints
  chat: {
    sendMessage: async (messages: Message[]): Promise<{ role: string; content: string }> => {
      const response = await fetch(`${API_BASE_URL}/api/chat/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages }),
      });

      if (!response.ok) {
        throw new Error(`Failed to send message: ${response.statusText}`);
      }

      return response.json();
    },
  },

  // Document endpoints
  document: {
    upload: async (file: File): Promise<{ filename: string; status: string }> => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(`${API_BASE_URL}/api/document/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `Failed to upload document: ${response.statusText}`);
      }

      return response.json();
    },

    list: async (): Promise<{ documents: string[] }> => {
      const response = await fetch(`${API_BASE_URL}/api/document/`);

      if (!response.ok) {
        throw new Error(`Failed to fetch documents: ${response.statusText}`);
      }

      return response.json();
    },
  },

  // Health check
  health: {
    check: async (): Promise<{ status: string }> => {
      const response = await fetch(`${API_BASE_URL}/`);

      if (!response.ok) {
        throw new Error(`Backend health check failed: ${response.statusText}`);
      }

      return response.json();
    },
  },
};

// Type-safe API response handlers
export const handleApiResponse = async <T>(promise: Promise<T>): Promise<{ data?: T; error?: string }> => {
  try {
    const data = await promise;
    return { data };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error occurred" };
  }
};