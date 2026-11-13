import { useState, useCallback, useEffect } from "react";
import { apiService, handleApiResponse } from "@/lib/api";

export const useDocuments = () => {
  const [documents, setDocuments] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: apiError } = await handleApiResponse(apiService.document.list());
      if (apiError) {
        throw new Error(apiError);
      }
      setDocuments(data?.documents || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch documents");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const uploadDocument = useCallback(async (file: File): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: apiError } = await handleApiResponse(apiService.document.upload(file));
      if (apiError) {
        throw new Error(apiError);
      }
      await fetchDocuments(); // Refresh document list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload document");
      return false;
    } finally {
      setLoading(false);
    }
  }, [fetchDocuments]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  return {
    documents,
    loading,
    error,
    refetch: fetchDocuments,
    uploadDocument,
  };
};