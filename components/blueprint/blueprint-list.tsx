"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Loader2, AlertTriangle, MoreHorizontal, Trash2, Archive, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { NewBlueprintDialog } from "./new-blueprint-dialog";
import { useToast } from "@/hooks/use-toast";
import type { BlueprintListItem, BlueprintStatus } from "@/lib/types";

interface ListApiResponse {
  blueprints?: BlueprintListItem[];
  error?: string;
}

async function fetchBlueprints(): Promise<BlueprintListItem[]> {
  const res = await fetch("/api/blueprints");
  const body = (await res.json().catch(() => ({}))) as ListApiResponse;
  if (!res.ok) {
    throw new Error(body.error || `Failed to load blueprints (HTTP ${res.status})`);
  }
  return body.blueprints ?? [];
}

async function deleteBlueprintApi(id: string): Promise<void> {
  const res = await fetch(`/api/blueprints/${id}`, { method: "DELETE" });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Failed to delete (HTTP ${res.status})`);
  }
}

async function updateStatusApi(id: string, status: BlueprintStatus): Promise<void> {
  const res = await fetch(`/api/blueprints/${id}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status })
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error || `Failed to update status (HTTP ${res.status})`);
  }
}

function fmtDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

type StatusFilterValue = BlueprintStatus | "all";

export function BlueprintList() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilterValue>("all");

  const query = useQuery({
    queryKey: ["blueprints"],
    queryFn: fetchBlueprints
  });

  const deleteMutation = useMutation({
    mutationFn: deleteBlueprintApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blueprints"] });
      toast({ title: "Blueprint deleted" });
    },
    onError: (err: Error) =>
      toast({ title: "Couldn't delete blueprint", description: err.message, variant: "destructive" })
  });

  const statusMutation = useMutation({
    mutationFn: (input: { id: string; status: BlueprintStatus }) =>
      updateStatusApi(input.id, input.status),
    onSuccess: (_data, vars) => {
      queryClient.invalidateQueries({ queryKey: ["blueprints"] });
      toast({ title: `Marked as ${vars.status === "in-review" ? "In Review" : vars.status}` });
    },
    onError: (err: Error) =>
      toast({ title: "Couldn't update status", description: err.message, variant: "destructive" })
  });

  const filtered = useMemo(() => {
    const items = query.data ?? [];
    const q = search.trim().toLowerCase();
    return items.filter((bp) => {
      if (statusFilter !== "all" && bp.status !== statusFilter) return false;
      if (!q) return true;
      const hay = `${bp.title} ${bp.systemName} ${bp.description}`.toLowerCase();
      return hay.includes(q);
    });
  }, [query.data, search, statusFilter]);

  const isEmpty = !query.isLoading && !query.error && (query.data ?? []).length === 0;

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <PageHeader
        eyebrow="UEW Healthcare · AI Innovations"
        title="System Architect"
        subtitle="Design, decompose, and document AI-augmented systems."
      />

      {/* Action bar */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <div className="flex flex-1 gap-3 items-center">
          <div className="relative flex-1 max-w-md">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <Input
              placeholder="Search title, system, or description…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 bg-white"
              disabled={isEmpty}
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as StatusFilterValue)}
            disabled={isEmpty}
          >
            <SelectTrigger className="w-44 bg-white">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="in-review">In Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <NewBlueprintDialog
          trigger={
            <Button className="bg-uew-orange hover:bg-uew-orange/90 text-white">
              <Plus size={16} className="mr-1.5" />
              New Blueprint
            </Button>
          }
        />
      </div>

      {/* Body */}
      {query.isLoading ? (
        <div className="flex items-center justify-center py-24 text-slate-500">
          <Loader2 size={20} className="animate-spin mr-2" />
          Loading blueprints…
        </div>
      ) : query.error ? (
        <Alert variant="destructive">
          <AlertTriangle size={16} />
          <AlertTitle>Couldn&apos;t load blueprints</AlertTitle>
          <AlertDescription>
            {(query.error as Error).message}
            <div className="mt-2 text-xs">
              Check that <code className="font-mono">GITHUB_TOKEN</code> is set in your environment
              and that the storage repo exists.
            </div>
          </AlertDescription>
        </Alert>
      ) : isEmpty ? (
        <EmptyState
          title="No blueprints yet"
          subtitle="Create your first blueprint to start decomposing a system."
          action={
            <NewBlueprintDialog
              trigger={
                <Button className="bg-uew-orange hover:bg-uew-orange/90 text-white">
                  <Plus size={16} className="mr-1.5" />
                  New Blueprint
                </Button>
              }
            />
          }
          footer={
            <>
              System Architect helps you design, document, and plan AI-augmented systems. Each
              blueprint captures a system&apos;s current state and future state across 12
              architectural dimensions.
            </>
          }
        />
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-500 text-sm">
          No blueprints match the current filters.
        </div>
      ) : (
        <div className="rounded-lg border bg-white overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/60">
                <TableHead>Title</TableHead>
                <TableHead>System</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last updated</TableHead>
                <TableHead className="text-right pr-4">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((bp) => (
                <BlueprintListRow
                  key={bp.id}
                  blueprint={bp}
                  onDelete={() => {
                    if (
                      typeof window !== "undefined" &&
                      window.confirm(`Delete "${bp.title}"? This cannot be undone.`)
                    ) {
                      deleteMutation.mutate(bp.id);
                    }
                  }}
                  onArchive={() => statusMutation.mutate({ id: bp.id, status: "archived" })}
                  onMarkInReview={() => statusMutation.mutate({ id: bp.id, status: "in-review" })}
                />
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

interface BlueprintListRowProps {
  blueprint: BlueprintListItem;
  onDelete: () => void;
  onArchive: () => void;
  onMarkInReview: () => void;
}

function BlueprintListRow({ blueprint, onDelete, onArchive, onMarkInReview }: BlueprintListRowProps) {
  return (
    <TableRow className="cursor-pointer hover:bg-uew-cream/60 transition-colors">
      <TableCell className="font-semibold text-uew-navy">
        <Link
          href={`/blueprints/${blueprint.id}`}
          className="hover:underline decoration-uew-orange underline-offset-4"
        >
          {blueprint.title}
        </Link>
        {blueprint.description ? (
          <div className="text-xs font-normal text-slate-500 mt-0.5 max-w-md truncate">
            {blueprint.description}
          </div>
        ) : null}
      </TableCell>
      <TableCell className="text-slate-700">{blueprint.systemName}</TableCell>
      <TableCell>
        <StatusBadge status={blueprint.status} />
      </TableCell>
      <TableCell className="text-sm text-slate-600 font-mono">{fmtDate(blueprint.updatedAt)}</TableCell>
      <TableCell className="text-right pr-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Actions">
              <MoreHorizontal size={16} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href={`/blueprints/${blueprint.id}`}>
                <ExternalLink size={14} className="mr-2" />
                Open
              </Link>
            </DropdownMenuItem>
            {blueprint.status !== "in-review" && blueprint.status !== "approved" ? (
              <DropdownMenuItem onClick={onMarkInReview}>Mark In Review</DropdownMenuItem>
            ) : null}
            {blueprint.status !== "archived" ? (
              <DropdownMenuItem onClick={onArchive}>
                <Archive size={14} className="mr-2" />
                Archive
              </DropdownMenuItem>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
              <Trash2 size={14} className="mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
