"use client";

import { useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { StatusBadge } from "@/components/project/status-badge";
import { useLanguage } from "@/context/language-context";
import { 
  Users, 
  Loader2, 
  MessageSquare, 
  ChevronRight, 
  GraduationCap, 
  BookOpen, 
  Mail, 
  Phone, 
  TrendingUp, 
  ClipboardCheck, 
  Activity 
} from "lucide-react";
import Link from "next/link";

const PROGRESS_FIELDS = [
  "title", "facultad", "programa", "curso", "researchLine", "researchSubLine",
  "proponent1Name", "proponent1Id", "proponent1Email", "proponent1Phone",
  "proposedDirectorName", "problemStatement", "problemFormulation",
  "justification", "generalObjective", "specificObjectives", "methodology", "expectedResults"
];

export default function AdvisorTuteesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t } = useLanguage();

  const projectsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "projects"));
  }, [db]);

  const { data: rawProjects, isLoading } = useCollection<any>(projectsQuery);

  // Filtrar los proyectos asignados a este asesor
  const tutees = useMemo(() => {
    if (!rawProjects || !user) return [];
    return rawProjects.filter(p => p.advisorIds?.includes(user.uid) || p.directorId === user.uid);
  }, [rawProjects, user]);

  // Estadísticas globales del Asesor
  const stats = useMemo(() => {
    if (tutees.length === 0) return { total: 0, avgProgress: 0, pendingReview: 0, active: 0 };
    
    let totalProgress = 0;
    let pendingReview = 0;
    let active = 0;

    tutees.forEach(project => {
      // Calcular progreso del formato V03
      let completedCount = 0;
      PROGRESS_FIELDS.forEach(field => {
        const val = project[field];
        if (val && String(val).trim().length > 0) {
          completedCount++;
        }
      });
      const progress = Math.round((completedCount / PROGRESS_FIELDS.length) * 100);
      totalProgress += progress;

      if (project.status === 'Pendiente' || project.status === 'En Revisión') {
        pendingReview++;
      }
      if (project.status === 'En Curso') {
        active++;
      }
    });

    return {
      total: tutees.length,
      avgProgress: Math.round(totalProgress / tutees.length),
      pendingReview,
      active
    };
  }, [tutees]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="border-b pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline text-primary uppercase tracking-tight flex items-center gap-2.5">
            <Users className="h-7 w-7 text-[#FF6B00]" /> {t('tutorados')}
          </h1>
          <p className="text-muted-foreground font-medium">
            Seguimiento analítico de estudiantes asignados bajo tu tutela académica.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : tutees.length === 0 ? (
        <Card className="border-dashed border-2 py-20 text-center bg-white flex flex-col items-center gap-4">
          <Users className="h-14 w-14 text-slate-300" />
          <div className="space-y-1 max-w-sm">
            <h3 className="text-sm font-black uppercase text-slate-800 tracking-wide">Sin Tutorados Asignados</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              No tienes proyectos de grado vinculados a tu cuenta en este momento. Cuando la decanatura te asigne tutorados, aparecerán en este directorio.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* KPI Dashboard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-primary text-white border-none shadow-lg overflow-hidden relative p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-primary-foreground/75 text-[10px] font-black uppercase tracking-widest">Total Tutorados</p>
                  <h3 className="text-4xl font-black mt-2 tracking-tighter">{stats.total}</h3>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl"><Users className="h-5 w-5" /></div>
              </div>
              <p className="text-[9px] text-primary-foreground/50 font-bold uppercase mt-3">Estudiantes a cargo este semestre</p>
            </Card>

            <Card className="bg-[#1E6EAA] text-white border-none shadow-lg overflow-hidden relative p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/75 text-[10px] font-black uppercase tracking-widest">Progreso Promedio</p>
                  <h3 className="text-4xl font-black mt-2 tracking-tighter">{stats.avgProgress}%</h3>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl"><TrendingUp className="h-5 w-5 animate-pulse" /></div>
              </div>
              <div className="mt-3">
                <Progress value={stats.avgProgress} className="h-1.5 bg-white/20" />
              </div>
            </Card>

            <Card className="bg-[#FF6B00] text-white border-none shadow-lg overflow-hidden relative p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/75 text-[10px] font-black uppercase tracking-widest">Revisiones Pendientes</p>
                  <h3 className="text-4xl font-black mt-2 tracking-tighter">{stats.pendingReview}</h3>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl"><ClipboardCheck className="h-5 w-5" /></div>
              </div>
              <p className="text-[9px] text-white/60 font-bold uppercase mt-3">Propuestas esperando retroalimentación</p>
            </Card>

            <Card className="bg-[#33B8AD] text-white border-none shadow-lg overflow-hidden relative p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/75 text-[10px] font-black uppercase tracking-widest">Tesis En Curso</p>
                  <h3 className="text-4xl font-black mt-2 tracking-tighter">{stats.active}</h3>
                </div>
                <div className="p-3 bg-white/10 rounded-2xl"><Activity className="h-5 w-5" /></div>
              </div>
              <p className="text-[9px] text-white/60 font-bold uppercase mt-3">Proyectos aprobados activamente</p>
            </Card>
          </div>

          {/* Listado de Tutorados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tutees.map((project) => {
              // Calcular avance de cada uno
              let completedCount = 0;
              PROGRESS_FIELDS.forEach(field => {
                const val = project[field];
                if (val && String(val).trim().length > 0) {
                  completedCount++;
                }
              });
              const progress = Math.round((completedCount / PROGRESS_FIELDS.length) * 100);

              return (
                <Card key={project.id} className="bg-white border hover:shadow-md transition-shadow rounded-3xl overflow-hidden flex flex-col justify-between group">
                  <div className="p-6 space-y-4">
                    {/* Header Tarjeta */}
                    <div className="flex justify-between items-start gap-4 border-b pb-3.5">
                      <div>
                        <span className="text-[8px] font-black uppercase tracking-wider text-[#FF6B00] bg-orange-50 px-2.5 py-1 rounded-md">
                          {project.programa}
                        </span>
                        <h3 className="text-sm font-black uppercase text-slate-800 mt-2 line-clamp-2 leading-tight tracking-tight group-hover:text-primary transition-colors">
                          {project.title}
                        </h3>
                      </div>
                      <StatusBadge status={project.status} />
                    </div>

                    {/* Proponente */}
                    <div className="p-4 bg-slate-50/70 rounded-2xl border space-y-2 text-xs">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-black uppercase tracking-tight text-slate-700">{project.proponent1Name}</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1 pl-6">
                        <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px]">
                          <Mail className="h-3 w-3 text-slate-400" />
                          <span>{project.proponent1Email}</span>
                        </div>
                        {project.proponent1Phone && (
                          <div className="flex items-center gap-1.5 text-slate-500 font-bold text-[10px]">
                            <Phone className="h-3 w-3 text-slate-400" />
                            <span>{project.proponent1Phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Barra de Progreso */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-black uppercase text-slate-400 tracking-wider">
                        <span>Avance Formato V03</span>
                        <span className="text-slate-800 font-black">{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-1.5 bg-slate-100" />
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="px-6 py-4 bg-slate-50/50 border-t flex flex-col sm:flex-row gap-2 shrink-0">
                    <Button 
                      asChild 
                      variant="outline" 
                      size="sm" 
                      className="rounded-full flex-1 gap-1.5 font-bold uppercase text-[9px] tracking-widest text-primary border-primary/20 hover:bg-slate-100"
                    >
                      <Link href={`/dashboard/feedback`}>
                        <MessageSquare className="h-3.5 w-3.5" /> Iniciar Chat
                      </Link>
                    </Button>
                    <Button 
                      asChild 
                      variant="default" 
                      size="sm" 
                      className="rounded-full flex-1 gap-1.5 font-bold uppercase text-[9px] tracking-widest bg-primary hover:bg-primary/95 text-white"
                    >
                      <Link href={`/dashboard/projects/${project.id}`}>
                        Revisar Proyecto <ChevronRight className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
