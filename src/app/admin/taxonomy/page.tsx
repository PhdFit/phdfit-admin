"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockTaxonomy } from "@/lib/mock-data";
import type { TaxonomyNode, TopicType } from "@/types/admin";
import {
  ChevronRight,
  ChevronDown,
  Plus,
  GitMerge,
  Tags,
  FolderTree,
  Hash,
  FlaskConical,
  AlertTriangle,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Recursively flatten the taxonomy tree into a list of all nodes. */
function flattenNodes(nodes: TaxonomyNode[]): TaxonomyNode[] {
  const result: TaxonomyNode[] = [];
  for (const node of nodes) {
    result.push(node);
    if (node.children.length > 0) {
      result.push(...flattenNodes(node.children));
    }
  }
  return result;
}

/** Return badge colour classes based on TopicType. */
function typeBadgeVariant(type: TopicType) {
  switch (type) {
    case "domain":
      return "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300";
    case "topic":
      return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    case "method":
      return "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300";
  }
}

// ---------------------------------------------------------------------------
// Recursive tree-item component
// ---------------------------------------------------------------------------

function TaxonomyTreeItem({
  node,
  depth,
  expandedIds,
  toggleExpand,
}: {
  node: TaxonomyNode;
  depth: number;
  expandedIds: Set<string>;
  toggleExpand: (id: string) => void;
}) {
  const hasChildren = node.children.length > 0;
  const isExpanded = expandedIds.has(node.id);

  return (
    <div>
      {/* Row */}
      <button
        type="button"
        onClick={() => hasChildren && toggleExpand(node.id)}
        className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-colors hover:bg-muted/60 ${
          hasChildren ? "cursor-pointer" : "cursor-default"
        }`}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {/* Expand / collapse icon */}
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground">
          {hasChildren ? (
            isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )
          ) : (
            <span className="inline-block h-1 w-1 rounded-full bg-muted-foreground/40" />
          )}
        </span>

        {/* Name */}
        <span className="flex-1 truncate font-medium">{node.name}</span>

        {/* Type badge */}
        <Badge
          variant="outline"
          className={`pointer-events-none border-transparent text-[10px] uppercase tracking-wide ${typeBadgeVariant(node.type)}`}
        >
          {node.type}
        </Badge>

        {/* Usage count */}
        <span className="min-w-[3rem] text-right tabular-nums text-xs text-muted-foreground">
          {node.usage_count}
        </span>
      </button>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div>
          {node.children.map((child) => (
            <TaxonomyTreeItem
              key={child.id}
              node={child}
              depth={depth + 1}
              expandedIds={expandedIds}
              toggleExpand={toggleExpand}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function TaxonomyPage() {
  // Expand / collapse state -------------------------------------------------
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Top-level nodes start expanded
    return new Set(mockTaxonomy.map((n) => n.id));
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Derived stats -----------------------------------------------------------
  const allNodes = flattenNodes(mockTaxonomy);
  const totalNodes = allNodes.length;
  const domainCount = allNodes.filter((n) => n.type === "domain").length;
  const topicCount = allNodes.filter((n) => n.type === "topic").length;
  const methodCount = allNodes.filter((n) => n.type === "method").length;
  const orphanCount = allNodes.filter((n) => n.usage_count === 0).length;

  // Render ------------------------------------------------------------------
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Taxonomy Manager</h1>
          <p className="text-sm text-muted-foreground">
            Browse and manage the research taxonomy hierarchy.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <GitMerge className="mr-1.5 h-4 w-4" />
            Merge Tags
          </Button>
          <Button size="sm">
            <Plus className="mr-1.5 h-4 w-4" />
            Add Topic / Method
          </Button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <FolderTree className="mr-1 inline-block h-3.5 w-3.5 align-text-bottom" />
              Total Nodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalNodes}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Tags className="mr-1 inline-block h-3.5 w-3.5 align-text-bottom" />
              Domains
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{domainCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <Hash className="mr-1 inline-block h-3.5 w-3.5 align-text-bottom" />
              Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{topicCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <FlaskConical className="mr-1 inline-block h-3.5 w-3.5 align-text-bottom" />
              Methods
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{methodCount}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              <AlertTriangle className="mr-1 inline-block h-3.5 w-3.5 align-text-bottom" />
              Orphan Nodes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orphanCount}</div>
          </CardContent>
        </Card>
      </div>

      {/* Taxonomy tree */}
      <Card>
        <CardHeader>
          <CardTitle>Taxonomy Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Column labels */}
          <div className="mb-1 flex items-center gap-2 border-b px-2 pb-2 text-xs font-medium text-muted-foreground">
            <span className="flex-1">Name</span>
            <span className="w-16 text-center">Type</span>
            <span className="min-w-[3rem] text-right">Usage</span>
          </div>

          {/* Tree */}
          <div className="space-y-px">
            {mockTaxonomy.map((node) => (
              <TaxonomyTreeItem
                key={node.id}
                node={node}
                depth={0}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
