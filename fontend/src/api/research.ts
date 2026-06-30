import { apiClient } from "./client";
import type { ApiResponse, ResearchResult } from "../types";

export const searchResearch = async (query: string, maxResults: number) => {
  const response = await apiClient.post<ApiResponse<ResearchResult[]>>("/research/search", {
    query,
    max_results: maxResults,
  });
  return response.data.data;
};

export const getResearchResults = async () => {
  const response = await apiClient.get<ApiResponse<ResearchResult[]>>("/research/results");
  return response.data.data;
};

