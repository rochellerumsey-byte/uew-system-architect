"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { Blueprint } from "@/lib/types";

interface CreateApiResponse {
  blueprint?: Blueprint;
  error?: string;
  issues?: string[];
}

async function createBlueprint(input: {
  title: string;
  systemName: string;
  description: string;
}): Promise<Blueprint> {
  const res = await fetch("/api/blueprints", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input)
  });
  const body = (await res.json().catch(() => ({}))) as CreateApiResponse;
  if (!res.ok || !body.blueprint) {
    const msg = body.error || `Failed to create blueprint (HTTP ${res.status})`;
    throw new Error(msg);
  }
  return body.blueprint;
}

/**
 * "+ New Blueprint" entry point. Wraps any trigger element in a Dialog.
 * On submit: POST /api/blueprints → navigate to the new blueprint's page.
 */
export function NewBlueprintDialog({ trigger }: { trigger: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [systemName, setSystemName] = useState("");
  const [description, setDescription] = useState("");

  const mutation = useMutation({
    mutationFn: createBlueprint,
    onSuccess: (blueprint) => {
      queryClient.invalidateQueries({ queryKey: ["blueprints"] });
      toast({ title: "Blueprint created", description: blueprint.title });
      setOpen(false);
      setTitle("");
      setSystemName("");
      setDescription("");
      router.push(`/blueprints/${blueprint.id}`);
    },
    onError: (err: Error) => {
      toast({
        title: "Couldn't create blueprint",
        description: err.message,
        variant: "destructive"
      });
    }
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const t = title.trim();
    const s = systemName.trim();
    if (!t || !s) {
      toast({
        title: "Title and system name are required.",
        variant: "destructive"
      });
      return;
    }
    mutation.mutate({ title: t, systemName: s, description: description.trim() });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-uew-navy">New Blueprint</DialogTitle>
            <DialogDescription>
              Create a new system blueprint. You can fill in the 12 tabs after creation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-1.5">
              <Label htmlFor="bp-title">Title *</Label>
              <Input
                id="bp-title"
                placeholder="e.g. Self-Filing Agentic System"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                disabled={mutation.isPending}
                autoFocus
                required
                maxLength={200}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bp-system">System Name *</Label>
              <Input
                id="bp-system"
                placeholder="e.g. Self-Filing"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                disabled={mutation.isPending}
                required
                maxLength={200}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="bp-description">Description</Label>
              <Textarea
                id="bp-description"
                placeholder="Short summary of what this system is and why it exists."
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={mutation.isPending}
                maxLength={2000}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-uew-orange hover:bg-uew-orange/90 text-white"
            >
              {mutation.isPending ? "Creating…" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
