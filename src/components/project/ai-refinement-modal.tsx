"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Sparkles, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  RefreshCw, 
  Zap, 
  TrendingUp, 
  Info,
  Target,
  FileSearch,
  ChevronDown,
  Play
} from "lucide-react";
import { refineProjectProposal, RefineProjectProposalOutput } from "@/ai/flows/refine-project-proposal-ai-flow";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

interface AIRefinementModalProps {
  title: string;
  description: string;
  objectives: string;
}

export function AIRefinementModal({ title, description, objectives }: AIRefinementModalProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RefineProjectProposalOutput | null>(null);
  const { toast } = useToast();

  const handleRefine = async () => {
    if (!description || description.trim().length < 10) {
      toast({
        variant: "destructive",
        title: "Información Insuficiente",
        description: "Debe completar el planteamiento del problema para realizar la auditoría.",
      });
      return;
    }

    setLoading(true);
    setResult(null); 
    
    try {
      const output = await refineProjectProposal({ title, description, objectives });
      if (output) {
        setResult(output);
        if (output.isDemo) {
          toast({
            title: "Modo Prototipo Activo",
            description: "Analizando tu contenido real en un entorno simulado.",
          });
        }
      }
    } catch (error: any) {
      console.error("AI Modal Error:", error);
      toast({
        variant: "destructive",
        title: "Error de Auditoría",
        description: "No se pudo conectar con el motor de IA.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setLoading(false);
  };

  return (
    <Dialog onOpenChange={(open) => { if (!open) handleReset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2 border-accent text-accent hover:bg-accent hover:text-white transition-all rounded-full px-6 shadow-sm group">
          <Zap className="h-4 w-4 group-hover:animate-pulse" /> Auditoría & Predicción (IA)
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-5xl w-[95vw] h-[90vh] flex flex-col p-0 border-none shadow-2xl overflow-hidden rounded-[2rem]">
        {/* ENCABEZADO FIJO */}
        <div className="bg-slate-900 p-6 md:p-8 text-white shrink-0 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 blur-[80px] rounded-full -mr-20 -mt-20" />
          <DialogHeader className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-accent rounded-xl shadow-lg shadow-accent/20">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <Badge variant="outline" className="border-accent text-accent text-[9px] font-black uppercase tracking-[0.2em] px-3">
                ESCUELA NAVAL "ENSUB" AI
              </Badge>
            </div>
            <DialogTitle className="text-2xl md:text-3xl font-black tracking-tight uppercase">
              Auditoría Integral V03
            </DialogTitle>
            <DialogDescription className="text-slate-400 font-medium text-sm">
              Análisis verídico de viabilidad e impacto institucional.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* CUERPO CENTRAL */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 flex flex-col">
          {!result && !loading && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-8 text-center space-y-5 animate-in fade-in zoom-in-95 duration-500 min-h-min">
              <div className="p-6 bg-white rounded-[2rem] shadow-xl border border-slate-100 relative group">
                <div className="absolute inset-0 bg-primary/5 rounded-[2rem] scale-95 group-hover:scale-100 transition-transform duration-500" />
                <FileSearch className="h-16 w-16 text-primary relative z-10" />
              </div>
              <div className="space-y-2 max-w-md">
                <h3 className="text-xl md:text-2xl font-black text-slate-900 uppercase tracking-tight">Iniciar Auditoría</h3>
                <p className="text-muted-foreground text-xs md:text-sm font-medium leading-relaxed">
                  El motor de IA analizará tu contenido real para generar correcciones detalladas y una predicción de éxito.
                </p>
              </div>
              
              <div className="pt-2 pb-4">
                <Button 
                  onClick={handleRefine} 
                  size="lg" 
                  className="bg-primary hover:bg-primary/90 text-white rounded-full px-8 md:px-12 h-14 md:h-16 font-black uppercase text-xs shadow-2xl transition-all hover:scale-105 gap-3"
                >
                  <Play className="h-4 w-4 md:h-5 md:w-5 fill-current" />
                  Iniciar Auditoría Completa
                </Button>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-8 animate-in fade-in duration-300">
              <div className="relative p-8 bg-white rounded-full shadow-2xl border">
                <Loader2 className="h-14 w-14 text-primary animate-spin" />
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-black text-slate-800 uppercase tracking-tight">Analizando Proyecto...</p>
                <p className="text-sm text-muted-foreground font-medium animate-pulse">
                  Evaluando coherencia técnica y normativa.
                </p>
              </div>
            </div>
          )}

          {result && (
            <ScrollArea className="h-full w-full">
              <div className="p-6 md:p-10 space-y-10 pb-20">
                {result.isDemo && (
                  <Alert className="bg-amber-50 border-amber-200 text-amber-900 rounded-2xl shadow-sm border-l-4">
                    <Info className="h-5 w-5 text-amber-600" />
                    <div>
                      <AlertTitle className="font-black text-[10px] uppercase tracking-widest mb-1">Modo Prototipo Activo</AlertTitle>
                      <AlertDescription className="text-xs font-medium opacity-80">
                        Análisis basado en la información real del proyecto para validación de flujo.
                      </AlertDescription>
                    </div>
                  </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  <div className="lg:col-span-4 space-y-8">
                    <section className="space-y-4">
                      <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-accent flex items-center gap-2">
                        <TrendingUp className="h-4 w-4" /> Predicción Académica
                      </h4>
                      <div className="p-6 bg-slate-900 text-white rounded-[2rem] shadow-2xl">
                        <p className="text-xs font-bold leading-relaxed whitespace-pre-wrap italic">
                          {result.prediction}
                        </p>
                      </div>
                    </section>

                    <div className="grid gap-6">
                      <div className="p-5 bg-white rounded-2xl border shadow-sm space-y-3 border-l-4 border-emerald-500">
                        <h5 className="text-[9px] font-black uppercase text-emerald-600 flex items-center gap-2">
                          <CheckCircle2 className="h-3 w-3" /> Sugerencias de Mejora
                        </h5>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                          {result.suggestions}
                        </p>
                      </div>

                      <div className="p-5 bg-white rounded-2xl border shadow-sm space-y-3 border-l-4 border-red-500">
                        <h5 className="text-[9px] font-black uppercase text-red-600 flex items-center gap-2">
                          <AlertCircle className="h-3 w-3" /> Riesgos Detectados
                        </h5>
                        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap font-medium">
                          {result.weaknesses}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-8 space-y-8">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                      <h4 className="font-black text-[11px] uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
                        <Target className="h-4 w-4 text-primary" /> Desglose por Sección V03
                      </h4>
                    </div>

                    <Accordion type="multiple" defaultValue={["item-0"]} className="w-full space-y-4">
                      {Object.entries(result.detailedCorrections).map(([section, correction], idx) => (
                        <AccordionItem 
                          key={idx} 
                          value={`item-${idx}`} 
                          className="border rounded-[1.5rem] bg-white overflow-hidden shadow-sm px-4"
                        >
                          <AccordionTrigger className="hover:no-underline py-5">
                            <div className="flex items-center gap-4">
                              <div className="h-10 w-10 rounded-2xl bg-slate-50 flex items-center justify-center text-[10px] font-black text-primary">
                                {idx + 1}
                              </div>
                              <span className="text-xs font-black uppercase text-slate-800 text-left">{section}</span>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent className="pb-8 pt-2">
                            <div className="pl-14">
                              <div className="p-6 bg-slate-50 rounded-2xl border-l-4 border-primary text-sm text-slate-700 leading-relaxed font-medium">
                                {correction}
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}
        </div>

        {/* PIE DE PÁGINA FIJO */}
        <div className="p-6 md:p-8 border-t bg-white flex justify-between items-center gap-6 shrink-0">
          <p className="text-[10px] font-black uppercase tracking-widest opacity-50">Auditoría ENSUB v1.5</p>
          <div className="flex gap-4">
            {result && (
              <Button 
                variant="outline" 
                className="rounded-full gap-2 font-black uppercase text-[10px] h-12 px-8" 
                onClick={handleReset}
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                Nueva Auditoría
              </Button>
            )}
            <DialogTrigger asChild>
              <Button variant="secondary" className="rounded-full font-black uppercase text-[10px] h-12 px-10">
                Cerrar
              </Button>
            </DialogTrigger>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}