"use client";

import { use, useState, useEffect, useMemo } from "react";
import { useUser, useFirestore, useDoc, useCollection, useMemoFirebase } from "@/firebase";
import { doc, collection, query, orderBy, updateDoc, deleteDoc, addDoc, getDoc } from "firebase/firestore";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/project/status-badge";
import { 
  ArrowLeft, 
  MessageSquare, 
  Loader2, 
  History, 
  Sparkles, 
  GraduationCap,
  Save,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  RotateCcw,
  Printer,
  XCircle,
  CheckCircle,
  Trash2,
  BookOpen,
  FileText,
  Calendar,
  User,
  Info,
  Users,
  ClipboardCheck,
  Bookmark,
  Layers,
  Zap,
  Globe,
  Database,
  FileCode,
  ListTodo,
  Mail,
  Phone,
  IdCard,
  Languages,
  BookMarked,
  TrendingUp,
  Clock,
  BarChart3,
  List,
  Activity,
  Award,
  ShieldAlert
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from 'recharts';
import Link from "next/link";
import { AIRefinementModal } from "@/components/project/ai-refinement-modal";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { AdvisorChatFloating } from "@/components/project/advisor-chat-floating";
import { DegreeProject, ActivityLog, SectionCorrectionItem } from "@/lib/types";
import { InlineSectionFeedback } from "@/components/project/inline-section-feedback";
import { useLanguage } from "@/context/language-context";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PrintProposalV03 } from "@/components/project/print-proposal-v03";
import { PrintThesisAPA } from "@/components/project/print-thesis-apa";
import { ENSUBLogo } from "@/components/institutional/ensub-logo";
import { ArticuloCientifico } from "@/components/project/articulo-cientifico";
import { SectionCorrectionDialog } from "@/components/project/section-correction-dialog";
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

const PROGRESS_FIELDS: { key: keyof DegreeProject; label: string }[] = [
  { key: "title", label: "Título del Proyecto" },
  { key: "facultad", label: "Facultad" },
  { key: "programa", label: "Programa / Especialidad" },
  { key: "curso", label: "Curso" },
  { key: "researchLine", label: "Línea de Investigación" },
  { key: "researchSubLine", label: "Sublínea" },
  { key: "proponent1Name", label: "Nombre Proponente 1" },
  { key: "proponent1Id", label: "ID Proponente 1" },
  { key: "proponent1Email", label: "Email Proponente 1" },
  { key: "proponent1Phone", label: "Teléfono Proponente 1" },
  { key: "proposedDirectorName", label: "Director Propuesto" },
  { key: "problemStatement", label: "Descripción del Problema" },
  { key: "problemFormulation", label: "Formulación del Problema" },
  { key: "justification", label: "Justificación" },
  { key: "generalObjective", label: "Objetivo General" },
  { key: "specificObjectives", label: "Objetivos Específicos" },
  { key: "methodology", label: "Diseño Metodológico" },
  { key: "expectedResults", label: "Resultados e Impacto" }
];

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const projectRef = useMemoFirebase(() => db ? doc(db, "projects", id) : null, [db, id]);
  const { data: project, isLoading: isProjectLoading } = useDoc<DegreeProject>(projectRef);

  const logsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "projects", id, "activityLogs"), orderBy("createdAt", "desc"));
  }, [db, id]);
  const { data: logs } = useCollection<ActivityLog>(logsQuery);

  const [isDeleting, setIsDeleting] = useState(false);
  const [isSavingThesis, setIsSavingThesis] = useState(false);
  const [isSavingArticle, setIsSavingArticle] = useState(false);
  const [thesisForm, setThesisForm] = useState<Partial<DegreeProject>>({});
  const [printTarget, setPrintTarget] = useState<'proposal' | 'thesis'>('proposal');
  const [isCorrectionDialogOpen, setIsCorrectionDialogOpen] = useState(false);
  const [correctionComment, setCorrectionComment] = useState("");
  const [auditViewMode, setAuditViewMode] = useState<'list' | 'stats'>('list');

  // Procesamiento de datos de auditoría para estadísticas y trazabilidad
  const auditStats = useMemo(() => {
    if (!logs || logs.length === 0) return null;

    // 1. Cronológico (de más antiguo a más nuevo)
    const sortedLogs = [...logs].reverse();

    // 2. Tiempo transcurrido total
    const startTime = new Date(sortedLogs[0].createdAt).getTime();
    const totalCycleTimeMs = Date.now() - startTime; // desde la creación hasta hoy

    const formatDuration = (ms: number) => {
      const days = Math.floor(ms / (1000 * 60 * 60 * 24));
      const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) return `${days}d ${hours}h`;
      if (hours > 0) return `${hours}h ${mins}m`;
      return `${mins}m`;
    };

    const cycleTimeText = formatDuration(totalCycleTimeMs);

    // 3. Iteraciones de corrección
    const correctionsCount = logs.filter(log => log.actionType?.includes('Corregir')).length;

    // 4. Puntaje de auditoría (comienza en 100%, disminuye 15% por corrección)
    const auditScoreValue = Math.max(0, 100 - (correctionsCount * 15));

    // 5. Participación por actor
    const actorCounts: Record<string, number> = {};
    logs.forEach(log => {
      const actor = log.actorName || "Sistema";
      actorCounts[actor] = (actorCounts[actor] || 0) + 1;
    });

    const actorColors = ['#1E6EAA', '#33B8AD', '#F59E0B', '#EF4444', '#10B981'];
    const participationData = Object.entries(actorCounts).map(([name, count], index) => ({
      name,
      value: count,
      color: actorColors[index % actorColors.length]
    }));

    // 6. Distribución de tipos de acción
    const actionCounts: Record<string, number> = {};
    logs.forEach(log => {
      let type = "General";
      if (log.actionType?.includes("Cambio de Estado")) {
        type = "Estados";
      } else if (log.actionType?.includes("Borrador") || log.details?.includes("borrador")) {
        type = "Borrador";
      } else if (log.actionType?.includes("Auditoría")) {
        type = "AI Audit";
      } else if (log.actionType?.includes("Comentario") || log.details?.includes("comentario")) {
        type = "Foro";
      } else if (log.actionType?.includes("Tesis") || log.details?.includes("tesis")) {
        type = "Tesis";
      }
      actionCounts[type] = (actionCounts[type] || 0) + 1;
    });

    const actionData = Object.entries(actionCounts).map(([name, count]) => ({
      name,
      total: count
    }));

    // 7. Flujo de trazabilidad (Línea de tiempo de estados secuencial)
    // Extrae los eventos de cambio de estado o creación del borrador
    const stateEvents = sortedLogs.filter(log => 
      log.actionType?.includes("Cambio de Estado") || 
      log.actionType?.includes("Borrador") || 
      log.actionType?.includes("Creación")
    );

    const traceabilityFlow = stateEvents.map((event, index) => {
      const currentStamp = new Date(event.createdAt).getTime();
      const nextStamp = stateEvents[index + 1] 
        ? new Date(stateEvents[index + 1].createdAt).getTime()
        : Date.now();
      const timeSpentMs = nextStamp - currentStamp;
      
      let stateName = "Borrador";
      if (event.actionType?.includes("Cambio de Estado")) {
        stateName = event.actionType.replace("Cambio de Estado: ", "").trim();
      }

      return {
        id: event.id,
        stateName,
        createdAt: event.createdAt,
        actorName: event.actorName,
        details: event.details,
        timeSpentMs,
        timeSpentText: formatDuration(timeSpentMs)
      };
    });

    return {
      cycleTimeText,
      correctionsCount,
      auditScoreValue,
      participationData,
      actionData,
      traceabilityFlow
    };
  }, [logs]);

  useEffect(() => {
    if (project) {
      setThesisForm({
        thesisTitle: project.thesisTitle || project.title,
        thesisIntroduction: project.thesisIntroduction || "",
        thesisDedication: project.thesisDedication || "",
        thesisAcknowledgments: project.thesisAcknowledgments || "",
        thesisAbstract: project.thesisAbstract || "",
        thesisAbstractEnglish: project.thesisAbstractEnglish || "",
        thesisGlossary: project.thesisGlossary || "",
        thesisBackground: project.thesisBackground || "",
        thesisTheoreticalFramework: project.thesisTheoreticalFramework || "",
        thesisConceptualFramework: project.thesisConceptualFramework || "",
        thesisLegalFramework: project.thesisLegalFramework || "",
        thesisMethodologyDesign: project.thesisMethodologyDesign || "",
        thesisMethodologyPopulation: project.thesisMethodologyPopulation || "",
        thesisMethodologySample: project.thesisMethodologySample || "",
        thesisMethodologyInstruments: project.thesisMethodologyInstruments || "",
        thesisResults: project.thesisResults || "",
        thesisDiscussion: project.thesisDiscussion || "",
        thesisConclusions: project.thesisConclusions || "",
        thesisRecommendations: project.thesisRecommendations || "",
        thesisReferences: project.thesisReferences || "",
        thesisAnnexes: project.thesisAnnexes || "",
      });
    }
  }, [project]);

  const logActivity = async (actionType: string, details: string) => {
    if (!db || !user) return;
    try {
      let actorName = user.displayName || user.email || "Usuario";
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          actorName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || actorName;
        }
      } catch (err) {
        console.error("Error fetching user data for log:", err);
      }

      await addDoc(collection(db, "projects", id, "activityLogs"), {
        actorId: user.uid,
        actorName,
        projectId: id,
        actionType,
        details,
        createdAt: new Date().toISOString()
      });
    } catch (error) {
      console.error("Error creating activity log:", error);
    }
  };

  const updateStatus = async (
    newStatus: any, 
    commentText?: string, 
    sectionCorrections?: Record<string, any>
  ) => {
    if (!project || !db || !user) return;
    try {
      const updateData: any = { 
        status: newStatus, 
        updatedAt: new Date().toISOString() 
      };
      
      if (newStatus === 'Corregir') {
        if (commentText) updateData.correcciones = commentText;
        if (sectionCorrections) updateData.sectionCorrections = sectionCorrections;
      }

      await updateDoc(doc(db, "projects", id), updateData);
      
      let logDetails = `El proyecto cambió de estado a: ${newStatus}`;
      if (newStatus === 'Corregir' && commentText) {
        logDetails += `. Correcciones solicitadas en ${sectionCorrections ? Object.keys(sectionCorrections).length : 1} planteamientos.`;
      } else if (newStatus === 'En Revisión') {
        logDetails = `El estudiante envió el proyecto a revisión`;
      } else if (newStatus === 'En Curso') {
        logDetails = `El asesor aprobó la propuesta y el proyecto pasó a estar en curso.`;
      }
      
      await logActivity(`Cambio de Estado: ${newStatus}`, logDetails);

      // Auditoría Inmutable Forense
      let actorName = user.displayName || user.email || "Usuario";
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          actorName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || actorName;
        }
      } catch (err) {
        console.error("Error fetching user data for audit:", err);
      }

      await recordAuditLog(db, {
        actorId: user.uid,
        actorEmail: user.email || "unknown",
        actorName,
        actorRole: isSuperUser ? "admin" : (isAdvisor ? "advisor" : "student"),
        actionType: "PROJECT_STATUS_CHANGE",
        entityType: "Project",
        entityId: id,
        projectTitle: project.title,
        details: logDetails,
        metadata: {
          previousStatus: project.status,
          newStatus,
          corrections: commentText || null,
          sectionCount: sectionCorrections ? Object.keys(sectionCorrections).length : 0
        }
      });
      
      toast({ title: t('saved') });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({ variant: "destructive", title: "Error" });
    }
  };

  const handleSaveThesis = async () => {
    if (!db || !project) return;
    setIsSavingThesis(true);
    try {
      await updateDoc(doc(db, "projects", id), {
        ...thesisForm,
        updatedAt: new Date().toISOString()
      });
      toast({ title: t('saveSuccess') });
    } catch (error) {
      toast({ variant: "destructive", title: "Error al guardar tesis" });
    } finally {
      setIsSavingThesis(false);
    }
  };

  const handleSaveArticle = async (data: Partial<DegreeProject>) => {
    if (!db || !project) return;
    setIsSavingArticle(true);
    try {
      await updateDoc(doc(db, "projects", id), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      await logActivity("Artículo Científico", "Se guardaron los avances del artículo científico.");
      toast({ title: "Artículo guardado", description: "Los datos del artículo científico se han sincronizado correctamente." });
    } catch (error) {
      toast({ variant: "destructive", title: "Error al guardar artículo" });
    } finally {
      setIsSavingArticle(false);
    }
  };

  const handleSaveSingleCorrection = async (sectionKey: string, sectionTitle: string, comment: string) => {
    if (!db || !project || !user) return;
    try {
      let actorName = user.displayName || user.email || "Docente Evaluador";
      try {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          actorName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || actorName;
        }
      } catch (err) {
        console.error("Error getting user name:", err);
      }

      const currentCorrections: Record<string, SectionCorrectionItem> = {
        ...(project.sectionCorrections || {}),
      };

      currentCorrections[sectionKey] = {
        sectionKey,
        sectionTitle,
        comment,
        authorName: actorName,
        updatedAt: new Date().toISOString()
      };

      const synthesis = Object.values(currentCorrections)
        .map(item => `[${item.sectionTitle}]: ${item.comment}`)
        .join("\n\n");

      await updateDoc(doc(db, "projects", id), {
        sectionCorrections: currentCorrections,
        correcciones: synthesis,
        updatedAt: new Date().toISOString()
      });

      await logActivity("Observación en Planteamiento", `El docente ${actorName} registró una observación para "${sectionTitle}".`);

      toast({
        title: "Observación Guardada",
        description: `Se registró la corrección para "${sectionTitle}".`
      });
    } catch (error: any) {
      console.error("Error saving section correction:", error);
      toast({
        variant: "destructive",
        title: "Error al guardar observación",
        description: error?.message || "No se pudo guardar la corrección."
      });
    }
  };

  const handleRemoveSingleCorrection = async (sectionKey: string) => {
    if (!db || !project || !user) return;
    try {
      const currentCorrections: Record<string, SectionCorrectionItem> = {
        ...(project.sectionCorrections || {}),
      };

      const removedItem = currentCorrections[sectionKey];
      delete currentCorrections[sectionKey];

      const synthesis = Object.values(currentCorrections)
        .map(item => `[${item.sectionTitle}]: ${item.comment}`)
        .join("\n\n");

      await updateDoc(doc(db, "projects", id), {
        sectionCorrections: currentCorrections,
        correcciones: synthesis || null,
        updatedAt: new Date().toISOString()
      });

      await logActivity("Observación Eliminada", `Se removió la observación de "${removedItem?.sectionTitle || sectionKey}".`);

      toast({
        title: "Observación Eliminada",
        description: `Se eliminó la corrección de "${removedItem?.sectionTitle || sectionKey}".`
      });
    } catch (error: any) {
      console.error("Error removing section correction:", error);
      toast({
        variant: "destructive",
        title: "Error al eliminar observación"
      });
    }
  };

  const handleDeleteProject = async () => {
    if (!db || !isSuperUser || !user || !project) return;
    setIsDeleting(true);
    try {
      await recordAuditLog(db, {
        actorId: user.uid,
        actorEmail: user.email || "unknown",
        actorName: user.displayName || user.email || "Superadministrador",
        actorRole: "admin",
        actionType: "PROJECT_DELETE_DRAFT",
        entityType: "Project",
        entityId: id,
        projectTitle: project.title,
        details: `Eliminación permanente del proyecto "${project.title}" por parte del Superadministrador.`,
      });

      await deleteDoc(doc(db, "projects", id));
      toast({ title: "Proyecto Eliminado" });
      router.push("/dashboard/advisor");
    } catch (error) {
      toast({ variant: "destructive", title: "Error de eliminación" });
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePrint = (target: 'proposal' | 'thesis') => {
    setPrintTarget(target);
    setTimeout(() => {
      window.print();
    }, 100);
  };

  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssignSelf = async () => {
    if (!db || !user || !project) return;
    setIsAssigning(true);
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

      await updateDoc(doc(db, "projects", id), updateData);
      await logActivity("Asignación de Tutor", `El docente ${actorName} se asignó como asesor/evaluador de este trabajo.`);

      await recordAuditLog(db, {
        actorId: user.uid,
        actorEmail: user.email || "unknown",
        actorName,
        actorRole: isSuperUser ? "admin" : "advisor",
        actionType: "PROJECT_ASSIGN_ADVISOR",
        entityType: "Project",
        entityId: id,
        projectTitle: project.title,
        details: `El docente ${actorName} tomó la tutoría/evaluación de este trabajo de grado.`,
      });

      toast({
        title: "¡Proyecto Asignado!",
        description: "Te has vinculado como asesor/evaluador de este proyecto. Ahora figura en tu panel 'Mis Asignados'.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de asignación",
        description: error?.message || "No se pudo vincular al proyecto.",
      });
    } finally {
      setIsAssigning(false);
    }
  };

  if (isProjectLoading) return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!project) return <div className="p-8 text-center">Proyecto no encontrado.</div>;

  const ADMIN_WHITELIST = [
    "maximus8874@gmail.com",
    "administracionmaritima@ensub.edu.co",
    "josediazdoria08@gmail.com",
    "felipetorrez502@gmail.com"
  ];

  const isSuperUser = ADMIN_WHITELIST.includes(user?.email?.toLowerCase() || "");
  const isAdvisor = project.advisorIds?.includes(user?.uid || "") || isSuperUser;
  const isStudent = project.studentId === user?.uid;
  const canViewThesis = ['En Curso', 'Defendido', 'Completado', 'Rechazado'].includes(project.status);
  const canEditThesis = isStudent && project.status === 'En Curso';
  const activeCorrectionsCount = project.sectionCorrections ? Object.keys(project.sectionCorrections).length : 0;

  const integrityCheck = PROGRESS_FIELDS.map(field => {
    const value = project[field.key as keyof DegreeProject];
    const isComplete = value && String(value).trim().length > 0;
    return { ...field, isComplete };
  });

  return (
    <>
      <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-12 print:hidden">
        {/* BANNER DE ASIGNACIÓN PARA DOCENTES */}
        {!isAdvisor && !isStudent && (
          <Card className="border-2 border-primary/30 bg-primary/5 rounded-2xl p-5 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-primary text-white rounded-xl shadow-inner">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="space-y-0.5">
                  <h3 className="font-black text-sm uppercase tracking-tight text-primary">
                    ¿Deseas evaluar o asesorar este trabajo de grado?
                  </h3>
                  <p className="text-xs text-slate-600 font-medium">
                    Al asignarte como asesor/evaluador, este proyecto se vinculará a tu panel "Mis Asignados" y podrás calificarlo, solicitar correcciones planteamiento por planteamiento y realizar el seguimiento continuo.
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleAssignSelf}
                disabled={isAssigning}
                className="rounded-full px-6 font-black uppercase text-xs tracking-wider gap-2 shadow-md bg-orange-600 hover:bg-orange-700 text-white shrink-0 hover:scale-105 transition-transform"
              >
                {isAssigning ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                Asignarme como Asesor / Evaluador
              </Button>
            </div>
          </Card>
        )}

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row md:items-center gap-4 bg-white p-6 rounded-2xl border shadow-sm">
          <Button variant="ghost" size="icon" asChild className="rounded-full hover:bg-primary/10">
            <Link href={isStudent ? "/dashboard/student" : "/dashboard/advisor"}><ArrowLeft className="h-5 w-5" /></Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-black font-headline tracking-tight uppercase text-primary leading-tight">{project.title}</h1>
            <div className="flex items-center gap-3 mt-1.5">
              <StatusBadge status={project.status} />
              <div className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">EDUCA-FT-093-JINEN-V03</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {isSuperUser && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="destructive" className="rounded-full gap-2 shadow-sm" disabled={isDeleting}>
                    <Trash2 className="h-4 w-4" /> Eliminar
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Confirmar eliminación absoluta?</AlertDialogTitle>
                    <AlertDialogDescription>Esta acción es irreversible y eliminará todos los registros del sistema.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDeleteProject} className="bg-destructive text-destructive-foreground">Confirmar Borrado</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <Button 
              size="sm" 
              variant="outline" 
              className="rounded-full gap-2 border-primary/20 hover:border-primary" 
              onClick={() => handlePrint('proposal')}
            >
              <Printer className="h-4 w-4" /> {t('printProposal')}
            </Button>
            {isAdvisor && (
              <>
                {project.status === 'Corregir' ? (
                  <Button size="sm" variant="ghost" className="rounded-full gap-2 text-primary" onClick={() => updateStatus('En Revisión')}><RotateCcw className="h-4 w-4" /> {t('undoCorrection')}</Button>
                ) : (
                  <Button size="sm" variant="outline" className="rounded-full gap-2 text-orange-600 border-orange-200 hover:bg-orange-50" onClick={() => setIsCorrectionDialogOpen(true)}><Info className="h-4 w-4" /> {t('askCorrection')}</Button>
                )}
                {(project.status === 'Pendiente' || project.status === 'En Revisión') && (
                  <Button size="sm" variant="default" className="rounded-full gap-2 shadow-md hover:scale-105 transition-transform" onClick={() => updateStatus('En Curso')}><CheckCircle2 className="h-4 w-4" /> {t('approvePhase')}</Button>
                )}
              </>
            )}
          </div>

          {isStudent && project.status === 'Corregir' && (
            <Button size="sm" asChild className="rounded-full gap-2 bg-orange-600 hover:bg-orange-700 shadow-md animate-pulse">
              <Link href={`/dashboard/projects/new?draftId=${id}`}><Edit3 className="h-4 w-4" /> {t('corregir')}</Link>
            </Button>
          )}
        </div>

        {project.status === 'Corregir' && (project.correcciones || project.sectionCorrections) && (
          <Card className="border-orange-300 bg-orange-50/70 rounded-2xl shadow-sm border overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-orange-100 rounded-xl text-orange-600 shrink-0">
                  <Info className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black uppercase text-orange-800 tracking-tight flex items-center gap-2">
                      Dictamen de Correcciones por Planteamientos
                    </h3>
                    {isStudent && (
                      <Button size="sm" asChild className="rounded-full gap-2 bg-orange-600 hover:bg-orange-700 text-white shadow-md">
                        <Link href={`/dashboard/projects/new?draftId=${id}`}>
                          <Edit3 className="h-4 w-4" /> Corregir Propuesta
                        </Link>
                      </Button>
                    )}
                  </div>
                  {project.correcciones && (
                    <p className="text-xs text-orange-950 font-medium whitespace-pre-wrap leading-relaxed pt-1">
                      {project.correcciones}
                    </p>
                  )}
                  {isStudent && (
                    <p className="text-[10px] text-orange-600 font-bold uppercase mt-2">
                      💡 Haz clic en el botón "Corregir Propuesta" para ver las observaciones al lado de cada casilla, realizar los ajustes y reenviar tu trabajo.
                    </p>
                  )}
                </div>
              </div>

              {project.sectionCorrections && Object.keys(project.sectionCorrections).length > 0 && (
                <div className="pt-3 border-t border-orange-200/80">
                  <span className="text-[10px] font-black uppercase text-orange-800 tracking-wider mb-2.5 block">
                    Observaciones Detalladas por Planteamiento:
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Object.entries(project.sectionCorrections).map(([key, item]) => {
                      const comment = typeof item === 'string' ? item : item.comment;
                      const title = typeof item === 'object' ? item.sectionTitle : key;
                      const author = typeof item === 'object' ? item.authorName : null;
                      return (
                        <div key={key} className="bg-white/90 border border-orange-200/80 p-3.5 rounded-xl space-y-1 shadow-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase text-orange-700 flex items-center gap-1.5">
                              <span className="h-2 w-2 rounded-full bg-orange-500" />
                              {title}
                            </span>
                            {author && <span className="text-[9px] text-slate-400 font-semibold">{author}</span>}
                          </div>
                          <p className="text-xs text-slate-800 font-medium leading-relaxed pt-0.5">
                            {comment}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <Tabs defaultValue="propuesta" className="w-full">
              <TabsList className={cn("grid w-full bg-slate-100 p-1 h-14 rounded-xl border",
                isAdvisor
                  ? (canViewThesis ? "grid-cols-5" : "grid-cols-4")
                  : (canViewThesis ? "grid-cols-3" : "grid-cols-1")
              )}>
                <TabsTrigger value="propuesta" className="rounded-lg font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-primary shadow-sm"><BookOpen className="h-4 w-4" /> Propuesta V03</TabsTrigger>
                {canViewThesis && <TabsTrigger value="thesis" className="rounded-lg font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-primary shadow-sm"><GraduationCap className="h-4 w-4" /> Tesis APA V1</TabsTrigger>}
                {canViewThesis && <TabsTrigger value="articulo" className="rounded-lg font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-rose-600 shadow-sm"><FileCode className="h-4 w-4" /> Artículo Cient.</TabsTrigger>}
                {isAdvisor && (
                  <>
                    <TabsTrigger value="audit" className="rounded-lg font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-primary shadow-sm"><ShieldCheck className="h-4 w-4" /> Auditoría</TabsTrigger>
                    <TabsTrigger value="feedback" className="rounded-lg font-bold uppercase text-[10px] tracking-widest flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-primary shadow-sm"><MessageSquare className="h-4 w-4" /> Foro</TabsTrigger>
                  </>
                )}
              </TabsList>

              {/* TAB 1: PROPUESTA V03 */}
              <TabsContent value="propuesta" className="mt-8 space-y-8 focus-visible:ring-0">
                <Card className="border-none shadow-sm rounded-xl overflow-hidden bg-white">
                  <CardHeader className="bg-primary text-white p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full w-fit">
                          <Bookmark className="h-3 w-3 text-accent" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-accent">Fase 1: Identificación Institucional</span>
                        </div>
                        <CardTitle className="text-lg font-bold uppercase tracking-tight">Datos del Formato V03</CardTitle>
                      </div>
                      {isAdvisor && (
                        <AIRefinementModal 
                          title={project.title} 
                          description={project.problemStatement || ""} 
                          objectives={project.generalObjective || ""} 
                        />
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    {/* Bloque 1: Facultad, Programa, Curso */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      <div className="md:col-span-5 space-y-1.5 p-4 bg-slate-50 rounded-xl border">
                        <Label className="text-[10px] font-black uppercase text-primary/60">Facultad</Label>
                        <p className="text-sm font-bold text-slate-900 uppercase">{project.facultad}</p>
                      </div>
                      <div className="md:col-span-5 space-y-1.5 p-4 bg-slate-50 rounded-xl border">
                        <Label className="text-[10px] font-black uppercase text-primary/60">Programa</Label>
                        <p className="text-sm font-bold text-slate-900 uppercase">{project.programa}</p>
                      </div>
                      <div className="md:col-span-2 space-y-1.5 p-4 bg-slate-50 rounded-xl border">
                        <Label className="text-[10px] font-black uppercase text-primary/60">Curso</Label>
                        <p className="text-sm font-bold text-slate-900 uppercase">{project.curso}</p>
                      </div>
                    </div>

                    {/* Bloque 2: Líneas */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      <div className="space-y-1.5 p-4 bg-slate-50 rounded-xl border">
                        <Label className="text-[10px] font-black uppercase text-primary/60">Grupo de Investigación</Label>
                        <p className="text-sm font-bold text-slate-900">{project.researchGroup || "N/A"}</p>
                      </div>
                      <div className="space-y-1.5 p-4 bg-slate-50 rounded-xl border">
                        <Label className="text-[10px] font-black uppercase text-primary/60">Línea de Investigación</Label>
                        <p className="text-sm font-bold text-slate-900">{project.researchLine}</p>
                      </div>
                      <div className="space-y-1.5 p-4 bg-slate-50 rounded-xl border">
                        <Label className="text-[10px] font-black uppercase text-primary/60">Sublínea</Label>
                        <p className="text-sm font-bold text-slate-900">{project.researchSubLine}</p>
                      </div>
                    </div>

                    {/* Bloque 3: Proponentes Comparativos */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2">
                          <User className="h-3 w-3" /> Nombre Completo Proponente 1
                        </Label>
                        <div className="p-5 bg-slate-50 rounded-2xl border space-y-3">
                          <p className="text-sm font-black text-slate-800 uppercase">{project.proponent1Name}</p>
                          <div className="grid grid-cols-1 gap-2 border-t pt-3">
                             <div className="flex items-center gap-2 text-xs text-slate-600">
                               <IdCard className="h-3 w-3 text-primary/50" />
                               <span className="font-bold">C.C:</span> {project.proponent1Id}
                             </div>
                             <div className="flex items-center gap-2 text-xs text-slate-600">
                               <Mail className="h-3 w-3 text-primary/50" />
                               <span className="font-bold">Correo:</span> {project.proponent1Email}
                             </div>
                             <div className="flex items-center gap-2 text-xs text-slate-600">
                               <Phone className="h-3 w-3 text-primary/50" />
                               <span className="font-bold">Celular:</span> {project.proponent1Phone}
                             </div>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <Label className="text-[10px] font-black uppercase text-primary flex items-center gap-2">
                          <User className="h-3 w-3" /> Nombre Completo Proponente 2
                        </Label>
                        <div className="p-5 bg-slate-50 rounded-2xl border space-y-3">
                          <p className="text-sm font-black text-slate-800 uppercase">{project.proponent2Name || "N/A"}</p>
                          <div className="grid grid-cols-1 gap-2 border-t pt-3">
                             <div className="flex items-center gap-2 text-xs text-slate-600">
                               <IdCard className="h-3 w-3 text-primary/50" />
                               <span className="font-bold">C.C:</span> {project.proponent2Id || "N/A"}
                             </div>
                             <div className="flex items-center gap-2 text-xs text-slate-600">
                               <Mail className="h-3 w-3 text-primary/50" />
                               <span className="font-bold">Correo:</span> {project.proponent2Email || "N/A"}
                             </div>
                             <div className="flex items-center gap-2 text-xs text-slate-600">
                               <Phone className="h-3 w-3 text-primary/50" />
                               <span className="font-bold">Celular:</span> {project.proponent2Phone || "N/A"}
                             </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bloque 4: Dirección */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 p-4 bg-slate-50 rounded-xl border">
                        <Label className="text-[10px] font-black uppercase text-primary/60">Nombre Completo Director Propuesto</Label>
                        <p className="text-sm font-bold text-slate-900">{project.proposedDirectorName}</p>
                      </div>
                      <div className="space-y-1.5 p-4 bg-slate-50 rounded-xl border flex items-center justify-center">
                        <div className="text-center">
                          <Label className="text-[10px] font-black uppercase text-primary/60 block mb-2">Firma Director Propuesto</Label>
                          <div className="h-10 w-40 border-b-2 border-slate-300 italic text-slate-400 text-xs flex items-end justify-center">
                            {project.directorSignature ? project.directorSignature : "Espacio de firma"}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Bloque 4.1: Evaluadores */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 p-4 bg-slate-50 rounded-xl border">
                        <Label className="text-[10px] font-black uppercase text-primary/60">Evaluador 1</Label>
                        <p className="text-sm font-bold text-slate-900">{project.evaluator1Name || "No asignado"}</p>
                      </div>
                      <div className="space-y-1.5 p-4 bg-slate-50 rounded-xl border">
                        <Label className="text-[10px] font-black uppercase text-primary/60">Evaluador 2</Label>
                        <p className="text-sm font-bold text-slate-900">{project.evaluator2Name || "No asignado"}</p>
                      </div>
                    </div>

                    {/* Bloque 5: Fecha de Entrega */}
                    <div className="p-4 bg-slate-900 text-white rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                      <Label className="text-[10px] font-black uppercase tracking-[0.2em]">Fecha Comité de Investigación Formativa - COIF</Label>
                      <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-white/50 uppercase">Día:</span>
                          <span className="bg-white/10 px-3 py-1 rounded font-black text-sm">{project.deliveryDay || "--"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-white/50 uppercase">Mes:</span>
                          <span className="bg-white/10 px-3 py-1 rounded font-black text-sm">{project.deliveryMonth || "--"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-bold text-white/50 uppercase">Año:</span>
                          <span className="bg-white/10 px-3 py-1 rounded font-black text-sm">{project.deliveryYear || "--"}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* TÍTULO PRELIMINAR */}
                <Card className="border-none shadow-sm rounded-xl bg-primary text-white overflow-hidden">
                  <CardHeader className="p-6 border-b border-white/10">
                    <CardTitle className="text-xs font-black uppercase flex items-center gap-3">
                      <FileText className="h-4 w-4 text-accent" /> Título Preliminar de la Propuesta
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8">
                    <h2 className="text-xl font-black leading-tight uppercase tracking-tight">
                      {project.title}
                    </h2>
                    <InlineSectionFeedback
                      sectionKey="title"
                      sectionTitle="Título del Proyecto"
                      existingCorrection={project.sectionCorrections?.title}
                      onSaveCorrection={handleSaveSingleCorrection}
                      onRemoveCorrection={handleRemoveSingleCorrection}
                      isAdvisor={isAdvisor}
                    />
                  </CardContent>
                </Card>

                {/* PLANTEAMIENTO DEL PROBLEMA */}
                <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden">
                  <CardHeader className="p-6 border-b bg-slate-50">
                    <CardTitle className="text-xs font-black uppercase text-primary flex items-center gap-3">
                      <ClipboardCheck className="h-4 w-4" /> 2. Planteamiento del Problema
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    <div className="space-y-3">
                      <Label className="text-[9px] font-black uppercase text-slate-400 block">2.1 Descripción del Problema</Label>
                      <div className="bg-slate-50 p-6 rounded-xl border italic text-sm text-slate-700 leading-relaxed">
                        {project.problemStatement}
                      </div>
                      <InlineSectionFeedback
                        sectionKey="problemStatement"
                        sectionTitle="2.1 Descripción del Problema"
                        existingCorrection={project.sectionCorrections?.problemStatement}
                        onSaveCorrection={handleSaveSingleCorrection}
                        onRemoveCorrection={handleRemoveSingleCorrection}
                        isAdvisor={isAdvisor}
                      />
                    </div>
                    <div className="bg-primary/5 p-6 rounded-xl border-l-4 border-primary">
                      <Label className="text-[9px] font-black uppercase text-primary mb-2 block">2.2 Formulación del Problema (Pregunta)</Label>
                      <p className="text-lg font-bold text-primary leading-tight">"{project.problemFormulation}"</p>
                      <InlineSectionFeedback
                        sectionKey="problemFormulation"
                        sectionTitle="2.2 Formulación del Problema"
                        existingCorrection={project.sectionCorrections?.problemFormulation}
                        onSaveCorrection={handleSaveSingleCorrection}
                        onRemoveCorrection={handleRemoveSingleCorrection}
                        isAdvisor={isAdvisor}
                      />
                    </div>
                    <div className="text-sm leading-relaxed text-slate-600 px-2">
                      <Label className="text-[9px] font-black uppercase text-slate-400 mb-2 block">2.3 Justificación</Label>
                      <p className="whitespace-pre-wrap">{project.justification}</p>
                      <InlineSectionFeedback
                        sectionKey="justification"
                        sectionTitle="2.3 Justificación"
                        existingCorrection={project.sectionCorrections?.justification}
                        onSaveCorrection={handleSaveSingleCorrection}
                        onRemoveCorrection={handleRemoveSingleCorrection}
                        isAdvisor={isAdvisor}
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* OBJETIVOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-none shadow-sm rounded-xl bg-white p-6 space-y-4">
                    <Label className="text-[10px] font-black uppercase text-primary">3.1 Objetivo General</Label>
                    <p className="text-md font-bold text-slate-800 leading-relaxed">{project.generalObjective}</p>
                    <InlineSectionFeedback
                      sectionKey="generalObjective"
                      sectionTitle="3.1 Objetivo General"
                      existingCorrection={project.sectionCorrections?.generalObjective}
                      onSaveCorrection={handleSaveSingleCorrection}
                      onRemoveCorrection={handleRemoveSingleCorrection}
                      isAdvisor={isAdvisor}
                    />
                  </Card>
                  <Card className="border-none shadow-sm rounded-xl bg-white p-6 space-y-4">
                    <Label className="text-[10px] font-black uppercase text-accent">3.2 Objetivos Específicos</Label>
                    <div className="text-sm font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">{project.specificObjectives}</div>
                    <InlineSectionFeedback
                      sectionKey="specificObjectives"
                      sectionTitle="3.2 Objetivos Específicos"
                      existingCorrection={project.sectionCorrections?.specificObjectives}
                      onSaveCorrection={handleSaveSingleCorrection}
                      onRemoveCorrection={handleRemoveSingleCorrection}
                      isAdvisor={isAdvisor}
                    />
                  </Card>
                </div>

                {/* METODOLOGÍA Y RESULTADOS SEPARADOS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-none shadow-sm rounded-xl bg-white p-6 space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-500 block mb-2">4.1 Diseño Metodológico</Label>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{project.methodology}</p>
                    <InlineSectionFeedback
                      sectionKey="methodology"
                      sectionTitle="4.1 Diseño Metodológico"
                      existingCorrection={project.sectionCorrections?.methodology}
                      onSaveCorrection={handleSaveSingleCorrection}
                      onRemoveCorrection={handleRemoveSingleCorrection}
                      isAdvisor={isAdvisor}
                    />
                  </Card>

                  <Card className="border-none shadow-sm rounded-xl bg-white p-6 space-y-3">
                    <Label className="text-[10px] font-black uppercase text-slate-500 block mb-2">4.2 Resultados Esperados e Impacto</Label>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{project.expectedResults}</p>
                    <InlineSectionFeedback
                      sectionKey="expectedResults"
                      sectionTitle="4.2 Resultados e Impacto"
                      existingCorrection={project.sectionCorrections?.expectedResults}
                      onSaveCorrection={handleSaveSingleCorrection}
                      onRemoveCorrection={handleRemoveSingleCorrection}
                      isAdvisor={isAdvisor}
                    />
                  </Card>
                </div>

                {/* BIBLIOGRAFÍA */}
                <Card className="border-none shadow-sm rounded-xl bg-slate-50 p-6 space-y-4">
                  <Label className="text-[10px] font-black uppercase text-slate-400">5. Referencias Bibliográficas</Label>
                  <div className="text-xs font-mono text-slate-600 whitespace-pre-wrap leading-relaxed">
                    {project.bibliography || "No se han registrado referencias."}
                  </div>
                  <InlineSectionFeedback
                    sectionKey="bibliography"
                    sectionTitle="5. Referencias Bibliográficas"
                    existingCorrection={project.sectionCorrections?.bibliography}
                    onSaveCorrection={handleSaveSingleCorrection}
                    onRemoveCorrection={handleRemoveSingleCorrection}
                    isAdvisor={isAdvisor}
                  />
                </Card>
              </TabsContent>

              {/* TAB 2: TESIS FINAL (APA V1) */}
              {canViewThesis && (
                <TabsContent value="thesis" className="mt-8 space-y-12 pb-20">
                  <div className="bg-slate-900 p-10 rounded-[2rem] text-white shadow-lg relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10 opacity-30" />
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
                      <div className="flex items-center gap-6">
                        <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
                          <GraduationCap className="h-10 w-10 text-accent" />
                        </div>
                        <div>
                          <h2 className="text-2xl font-black uppercase tracking-tight">Fase de Tesis</h2>
                          <p className="text-[10px] text-accent font-black uppercase tracking-widest mt-1">Plantilla Proyecto de Grado - APA V1</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {canEditThesis && (
                          <Button onClick={handleSaveThesis} disabled={isSavingThesis} className="bg-accent text-white rounded-full gap-3 px-6 h-12 font-black text-xs uppercase shadow-lg hover:scale-105 transition-all">
                            {isSavingThesis ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
                            {t('saveThesis')}
                          </Button>
                        )}
                        <Button 
                          onClick={() => handlePrint('thesis')}
                          className="bg-white text-primary hover:bg-slate-100 rounded-full gap-3 px-6 h-12 font-black text-xs uppercase shadow-lg border-2 border-primary/20"
                        >
                          <Printer className="h-5 w-5" />
                          Imprimir Tesis
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* PORTADA VISUAL */}
                  <Card className="border-none shadow-xl rounded-2xl bg-white p-16 flex flex-col items-center text-center space-y-12 border-t-8 border-primary">
                     <div className="space-y-4">
                        <p className="font-black uppercase text-xs tracking-widest text-primary">Escuela Naval de Suboficiales ARC "Barranquilla"</p>
                        <p className="text-sm font-bold text-slate-600 uppercase">{project.programa}</p>
                        <p className="text-xs font-medium text-slate-400">Contingente No. {project.curso}</p>
                     </div>
                     
                     <div className="w-40 h-40 py-4">
                        <ENSUBLogo />
                     </div>
                     
                     <div className="py-8 space-y-2">
                        <Label className="text-[10px] font-black uppercase text-accent mb-4 block">Título del trabajo presentado</Label>
                        <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900 max-w-2xl leading-tight">
                          {thesisForm.thesisTitle || project.title}
                        </h2>
                     </div>
                     
                     <div className="space-y-6">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase text-slate-400">Autor 1</p>
                          <p className="font-black uppercase text-md text-primary">{project.proponent1Name}</p>
                        </div>
                        {project.proponent2Name && (
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-slate-400">Autor 2</p>
                            <p className="font-black uppercase text-md text-primary">{project.proponent2Name}</p>
                          </div>
                        )}
                     </div>
                     
                     <div className="pt-16 space-y-2">
                        <p className="text-sm font-black uppercase tracking-wider text-slate-800">Barranquilla, Colombia</p>
                        <p className="text-sm font-bold text-slate-500">{project.deliveryYear}</p>
                     </div>
                  </Card>

                  {/* PRELIMINARES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-none shadow-sm rounded-xl bg-white p-6 space-y-4 border-l-4 border-slate-200">
                      <Label className="text-[10px] font-black uppercase text-slate-500">Dedicatoria</Label>
                      <Textarea 
                        disabled={!canEditThesis}
                        value={thesisForm.thesisDedication}
                        onChange={(e) => setThesisForm(prev => ({ ...prev, thesisDedication: e.target.value }))}
                        className="min-h-[150px] bg-slate-50/50 border-none italic"
                        placeholder="Escribe tu dedicatoria..."
                      />
                    </Card>
                    <Card className="border-none shadow-sm rounded-xl bg-white p-6 space-y-4 border-l-4 border-slate-200">
                      <Label className="text-[10px] font-black uppercase text-slate-500">Agradecimientos</Label>
                      <Textarea 
                        disabled={!canEditThesis}
                        value={thesisForm.thesisAcknowledgments}
                        onChange={(e) => setThesisForm(prev => ({ ...prev, thesisAcknowledgments: e.target.value }))}
                        className="min-h-[150px] bg-slate-50/50 border-none"
                        placeholder="Escribe tus agradecimientos..."
                      />
                    </Card>
                  </div>

                  {/* RESÚMENES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-none shadow-sm rounded-xl bg-white p-6 space-y-4 border-l-4 border-primary">
                      <div className="flex items-center gap-2">
                        <BookMarked className="h-4 w-4 text-primary" />
                        <Label className="text-[10px] font-black uppercase text-primary">Resumen (Español)</Label>
                      </div>
                      <Textarea 
                        disabled={!canEditThesis}
                        value={thesisForm.thesisAbstract}
                        onChange={(e) => setThesisForm(prev => ({ ...prev, thesisAbstract: e.target.value }))}
                        className="min-h-[200px] bg-slate-50/50 border-none text-sm"
                        placeholder="Resumen ejecutivo de la investigación..."
                      />
                    </Card>
                    <Card className="border-none shadow-sm rounded-xl bg-white p-6 space-y-4 border-l-4 border-accent">
                      <div className="flex items-center gap-2">
                        <Languages className="h-4 w-4 text-accent" />
                        <Label className="text-[10px] font-black uppercase text-accent">Abstract (English)</Label>
                      </div>
                      <Textarea 
                        disabled={!canEditThesis}
                        value={thesisForm.thesisAbstractEnglish}
                        onChange={(e) => setThesisForm(prev => ({ ...prev, thesisAbstractEnglish: e.target.value }))}
                        className="min-h-[200px] bg-slate-50/50 border-none text-sm"
                        placeholder="English version of the abstract..."
                      />
                    </Card>
                  </div>

                  {/* CAPÍTULO 1: INTRODUCCIÓN */}
                  <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden border-l-4 border-primary">
                    <CardHeader className="bg-slate-50 p-6 border-b flex flex-row items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <CardTitle className="text-xs font-black uppercase text-slate-500">Capítulo 1: Introducción</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8">
                      <Textarea 
                        disabled={!canEditThesis}
                        value={thesisForm.thesisIntroduction}
                        onChange={(e) => setThesisForm(prev => ({ ...prev, thesisIntroduction: e.target.value }))}
                        className="min-h-[300px] bg-slate-50/50 border-none p-6 text-sm leading-relaxed"
                        placeholder="Redacta la introducción siguiendo normas APA..."
                      />
                    </CardContent>
                  </Card>

                  {/* CAPÍTULO 2: MARCO REFERENCIAL */}
                  <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden border-l-4 border-accent">
                    <CardHeader className="bg-slate-50 p-6 border-b flex flex-row items-center gap-3">
                      <Globe className="h-5 w-5 text-accent" />
                      <CardTitle className="text-xs font-black uppercase text-slate-500">Capítulo 2: Marco Referencial</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                      <div className="grid gap-4">
                        <Label className="text-[10px] font-black uppercase text-accent">2.1 Antecedentes</Label>
                        <Textarea 
                          disabled={!canEditThesis}
                          value={thesisForm.thesisBackground}
                          onChange={(e) => setThesisForm(prev => ({ ...prev, thesisBackground: e.target.value }))}
                          className="min-h-[150px] bg-slate-50/50 border-none p-6 text-sm"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="grid gap-4">
                          <Label className="text-[10px] font-black uppercase text-accent">2.2 Marco Teórico</Label>
                          <Textarea 
                            disabled={!canEditThesis}
                            value={thesisForm.thesisTheoreticalFramework}
                            onChange={(e) => setThesisForm(prev => ({ ...prev, thesisTheoreticalFramework: e.target.value }))}
                            className="min-h-[200px] bg-slate-50/50 border-none p-6 text-sm"
                          />
                        </div>
                        <div className="grid gap-4">
                          <Label className="text-[10px] font-black uppercase text-accent">2.3 Marco Conceptual</Label>
                          <Textarea 
                            disabled={!canEditThesis}
                            value={thesisForm.thesisConceptualFramework}
                            onChange={(e) => setThesisForm(prev => ({ ...prev, thesisConceptualFramework: e.target.value }))}
                            className="min-h-[200px] bg-slate-50/50 border-none p-6 text-sm"
                          />
                        </div>
                        <div className="grid gap-4">
                          <Label className="text-[10px] font-black uppercase text-accent">2.4 Marco Legal</Label>
                          <Textarea 
                            disabled={!canEditThesis}
                            value={thesisForm.thesisLegalFramework}
                            onChange={(e) => setThesisForm(prev => ({ ...prev, thesisLegalFramework: e.target.value }))}
                            className="min-h-[200px] bg-slate-50/50 border-none p-6 text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* CAPÍTULO 3: DISEÑO METODOLÓGICO */}
                  <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden border-l-4 border-slate-900">
                    <CardHeader className="bg-slate-900 p-6 border-b flex flex-row items-center gap-3">
                      <IdCard className="h-5 w-5 text-white" />
                      <CardTitle className="text-xs font-black uppercase text-white/70">Capítulo 3: Diseño Metodológico</CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 space-y-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="grid gap-4">
                          <Label className="text-[10px] font-black uppercase text-slate-500">3.1 Tipo de Investigación</Label>
                          <Textarea 
                            disabled={!canEditThesis}
                            value={thesisForm.thesisMethodologyDesign}
                            onChange={(e) => setThesisForm(prev => ({ ...prev, thesisMethodologyDesign: e.target.value }))}
                            className="min-h-[120px] bg-slate-50/50 border-none p-6 text-sm"
                          />
                        </div>
                        <div className="grid gap-4">
                          <Label className="text-[10px] font-black uppercase text-slate-500">3.2 Población y Muestra</Label>
                          <Textarea 
                            disabled={!canEditThesis}
                            value={thesisForm.thesisMethodologyPopulation}
                            onChange={(e) => setThesisForm(prev => ({ ...prev, thesisMethodologyPopulation: e.target.value }))}
                            className="min-h-[120px] bg-slate-50/50 border-none p-6 text-sm"
                          />
                        </div>
                        <div className="grid gap-4">
                          <Label className="text-[10px] font-black uppercase text-slate-500">3.3 Muestra</Label>
                          <Textarea 
                            disabled={!canEditThesis}
                            value={thesisForm.thesisMethodologySample}
                            onChange={(e) => setThesisForm(prev => ({ ...prev, thesisMethodologySample: e.target.value }))}
                            className="min-h-[120px] bg-slate-50/50 border-none p-6 text-sm"
                          />
                        </div>
                        <div className="grid gap-4">
                          <Label className="text-[10px] font-black uppercase text-slate-500">3.4 Instrumentos</Label>
                          <Textarea 
                            disabled={!canEditThesis}
                            value={thesisForm.thesisMethodologyInstruments}
                            onChange={(e) => setThesisForm(prev => ({ ...prev, thesisMethodologyInstruments: e.target.value }))}
                            className="min-h-[120px] bg-slate-50/50 border-none p-6 text-sm"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* RESULTADOS Y DISCUSIÓN */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-none shadow-sm rounded-xl bg-white border-t-4 border-primary p-6 space-y-4">
                      <Label className="text-[10px] font-black uppercase text-primary">Capítulo 4: Resultados</Label>
                      <Textarea 
                        disabled={!canEditThesis}
                        value={thesisForm.thesisResults}
                        onChange={(e) => setThesisForm(prev => ({ ...prev, thesisResults: e.target.value }))}
                        className="min-h-[250px] border-none bg-slate-50/50 p-6 text-sm"
                      />
                    </Card>
                    <Card className="border-none shadow-sm rounded-xl bg-white border-t-4 border-accent p-6 space-y-4">
                      <Label className="text-[10px] font-black uppercase text-accent">Capítulo 5: Discusión</Label>
                      <Textarea 
                        disabled={!canEditThesis}
                        value={thesisForm.thesisDiscussion}
                        onChange={(e) => setThesisForm(prev => ({ ...prev, thesisDiscussion: e.target.value }))}
                        className="min-h-[250px] border-none bg-slate-50/50 p-6 text-sm"
                      />
                    </Card>
                  </div>

                  {/* CONCLUSIONES Y RECOMENDACIONES */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="border-none shadow-sm rounded-xl bg-white border-t-4 border-emerald-500 p-6 space-y-4">
                      <Label className="text-[10px] font-black uppercase text-emerald-600">Conclusiones</Label>
                      <Textarea 
                        disabled={!canEditThesis}
                        value={thesisForm.thesisConclusions}
                        onChange={(e) => setThesisForm(prev => ({ ...prev, thesisConclusions: e.target.value }))}
                        className="min-h-[200px] bg-slate-50/50 border-none p-6 text-sm"
                      />
                    </Card>
                    <Card className="border-none shadow-sm rounded-xl bg-white border-t-4 border-amber-500 p-6 space-y-4">
                      <Label className="text-[10px] font-black uppercase text-amber-600">Recomendaciones</Label>
                      <Textarea 
                        disabled={!canEditThesis}
                        value={thesisForm.thesisRecommendations}
                        onChange={(e) => setThesisForm(prev => ({ ...prev, thesisRecommendations: e.target.value }))}
                        className="min-h-[200px] bg-slate-50/50 border-none p-6 text-sm"
                      />
                    </Card>
                  </div>

                  {/* FINALIZACIÓN */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="p-6 rounded-xl border-dashed border-2 bg-white">
                      <Label className="text-[10px] font-black uppercase text-slate-400 mb-4 block">Referencias Bibliográficas (APA)</Label>
                      <Textarea 
                        disabled={!canEditThesis}
                        value={thesisForm.thesisReferences}
                        onChange={(e) => setThesisForm(prev => ({ ...prev, thesisReferences: e.target.value }))}
                        className="min-h-[150px] bg-slate-50 text-xs border-none"
                        placeholder="Lista de referencias en formato APA..."
                      />
                    </Card>
                    <Card className="p-6 rounded-xl border-dashed border-2 bg-white">
                      <Label className="text-[10px] font-black uppercase text-slate-400 mb-4 block">Anexos y Apéndices</Label>
                      <Textarea 
                        disabled={!canEditThesis}
                        value={thesisForm.thesisAnnexes}
                        onChange={(e) => setThesisForm(prev => ({ ...prev, thesisAnnexes: e.target.value }))}
                        className="min-h-[150px] bg-slate-50 text-xs border-none"
                      />
                    </Card>
                  </div>
                </TabsContent>
              )}

              {/* TAB ARTÍCULO CIENTÍFICO */}
              {canViewThesis && (
                <TabsContent value="articulo" className="mt-8 focus-visible:ring-0">
                  <ArticuloCientifico
                    project={project}
                    canEdit={canEditThesis}
                    onSave={handleSaveArticle}
                    isSaving={isSavingArticle}
                  />
                </TabsContent>
              )}

              {/* TAB 3: AUDITORÍA */}
              {isAdvisor && (
                <TabsContent value="audit" className="mt-8">
                  <Card className="border-none shadow-sm rounded-xl bg-white overflow-hidden">
                    <CardHeader className="p-6 bg-slate-50 border-b flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      <CardTitle className="text-md uppercase font-black text-primary flex items-center gap-2">
                        <History className="h-4 w-4" />
                        {auditViewMode === 'list' ? t('auditHistory') : t('viewStats')}
                      </CardTitle>
                      
                      {/* Control de Vista (Toggle) */}
                      {logs && logs.length > 0 && (
                        <div className="flex bg-slate-200/60 p-1 rounded-full border shadow-inner w-fit">
                          <button
                            onClick={() => setAuditViewMode('list')}
                            className={cn(
                              "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all",
                              auditViewMode === 'list'
                                ? "bg-white text-primary shadow-sm"
                                : "text-slate-500 hover:text-slate-900"
                            )}
                          >
                            <List className="h-3 w-3" /> {t('viewHistory')}
                          </button>
                          <button
                            onClick={() => setAuditViewMode('stats')}
                            className={cn(
                              "flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-wider transition-all",
                              auditViewMode === 'stats'
                                ? "bg-white text-primary shadow-sm"
                                : "text-slate-500 hover:text-slate-900"
                            )}
                          >
                            <BarChart3 className="h-3 w-3" /> {t('viewStats')}
                          </button>
                        </div>
                      )}
                    </CardHeader>
                    
                    <CardContent className="p-6">
                      {logs?.length === 0 ? (
                        <div className="py-20 text-center opacity-30 flex flex-col items-center gap-4">
                          <History className="h-12 w-12" />
                          <p className="font-bold uppercase text-[10px]">Sin actividad registrada</p>
                        </div>
                      ) : auditViewMode === 'list' ? (
                        /* VISTA 1: HISTORIAL DE ACTIVIDAD (LISTA) */
                        <div className="space-y-4">
                          {logs?.map((log) => (
                            <div key={log.id} className="flex items-start gap-4 p-4 border rounded-xl hover:bg-slate-50 transition-colors">
                              <div className="p-2 bg-primary/10 rounded-lg">
                                <History className="h-4 w-4 text-primary" />
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start gap-2">
                                  <p className="text-[9px] font-black uppercase text-primary tracking-tight">
                                    {log.actionType}
                                  </p>
                                  <span className="text-[8px] font-bold text-slate-400 shrink-0">
                                    {new Date(log.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="text-xs mt-1 text-slate-700 leading-relaxed font-medium">
                                  {log.details}
                                </p>
                                <div className="flex items-center gap-1.5 mt-2">
                                  <User className="h-3 w-3 text-slate-400" />
                                  <span className="text-[8px] font-black text-slate-400 uppercase">
                                    {log.actorName}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        /* VISTA 2: ESTADÍSTICAS Y TRAZABILIDAD */
                        auditStats && (
                          <div className="space-y-8">
                            {/* Grid de KPIs */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              <Card className="border p-4 bg-slate-50/50 rounded-2xl flex flex-col justify-between shadow-sm">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                                      {t('totalCycleTime')}
                                    </p>
                                    <h4 className="text-xl font-black text-slate-800 mt-1 tracking-tight">
                                      {auditStats.cycleTimeText}
                                    </h4>
                                  </div>
                                  <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                                    <Clock className="h-4 w-4" />
                                  </div>
                                </div>
                                <p className="text-[8px] font-bold text-slate-400 mt-2 uppercase">
                                  Desde el primer borrador registrado
                                </p>
                              </Card>

                              <Card className="border p-4 bg-slate-50/50 rounded-2xl flex flex-col justify-between shadow-sm">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                                      {t('correctionsCount')}
                                    </p>
                                    <h4 className="text-xl font-black text-slate-800 mt-1 tracking-tight">
                                      {auditStats.correctionsCount} {auditStats.correctionsCount === 1 ? 'solicitud' : 'solicitudes'}
                                    </h4>
                                  </div>
                                  <div className="p-2 bg-orange-50 text-orange-600 rounded-xl">
                                    <RotateCcw className="h-4 w-4" />
                                  </div>
                                </div>
                                <p className="text-[8px] font-bold text-slate-400 mt-2 uppercase">
                                  Ciclos de observación académica
                                </p>
                              </Card>

                              <Card className="border p-4 bg-slate-50/50 rounded-2xl flex flex-col justify-between shadow-sm">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                                      Acciones Registradas
                                    </p>
                                    <h4 className="text-xl font-black text-slate-800 mt-1 tracking-tight">
                                      {logs?.length || 0}
                                    </h4>
                                  </div>
                                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                                    <Activity className="h-4 w-4" />
                                  </div>
                                </div>
                                <p className="text-[8px] font-bold text-slate-400 mt-2 uppercase">
                                  Eventos auditados en bitácora
                                </p>
                              </Card>

                              <Card className="border p-4 bg-slate-50/50 rounded-2xl flex flex-col justify-between shadow-sm">
                                <div className="flex justify-between items-start">
                                  <div>
                                    <p className="text-[8px] font-black uppercase text-slate-400 tracking-wider">
                                      {t('auditScore')}
                                    </p>
                                    <h4 className="text-xl font-black text-slate-800 mt-1 tracking-tight">
                                      {auditStats.auditScoreValue}%
                                    </h4>
                                  </div>
                                  <div className={cn(
                                    "p-2 rounded-xl",
                                    auditStats.auditScoreValue >= 80 ? "bg-emerald-50 text-emerald-600" : (auditStats.auditScoreValue >= 50 ? "bg-amber-50 text-amber-600" : "bg-red-50 text-red-600")
                                  )}>
                                    {auditStats.auditScoreValue >= 80 ? <Award className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                                  </div>
                                </div>
                                <div className="mt-2">
                                  <Progress 
                                    value={auditStats.auditScoreValue} 
                                    className="h-1.5"
                                  />
                                </div>
                              </Card>
                            </div>

                            {/* Flujo de Trazabilidad */}
                            <div className="border rounded-2xl p-6 bg-slate-50/30 space-y-6 shadow-sm">
                              <div>
                                <h3 className="text-xs font-black uppercase text-primary tracking-widest flex items-center gap-2">
                                  <TrendingUp className="h-4 w-4" /> Trazabilidad Cronológica del Proyecto
                                </h3>
                                <p className="text-[10px] text-muted-foreground font-medium mt-1">
                                  Flujo evolutivo de los cambios de estado y el tiempo promedio de retención de la propuesta.
                                </p>
                              </div>

                              <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200/70 before:my-3">
                                {auditStats.traceabilityFlow.map((flow, index) => (
                                  <div key={flow.id} className="flex gap-4 relative">
                                    <div className={cn(
                                      "w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-md z-10 shrink-0 text-white font-black text-[10px]",
                                      index === auditStats.traceabilityFlow.length - 1 ? "bg-primary animate-pulse" : "bg-slate-400"
                                    )}>
                                      {index + 1}
                                    </div>
                                    <div className="flex-1 bg-white border rounded-2xl p-4 sm:p-5 hover:bg-slate-50/50 transition-colors shadow-sm">
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b pb-2 mb-3">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-black uppercase text-slate-800 tracking-tight">
                                            {flow.stateName}
                                          </span>
                                          <div className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                                          <span className="text-[9px] font-black text-slate-400 uppercase flex items-center gap-1">
                                            <User className="h-2.5 w-2.5" /> {flow.actorName}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-bold">
                                          <Calendar className="h-3 w-3 text-slate-300" />
                                          <span>{new Date(flow.createdAt).toLocaleString()}</span>
                                        </div>
                                      </div>
                                      <p className="text-xs text-slate-600 font-medium leading-relaxed">
                                        {flow.details}
                                      </p>
                                      {index < auditStats.traceabilityFlow.length - 1 && flow.timeSpentMs > 0 && (
                                        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-dashed w-fit text-[9px] font-black uppercase text-accent tracking-widest bg-accent/5 px-2.5 py-1 rounded-md">
                                          <Clock className="h-3 w-3 text-accent" />
                                          <span>{t('timeSpent')}: {flow.timeSpentText}</span>
                                        </div>
                                      )}
                                      {index === auditStats.traceabilityFlow.length - 1 && (
                                        <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-dashed w-fit text-[9px] font-black uppercase text-emerald-600 tracking-widest bg-emerald-50 px-2.5 py-1 rounded-md">
                                          <Clock className="h-3 w-3 text-emerald-600" />
                                          <span>Fase Activa: Hace {flow.timeSpentText}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Fila de Gráficos Recharts */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                              {/* Participación por Actor */}
                              <Card className="border p-6 rounded-2xl bg-white shadow-sm flex flex-col justify-between">
                                <div>
                                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                                    {t('participationChart')}
                                  </h4>
                                  <p className="text-[9px] text-muted-foreground font-medium mt-0.5">
                                    Nivel de involucramiento y acciones de asesores, estudiantes y sistema.
                                  </p>
                                </div>
                                <div className="h-[220px] flex items-center justify-center mt-4">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                      <Pie
                                        data={auditStats.participationData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={4}
                                        dataKey="value"
                                      >
                                        {auditStats.participationData.map((entry, index) => (
                                          <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                      </Pie>
                                      <Tooltip 
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: 10, fontWeight: 'bold' }}
                                      />
                                    </PieChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t pt-4">
                                  {auditStats.participationData.map((actor, idx) => (
                                    <div key={idx} className="flex items-center gap-2 truncate">
                                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: actor.color }} />
                                      <span className="font-bold text-slate-700 truncate uppercase text-[9px]">{actor.name}</span>
                                      <span className="text-[8px] bg-slate-100 px-2 py-0.5 rounded-full font-black text-slate-500 shrink-0 ml-auto">{actor.value} act.</span>
                                    </div>
                                  ))}
                                </div>
                              </Card>

                              {/* Distribución de Actividad */}
                              <Card className="border p-6 rounded-2xl bg-white shadow-sm flex flex-col justify-between">
                                <div>
                                  <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider">
                                    {t('activityChart')}
                                  </h4>
                                  <p className="text-[9px] text-muted-foreground font-medium mt-0.5">
                                    Frecuencia de las acciones registradas agrupadas por módulo o tipo.
                                  </p>
                                </div>
                                <div className="h-[220px] mt-4">
                                  <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={auditStats.actionData} margin={{ left: -25, right: 10, top: 10, bottom: 0 }}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                                      <XAxis dataKey="name" tick={{ fontSize: 8, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                      <YAxis tick={{ fontSize: 8, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                      <Tooltip 
                                        cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontSize: 10, fontWeight: 'bold' }}
                                      />
                                      <Bar dataKey="total" fill="#1E6EAA" radius={[4, 4, 0, 0]}>
                                        {auditStats.actionData.map((entry, index) => (
                                          <Cell 
                                            key={`cell-${index}`} 
                                            fill={index % 2 === 0 ? '#1E6EAA' : '#33B8AD'} 
                                          />
                                        ))}
                                      </Bar>
                                    </BarChart>
                                  </ResponsiveContainer>
                                </div>
                                <div className="text-[9px] text-slate-400 font-bold border-t pt-4 text-center uppercase tracking-wide">
                                  Distribución basada en {logs?.length || 0} registros auditados
                                </div>
                              </Card>
                            </div>
                          </div>
                        )
                      )}

                      {/* Artículo Científico en Auditoría (solo lectura) */}
                      <div className="mt-8 border-t pt-8">
                        <div className="flex items-center gap-2 mb-6">
                          <FileCode className="h-5 w-5 text-rose-500" />
                          <h3 className="text-sm font-black uppercase text-rose-600 tracking-widest">Artículo Científico — Estado Actual</h3>
                          <span className="ml-auto text-[9px] font-black uppercase text-slate-400 bg-slate-100 px-3 py-1 rounded-full">Solo Lectura</span>
                        </div>
                        <ArticuloCientifico
                          project={project}
                          canEdit={false}
                          onSave={async () => {}}
                          isSaving={false}
                          auditMode={true}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              )}
            </Tabs>
          </div>

          {/* SIDEBAR: CALIDAD Y PROGRESO */}
          <div className="space-y-8 print:hidden">
            <Card className="border-none shadow-sm rounded-xl bg-slate-900 text-white overflow-hidden sticky top-28">
              <CardHeader className="bg-white/5 p-5 border-b border-white/5">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest flex items-center gap-3">
                  <CheckCircle className="h-4 w-4 text-accent" /> Calidad de Formato V03
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[400px]">
                  <div className="p-4 space-y-2">
                    {integrityCheck.map((f) => (
                      <div key={f.key} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                        <div className="flex flex-col">
                          <span className="text-[8px] font-black uppercase truncate max-w-[120px] opacity-70">{f.label}</span>
                          <span className={cn("text-[7px] font-bold uppercase mt-0.5", f.isComplete ? "text-emerald-400" : "text-red-400")}>
                            {f.isComplete ? 'Verificado' : 'Pendiente'}
                          </span>
                        </div>
                        {f.isComplete ? (
                          <div className="p-1 bg-emerald-500/20 rounded-full"><CheckCircle2 className="h-3 w-3 text-emerald-400" /></div>
                        ) : (
                          <div className="p-1 bg-red-500/20 rounded-full"><XCircle className="h-3 w-3 text-red-400" /></div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
              <CardFooter className="bg-white/5 p-6 border-t border-white/5">
                <div className="w-full space-y-3">
                  <div className="flex justify-between items-end">
                    <div className="space-y-0.5">
                      <p className="text-[7px] font-black uppercase text-accent tracking-widest">Nivel de Integridad</p>
                      <span className="text-xl font-black text-white">{Math.round((integrityCheck.filter(f => f.isComplete).length / integrityCheck.length) * 100)}%</span>
                    </div>
                    <Progress value={(integrityCheck.filter(f => f.isComplete).length / integrityCheck.length) * 100} className="h-1.5 w-24 bg-white/10" />
                  </div>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
        {/* BARRA FLOTANTE DE ACCIONES DE REVISIÓN PARA DOCENTES */}
        {isAdvisor && project.status !== 'Completado' && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-4xl animate-in slide-in-from-bottom-5 duration-300">
            <div className="bg-slate-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-700/80 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "px-3 py-1.5 rounded-xl flex items-center justify-center font-black text-xs",
                  activeCorrectionsCount > 0 
                    ? "bg-orange-500/20 text-orange-400 border border-orange-500/30" 
                    : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                )}>
                  {activeCorrectionsCount > 0 ? (
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-orange-400 animate-ping" />
                      {activeCorrectionsCount} {activeCorrectionsCount === 1 ? 'observación' : 'observaciones'}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      Sin observaciones
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-300 hidden md:block">
                  {activeCorrectionsCount > 0 ? (
                    <span>Observaciones registradas por planteamiento listas para dictaminar.</span>
                  ) : (
                    <span>Escribe observaciones directamente en cada punto o aprueba la propuesta.</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                {activeCorrectionsCount > 0 && (
                  <Button
                    size="sm"
                    onClick={() => updateStatus('Corregir', project.correcciones, project.sectionCorrections)}
                    className="rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider bg-orange-600 hover:bg-orange-700 text-white shadow-lg hover:scale-105 transition-all gap-2"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Devolver al Estudiante ({activeCorrectionsCount})
                  </Button>
                )}
                {(project.status === 'Pendiente' || project.status === 'En Revisión' || project.status === 'Corregir') && (
                  <Button
                    size="sm"
                    onClick={() => updateStatus('En Curso')}
                    className="rounded-full px-5 py-2 text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg hover:scale-105 transition-all gap-2"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Aprobar Propuesta
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        <AdvisorChatFloating projectId={id} projectTitle={project.title} studentId={project.studentId} advisorIds={project.advisorIds || []} />
      </div>

      <SectionCorrectionDialog
        open={isCorrectionDialogOpen}
        onOpenChange={setIsCorrectionDialogOpen}
        project={project}
        evaluatorName={user?.displayName || user?.email || "Docente Evaluador"}
        onSubmitCorrections={async (sectionCorrections, summary) => {
          await updateStatus('Corregir', summary, sectionCorrections);
          toast({
            title: "Correcciones Enviadas al Estudiante",
            description: "El estudiante ha recibido las observaciones planteamiento por planteamiento.",
          });
        }}
      />

      {/* VISTA DE IMPRESIÓN EXCLUSIVA */}
      <div className={cn(printTarget === 'proposal' ? "print:block" : "print:hidden", "hidden")}>
        <PrintProposalV03 project={project} />
      </div>
      <div className={cn(printTarget === 'thesis' ? "print:block" : "print:hidden", "hidden")}>
        <PrintThesisAPA project={project} />
      </div>
    </>
  );
}
