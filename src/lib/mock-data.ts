import type {
  Professor,
  CrawlJob,
  CronTask,
  DataCoverage,
  TaxonomyNode,
  RecruitingSignal,
  User,
  AnalyticsOverview,
  SearchQuery,
  LLMUsageEntry,
  LLMCostSummary,
  ServiceHealth,
  ResourceUsage,
  QueueStatus,
} from "@/types/admin";

// === Professors ===
export const mockProfessors: Professor[] = [
  {
    id: "prof-001", name: "Dr. Alice Chen", email: "achen@stanford.edu",
    institution: "Stanford University", department: "Computer Science", title: "Associate Professor",
    research_interests: ["Machine Learning", "NLP", "Multimodal AI"],
    h_index: 42, paper_count: 87, grant_count: 3, has_embedding: true, has_signals: true,
    data_completeness: 95, created_at: "2026-01-15T00:00:00Z", updated_at: "2026-03-20T00:00:00Z",
  },
  {
    id: "prof-002", name: "Dr. Bob Williams", email: "bwilliams@mit.edu",
    institution: "MIT", department: "EECS", title: "Full Professor",
    research_interests: ["Robotics", "Computer Vision", "Reinforcement Learning"],
    h_index: 58, paper_count: 134, grant_count: 5, has_embedding: true, has_signals: false,
    data_completeness: 82, created_at: "2026-01-15T00:00:00Z", updated_at: "2026-03-18T00:00:00Z",
  },
  {
    id: "prof-003", name: "Dr. Carol Davis", email: null,
    institution: "UC Berkeley", department: "Computer Science", title: "Assistant Professor",
    research_interests: ["AI Safety", "Alignment"],
    h_index: 18, paper_count: 25, grant_count: 1, has_embedding: true, has_signals: true,
    data_completeness: 68, created_at: "2026-02-01T00:00:00Z", updated_at: "2026-03-22T00:00:00Z",
  },
  {
    id: "prof-004", name: "Dr. David Kim", email: "dkim@cmu.edu",
    institution: "Carnegie Mellon University", department: "Machine Learning", title: "Associate Professor",
    research_interests: ["Graph Neural Networks", "Drug Discovery"],
    h_index: 35, paper_count: 62, grant_count: 2, has_embedding: false, has_signals: false,
    data_completeness: 45, created_at: "2026-02-10T00:00:00Z", updated_at: "2026-03-15T00:00:00Z",
  },
  {
    id: "prof-005", name: "Dr. Elena Rodriguez", email: "erodriguez@uw.edu",
    institution: "University of Washington", department: "CSE", title: "Full Professor",
    research_interests: ["HCI", "Accessibility", "Social Computing"],
    h_index: 47, paper_count: 95, grant_count: 4, has_embedding: true, has_signals: true,
    data_completeness: 91, created_at: "2026-01-20T00:00:00Z", updated_at: "2026-03-21T00:00:00Z",
  },
];

// === Crawl Jobs ===
export const mockCrawlJobs: CrawlJob[] = [
  {
    id: "cj-001", type: "faculty_page", status: "completed", target: "Stanford CS Faculty Directory",
    started_at: "2026-03-24T02:00:00Z", completed_at: "2026-03-24T02:35:00Z",
    duration_seconds: 2100, items_processed: 48, items_failed: 2, error_message: null,
  },
  {
    id: "cj-002", type: "paper_sync", status: "running", target: "OpenAlex daily sync",
    started_at: "2026-03-25T02:00:00Z", completed_at: null,
    duration_seconds: null, items_processed: 312, items_failed: 0, error_message: null,
  },
  {
    id: "cj-003", type: "grant_sync", status: "failed", target: "NSF Award Search sync",
    started_at: "2026-03-23T03:00:00Z", completed_at: "2026-03-23T03:05:00Z",
    duration_seconds: 300, items_processed: 0, items_failed: 1, error_message: "NSF API returned 503 Service Unavailable",
  },
  {
    id: "cj-004", type: "signal_detect", status: "queued", target: "Weekly signal refresh",
    started_at: null, completed_at: null,
    duration_seconds: null, items_processed: 0, items_failed: 0, error_message: null,
  },
  {
    id: "cj-005", type: "lab_page", status: "completed", target: "MIT CSAIL Lab Pages",
    started_at: "2026-03-24T01:00:00Z", completed_at: "2026-03-24T01:22:00Z",
    duration_seconds: 1320, items_processed: 35, items_failed: 1, error_message: null,
  },
];

export const mockCronTasks: CronTask[] = [
  { id: "cron-1", name: "sync_papers", schedule: "0 2 * * *", last_run: "2026-03-25T02:00:00Z", next_run: "2026-03-26T02:00:00Z", status: "active", last_status: "running" },
  { id: "cron-2", name: "crawl_faculty_pages", schedule: "0 0 * * 0", last_run: "2026-03-23T00:00:00Z", next_run: "2026-03-30T00:00:00Z", status: "active", last_status: "completed" },
  { id: "cron-3", name: "sync_grants", schedule: "0 3 1,15 * *", last_run: "2026-03-15T03:00:00Z", next_run: "2026-04-01T03:00:00Z", status: "active", last_status: "completed" },
  { id: "cron-4", name: "recompute_features", schedule: "0 4 * * *", last_run: "2026-03-25T04:00:00Z", next_run: "2026-03-26T04:00:00Z", status: "active", last_status: "completed" },
  { id: "cron-5", name: "refresh_embeddings", schedule: "0 5 * * 1", last_run: "2026-03-24T05:00:00Z", next_run: "2026-03-31T05:00:00Z", status: "active", last_status: "completed" },
  { id: "cron-6", name: "detect_signals", schedule: "0 1 * * 3", last_run: "2026-03-19T01:00:00Z", next_run: "2026-03-26T01:00:00Z", status: "active", last_status: "completed" },
  { id: "cron-7", name: "cleanup_expired_signals", schedule: "0 0 1 * *", last_run: "2026-03-01T00:00:00Z", next_run: "2026-04-01T00:00:00Z", status: "paused", last_status: "completed" },
  { id: "cron-8", name: "generate_analytics", schedule: "0 6 * * *", last_run: "2026-03-25T06:00:00Z", next_run: "2026-03-26T06:00:00Z", status: "active", last_status: "completed" },
];

export const mockDataCoverage: DataCoverage = {
  total_professors: 487,
  with_papers: 462,
  with_embeddings: 445,
  with_signals: 298,
  with_grants: 312,
  avg_completeness: 78.4,
};

// === Taxonomy ===
export const mockTaxonomy: TaxonomyNode[] = [
  {
    id: "t-1", name: "Artificial Intelligence", type: "domain", parent_id: null, usage_count: 234, created_at: "2026-01-15T00:00:00Z",
    children: [
      { id: "t-1-1", name: "Machine Learning", type: "topic", parent_id: "t-1", usage_count: 189, created_at: "2026-01-15T00:00:00Z", children: [
        { id: "t-1-1-1", name: "Deep Learning", type: "topic", parent_id: "t-1-1", usage_count: 145, created_at: "2026-01-15T00:00:00Z", children: [] },
        { id: "t-1-1-2", name: "Reinforcement Learning", type: "topic", parent_id: "t-1-1", usage_count: 67, created_at: "2026-01-15T00:00:00Z", children: [] },
        { id: "t-1-1-3", name: "Federated Learning", type: "topic", parent_id: "t-1-1", usage_count: 23, created_at: "2026-01-15T00:00:00Z", children: [] },
      ]},
      { id: "t-1-2", name: "Natural Language Processing", type: "topic", parent_id: "t-1", usage_count: 156, created_at: "2026-01-15T00:00:00Z", children: [
        { id: "t-1-2-1", name: "Large Language Models", type: "topic", parent_id: "t-1-2", usage_count: 98, created_at: "2026-02-01T00:00:00Z", children: [] },
        { id: "t-1-2-2", name: "Information Extraction", type: "topic", parent_id: "t-1-2", usage_count: 34, created_at: "2026-01-15T00:00:00Z", children: [] },
      ]},
      { id: "t-1-3", name: "Computer Vision", type: "topic", parent_id: "t-1", usage_count: 112, created_at: "2026-01-15T00:00:00Z", children: [] },
    ],
  },
  {
    id: "t-2", name: "Systems", type: "domain", parent_id: null, usage_count: 89, created_at: "2026-01-15T00:00:00Z",
    children: [
      { id: "t-2-1", name: "Distributed Systems", type: "topic", parent_id: "t-2", usage_count: 45, created_at: "2026-01-15T00:00:00Z", children: [] },
      { id: "t-2-2", name: "Operating Systems", type: "topic", parent_id: "t-2", usage_count: 28, created_at: "2026-01-15T00:00:00Z", children: [] },
    ],
  },
  {
    id: "t-3", name: "Methods", type: "method", parent_id: null, usage_count: 310, created_at: "2026-01-15T00:00:00Z",
    children: [
      { id: "t-3-1", name: "Transformer", type: "method", parent_id: "t-3", usage_count: 178, created_at: "2026-01-15T00:00:00Z", children: [] },
      { id: "t-3-2", name: "Graph Neural Network", type: "method", parent_id: "t-3", usage_count: 67, created_at: "2026-01-15T00:00:00Z", children: [] },
      { id: "t-3-3", name: "Diffusion Model", type: "method", parent_id: "t-3", usage_count: 54, created_at: "2026-01-15T00:00:00Z", children: [] },
    ],
  },
];

// === Signals ===
export const mockSignals: RecruitingSignal[] = [
  {
    id: "sig-001", professor_id: "prof-001", professor_name: "Dr. Alice Chen", institution: "Stanford University",
    signal_type: "recruiting", confidence: 0.92, source_url: "https://cs.stanford.edu/~achen/lab",
    extracted_text: "We are actively looking for PhD students interested in multimodal AI for Fall 2027.",
    detected_at: "2026-03-20T00:00:00Z", status: "pending_review", reviewer_notes: null,
  },
  {
    id: "sig-002", professor_id: "prof-003", professor_name: "Dr. Carol Davis", institution: "UC Berkeley",
    signal_type: "recruiting", confidence: 0.65, source_url: "https://people.eecs.berkeley.edu/~cdavis/",
    extracted_text: "Prospective students: please see my research page for current openings.",
    detected_at: "2026-03-19T00:00:00Z", status: "pending_review", reviewer_notes: null,
  },
  {
    id: "sig-003", professor_id: "prof-005", professor_name: "Dr. Elena Rodriguez", institution: "University of Washington",
    signal_type: "funding", confidence: 0.88, source_url: "https://nsf.gov/awardsearch/showAward?AWD_ID=2612345",
    extracted_text: "NSF CAREER Award: $600K for 5 years, Inclusive Design for AI-Powered Accessibility Tools",
    detected_at: "2026-03-22T00:00:00Z", status: "confirmed", reviewer_notes: "Verified on NSF website",
  },
  {
    id: "sig-004", professor_id: "prof-002", professor_name: "Dr. Bob Williams", institution: "MIT",
    signal_type: "recruiting", confidence: 0.42, source_url: "https://people.csail.mit.edu/bwilliams/",
    extracted_text: "Our lab focuses on building robust autonomous systems.",
    detected_at: "2026-03-21T00:00:00Z", status: "rejected", reviewer_notes: "Generic lab description, not a recruiting signal",
  },
];

// === Users ===
export const mockUsers: User[] = [
  { id: "u-001", email: "alice@example.com", name: "Alice Zhang", plan: "pro", status: "active", searches_today: 12, shortlist_count: 3, last_active: "2026-03-25T10:30:00Z", created_at: "2026-01-20T00:00:00Z" },
  { id: "u-002", email: "bob@example.com", name: "Bob Li", plan: "free", status: "active", searches_today: 3, shortlist_count: 1, last_active: "2026-03-25T09:15:00Z", created_at: "2026-02-15T00:00:00Z" },
  { id: "u-003", email: "carol@example.com", name: "Carol Wang", plan: "free", status: "active", searches_today: 0, shortlist_count: 0, last_active: "2026-03-20T14:00:00Z", created_at: "2026-03-01T00:00:00Z" },
  { id: "u-004", email: "david@example.com", name: "David Park", plan: "pro", status: "active", searches_today: 8, shortlist_count: 2, last_active: "2026-03-25T11:00:00Z", created_at: "2026-01-25T00:00:00Z" },
  { id: "u-005", email: "eva@example.com", name: null, plan: "free", status: "inactive", searches_today: 0, shortlist_count: 0, last_active: "2026-02-28T08:00:00Z", created_at: "2026-02-20T00:00:00Z" },
];

export const mockAnalyticsOverview: AnalyticsOverview = {
  dau: 47, wau: 156, mau: 423, total_users: 512,
  conversion_rate: 8.2, retention_7d: 62.5, retention_30d: 38.1, avg_searches_per_user: 4.3,
};

export const mockSearchQueries: SearchQuery[] = [
  { query: "machine learning NLP", count: 89, avg_results: 34, zero_results: false },
  { query: "robotics professor USA", count: 67, avg_results: 28, zero_results: false },
  { query: "AI safety alignment", count: 52, avg_results: 12, zero_results: false },
  { query: "quantum computing ML", count: 31, avg_results: 5, zero_results: false },
  { query: "bioinformatics deep learning", count: 28, avg_results: 8, zero_results: false },
  { query: "federated learning privacy", count: 15, avg_results: 0, zero_results: true },
  { query: "neuromorphic computing", count: 12, avg_results: 0, zero_results: true },
];

// === LLM ===
export const mockLLMUsage: LLMUsageEntry[] = [
  { date: "2026-03-25", model: "claude-haiku-4.5", purpose: "topic_tag", input_tokens: 45000, output_tokens: 12000, cost_usd: 0.85, request_count: 120 },
  { date: "2026-03-25", model: "claude-sonnet-4.6", purpose: "fit_explain", input_tokens: 82000, output_tokens: 38000, cost_usd: 4.20, request_count: 45 },
  { date: "2026-03-25", model: "gpt-4o-mini", purpose: "resume_parse", input_tokens: 15000, output_tokens: 8000, cost_usd: 0.12, request_count: 8 },
  { date: "2026-03-25", model: "text-embedding-3-small", purpose: "embedding", input_tokens: 120000, output_tokens: 0, cost_usd: 0.24, request_count: 200 },
  { date: "2026-03-24", model: "claude-haiku-4.5", purpose: "topic_tag", input_tokens: 52000, output_tokens: 14000, cost_usd: 0.98, request_count: 140 },
  { date: "2026-03-24", model: "claude-sonnet-4.6", purpose: "fit_explain", input_tokens: 75000, output_tokens: 35000, cost_usd: 3.85, request_count: 40 },
  { date: "2026-03-24", model: "claude-haiku-4.5", purpose: "paper_summary", input_tokens: 95000, output_tokens: 42000, cost_usd: 2.10, request_count: 65 },
  { date: "2026-03-23", model: "claude-sonnet-4.6", purpose: "fit_explain", input_tokens: 68000, output_tokens: 30000, cost_usd: 3.42, request_count: 35 },
];

export const mockLLMCostSummary: LLMCostSummary = {
  total_cost_today: 5.41,
  total_cost_week: 32.80,
  total_cost_month: 128.50,
  cache_hit_rate: 73.2,
  top_model: "claude-sonnet-4.6",
  top_purpose: "fit_explain",
};

// === System Health ===
export const mockServices: ServiceHealth[] = [
  { name: "Core API (Service 1)", status: "healthy", latency_p95_ms: 45, error_rate: 0.1, uptime: 99.98, last_check: "2026-03-25T12:00:00Z" },
  { name: "Data Ingestion (Service 2)", status: "healthy", latency_p95_ms: 120, error_rate: 0.5, uptime: 99.85, last_check: "2026-03-25T12:00:00Z" },
  { name: "Semantic Analysis (Service 3)", status: "healthy", latency_p95_ms: 230, error_rate: 0.3, uptime: 99.92, last_check: "2026-03-25T12:00:00Z" },
  { name: "Search & Ranking (Service 4)", status: "degraded", latency_p95_ms: 580, error_rate: 2.1, uptime: 99.50, last_check: "2026-03-25T12:00:00Z" },
  { name: "LLM Orchestration (Service 5)", status: "healthy", latency_p95_ms: 1200, error_rate: 0.8, uptime: 99.70, last_check: "2026-03-25T12:00:00Z" },
  { name: "Export & Report (Service 6)", status: "healthy", latency_p95_ms: 350, error_rate: 0.2, uptime: 99.95, last_check: "2026-03-25T12:00:00Z" },
];

export const mockResources: ResourceUsage[] = [
  { name: "Supabase PostgreSQL", current: 248, limit: 500, unit: "MB", percentage: 49.6 },
  { name: "Cloudflare Workers (daily)", current: 32400, limit: 100000, unit: "requests", percentage: 32.4 },
  { name: "Upstash Redis (daily)", current: 4800, limit: 10000, unit: "commands", percentage: 48.0 },
  { name: "Cloudflare R2", current: 2.1, limit: 10, unit: "GB", percentage: 21.0 },
  { name: "Vercel Bandwidth (monthly)", current: 18, limit: 100, unit: "GB", percentage: 18.0 },
];

export const mockQueues: QueueStatus[] = [
  { name: "resume_parse", pending: 2, processing: 1, failed: 0, throughput_per_min: 3 },
  { name: "paper_sync", pending: 45, processing: 5, failed: 2, throughput_per_min: 12 },
  { name: "embedding_generate", pending: 0, processing: 0, failed: 0, throughput_per_min: 0 },
  { name: "report_generate", pending: 1, processing: 0, failed: 0, throughput_per_min: 1 },
];
