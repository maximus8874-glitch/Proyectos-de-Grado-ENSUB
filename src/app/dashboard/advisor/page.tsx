
"use client";

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, deleteDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/project/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, Clock, AlertTriangle, Loader2, TrendingUp, ClipboardCheck, Trash2 } from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AdvisorDashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const { t } = useLanguage();
  const ADMIN_WHITELIST = [
    "maximus8874@gmail.com",
    "administracionmaritima@ensub.edu.co",
    "josediazdoria08@gmail.com",
    "felipetorrez502@gmail.com"
  ];

  const isSuperUser = ADMIN_WHITELIST.includes(user?.email?.toLowerCase() || "");

  // Consulta optimizada: 
  // - Si es Superusuario, ve TODOS los proyectos.
  // - Si es asesor normal, solo los asignados.
  const assignedProjectsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    if (isSuperUser) {
      return query(collection(db, "projects"));
    }
    return query(
      collection(db, "projects"),
      where("advisorIds", "array-contains", user.uid)
    );
  }, [db, user, isSuperUser]);

  const { data: projects, isLoading } = useCollection(assignedProjectsQuery);

  const handleDeleteProject = async (projectId: string) => {
    if (!db || !isSuperUser) return;
    try {
      await deleteDoc(doc(db, "projects", projectId));
      toast({
        title: "Proyecto Eliminado",
        description: "La propuesta ha sido borrada permanentemente del sistema.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el proyecto.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  // Si no es borrador, el progreso es 100% para fines de visualización de la propuesta enviada
  const getDisplayProgress = (project: any) => {
    return project.status !== 'Borrador' ? 100 : (project.progressPercent || 1);
  };

  const pendingReview = projects?.filter(p => p.status === 'Pendiente' || p.status === 'En Revisión' || p.status === 'Corregir').length || 0;
  const avgProgress = projects?.length ? Math.round(projects.reduce((acc, p) => acc + getDisplayProgress(p), 0) / projects.length) : 0;
  const atRisk = projects?.filter(p => getDisplayProgress(p) < 15 && p.status === 'Pendiente').length || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-black font-headline text-primary uppercase tracking-tight">
            {isSuperUser ? "Control Maestro de Asesoría" : t('advisorTitle')}
          </h1>
          <p className="text-muted-foreground font-medium">
            {isSuperUser ? "Supervisión global de todos los procesos académicos." : t('advisorDesc')}
          </p>
        </div>
        <div className="flex items-center gap-3 px-5 py-2.5 bg-primary/10 rounded-full border border-primary/20 shadow-sm">
          <ClipboardCheck className="h-5 w-5 text-primary" />
          <span className="text-[10px] font-black uppercase text-primary tracking-widest">
            {isSuperUser ? "Todos los Proyectos" : "Mis Proyectos Asignados"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <AdvisorMetricCard title={t('assignedProjects')} value={projects?.length.toString() || "0"} icon={<Users className="h-5 w-5" />} />
        <AdvisorMetricCard title={t('averageProgress')} value={`${avgProgress}%`} icon={<TrendingUp className="h-5 w-5" />} />
        <AdvisorMetricCard title={t('toReview')} value={pendingReview.toString()} icon={<Clock className="h-5 w-5" />} color="text-amber-500" />
        <AdvisorMetricCard title={t('atRisk')} value={atRisk.toString()} icon={<AlertTriangle className="h-5 w-5" />} color="text-destructive" />
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader className="flex flex-col md:flex-row md:items-center justify-between bg-slate-50/50 rounded-t-lg gap-4">
          <div>
            <CardTitle className="text-lg font-black uppercase text-primary">{t('projectStatusTable')}</CardTitle>
            <CardDescription className="text-xs font-medium">{t('studentFollowUp')}</CardDescription>
          </div>
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder={t('searchByTitle')} className="pl-10 h-10 bg-white border-none shadow-sm" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {!projects || projects.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-4 bg-white rounded-b-lg">
              <Users className="h-16 w-16 opacity-10" />
              <div className="space-y-1">
                <p className="font-black uppercase tracking-tight">{t('noProjectsAssigned')}</p>
                <p className="text-xs max-w-xs mx-auto">No hay proyectos para mostrar en este momento.</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="font-black uppercase text-[10px]">{t('project') || "Proyecto"}</TableHead>
                  <TableHead className="font-black uppercase text-[10px]">{t('progress')}</TableHead>
                  <TableHead className="font-black uppercase text-[10px]">{t('status')}</TableHead>
                  <TableHead className="text-right font-black uppercase text-[10px]">{t('actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projects.map((project) => {
                  const displayProgress = getDisplayProgress(project);
                  
                  return (
                    <TableRow key={project.id} className="group hover:bg-slate-50/50 transition-colors">
                      <TableCell className="max-w-md py-5">
                        <p className="font-black text-sm text-slate-900 group-hover:text-primary transition-colors truncate">{project.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase">{project.programa}</span>
                          <div className="h-1 w-1 rounded-full bg-slate-300" />
                          <p className="text-[10px] text-muted-foreground">{t('lastUpdate')}: {new Date(project.updatedAt || project.createdAt).toLocaleDateString()}</p>
                        </div>
                      </TableCell>
                      <TableCell className="w-[200px]">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-[10px] font-black">
                            <span className="text-primary">{displayProgress}%</span>
                          </div>
                          <Progress value={displayProgress} className="h-1.5" />
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={project.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isSuperUser && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Eliminar Proyecto?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta acción es irreversible. Se borrarán todos los datos, comentarios y registros de auditoría del proyecto "{project.title}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDeleteProject(project.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    Eliminar permanentemente
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                          <Button variant="outline" size="sm" asChild className="rounded-full px-6 font-bold hover:bg-primary hover:text-white transition-all shadow-sm">
                            <Link href={`/dashboard/projects/${project.id}`}>
                              {t('verify')}
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AdvisorMetricCard({ title, value, icon, color = "text-primary" }: { title: string, value: string, icon: React.ReactNode, color?: string }) {
  return (
    <Card className="bg-white shadow-sm border-none overflow-hidden group">
      <div className={`h-1 w-full ${color.replace('text', 'bg')}`} />
      <CardContent className="p-6 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{title}</p>
          <p className={`text-4xl font-black ${color} tracking-tighter`}>{value}</p>
        </div>
        <div className={`p-4 bg-muted/50 rounded-2xl ${color} group-hover:scale-110 transition-transform`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
