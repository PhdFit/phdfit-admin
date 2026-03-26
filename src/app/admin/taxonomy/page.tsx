import { isSupabaseConnected } from "@/lib/supabase";
import { getTopicsTree, getTopicStats } from "@/lib/data/taxonomy";
import type { TopicRow } from "@/lib/data/taxonomy";
import { NoDbBanner } from "@/components/admin/no-db-banner";
import {
  TaxonomyTreeClient,
  type TaxonomyTreeNode,
  type TaxonomyStats,
} from "@/components/admin/taxonomy-tree";
import { mockTaxonomy } from "@/lib/mock-data";
import type { TaxonomyNode } from "@/types/admin";

// ---------------------------------------------------------------------------
// Mapping helpers
// ---------------------------------------------------------------------------

/**
 * Map a Supabase `topic_type` value to the badge colour key and a short
 * display label shown in the UI.
 *
 * DB topic_type values: "discipline", "domain", "research_topic", "method"
 * Badge colours:        "domain"   , "domain",  "topic"         , "method"
 */
function mapTopicType(topicType: string): {
  displayType: string;
  badgeColor: "domain" | "topic" | "method";
} {
  switch (topicType) {
    case "discipline":
      return { displayType: "discipline", badgeColor: "domain" };
    case "domain":
      return { displayType: "domain", badgeColor: "domain" };
    case "research_topic":
      return { displayType: "topic", badgeColor: "topic" };
    case "method":
      return { displayType: "method", badgeColor: "method" };
    default:
      return { displayType: topicType, badgeColor: "topic" };
  }
}

/** Convert a Supabase `TopicRow` tree into the `TaxonomyTreeNode` shape. */
function topicRowToTreeNode(row: TopicRow): TaxonomyTreeNode {
  const { displayType, badgeColor } = mapTopicType(row.topic_type);
  return {
    id: row.id,
    name: row.name,
    displayType,
    badgeColor,
    usage_count: row.usage_count,
    children: row.children.map(topicRowToTreeNode),
  };
}

/** Convert a mock `TaxonomyNode` tree into the `TaxonomyTreeNode` shape. */
function mockNodeToTreeNode(node: TaxonomyNode): TaxonomyTreeNode {
  return {
    id: node.id,
    name: node.name,
    displayType: node.type,
    badgeColor: node.type,
    usage_count: node.usage_count,
    children: node.children.map(mockNodeToTreeNode),
  };
}

/** Recursively flatten tree nodes so we can compute stats from mock data. */
function flattenMockNodes(nodes: TaxonomyNode[]): TaxonomyNode[] {
  const result: TaxonomyNode[] = [];
  for (const n of nodes) {
    result.push(n);
    if (n.children.length > 0) {
      result.push(...flattenMockNodes(n.children));
    }
  }
  return result;
}

function mockStats(): TaxonomyStats {
  const all = flattenMockNodes(mockTaxonomy);
  return {
    total: all.length,
    domains: all.filter((n) => n.type === "domain").length,
    topics: all.filter((n) => n.type === "topic").length,
    methods: all.filter((n) => n.type === "method").length,
    orphans: all.filter((n) => n.usage_count === 0).length,
  };
}

// ---------------------------------------------------------------------------
// Page (async Server Component)
// ---------------------------------------------------------------------------

export default async function TaxonomyPage() {
  const connected = isSupabaseConnected();

  let tree: TaxonomyTreeNode[];
  let stats: TaxonomyStats;
  let showBanner = false;

  if (connected) {
    const [topicsTree, topicStats] = await Promise.all([
      getTopicsTree(),
      getTopicStats(),
    ]);

    if (topicsTree && topicStats) {
      tree = topicsTree.map(topicRowToTreeNode);
      stats = topicStats;
    } else {
      // Supabase is configured but the queries failed -- fall back to mock
      showBanner = true;
      tree = mockTaxonomy.map(mockNodeToTreeNode);
      stats = mockStats();
    }
  } else {
    showBanner = true;
    tree = mockTaxonomy.map(mockNodeToTreeNode);
    stats = mockStats();
  }

  return (
    <>
      {showBanner && <NoDbBanner />}
      <TaxonomyTreeClient tree={tree} stats={stats} />
    </>
  );
}
