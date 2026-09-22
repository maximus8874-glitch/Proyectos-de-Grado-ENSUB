
"use client";

import { Milestone } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Check, Clock, AlertCircle, CircleDashed } from "lucide-react";

interface ProjectTimelineProps {
  milestones: Milestone[];
}

export function ProjectTimeline({ milestones }: ProjectTimelineProps) {
  if (!milestones || milestones.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground opacity-50">
        <CircleDashed className="h-12 w-12 mb-4 animate-[spin_10s_linear_infinite]" />
        <p className="text-sm font-bold uppercase tracking-widest">Sin hitos registrados</p>
      </div>
    );
  }

  return (
    <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/10 before:via-primary/50 before:to-primary/10">
      {milestones.map((milestone, index) => {
        const isCompleted = milestone.status === 'Approved';
        const isCurrent = milestone.status === 'Submitted' || milestone.status === 'Needs Revision';
        const isOverdue = !isCompleted && new Date(milestone.dueDate) < new Date();

        return (
          <div key={milestone.id} className={cn(
            "relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group",
            index % 2 === 0 ? "md:flex-row-reverse" : "md:flex-row"
          )}>
            {/* Indicador Visual (Punto) */}
            <div className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full border-4 border-white shadow-lg shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 transition-all duration-500 scale-100 group-hover:scale-110",
              isCompleted 
                ? "bg-emerald-500 text-white" 
                : isOverdue 
                ? "bg-destructive text-white" 
                : isCurrent 
                ? "bg-primary text-white" 
                : "bg-slate-200 text-slate-500"
            )}>
              {isCompleted ? (
                <Check className="h-5 w-5" />
              ) : isOverdue ? (
                <AlertCircle className="h-5 w-5 animate-pulse" />
              ) : (
                <Clock className="h-5 w-5" />
              )}
            </div>
            
            {/* Tarjeta de Contenido */}
            <div className={cn(
              "w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl border transition-all duration-300 hover:shadow-xl",
              isCompleted 
                ? "bg-emerald-50/50 border-emerald-100" 
                : isOverdue 
                ? "bg-red-50/50 border-red-100" 
                : "bg-white border-slate-200 shadow-sm"
            )}>
              <div className="flex items-center justify-between gap-4 mb-2">
                <h4 className={cn(
                  "font-black text-sm uppercase tracking-tight",
                  isCompleted ? "text-emerald-700" : isOverdue ? "text-red-700" : "text-slate-900"
                )}>
                  {milestone.title}
                </h4>
                <time className={cn(
                  "font-mono text-[10px] font-black px-2 py-1 rounded-full whitespace-nowrap",
                  isCompleted 
                    ? "bg-emerald-500/10 text-emerald-600" 
                    : isOverdue 
                    ? "bg-red-500/10 text-red-600" 
                    : "bg-primary/10 text-primary"
                )}>
                  {milestone.dueDate}
                </time>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {milestone.description}
              </p>
              
              {isCompleted && milestone.completionDate && (
                <div className="mt-3 flex items-center gap-1.5 text-[9px] font-bold text-emerald-600 uppercase">
                  <Check className="h-3 w-3" />
                  Certificado el {new Date(milestone.completionDate).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
