"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Trash2, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { Comment } from "@/lib/comments";

interface CommentsPanelProps {
  comments: Comment[];
  isLoading: boolean;
  isAdding: boolean;
  addComment: (body: string) => void;
  toggleResolved: (args: { id: string; resolved: boolean }) => void;
  deleteComment: (id: string) => void;
}

export function CommentsPanel({
  comments,
  isLoading,
  isAdding,
  addComment,
  toggleResolved,
  deleteComment,
}: CommentsPanelProps) {
  const [draft, setDraft] = useState("");

  function handleSubmit() {
    const trimmed = draft.trim();
    if (!trimmed) return;
    addComment(trimmed);
    setDraft("");
  }

  const unresolved = comments.filter((c) => !c.resolved);
  const resolved = comments.filter((c) => c.resolved);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {isLoading && (
          <p className="text-xs text-muted-foreground">Loading...</p>
        )}

        {!isLoading && comments.length === 0 && (
          <p className="text-xs text-muted-foreground">No comments yet</p>
        )}

        {unresolved.map((comment) => (
          <CommentRow
            key={comment.id}
            comment={comment}
            onToggleResolved={() =>
              toggleResolved({ id: comment.id, resolved: true })
            }
            onDelete={() => deleteComment(comment.id)}
          />
        ))}

        {resolved.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
              Resolved ({resolved.length})
            </p>
            <div className="space-y-3 opacity-60">
              {resolved.map((comment) => (
                <CommentRow
                  key={comment.id}
                  comment={comment}
                  onToggleResolved={() =>
                    toggleResolved({ id: comment.id, resolved: false })
                  }
                  onDelete={() => deleteComment(comment.id)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 border-t p-3">
        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="Add a comment..."
          rows={2}
          className="flex-1 resize-none rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-600"
        />
        <button
          onClick={handleSubmit}
          disabled={isAdding || !draft.trim()}
          className="shrink-0 rounded-md bg-[#2F6B4F] p-2 text-white disabled:opacity-40"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}

function initials(name: string | null | undefined): string {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function CommentRow({
  comment,
  onToggleResolved,
  onDelete,
}: {
  comment: Comment;
  onToggleResolved: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="group flex gap-2 rounded-md border bg-muted/20 p-2">
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2F6B4F] text-xs font-medium text-white">
        {initials(comment.profiles?.name)}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">
            {comment.profiles?.name ?? "Unknown"}
          </p>
          <span className="text-[11px] text-muted-foreground">
            {formatRelativeTime(comment.created_at)}
          </span>
        </div>
        <p
          className={cn(
            "mt-0.5 text-xs text-foreground/90 break-words",
            comment.resolved && "line-through",
          )}
        >
          {comment.body}
        </p>
      </div>
      <div className="flex shrink-0 flex-col gap-1 opacity-0 group-hover:opacity-100">
        <button
          onClick={onToggleResolved}
          title={comment.resolved ? "Reopen" : "Resolve"}
        >
          {comment.resolved ? (
            <CheckCircle2 size={14} className="text-emerald-600" />
          ) : (
            <Circle
              size={14}
              className="text-muted-foreground hover:text-emerald-600"
            />
          )}
        </button>
        <button onClick={onDelete} title="Delete">
          <Trash2
            size={14}
            className="text-muted-foreground hover:text-destructive"
          />
        </button>
      </div>
    </div>
  );
}

function formatRelativeTime(iso: string): string {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
