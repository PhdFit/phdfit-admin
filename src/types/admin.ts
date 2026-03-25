// Shared types for PhdFit Admin Console

// === Professor Data Manager ===
export interface Professor {
  id: string;
  name: string;
  email: string | null;
  institution: string;
  department: string;
  title: string;
  research_interests: string[];
  h_index: number | null;
  paper_count: number;
  grant_count: number;
  has_embedding: boolean;
  has_signals: boolean;
  data_completeness: number; // 0-100
  created_at: string;
  updated_at: string;
}

export interface ProfessorDuplicate {
  id: string;
  professor_a: Professor;
  professor_b: Professor;
  similarity_score: number;
  status: "pending" | "merged" | "dismissed";
}

// === Crawler Monitor ===
export type CrawlJobStatus = "running" | "completed" | "failed" | "queued" | "cancelled";
export type CrawlJobType = "faculty_page" | "lab_page" | "paper_sync" | "grant_sync" | "signal_detect";

export interface CrawlJob {
  id: string;
  type: CrawlJobType;
  status: CrawlJobStatus;
  target: string; // URL or description
  started_at: string | null;
  completed_at: string | null;
  duration_seconds: number | null;
  items_processed: number;
  items_failed: number;
  error_message: string | null;
}

export interface CronTask {
  id: string;
  name: string;
  schedule: string; // cron expression
  last_run: string | null;
  next_run: string;
  status: "active" | "paused";
  last_status: CrawlJobStatus | null;
}

export interface DataCoverage {
  total_professors: number;
  with_papers: number;
  with_embeddings: number;
  with_signals: number;
  with_grants: number;
  avg_completeness: number;
}

// === Taxonomy Manager ===
export type TopicType = "domain" | "topic" | "method";

export interface TaxonomyNode {
  id: string;
  name: string;
  type: TopicType;
  parent_id: string | null;
  children: TaxonomyNode[];
  usage_count: number; // how many professors/papers reference this
  created_at: string;
}

// === Signal Quality Review ===
export type SignalType = "recruiting" | "funding" | "collaboration";
export type SignalStatus = "pending_review" | "confirmed" | "rejected";

export interface RecruitingSignal {
  id: string;
  professor_id: string;
  professor_name: string;
  institution: string;
  signal_type: SignalType;
  confidence: number; // 0-1
  source_url: string;
  extracted_text: string;
  detected_at: string;
  status: SignalStatus;
  reviewer_notes: string | null;
}

// === User Analytics ===
export interface User {
  id: string;
  email: string;
  name: string | null;
  plan: "free" | "pro" | "consultant";
  status: "active" | "inactive" | "suspended";
  searches_today: number;
  shortlist_count: number;
  last_active: string;
  created_at: string;
}

export interface AnalyticsOverview {
  dau: number;
  wau: number;
  mau: number;
  total_users: number;
  conversion_rate: number; // free -> pro
  retention_7d: number;
  retention_30d: number;
  avg_searches_per_user: number;
}

export interface SearchQuery {
  query: string;
  count: number;
  avg_results: number;
  zero_results: boolean;
}

// === LLM Cost Monitor ===
export interface LLMUsageEntry {
  date: string;
  model: string;
  purpose: string; // "resume_parse" | "topic_tag" | "fit_explain" etc.
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  request_count: number;
}

export interface LLMCostSummary {
  total_cost_today: number;
  total_cost_week: number;
  total_cost_month: number;
  cache_hit_rate: number;
  top_model: string;
  top_purpose: string;
}

// === System Health ===
export type ServiceStatus = "healthy" | "degraded" | "down";

export interface ServiceHealth {
  name: string;
  status: ServiceStatus;
  latency_p95_ms: number;
  error_rate: number; // percentage
  uptime: number; // percentage
  last_check: string;
}

export interface ResourceUsage {
  name: string;
  current: number;
  limit: number;
  unit: string;
  percentage: number;
}

export interface QueueStatus {
  name: string;
  pending: number;
  processing: number;
  failed: number;
  throughput_per_min: number;
}
