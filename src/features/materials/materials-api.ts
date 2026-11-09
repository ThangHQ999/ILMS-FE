import { api } from '@/lib/axios';
import type { ApiResponse } from '@/types/common';

export interface Draft {
  id: string;
  revision: number;
  hash: string;
  reviewStatus: string;
  graph: Record<string, unknown>;
  source: Record<string, unknown>;
  validation: { parser_warnings?: string[] };
}

export interface JobSummary {
  jobId: string;
  title: string;
  status: string;
}

export interface Job {
  jobId: string;
  status: string;
  stage: string | null;
  errorCode: string | null;
  draft: Draft | null;
}

export interface DraftGraph {
  revision_id: string;
  status: string;
  nodes: { id: string; kind: string; path: string; label: string }[];
  edges: { source: string; target: string; kind: string }[];
}

const root = '/materials/ingestion';

export const materials = {
  async upload(form: FormData) {
    const result = await api.post<ApiResponse<Job>>('/materials', form, {
      headers: { 'Content-Type': undefined },
      timeout: 60_000,
    });
    return result.data.data;
  },
  async list() {
    return (await api.get<ApiResponse<JobSummary[]>>(root)).data.data;
  },
  async get(id: string) {
    return (await api.get<ApiResponse<Job>>(`${root}/${id}`)).data.data;
  },
  async graph(job: string, revision: string) {
    return (await api.get<ApiResponse<DraftGraph>>(`${root}/${job}/drafts/${revision}/graph`)).data.data;
  },
  async save(job: string, draft: Draft, graph: Record<string, unknown>) {
    return (await api.post<ApiResponse<Draft>>(`${root}/${job}/drafts`, {
      baseRevisionId: draft.id, baseHash: draft.hash, graph,
    })).data.data;
  },
  async review(job: string, draft: Draft, decision: string) {
    await api.post(`${root}/${job}/review`, {
      baseRevisionId: draft.id, baseHash: draft.hash, decision,
    });
  },
  async retry(job: string) {
    await api.post(`${root}/${job}/retry`);
  },
};
