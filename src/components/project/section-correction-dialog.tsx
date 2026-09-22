"use client";

import { useState } from "react";
import { DegreeProject, SectionCorrectionItem } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  FileEdit, 
  Send, 
  MessageSquareWarning, 
  CheckCircle2, 
  BookOpen, 
  Target, 
  HelpCircle, 
  Sparkles,
  Layers
} from "lucide-react";

interface SectionCorrectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project: DegreeProject;
  evaluatorName: string;
  onSubmitCorrections: (
    sectionCorrections: Record<string, SectionCorrectionItem>,
    summaryComment: string
  ) => Promise<void>;
}

const SECTIONS_CONFIG = [
  {
    key: "general",
    title: "Dictamen General",
    subtitle: "Resumen y recomendaciones generales del evaluador",
    icon: MessageSquareWarning,
    category: "general",
    getStudentValue: (p: DegreeProject) => p.title || "Sin título",
    placeholder: "Escribe las observaciones generales del dictamen, orientaciones globales o conclusiones de la evaluación..."
  },
  {
    key: "title",
    title: "1. Título y Datos Institucionales",
    subtitle: "Coherencia del título con la investigación y facultad",
    icon: BookOpen,
    category: "identificacion",
    getStudentValue: (p: DegreeProject) => p.title,
    placeholder: "Ej: El título debe delimitar el alcance geográfico y temporal; evitar términos ambiguos..."
  },
  {
    key: "problemStatement",
    title: "2.1 Descripción del Problema",
    subtitle: "Síntomas, causas, consecuencias y revisión previa",
    icon: HelpCircle,
    category: "problema",
    getStudentValue: (p: DegreeProject) => p.problemStatement,
    placeholder: "Ej: Profundizar en las causas del problema identificado y citar antecedentes relevantes en el sector marítimo..."
  },
  {
    key: "problemFormulation",
    title: "2.2 Formulación (Pregunta)",
    subtitle: "Pregunta principal de investigación",
    icon: HelpCircle,
    category: "problema",
    getStudentValue: (p: DegreeProject) => p.problemFormulation,
    placeholder: "Ej: La pregunta debe formularse en términos de interrogación clara y concordar con el objetivo general..."
  },
  {
    key: "justification",
    title: "2.3 Justificación",
    subtitle: "Relevancia institucional, social y académica",
    icon: Sparkles,
    category: "problema",
    getStudentValue: (p: DegreeProject) => p.justification,
    placeholder: "Ej: Argumentar con mayor solidez el impacto o beneficio para la Armada Nacional y la ENSUB..."
  },
  {
    key: "generalObjective",
    title: "3.1 Objetivo General",
    subtitle: "Meta principal del trabajo de grado",
    icon: Target,
    category: "objetivos",
    getStudentValue: (p: DegreeProject) => p.generalObjective,
    placeholder: "Ej: Iniciar con un verbo en infinitivo medible y alcanzable; debe responder a la pregunta de investigación..."
  },
  {
    key: "specificObjectives",
    title: "3.2 Objetivos Específicos",
    subtitle: "Fases y pasos metodológicos ordenados",
    icon: Target,
    category: "objetivos",
    getStudentValue: (p: DegreeProject) => typeof p.specificObjectives === 'string' ? p.specificObjectives : (Array.isArray(p.specificObjectives as any) ? (p.specificObjectives as any).join("\n") : ""),
    placeholder: "Ej: Ordenar cronológicamente los objetivos específicos; el último debe orientarse a la validación o propuesta final..."
  },
  {
    key: "methodology",
    title: "4.1 Diseño Metodológico",
    subtitle: "Tipo de investigación, instrumentos y población",
    icon: Layers,
    category: "metodologia",
    getStudentValue: (p: DegreeProject) => p.methodology,
    placeholder: "Ej: Especificar las técnicas de recolección de datos, instrumentos y las etapas de desarrollo..."
  },
  {
    key: "expectedResults",
    title: "4.2 Resultados e Impacto",
    subtitle: "Productos entregables e impacto esperado",
    icon: Sparkles,
    category: "metodologia",
    getStudentValue: (p: DegreeProject) => p.expectedResults,
    placeholder: "Ej: Detallar los entregables tangibles (manual, prototipo, software, guía técnica) esperados..."
  }
];

export function SectionCorrectionDialog({
  open,
  onOpenChange,
  project,
  evaluatorName,
  onSubmitCorrections
}: SectionCorrectionDialogProps) {
  const [activeCategory, setActiveCategory] = useState<string>("general");
  const [comments, setComments] = useState<Record<string, string>>(() => {
    // Inicializar con las correcciones previas si existen
    const initial: Record<string, string> = {};
    if (project.sectionCorrections) {
      Object.entries(project.sectionCorrections).forEach(([k, item]) => {
        initial[k] = typeof item === 'string' ? item : item.comment;
      });
    } else if (project.correcciones) {
      initial["general"] = project.correcciones;
    }
    return initial;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCommentChange = (key: string, value: string) => {
    setComments(prev => ({ ...prev, [key]: value }));
  };

  const countedCorrections = Object.values(comments).filter(c => c && c.trim().length > 0).length;

  const handleSubmit = async () => {
    if (countedCorrections === 0) {
      alert("Por favor escribe al menos una observación o corrección para el estudiante.");
      return;
    }

    setIsSubmitting(true);
    try {
      const structuredCorrections: Record<string, SectionCorrectionItem> = {};
      const summaryParts: string[] = [];

      SECTIONS_CONFIG.forEach(sec => {
        const text = comments[sec.key]?.trim();
        if (text) {
          structuredCorrections[sec.key] = {
            sectionKey: sec.key,
            sectionTitle: sec.title,
            comment: text,
            resolved: false,
            updatedAt: new Date().toISOString(),
            authorName: evaluatorName
          };

          summaryParts.push(`📌 [${sec.title}]: ${text}`);
        }
      });

      const aggregatedSummary = summaryParts.join("\n\n");
      await onSubmitCorrections(structuredCorrections, aggregatedSummary);
      onOpenChange(false);
    } catch (err) {
      console.error("Error submitting corrections:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl">
        <DialogHeader className="p-6 bg-slate-900 text-white shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Badge className="bg-orange-500 text-white uppercase text-[10px] tracking-wider font-bold">
                Devolución Académica
              </Badge>
              <DialogTitle className="text-xl font-black uppercase tracking-tight text-white flex items-center gap-2">
                <FileEdit className="h-5 w-5 text-orange-400" /> Dictamen y Corrección por Planteamientos
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-300">
                Escribe observaciones específicas planteamiento por planteamiento para que el estudiante trabaje sobre cada sección.
              </DialogDescription>
            </div>

            <div className="text-right">
              <span className="text-xs font-bold text-orange-400 block">
                {countedCorrections} {countedCorrections === 1 ? "sección comentada" : "secciones comentadas"}
              </span>
              <span className="text-[10px] text-slate-400">Formato EDUCA-FT-093-JINEN-V03</span>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col p-6 bg-slate-50/50">
          <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full flex-1 flex flex-col">
            <TabsList className="grid grid-cols-4 bg-slate-200/80 p-1 rounded-xl mb-4 shrink-0">
              <TabsTrigger value="general" className="font-bold text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:text-primary">
                <MessageSquareWarning className="h-3.5 w-3.5" /> Dictamen
                {comments["general"] && <span className="h-2 w-2 rounded-full bg-orange-500 ml-1" />}
              </TabsTrigger>
              <TabsTrigger value="problema" className="font-bold text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:text-primary">
                <HelpCircle className="h-3.5 w-3.5" /> 2. Problema
                {(comments["problemStatement"] || comments["problemFormulation"] || comments["justification"]) && (
                  <span className="h-2 w-2 rounded-full bg-orange-500 ml-1" />
                )}
              </TabsTrigger>
              <TabsTrigger value="objetivos" className="font-bold text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:text-primary">
                <Target className="h-3.5 w-3.5" /> 3. Objetivos
                {(comments["generalObjective"] || comments["specificObjectives"]) && (
                  <span className="h-2 w-2 rounded-full bg-orange-500 ml-1" />
                )}
              </TabsTrigger>
              <TabsTrigger value="metodologia" className="font-bold text-xs gap-1.5 data-[state=active]:bg-white data-[state=active]:text-primary">
                <Layers className="h-3.5 w-3.5" /> 4. Metodología
                {(comments["methodology"] || comments["expectedResults"] || comments["title"]) && (
                  <span className="h-2 w-2 rounded-full bg-orange-500 ml-1" />
                )}
              </TabsTrigger>
            </TabsList>

            <ScrollArea className="flex-1 pr-4 max-h-[48vh]">
              {/* Pestaña: General / Dictamen */}
              <TabsContent value="general" className="space-y-4 m-0">
                {SECTIONS_CONFIG.filter(s => s.category === "general").map(sec => (
                  <SectionCommentEditor 
                    key={sec.key} 
                    config={sec} 
                    project={project}
                    comment={comments[sec.key] || ""} 
                    onChange={(val) => handleCommentChange(sec.key, val)} 
                  />
                ))}
              </TabsContent>

              {/* Pestaña: Problema */}
              <TabsContent value="problema" className="space-y-6 m-0">
                {SECTIONS_CONFIG.filter(s => s.category === "problema").map(sec => (
                  <SectionCommentEditor 
                    key={sec.key} 
                    config={sec} 
                    project={project}
                    comment={comments[sec.key] || ""} 
                    onChange={(val) => handleCommentChange(sec.key, val)} 
                  />
                ))}
              </TabsContent>

              {/* Pestaña: Objetivos */}
              <TabsContent value="objetivos" className="space-y-6 m-0">
                {SECTIONS_CONFIG.filter(s => s.category === "objetivos").map(sec => (
                  <SectionCommentEditor 
                    key={sec.key} 
                    config={sec} 
                    project={project}
                    comment={comments[sec.key] || ""} 
                    onChange={(val) => handleCommentChange(sec.key, val)} 
                  />
                ))}
              </TabsContent>

              {/* Pestaña: Metodología y Título */}
              <TabsContent value="metodologia" className="space-y-6 m-0">
                {SECTIONS_CONFIG.filter(s => s.category === "metodologia" || s.category === "identificacion").map(sec => (
                  <SectionCommentEditor 
                    key={sec.key} 
                    config={sec} 
                    project={project}
                    comment={comments[sec.key] || ""} 
                    onChange={(val) => handleCommentChange(sec.key, val)} 
                  />
                ))}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>

        <DialogFooter className="p-4 bg-white border-t flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <CheckCircle2 className="h-4 w-4 text-emerald-600" />
            Las observaciones se vincularán directamente a cada casilla en el editor del estudiante.
          </div>

          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="rounded-full px-5 text-xs font-bold"
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={isSubmitting || countedCorrections === 0}
              className="rounded-full px-6 text-xs font-black uppercase tracking-wider bg-orange-600 hover:bg-orange-700 text-white gap-2 shadow-lg hover:scale-105 transition-transform"
            >
              <Send className="h-4 w-4" /> Devolver con Correcciones
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function SectionCommentEditor({
  config,
  project,
  comment,
  onChange
}: {
  config: typeof SECTIONS_CONFIG[0];
  project: DegreeProject;
  comment: string;
  onChange: (val: string) => void;
}) {
  const studentText = config.getStudentValue(project);

  return (
    <div className="bg-white border rounded-xl p-4 shadow-sm space-y-3">
      <div className="flex items-center justify-between border-b pb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-orange-100 text-orange-700 rounded-lg">
            <config.icon className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-900 leading-tight">{config.title}</h4>
            <p className="text-[10px] text-slate-500 font-medium">{config.subtitle}</p>
          </div>
        </div>

        {comment.trim().length > 0 && (
          <Badge className="bg-orange-500/10 text-orange-700 border-orange-200 text-[10px] font-bold">
            Con Corrección
          </Badge>
        )}
      </div>

      {/* Vista previa del texto actual escrito por el estudiante */}
      {studentText && (
        <div className="bg-slate-50 p-3 rounded-lg border text-xs text-slate-700 space-y-1">
          <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider block">
            Texto actual del estudiante:
          </span>
          <p className="font-medium max-h-24 overflow-y-auto leading-relaxed whitespace-pre-wrap">
            {studentText}
          </p>
        </div>
      )}

      {/* Casilla de comentario del docente */}
      <div className="space-y-1.5">
        <Label className="text-[10px] font-black uppercase text-primary/80 flex items-center gap-1.5">
          Observaciones y Corrección del Docente para esta sección:
        </Label>
        <Textarea
          value={comment}
          onChange={(e) => onChange(e.target.value)}
          placeholder={config.placeholder}
          className="min-h-[85px] text-xs bg-orange-50/30 border-orange-200 focus-visible:ring-orange-500 placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}
