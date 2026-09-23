"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquarePlus, 
  MessageSquareWarning, 
  Check, 
  X, 
  Edit3, 
  Trash2, 
  Loader2, 
  Sparkles,
  Send
} from "lucide-react";
import { SectionCorrectionItem } from "@/lib/types";

interface InlineSectionFeedbackProps {
  sectionKey: string;
  sectionTitle: string;
  existingCorrection?: SectionCorrectionItem | string | null;
  onSaveCorrection: (sectionKey: string, sectionTitle: string, comment: string) => Promise<void>;
  onRemoveCorrection?: (sectionKey: string) => Promise<void>;
  isAdvisor: boolean;
}

export function InlineSectionFeedback({
  sectionKey,
  sectionTitle,
  existingCorrection,
  onSaveCorrection,
  onRemoveCorrection,
  isAdvisor
}: InlineSectionFeedbackProps) {
  const currentCommentText = typeof existingCorrection === "string" 
    ? existingCorrection 
    : existingCorrection?.comment || "";
  
  const authorName = typeof existingCorrection === "object" ? existingCorrection?.authorName : null;
  const updatedAt = typeof existingCorrection === "object" ? existingCorrection?.updatedAt : null;

  const [isOpen, setIsOpen] = useState(false);
  const [commentText, setCommentText] = useState(currentCommentText);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setCommentText(currentCommentText);
  }, [currentCommentText]);

  const handleSave = async () => {
    if (!commentText.trim()) {
      if (onRemoveCorrection && currentCommentText) {
        await handleRemove();
      }
      setIsOpen(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSaveCorrection(sectionKey, sectionTitle, commentText.trim());
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving inline correction:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!onRemoveCorrection) return;
    setIsSaving(true);
    try {
      await onRemoveCorrection(sectionKey);
      setCommentText("");
      setIsOpen(false);
    } catch (error) {
      console.error("Error removing inline correction:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // Si no es docente/asesor, solo renderizamos la observación si existe
  if (!isAdvisor) {
    if (!currentCommentText) return null;
    return (
      <div className="mt-3 bg-amber-50 border-2 border-amber-400/50 rounded-xl p-3.5 space-y-1.5 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black uppercase text-amber-800 flex items-center gap-1.5">
            <MessageSquareWarning className="h-3.5 w-3.5 text-amber-600" />
            Observación del Docente ({sectionTitle})
          </span>
          {authorName && <span className="text-[9px] text-amber-700 font-semibold">{authorName}</span>}
        </div>
        <p className="text-xs text-amber-950 font-medium whitespace-pre-wrap leading-relaxed">
          {currentCommentText}
        </p>
      </div>
    );
  }

  // Vista cuando ya existe un comentario guardado
  if (currentCommentText && !isOpen) {
    return (
      <div className="mt-3 bg-gradient-to-r from-orange-50/90 to-amber-50/90 border-2 border-orange-300 rounded-xl p-3.5 space-y-2 shadow-sm animate-in fade-in duration-300">
        <div className="flex items-center justify-between gap-2 border-b border-orange-200/80 pb-2">
          <div className="flex items-center gap-2">
            <Badge className="bg-orange-600 text-white text-[9px] font-black uppercase tracking-wider py-0 px-2 h-4 shadow-sm flex items-center gap-1">
              <MessageSquareWarning className="h-2.5 w-2.5" />
              Observación Registrada
            </Badge>
            <span className="text-[10px] font-black uppercase text-orange-900">
              {sectionTitle}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(true)}
              className="h-7 px-2.5 text-[10px] font-bold text-orange-800 hover:bg-orange-200/60 rounded-lg gap-1"
            >
              <Edit3 className="h-3 w-3" /> Editar
            </Button>
            {onRemoveCorrection && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRemove}
                disabled={isSaving}
                className="h-7 px-2 text-[10px] font-bold text-red-600 hover:bg-red-100 hover:text-red-700 rounded-lg"
                title="Eliminar observación"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        <p className="text-xs font-semibold text-orange-950 whitespace-pre-wrap leading-relaxed pl-1">
          {currentCommentText}
        </p>

        {authorName && (
          <div className="text-[9px] text-orange-700/80 font-medium pt-1 border-t border-orange-200/40 flex items-center justify-between">
            <span>Docente: <strong>{authorName}</strong></span>
            {updatedAt && <span>{new Date(updatedAt).toLocaleDateString()}</span>}
          </div>
        )}
      </div>
    );
  }

  // Vista cuando el docente decide escribir o editar la corrección
  if (isOpen) {
    return (
      <div className="mt-3 bg-white border-2 border-orange-400 rounded-xl p-4 space-y-3 shadow-md animate-in fade-in slide-in-from-top-1 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1 bg-orange-100 text-orange-700 rounded-md">
              <Edit3 className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-black uppercase tracking-tight text-orange-900">
              Escribir Corrección / Observación para {sectionTitle}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setCommentText(currentCommentText);
              setIsOpen(false);
            }}
            className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600 rounded-full"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={`Escribe aquí las observaciones, ajustes o correcciones puntuales que debe realizar el estudiante en la sección "${sectionTitle}"...`}
          className="min-h-[85px] text-xs bg-orange-50/40 border-orange-200 focus-visible:ring-orange-500 placeholder:text-slate-400 font-medium"
          autoFocus
        />

        <div className="flex items-center justify-between pt-1">
          <span className="text-[10px] text-slate-500 font-medium">
            💡 Esta nota aparecerá resaltada directamente sobre la casilla del estudiante.
          </span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setCommentText(currentCommentText);
                setIsOpen(false);
              }}
              className="h-8 px-3 text-xs font-bold rounded-lg border-slate-300"
              disabled={isSaving}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={isSaving}
              className="h-8 px-4 text-xs font-black uppercase tracking-wider bg-orange-600 hover:bg-orange-700 text-white rounded-lg gap-1.5 shadow-sm"
            >
              {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
              Guardar Observación
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Vista por defecto (botón para agregar observación)
  return (
    <div className="mt-2.5 flex items-center justify-end">
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-7 px-3 text-[10px] font-black uppercase tracking-wider text-orange-700 bg-orange-50 hover:bg-orange-100 hover:text-orange-900 border border-orange-200 rounded-full gap-1.5 transition-colors shadow-2xs"
      >
        <MessageSquarePlus className="h-3.5 w-3.5 text-orange-600" />
        Escribir corrección a {sectionTitle}
      </Button>
    </div>
  );
}
