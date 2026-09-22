
import { Badge } from "@/components/ui/badge";
import { ProjectStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: ProjectStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variants: Record<ProjectStatus, string> = {
    'Borrador': 'bg-slate-100 text-slate-700 border-slate-200',
    'Pendiente': 'bg-yellow-100 text-yellow-700 border-yellow-200',
    'En Revisión': 'bg-blue-100 text-blue-700 border-blue-200',
    'En Curso': 'bg-cyan-100 text-cyan-700 border-cyan-200',
    'Defendido': 'bg-indigo-100 text-indigo-700 border-indigo-200',
    'Completado': 'bg-emerald-100 text-emerald-700 border-emerald-200',
    'Rechazado': 'bg-red-100 text-red-700 border-red-200',
    'Corregir': 'bg-orange-100 text-orange-700 border-orange-200',
  };

  return (
    <Badge 
      variant="outline" 
      className={cn("px-2 py-1 rounded-md font-bold text-[10px] uppercase tracking-tighter", variants[status], className)}
    >
      {status}
    </Badge>
  );
}
