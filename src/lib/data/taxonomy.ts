import { supabase } from "@/lib/supabase";

export interface TopicRow {
  id: string;
  name: string;
  normalized_name: string;
  topic_type: string;
  parent_topic_id: string | null;
  usage_count: number;
  created_at: string;
  children: TopicRow[];
}

export async function getTopicsTree(): Promise<TopicRow[] | null> {
  if (!supabase) return null;

  // Fetch all topics with usage counts
  const { data: topics, error: topicErr } = await supabase
    .from("topics")
    .select("id, name, normalized_name, topic_type, parent_topic_id, created_at")
    .order("name");

  if (topicErr || !topics) {
    console.error("getTopicsTree error:", topicErr);
    return null;
  }

  // Get usage counts (professor_topics references)
  const { data: usageCounts, error: usageErr } = await supabase
    .from("professor_topics")
    .select("topic_id");

  if (usageErr) {
    console.error("getTopicsTree usage error:", usageErr);
  }

  // Count per topic
  const countMap = new Map<string, number>();
  for (const row of usageCounts ?? []) {
    const tid = (row as Record<string, unknown>).topic_id as string;
    countMap.set(tid, (countMap.get(tid) ?? 0) + 1);
  }

  // Build tree
  const nodeMap = new Map<string, TopicRow>();
  for (const t of topics) {
    const row = t as Record<string, unknown>;
    nodeMap.set(row.id as string, {
      id: row.id as string,
      name: row.name as string,
      normalized_name: row.normalized_name as string,
      topic_type: row.topic_type as string,
      parent_topic_id: row.parent_topic_id as string | null,
      usage_count: countMap.get(row.id as string) ?? 0,
      created_at: row.created_at as string,
      children: [],
    });
  }

  const roots: TopicRow[] = [];
  for (const node of nodeMap.values()) {
    if (node.parent_topic_id && nodeMap.has(node.parent_topic_id)) {
      nodeMap.get(node.parent_topic_id)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export async function getTopicStats(): Promise<{
  total: number;
  domains: number;
  topics: number;
  methods: number;
  orphans: number;
} | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("topics")
    .select("id, topic_type");

  if (error || !data) return null;

  const { data: used } = await supabase
    .from("professor_topics")
    .select("topic_id");

  const usedSet = new Set((used ?? []).map((r: Record<string, unknown>) => r.topic_id as string));

  const rows = data as Array<Record<string, unknown>>;
  return {
    total: rows.length,
    domains: rows.filter((r) => r.topic_type === "domain" || r.topic_type === "discipline").length,
    topics: rows.filter((r) => r.topic_type === "research_topic").length,
    methods: rows.filter((r) => r.topic_type === "method").length,
    orphans: rows.filter((r) => !usedSet.has(r.id as string)).length,
  };
}
