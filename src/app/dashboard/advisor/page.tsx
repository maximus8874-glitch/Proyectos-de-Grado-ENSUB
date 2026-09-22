"use client";

import { useState, useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, doc, deleteDoc, updateDoc, addDoc, getDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/project/status-badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Users, 
  Clock, 
  AlertTriangle, 
  Loader2, 
  TrendingUp, 
  ClipboardCheck, 
  Trash2, 
  X, 
  BookOpen, 
  Sparkles, 
  Calendar, 
  IdCard, 
  GraduationCap, 
  Globe2, 
  Filter,
  UserPlus,
  UserCheck,
  UserMinus,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/context/language-context";
import { useToast } from "@/hooks/use-toast";
import { recordAuditLog } from "@/lib/audit";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

const normalizeSearch = (str: string) =>
  (str || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();

export default function AdvisorDashboard() {
  const { user } = useUser();
  const db = useFirestore();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [viewFilter, setViewFilter] = useState<"all" | "assigned">("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const ADMIN_WHITELIST = [
    "maximus8874@gmail.com",
    "administracionmaritima@ensub.edu.co",
    "josediazdoria08@gmail.com",
    "felipetorrez502@gmail.com"
  ];

  const isSuperUser = ADMIN_WHITELIST.includes(user?.email?.toLowerCase() || "");

  // Consulta general de proyectos
  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    return query(collection(db, "projects"));
  }, [db, user]);

  const { data: rawProjects, isLoading } = useCollection<any>(projectsQuery);

  const handleAssignSelf = async (project: any) => {
    if (!db || !user) return;
    setAssigningId(project.id);
    try {
      let actorName = user.displayName || user.email || "Docente";
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          actorName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || actorName;
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }

      const currentAdvisorIds: string[] = Array.isArray(project.advisorIds) ? [...project.advisorIds] : [];
      if (!currentAdvisorIds.includes(user.uid)) {
        currentAdvisorIds.push(user.uid);
      }

      const updateData: any = {
        advisorIds: currentAdvisorIds,
        updatedAt: new Date().toISOString(),
      };

      if (!project.proposedDirectorName || project.proposedDirectorName.includes("COLOCAR")) {
        updateData.proposedDirectorName = actorName;
      }

      await updateDoc(doc(db, "projects", project.id), updateData);

      try {
        await addDoc(collection(db, "projects", project.id, "activityLogs"), {
          actorId: user.uid,
          actorName,
          projectId: project.id,
          actionType: "Asignación de Asesor",
          details: `El docente ${actorName} se asignó como tutor/evaluador de este trabajo de grado.`,
          createdAt: new Date().toISOString()
        });

        await recordAuditLog(db, {
          actorId: user.uid,
          actorEmail: user.email || "unknown",
          actorName,
          actorRole: isSuperUser ? "admin" : "advisor",
          actionType: "PROJECT_ASSIGN_ADVISOR",
          entityType: "Project",
          entityId: project.id,
          projectTitle: project.title || "Sin título",
          details: `El docente ${actorName} tomó la tutoría/evaluación de este trabajo de grado.`,
        });
      } catch (logErr) {
        console.error("Error creating activity log:", logErr);
      }

      toast({
        title: "¡Proyecto Asignado!",
        description: `Te has vinculado al trabajo "${project.title || 'Trabajo de Grado'}". Ahora figura en tu pestaña "Mis Asignados".`,
      });
    } catch (error: any) {
      console.error("Error assigning project:", error);
      toast({
        variant: "destructive",
        title: "Error de asignación",
        description: error?.message || "No se pudo vincular el proyecto.",
      });
    } finally {
      setAssigningId(null);
    }
  };

  const handleUnassignSelf = async (project: any) => {
    if (!db || !user) return;
    setAssigningId(project.id);
    try {
      let actorName = user.displayName || user.email || "Docente";
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          actorName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || actorName;
        }
      } catch (err) {}

      const currentAdvisorIds: string[] = Array.isArray(project.advisorIds) ? project.advisorIds : [];
      const updatedAdvisorIds = currentAdvisorIds.filter(id => id !== user.uid);

      await updateDoc(doc(db, "projects", project.id), {
        advisorIds: updatedAdvisorIds,
        updatedAt: new Date().toISOString(),
      });

      await recordAuditLog(db, {
        actorId: user.uid,
        actorEmail: user.email || "unknown",
        actorName,
        actorRole: isSuperUser ? "admin" : "advisor",
        actionType: "PROJECT_UNASSIGN_ADVISOR",
        entityType: "Project",
        entityId: project.id,
        projectTitle: project.title || "Sin título",
        details: `El docente ${actorName} se desvinculó de este trabajo de grado.`,
      });

      toast({
        title: "Desvinculación Completa",
        description: `Te has desvinculado de la tutoría de "${project.title}".`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al desvincular",
        description: error?.message || "No se pudo remover la asignación.",
      });
    } finally {
      setAssigningId(null);
    }
  };

  const handleDeleteProject = async (projectId: string, projectTitle?: string) => {
    if (!db || !isSuperUser) return;
    try {
      await deleteDoc(doc(db, "projects", projectId));
      toast({
        title: "Proyecto Eliminado",
        description: `El proyecto "${projectTitle || projectId}" ha sido eliminado exitosamente del repositorio.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar el proyecto.",
      });
    }
  };

  const safeGetTime = (val: any): number => {
    if (!val) return 0;
    try {
      if (typeof val === 'number') return val;
      if (typeof val === 'object' && val?.seconds) return val.seconds * 1000;
      if (typeof val === 'string') {
        const t = new Date(val).getTime();
        return isNaN(t) ? 0 : t;
      }
      if (val?.toDate && typeof val.toDate === 'function') {
        return val.toDate().getTime();
      }
      const parsed = new Date(val).getTime();
      return isNaN(parsed) ? 0 : parsed;
    } catch {
      return 0;
    }
  };

  const formatSafeDate = (val: any) => {
    const time = safeGetTime(val);
    if (time === 0) return 'N/A';
    try {
      return new Date(time).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const formatSafeTime = (val: any) => {
    const time = safeGetTime(val);
    if (time === 0) return '';
    try {
      return new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  // Proyectos disponibles en la red institucional
  const publishedProjects = useMemo(() => {
    if (!rawProjects) return [];
    return rawProjects;
  }, [rawProjects]);

  // Si no es borrador, el progreso es 100% para fines de visualización de la propuesta enviada
  const getDisplayProgress = (project: any) => {
    return project.status !== 'Borrador' ? 100 : (project.progressPercent || 1);
  };

  // Filtrado y ordenamiento inteligente por los más recientes
  const processedProjects = useMemo(() => {
    if (!publishedProjects) return [];

    let filtered = publishedProjects;

    // Filtro por vista: Todos en la red vs Mis Asignados
    if (viewFilter === "assigned" && user) {
      filtered = filtered.filter(p => 
        p.advisorIds?.includes(user.uid) || 
        p.directorId === user.uid ||
        (p.proposedDirectorName && user.displayName && normalizeSearch(p.proposedDirectorName).includes(normalizeSearch(user.displayName)))
      );
    }

    // Filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Filtro por término de búsqueda (Nombre, Cédula/ID, Título, Programa, Director, etc.)
    if (searchTerm.trim()) {
      const term = normalizeSearch(searchTerm);
      filtered = filtered.filter(p => {
        const title = normalizeSearch(p.title);
        const prop1Name = normalizeSearch(p.proponent1Name);
        const prop1Id = normalizeSearch(p.proponent1Id);
        const prop2Name = normalizeSearch(p.proponent2Name);
        const prop2Id = normalizeSearch(p.proponent2Id);
        const studentName = normalizeSearch(p.studentName);
        const programa = normalizeSearch(p.programa);
        const director = normalizeSearch(p.proposedDirectorName);
        const area = normalizeSearch(p.researchArea);
        const linea = normalizeSearch(p.researchLine);
        const sublinea = normalizeSearch(p.researchSubLine);
        const curso = normalizeSearch(p.curso);

        return (
          title.includes(term) ||
          prop1Name.includes(term) ||
          prop1Id.includes(term) ||
          prop2Name.includes(term) ||
          prop2Id.includes(term) ||
          studentName.includes(term) ||
          programa.includes(term) ||
          director.includes(term) ||
          area.includes(term) ||
          linea.includes(term) ||
          sublinea.includes(term) ||
          curso.includes(term)
        );
      });
    }

    // Ordenar siempre por los MÁS RECIENTES cargados en la red primero
    return [...filtered].sort((a, b) => {
      const dateA = safeGetTime(a.updatedAt || a.createdAt || a.proposalDate);
      const dateB = safeGetTime(b.updatedAt || b.createdAt || b.proposalDate);
      return dateB - dateA;
    });
  }, [publishedProjects, viewFilter, statusFilter, searchTerm, user]);

  // Métricas
  const totalInNetwork = publishedProjects.length;
  const pendingReview = publishedProjects.filter(p => p.status === 'Pendiente' || p.status === 'En Revisión' || p.status === 'Corregir').length;
  const avgProgress = publishedProjects.length 
    ? Math.round(publishedProjects.reduce((acc, p) => acc + getDisplayProgress(p), 0) / publishedProjects.length) 
    : 0;
  const inProgress = publishedProjects.filter(p => p.status === 'En Curso').length;

  const isRecentProject = (dateVal?: any) => {
    const time = safeGetTime(dateVal);
    if (time === 0) return false;
    const now = Date.now();
    const daysDiff = (now - time) / (1000 * 3600 * 24);
    return daysDiff >= 0 && daysDiff <= 7;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-80 gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
          Cargando repositorio de trabajos de grado...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-16">
      {/* Encabezado Principal */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-[#FF6B00] text-white hover:bg-[#FF6B00]/90 font-bold text-[10px] tracking-wider uppercase">
              Repositorio Institucional
            </Badge>
            <span className="text-xs text-muted-foreground font-semibold">Red ENSUB</span>
          </div>
          <h1 className="text-3xl font-black font-headline text-primary uppercase tracking-tight">
            {isSuperUser ? "Control y Búsqueda de Trabajos de Grado" : "Buscador y Estado de Trabajos de Grado"}
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Consulta en tiempo real de propuestas y trabajos de grado publicados en la plataforma institucional.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 px-5 py-2.5 bg-primary/10 rounded-full border border-primary/20 shadow-sm">
            <Globe2 className="h-5 w-5 text-primary animate-pulse" />
            <span className="text-[10px] font-black uppercase text-primary tracking-widest">
              {totalInNetwork} {totalInNetwork === 1 ? "Proyecto en Red" : "Proyectos en Red"}
            </span>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas Globales */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <AdvisorMetricCard 
          title="Trabajos en la Red" 
          value={totalInNetwork.toString()} 
          icon={<BookOpen className="h-5 w-5" />} 
          color="text-primary" 
        />
        <AdvisorMetricCard 
          title="Promedio de Avance" 
          value={`${avgProgress}%`} 
          icon={<TrendingUp className="h-5 w-5" />} 
          color="text-emerald-600" 
        />
        <AdvisorMetricCard 
          title="Pendientes / En Revisión" 
          value={pendingReview.toString()} 
          icon={<Clock className="h-5 w-5" />} 
          color="text-amber-500" 
        />
        <AdvisorMetricCard 
          title="En Curso (Desarrollo)" 
          value={inProgress.toString()} 
          icon={<GraduationCap className="h-5 w-5" />} 
          color="text-blue-600" 
        />
      </div>

      {/* Recuadro de Búsqueda y Tabla de Trabajos de Grado */}
      <Card className="border shadow-sm overflow-hidden bg-white">
        <CardHeader className="bg-slate-50/80 border-b p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-black uppercase text-primary flex items-center gap-2">
                <Search className="h-5 w-5 text-[#FF6B00]" /> {t('projectStatusTable') || "Estado de Proyectos"}
              </CardTitle>
              <CardDescription className="text-xs font-medium text-slate-600 mt-0.5">
                Búsqueda universal por nombre del estudiante, documento de identidad (ID/Cédula) o título del proyecto.
              </CardDescription>
            </div>

            {/* Pestañas de Vista (Todos vs Mis Asignados) */}
            <Tabs 
              value={viewFilter} 
              onValueChange={(val) => setViewFilter(val as any)}
              className="w-full sm:w-auto"
            >
              <TabsList className="grid grid-cols-2 bg-slate-200/70 p-1 rounded-lg">
                <TabsTrigger value="all" className="text-xs font-bold gap-1.5 data-[state=active]:bg-white data-[state=active]:text-primary">
                  <Globe2 className="h-3.5 w-3.5" /> Todos en la Red
                </TabsTrigger>
                <TabsTrigger value="assigned" className="text-xs font-bold gap-1.5 data-[state=active]:bg-white data-[state=active]:text-primary">
                  <Users className="h-3.5 w-3.5" /> Mis Asignados
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {/* Barra de Búsqueda Universal */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre de estudiante, cédula/ID o título del proyecto..." 
                className="pl-10 pr-10 h-12 bg-white border-slate-300 focus-visible:ring-primary shadow-inner text-sm font-medium" 
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Selector de Estado Rápido */}
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto py-1">
              {[
                { label: "Todos", value: "all" },
                { label: "Pendientes", value: "Pendiente" },
                { label: "En Revisión", value: "En Revisión" },
                { label: "En Curso", value: "En Curso" },
                { label: "Corregir", value: "Corregir" },
                { label: "Borradores", value: "Borrador" },
                { label: "Defendido / Completado", value: "Defendido" },
              ].map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setStatusFilter(filter.value)}
                  className={`px-3 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition-colors ${
                    statusFilter === filter.value 
                      ? "bg-primary text-white shadow-sm" 
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contador de Resultados */}
          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1">
            <span className="font-semibold">
              Mostrando <strong className="text-primary font-black">{processedProjects.length}</strong> {processedProjects.length === 1 ? "trabajo de grado" : "trabajos de grado"} (ordenados del más reciente al más antiguo)
            </span>
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")} 
                className="text-primary hover:underline font-bold"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {processedProjects.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground flex flex-col items-center gap-4 bg-white">
              <div className="h-20 w-20 rounded-full bg-slate-100 flex items-center justify-center">
                <Search className="h-10 w-10 text-slate-400" />
              </div>
              <div className="space-y-1.5 max-w-md mx-auto">
                <p className="font-black uppercase text-base text-slate-800">
                  {searchTerm ? "No se encontraron coincidencias" : "No hay proyectos para mostrar"}
                </p>
                <p className="text-xs text-slate-500">
                  {searchTerm 
                    ? `No encontramos ningún trabajo de grado que coincida con "${searchTerm}". Verifica el nombre, número de identificación o palabras clave del título.` 
                    : viewFilter === "assigned"
                      ? "No tienes proyectos directamente asignados bajo tu tutela actualmente. Cambia la pestaña a 'Todos en la Red' para ver todos los trabajos cargados y hacer clic en 'Asignarme'."
                      : "Aún no hay propuestas de grado radicadas en la red institucional."
                  }
                </p>
                {searchTerm && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSearchTerm("")}
                    className="mt-2 rounded-full"
                  >
                    Ver todos los proyectos
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-slate-50 border-b">
                  <TableRow>
                    <TableHead className="font-black uppercase text-[11px] text-slate-700 py-3.5">
                      Trabajo de Grado / Título
                    </TableHead>
                    <TableHead className="font-black uppercase text-[11px] text-slate-700">
                      Estudiante(s) / Proponente(s)
                    </TableHead>
                    <TableHead className="font-black uppercase text-[11px] text-slate-700">
                      Fecha de Cargue / Registro
                    </TableHead>
                    <TableHead className="font-black uppercase text-[11px] text-slate-700">
                      {t('progress')}
                    </TableHead>
                    <TableHead className="font-black uppercase text-[11px] text-slate-700">
                      {t('status')}
                    </TableHead>
                    <TableHead className="text-right font-black uppercase text-[11px] text-slate-700 pr-6">
                      {t('actions')}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {processedProjects.map((project) => {
                    const displayProgress = getDisplayProgress(project);
                    const updateDate = project.updatedAt || project.createdAt || project.proposalDate;
                    const isRecent = isRecentProject(updateDate);

                    const student1Name = project.proponent1Name || project.studentName || "Estudiante";
                    const student1Id = project.proponent1Id;
                    const student2Name = project.proponent2Name;
                    const student2Id = project.proponent2Id;

                    const isAssignedToMe = Boolean(
                      user && (
                        project.advisorIds?.includes(user.uid) || 
                        project.directorId === user.uid ||
                        (project.proposedDirectorName && user.displayName && normalizeSearch(project.proposedDirectorName).includes(normalizeSearch(user.displayName)))
                      )
                    );

                    return (
                      <TableRow key={project.id} className="group hover:bg-slate-50/70 transition-colors">
                        {/* Columna 1: Proyecto y Programa */}
                        <TableCell className="max-w-md py-4">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {isRecent && (
                                <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[9px] font-black uppercase tracking-wider py-0 px-1.5 h-4">
                                  <Sparkles className="h-2.5 w-2.5 mr-0.5" /> Reciente
                                </Badge>
                              )}
                              <span className="text-[10px] font-black uppercase text-primary bg-primary/10 px-2 py-0.5 rounded">
                                {project.programa || "Programa General"}
                              </span>
                              {isAssignedToMe && (
                                <Badge className="bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider py-0 px-2 h-4 gap-1 shadow-sm">
                                  <UserCheck className="h-2.5 w-2.5" /> Mi Asignado
                                </Badge>
                              )}
                            </div>

                            <Link 
                              href={`/dashboard/projects/${project.id}`}
                              className="font-bold text-sm text-slate-900 group-hover:text-primary transition-colors line-clamp-2 block leading-snug"
                            >
                              {project.title || "Sin título definido"}
                            </Link>

                            {project.proposedDirectorName && (
                              <p className="text-[10px] text-muted-foreground flex items-center gap-1 font-medium">
                                <GraduationCap className="h-3 w-3 text-slate-400" /> 
                                Director/Asesor: <span className="font-bold text-slate-700">{project.proposedDirectorName}</span>
                              </p>
                            )}
                          </div>
                        </TableCell>

                        {/* Columna 2: Datos del Estudiante (Nombre e Identificación) */}
                        <TableCell className="py-4">
                          <div className="space-y-2">
                            {/* Proponente 1 */}
                            <div>
                              <p className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                                {student1Name}
                              </p>
                              {student1Id ? (
                                <div className="flex items-center gap-1 mt-0.5 ml-3">
                                  <Badge variant="outline" className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 py-0 px-1.5 h-4">
                                    ID: {student1Id}
                                  </Badge>
                                </div>
                              ) : (
                                <p className="text-[10px] text-muted-foreground ml-3">ID no registrado</p>
                              )}
                            </div>

                            {/* Proponente 2 si existe */}
                            {student2Name && (
                              <div className="border-t border-slate-100 pt-1">
                                <p className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                                  {student2Name}
                                </p>
                                {student2Id && (
                                  <div className="flex items-center gap-1 mt-0.5 ml-3">
                                    <Badge variant="outline" className="text-[10px] font-mono font-bold bg-slate-100 text-slate-700 py-0 px-1.5 h-4">
                                      ID: {student2Id}
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        {/* Columna 3: Fecha de Cargue */}
                        <TableCell className="py-4 whitespace-nowrap">
                          <div className="flex flex-col text-xs font-medium text-slate-600">
                            <span className="flex items-center gap-1 text-slate-800 font-bold">
                              <Calendar className="h-3.5 w-3.5 text-primary" />
                              {formatSafeDate(updateDate)}
                            </span>
                            <span className="text-[10px] text-muted-foreground mt-0.5">
                              {formatSafeTime(updateDate)}
                            </span>
                          </div>
                        </TableCell>

                        {/* Columna 4: Progreso */}
                        <TableCell className="w-[160px] py-4">
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-black">
                              <span className="text-primary">{displayProgress}%</span>
                              <span className="text-[9px] text-muted-foreground uppercase">Avance</span>
                            </div>
                            <Progress value={displayProgress} className="h-2 bg-slate-100" />
                          </div>
                        </TableCell>

                        {/* Columna 5: Estado */}
                        <TableCell className="py-4">
                          <StatusBadge status={project.status} />
                        </TableCell>

                        {/* Columna 6: Acciones */}
                        <TableCell className="text-right py-4 pr-6">
                          <div className="flex items-center justify-end gap-2">
                            {isSuperUser && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full"
                                    title="Eliminar proyecto del sistema"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>¿Eliminar Proyecto?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Esta acción es irreversible. Se borrarán permanentemente los datos, entregables y trazabilidad del proyecto "{project.title}".
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => handleDeleteProject(project.id, project.title)} 
                                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                      Eliminar permanentemente
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}

                            {isAssignedToMe ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleUnassignSelf(project)}
                                disabled={assigningId === project.id}
                                className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full"
                                title="Desvincularme de este proyecto"
                              >
                                {assigningId === project.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UserMinus className="h-4 w-4" />}
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                onClick={() => handleAssignSelf(project)}
                                disabled={assigningId === project.id}
                                className="rounded-full px-3.5 h-8 text-[11px] font-black uppercase tracking-wider bg-orange-600 hover:bg-orange-700 text-white gap-1.5 shadow-sm transition-transform hover:scale-105"
                                title="Asignarme este trabajo de grado para tutoría/evaluación"
                              >
                                {assigningId === project.id ? <Loader2 className="h-3 w-3 animate-spin" /> : <UserPlus className="h-3.5 w-3.5" />}
                                Asignarme
                              </Button>
                            )}

                            <Button 
                              variant="outline" 
                              size="sm" 
                              asChild 
                              className="rounded-full px-4 h-8 font-bold hover:bg-primary hover:text-white transition-all shadow-sm border-slate-300"
                            >
                              <Link href={`/dashboard/projects/${project.id}`}>
                                {t('verify') || "Revisar"}
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function AdvisorMetricCard({ 
  title, 
  value, 
  icon, 
  color = "text-primary" 
}: { 
  title: string; 
  value: string; 
  icon: React.ReactNode; 
  color?: string;
}) {
  return (
    <Card className="bg-white shadow-sm border overflow-hidden group hover:shadow-md transition-shadow">
      <div className={`h-1.5 w-full ${color.replace('text', 'bg')}`} />
      <CardContent className="p-5 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{title}</p>
          <p className={`text-3xl font-black ${color} tracking-tighter`}>{value}</p>
        </div>
        <div className={`p-3.5 bg-slate-50 rounded-2xl ${color} border group-hover:scale-110 transition-transform shadow-inner`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  );
}
