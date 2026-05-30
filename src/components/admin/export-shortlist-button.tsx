"use client";

import { Download, FileSpreadsheet, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { ShortlistProfessorDetail } from "@/types/shortlist";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ExportShortlistButtonProps {
  shortlistTitle: string;
  items: ShortlistProfessorDetail[];
}

// ---------------------------------------------------------------------------
// CSV export — pure client-side Blob download
// ---------------------------------------------------------------------------

function exportCSV(title: string, items: ShortlistProfessorDetail[]) {
  const headers = [
    "Name",
    "Email",
    "Institution",
    "Department",
    "Title",
    "Bucket",
    "Contact Status",
    "H-Index",
    "Citations",
    "Impact",
    "Activity",
    "Funding",
    "Recruiting",
    "Industry",
    "Mentoring",
    "Note",
  ];

  const rows = items.map((item) => [
    item.professor_name,
    item.professor_email ?? "",
    item.institution_name ?? "",
    item.department_name ?? "",
    item.title ?? "",
    item.bucket ?? "",
    item.contact_status,
    item.scholar_h_index?.toString() ?? "",
    item.scholar_citation_count?.toString() ?? "",
    item.research_impact_score?.toString() ?? "",
    item.research_activity_score_hex?.toString() ?? "",
    item.funding_strength_score?.toString() ?? "",
    item.recruiting_signal_score_hex?.toString() ?? "",
    item.industry_opensource_score?.toString() ?? "",
    item.mentorship_culture_score?.toString() ?? "",
    (item.user_note ?? "").replace(/"/g, '""'),
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) =>
      row.map((cell) => `"${cell}"`).join(","),
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${title.replace(/[^a-zA-Z0-9]/g, "_")}_shortlist.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// PDF export — printable HTML via window.print()
// ---------------------------------------------------------------------------

function exportPDF(title: string, items: ShortlistProfessorDetail[]) {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return;

  const tableRows = items
    .map(
      (item) => `
    <tr>
      <td>${item.professor_name}</td>
      <td>${item.institution_name ?? ""}</td>
      <td>${item.department_name ?? ""}</td>
      <td>${item.bucket ?? "-"}</td>
      <td>${item.contact_status.replace("_", " ")}</td>
      <td style="text-align:right">${item.scholar_h_index ?? "-"}</td>
      <td style="text-align:right">${item.research_impact_score ?? "-"}</td>
      <td>${item.user_note ?? ""}</td>
    </tr>`,
    )
    .join("");

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${title} - Shortlist Export</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 2rem; color: #1a1a1a; }
        h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
        p.meta { color: #666; font-size: 0.85rem; margin-bottom: 1.5rem; }
        table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
        th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
        th { background: #f5f5f5; font-weight: 600; }
        tr:nth-child(even) { background: #fafafa; }
        @media print {
          body { margin: 0.5cm; }
          h1 { font-size: 14pt; }
        }
      </style>
    </head>
    <body>
      <h1>${title}</h1>
      <p class="meta">Exported on ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} &mdash; ${items.length} professor(s)</p>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Institution</th>
            <th>Department</th>
            <th>Bucket</th>
            <th>Contact</th>
            <th style="text-align:right">H-Index</th>
            <th style="text-align:right">Impact</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
        </tbody>
      </table>
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  // Short delay to let the page render before printing
  setTimeout(() => printWindow.print(), 250);
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExportShortlistButton({
  shortlistTitle,
  items,
}: ExportShortlistButtonProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" />}
      >
        <Download className="size-4" />
        Export
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => exportCSV(shortlistTitle, items)}>
          <FileSpreadsheet className="size-4" />
          Export CSV
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => exportPDF(shortlistTitle, items)}>
          <Printer className="size-4" />
          Export PDF
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
