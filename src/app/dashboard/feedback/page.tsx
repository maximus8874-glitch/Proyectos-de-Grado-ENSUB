"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, getDoc, setDoc, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useLanguage } from "@/context/language-context";
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  User, 
  Search, 
  BookOpen, 
  GraduationCap, 
  Clock, 
  ChevronRight, 
  ShieldCheck 
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function FeedbackPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { t } = useLanguage();
  const scrollRef = useRef<HTMLDivElement>(null);

  const [role, setRole] = useState<'student' | 'advisor' | 'admin'>('student');
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [activeProject, setActiveProject] = useState<any>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Obtener rol del usuario
  useEffect(() => {
    if (user && db) {
      const getRole = async () => {
        const isSuperUser = user.email === "felipetorrez502@gmail.com" || user.email === "administracionmaritima@ensub.edu.co";
        if (isSuperUser) {
          setRole('admin');
          return;
        }

        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role || 'student');
          }
        } catch (error) {
          console.error("Error fetching user role:", error);
        }
      };
      getRole();
    }
  }, [user, db]);

  // Query de proyectos según rol
  const projectsQuery = useMemoFirebase(() => {
    if (!db || !user) return null;
    if (role === 'student') {
      return query(collection(db, "projects"), where("studentId", "==", user.uid));
    } else {
      // advisor o admin: ver todos los asignados o todos si es admin
      return query(collection(db, "projects"));
    }
  }, [db, user, role]);

  const { data: rawProjects, isLoading: isProjectsLoading } = useCollection<any>(projectsQuery);

  // Filtrar proyectos si es asesor
  const projects = useMemo(() => {
    if (!rawProjects) return [];
    if (role === 'advisor') {
      return rawProjects.filter(p => p.advisorIds?.includes(user?.uid) || p.directorId === user?.uid);
    }
    return rawProjects;
  }, [rawProjects, role, user]);

  // Si es estudiante y tiene proyectos, autoseleccionar el primero
  useEffect(() => {
    if (role === 'student' && projects.length > 0 && !activeProjectId) {
      setActiveProjectId(projects[0].id);
      setActiveProject(projects[0]);
    }
  }, [projects, role, activeProjectId]);

  // Cambiar proyecto activo
  const handleSelectProject = (project: any) => {
    setActiveProjectId(project.id);
    setActiveProject(project);
  };

  // Filtrar proyectos del listado lateral por búsqueda
  const filteredProjects = useMemo(() => {
    return projects.filter(p => 
      p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.proponent1Name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.programa?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [projects, searchTerm]);

  // Query de comentarios del chat del proyecto activo
  const commentsQuery = useMemoFirebase(() => {
    if (!db || !activeProjectId) return null;
    return query(
      collection(db, "projects", activeProjectId, "comments"),
      orderBy("createdAt", "asc")
    );
  }, [db, activeProjectId]);

  const { data: comments, isLoading: isCommentsLoading } = useCollection<any>(commentsQuery);

  // Hacer scroll automático al recibir comentarios
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [comments]);

  const handleSendMessage = async () => {
    if (!message.trim() || !user || !db || !activeProjectId || !activeProject) return;
    setIsSubmitting(true);

    try {
      const commentId = doc(collection(db, `projects/${activeProjectId}/comments`)).id;
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      const userData = userDoc.data();
      const authorName = `${userData?.firstName} ${userData?.lastName}`.trim() || user.displayName || user.email || "Usuario";

      await setDoc(doc(db, "projects", activeProjectId, "comments", commentId), {
        id: commentId,
        projectId: activeProjectId,
        studentId: activeProject.studentId || "",
        advisorIds: activeProject.advisorIds || [],
        authorId: user.uid,
        authorName,
        authorRole: role,
        content: message,
        targetEntityType: "Project",
        targetEntityId: activeProjectId,
        createdAt: new Date().toISOString(),
      });

      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="border-b pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline text-primary uppercase tracking-tight flex items-center gap-2.5">
            <MessageSquare className="h-7 w-7 text-[#FF6B00]" /> {t('feedback')}
          </h1>
          <p className="text-muted-foreground font-medium">
            Canal institucional de orientación académica y mentoría de proyectos de grado.
          </p>
        </div>
      </div>

      {isProjectsLoading ? (
        <div className="flex items-center justify-center h-[500px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="border-dashed border-2 py-20 text-center bg-white flex flex-col items-center gap-4">
          <MessageSquare className="h-14 w-14 text-slate-300" />
          <div className="space-y-1 max-w-sm">
            <h3 className="text-sm font-black uppercase text-slate-800 tracking-wide">Sin Asesorías Activas</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Actualmente no cuentas con propuestas aprobadas o tutorías registradas para habilitar el canal de comunicación.
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-white border shadow-sm rounded-3xl overflow-hidden min-h-[600px] h-[calc(100vh-14rem)]">
          
          {/* LISTADO LATERAL (Solo visible para asesores o admins, o para estudiantes con múltiples tesis) */}
          {(role === 'advisor' || role === 'admin' || projects.length > 1) && (
            <div className="lg:col-span-4 border-r flex flex-col bg-slate-50/50">
              <div className="p-4 border-b space-y-3 bg-white">
                <p className="text-[10px] font-black uppercase text-primary tracking-widest">Hilos de Conversación</p>
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar estudiante o título..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-100/70 border-none rounded-full py-2 pl-9 pr-4 text-xs font-medium focus:ring-primary focus:bg-white transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-2 space-y-1.5">
                  {filteredProjects.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectProject(p)}
                      className={cn(
                        "w-full text-left p-3 rounded-2xl transition-all flex items-start gap-3 hover:bg-slate-100",
                        activeProjectId === p.id 
                          ? "bg-primary text-white hover:bg-primary shadow-md" 
                          : "bg-white border border-slate-100"
                      )}
                    >
                      <div className={cn(
                        "p-2 rounded-xl shrink-0 mt-0.5",
                        activeProjectId === p.id ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                      )}>
                        <BookOpen className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-1">
                          <p className={cn(
                            "text-[8px] font-black uppercase tracking-wider",
                            activeProjectId === p.id ? "text-accent" : "text-primary"
                          )}>
                            {p.programa}
                          </p>
                        </div>
                        <h4 className="text-xs font-black truncate uppercase mt-0.5 tracking-tight leading-tight">
                          {p.title}
                        </h4>
                        <p className={cn(
                          "text-[9px] font-bold mt-1.5 flex items-center gap-1.5 uppercase",
                          activeProjectId === p.id ? "text-white/80" : "text-slate-500"
                        )}>
                          <User className="h-3 w-3 shrink-0" />
                          <span className="truncate">{p.proponent1Name}</span>
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 opacity-50 shrink-0 self-center" />
                    </button>
                  ))}
                  {filteredProjects.length === 0 && (
                    <div className="py-20 text-center opacity-30 text-[10px] font-black uppercase">
                      No se encontraron resultados
                    </div>
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* CHAT INTEGRADO */}
          <div className={cn(
            "flex flex-col bg-white",
            (role === 'advisor' || role === 'admin' || projects.length > 1) ? "lg:col-span-8" : "lg:col-span-12"
          )}>
            {activeProject ? (
              <>
                {/* Cabecera del Chat */}
                <div className="p-4 border-b flex items-center justify-between gap-4 bg-slate-50/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-primary text-white rounded-2xl shadow-sm">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xs font-black uppercase text-slate-800 tracking-tight truncate max-w-[250px] sm:max-w-[400px]">
                        {activeProject.title}
                      </h3>
                      <p className="text-[9px] text-muted-foreground font-black uppercase mt-0.5 tracking-wider flex items-center gap-1.5">
                        <span>Estudiante: {activeProject.proponent1Name}</span>
                        <span className="h-1 w-1 bg-slate-300 rounded-full" />
                        <span className="text-accent">{activeProject.programa}</span>
                      </p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 bg-white border rounded-full text-[8px] font-black text-slate-500 uppercase tracking-widest shadow-sm">
                    <ShieldCheck className="h-3 w-3 text-emerald-500" />
                    Auditoría Habilitada
                  </div>
                </div>

                {/* Mensajes */}
                <ScrollArea className="flex-1 p-6 bg-slate-50/30">
                  <div className="space-y-4">
                    {isCommentsLoading ? (
                      <div className="flex justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-primary opacity-50" />
                      </div>
                    ) : comments?.length === 0 ? (
                      <div className="text-center py-20 max-w-sm mx-auto space-y-3 opacity-40">
                        <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                        <div className="space-y-1">
                          <h4 className="text-xs font-black uppercase text-slate-800 tracking-wide">Inicio de la Asesoría</h4>
                          <p className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                            Envía tu primera duda o comentario sobre la propuesta V03. Todo el intercambio quedará registrado en bitácora.
                          </p>
                        </div>
                      </div>
                    ) : (
                      comments?.map((comment) => (
                        <div
                          key={comment.id}
                          className={cn(
                            "flex flex-col space-y-1 max-w-[75%]",
                            comment.authorId === user?.uid ? "ml-auto items-end" : "mr-auto items-start"
                          )}
                        >
                          <span className="text-[8px] font-black uppercase text-slate-400 px-1 tracking-wider">
                            {comment.authorName} • {comment.authorRole === 'student' ? 'Estudiante' : 'Asesor'}
                          </span>
                          <div className={cn(
                            "p-3.5 rounded-2xl text-xs shadow-sm font-medium leading-relaxed",
                            comment.authorId === user?.uid 
                              ? "bg-primary text-white rounded-tr-none" 
                              : "bg-white border text-slate-800 rounded-tl-none"
                          )}>
                            {comment.content}
                          </div>
                          <span className="text-[8px] text-slate-400 px-1 font-bold flex items-center gap-1.5">
                            <Clock className="h-2.5 w-2.5" />
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))
                    )}
                    <div ref={scrollRef} />
                  </div>
                </ScrollArea>

                {/* Input de Envío */}
                <div className="p-4 bg-white border-t space-y-3">
                  <Textarea
                    placeholder="Escribe tus dudas, observaciones o correcciones de la tesis..."
                    className="min-h-[80px] max-h-[150px] text-xs resize-none bg-slate-50 border-none focus-visible:ring-primary placeholder:text-slate-400 p-4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-[9px] text-slate-400 font-bold uppercase">
                      💡 Presiona Enter para enviar
                    </p>
                    <Button 
                      size="sm" 
                      onClick={handleSendMessage} 
                      disabled={isSubmitting || !message.trim()} 
                      className="rounded-full gap-2 px-6 h-10 shadow-md font-black uppercase text-[10px] tracking-wider transition-all hover:scale-[1.03]"
                    >
                      {isSubmitting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                      Enviar Mensaje
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center opacity-40">
                <MessageSquare className="h-14 w-14 mb-4 text-muted-foreground" />
                <h3 className="text-xs font-black uppercase text-slate-800 tracking-wide">Selecciona una Conversación</h3>
                <p className="text-[10px] text-muted-foreground font-medium max-w-xs mt-1">
                  Elige uno de tus estudiantes asignados en el menú lateral para iniciar la tutoría académica.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
