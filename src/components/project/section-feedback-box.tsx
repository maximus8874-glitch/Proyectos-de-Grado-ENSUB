"use client";

import { SectionCorrectionItem } from "@/lib/types";
import { MessageSquareWarning, UserCheck, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SectionFeedbackBoxProps {
  sectionKey: string;
  corrections?: Record<string, SectionCorrectionItem | any>;
  title?: string;
}

export function SectionFeedbackBox({
  sectionKey,
  corrections,
  title
}: SectionFeedbackBoxProps) {
  if (!corrections || !corrections[sectionKey]) {
    return null;
  }

  const rawItem = corrections[sectionKey];
  const commentText = typeof rawItem === 'string' ? rawItem : rawItem?.comment;
  const authorName = typeof rawItem === 'object' ? rawItem?.authorName : null;
  const updatedAt = typeof rawItem === 'object' ? rawItem?.updatedAt : null;

  if (!commentText || commentText.trim().length === 0) {
    return null;
  }

  return (
    <div className="bg-amber-500/10 border-2 border-amber-500/40 rounded-xl p-3.5 mb-2.5 animate-in fade-in slide-in-from-top-1 duration-300 shadow-sm">
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="flex items-center gap-2">
          <div className="p-1 bg-amber-500/20 text-amber-700 rounded-md">
            <MessageSquareWarning className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-black uppercase tracking-tight text-amber-800 flex items-center gap-1.5">
              Observación del Docente Evaluador
              {title && <span className="font-bold text-amber-600">({title})</span>}
            </span>
            {authorName && (
              <span className="text-[9px] text-amber-700 font-semibold block">
                Docente: {authorName} {updatedAt && `• ${new Date(updatedAt).toLocaleDateString()}`}
              </span>
            )}
          </div>
        </div>

        <Badge className="bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider py-0 px-2 h-4 shrink-0 shadow-sm">
          Por Corregir
        </Badge>
      </div>

      <p className="text-xs font-medium text-amber-950 whitespace-pre-wrap leading-relaxed pl-7 border-l-2 border-amber-400 ml-1 mt-1">
        {commentText}
      </p>
    </div>
  );
}
