"use client";

import { useState } from "react";
import MarkdownRenderer from "./MarkdownRenderer";

export default function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your post... (Markdown supported)",
  maxLength = 10000,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  const [preview, setPreview] = useState(false);

  return (
    <div className="border border-border rounded-[10px] overflow-hidden bg-surface">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-border-light bg-background">
        <button
          type="button"
          onClick={() => setPreview(false)}
          className={`font-mono text-xs px-2 py-1 rounded transition-colors ${
            !preview
              ? "text-accent bg-accent-soft"
              : "text-text-tertiary hover:text-text-secondary"
          }`}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setPreview(true)}
          className={`font-mono text-xs px-2 py-1 rounded transition-colors ${
            preview
              ? "text-accent bg-accent-soft"
              : "text-text-tertiary hover:text-text-secondary"
          }`}
        >
          Preview
        </button>
        <span className="ml-auto font-mono text-xs text-text-tertiary">
          {value.length}/{maxLength}
        </span>
      </div>
      {preview ? (
        <div className="p-4 min-h-[150px] markdown-content">
          {value ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-text-tertiary italic">Nothing to preview</p>
          )}
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder={placeholder}
          className="w-full min-h-[150px] p-4 resize-y bg-surface text-text placeholder:text-text-tertiary focus:outline-none font-sans text-sm leading-relaxed"
        />
      )}
    </div>
  );
}
