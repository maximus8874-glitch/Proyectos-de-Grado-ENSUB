"use client";

import { useState, useEffect, useMemo } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/context/language-context";
import { 
  Activity, 
  Search, 
  Loader2, 
  User, 
  Calendar, 
  Clock, 
  BookOpen, 
  Filter,
  CheckCircle,
  FileBarChart,
  Users,
  ShieldCheck,
  ShieldAlert,
  Download,
  Lock,
  FileText,
  KeyRound,
  RefreshCw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminActivityPage() {
  const db = useFirestore();
  const { t } = useLanguage();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [logs, setLogs] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(true);

  // Cargar proyectos para compatibilidad con logs heredados
  const projectsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "projects");
  }, [db]);

  const { data: projects, isLoading: isProjectsLoading } = useCollection<any>(projectsQuery);

  const fetchAllAuditLogs = async () => {
    if (!db) return;
    setIsLogsLoading(true);
    try {
      const allLogs: any[] = [];

      // 1. Cargar colección global inmutable `audit_logs`
      try {
        const auditSnap = await getDocs(collection(db, "audit_logs"));
        auditSnap.docs.forEach((docSnap) => {
          allLogs.push({
            id: docSnap.id,
            isImmutableAudit: true,
            ...docSnap.data(),
          });
        });
      } catch (auditErr) {
        console.warn("No se pudieron cargar audit_logs globales:", auditErr);
      }

      // 2. Cargar logs de actividad de subcolecciones de proyectos
      if (projects && projects.length > 0) {
        const projectPromises = projects.map(async (project) => {
          try {
            const logsRef = collection(db, "projects", project.id, "activityLogs");
            const snap = await getDocs(logsRef);
            return snap.docs.map(d => ({
              id: d.id,
              projectTitle: project.title,
              isImmutableAudit: false,
              ...d.data()
            }));
          } catch {
            return [];
          }
        });

        const nestedProjectLogs = await Promise.all(projectPromises);
        allLogs.push(...nestedProjectLogs.flat());
      }

      // Desduplicar por ID y ordenar por fecha descendente
      const uniqueMap = new Map();
      allLogs.forEach(item => {
        if (!uniqueMap.has(item.id)) {
          uniqueMap.set(item.id, item);
        }
      });

      const sortedLogs = Array.from(uniqueMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setLogs(sortedLogs);
    } catch (error) {
      console.error("Error al obtener la bitácora de auditoría:", error);
    } finally {
      setIsLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAuditLogs();
  }, [db, projects]);

  // Filtrar logs
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchSearch = 
        log.actorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actorEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.projectTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.actionType?.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchAction = true;
      if (actionFilter !== 'all') {
        if (actionFilter === 'security') {
          matchAction = 
            log.actionType?.includes('AUTH') || 
            log.actionType?.includes('PIN') || 
            log.actionType?.includes('PASSWORD') ||
            log.entityType === 'Security' ||
            log.entityType === 'Auth';
        } else if (actionFilter === 'states') {
          matchAction = 
            log.actionType?.includes('Cambio de Estado') || 
            log.actionType === 'PROJECT_STATUS_CHANGE';
        } else if (actionFilter === 'proposals') {
          matchAction = 
            log.actionType?.includes('PROJECT_CREATE') || 
            log.actionType?.includes('Propuesta') ||
            log.actionType?.includes('Tesis') ||
            log.actionType?.includes('Artículo');
        } else if (actionFilter === 'deletions') {
          matchAction = 
            log.actionType?.includes('DELETE') || 
            log.details?.toLowerCase().includes('borrad') ||
            log.details?.toLowerCase().includes('elimin');
        }
      }

      return matchSearch && matchAction;
    });
  }, [logs, searchTerm, actionFilter]);

  // Estadísticas de Auditoría
  const stats = useMemo(() => {
    if (logs.length === 0) return { total: 0, immutableCount: 0, securityEvents: 0, stateChanges: 0 };

    let immutables = 0;
    let secEvents = 0;
    let states = 0;

    logs.forEach(log => {
      if (log.isImmutableAudit) immutables++;
      if (log.actionType?.includes('AUTH') || log.actionType?.includes('PIN') || log.actionType?.includes('PASSWORD')) {
        secEvents++;
      }
      if (log.actionType?.includes('Cambio de Estado') || log.actionType === 'PROJECT_STATUS_CHANGE') {
        states++;
      }
    });

    return {
      total: logs.length,
      immutableCount: immutables,
      securityEvents: secEvents,
      stateChanges: states,
    };
  }, [logs]);

  // Exportar Bitácora Forense Oficial
  const handleExportAudit = () => {
    try {
      const exportPayload = {
        institucion: "ESCUELA NAVAL DE SUBOFICIALES ARC BARRANQUILLA",
        sistema: "Sistema de Formulación y Gestión de Proyectos de Grado (ENSUB)",
        fechaExportacion: new Date().toISOString(),
        totalRegistros: filteredLogs.length,
        registrosAuditoria: filteredLogs.map((l, index) => ({
          secuencia: index + 1,
          idEvento: l.id,
          tipoSeguridad: l.isImmutableAudit ? "INMUTABLE_FORENSE" : "REGISTRO_PROYECTO",
          fechaHora: l.createdAt,
          actor: {
            nombre: l.actorName || "Desconocido",
            email: l.actorEmail || "No registrado",
            id: l.actorId || "N/A",
            rol: l.actorRole || "N/A"
          },
          tipoAccion: l.actionType,
          entidad: l.entityType || "General",
          proyectoRelacionado: l.projectTitle || "N/A",
          descripcion: l.details,
          metadatos: l.metadata || {},
          agenteUsuario: l.userAgent || "N/A"
        }))
      };

      const dataStr = JSON.stringify(exportPayload, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', `ENSUB_AUDITORIA_FORENSE_${new Date().toISOString().slice(0, 10)}.json`);
      linkElement.click();

      toast({
        title: "Bitácora Forense Exportada",
        description: `Se descargaron ${filteredLogs.length} eventos de auditoría oficial.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error al exportar",
        description: "No se pudo generar el archivo de auditoría.",
      });
    }
  };

  const getActionBadge = (log: any) => {
    const action = log.actionType || "";
    if (action.includes("AUTH_REGISTER") || action.includes("AUTH_LOGIN")) {
      return (
        <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-300">
          Autenticación
        </span>
      );
    }
    if (action.includes("PIN") || action.includes("PASSWORD")) {
      return (
        <span className="text-[9px] font-black uppercase tracking-wider bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-300">
          Seguridad / PIN
        </span>
      );
    }
    if (action.includes("STATUS") || action.includes("Estado")) {
      return (
        <span className="text-[9px] font-black uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-300">
          Estado Académico
        </span>
      );
    }
    if (action.includes("DELETE")) {
      return (
        <span className="text-[9px] font-black uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 px-2.5 py-0.5 rounded-full border border-red-300">
          Eliminación
        </span>
      );
    }
    return (
      <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 px-2.5 py-0.5 rounded-full border border-slate-200">
        {action || "Registro"}
      </span>
    );
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="border-b pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded-full border border-primary/20">
              Auditoría Forense Blindada
            </span>
            <span className="px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase rounded-full border border-emerald-500/20 flex items-center gap-1">
              <Lock className="h-3 w-3" /> Regla Inmutable Activa
            </span>
          </div>
          <h1 className="text-3xl font-black font-headline text-primary uppercase tracking-tight flex items-center gap-2.5">
            <Activity className="h-7 w-7 text-[#FF6B00]" /> Registro de Auditoría y Trazabilidad
          </h1>
          <p className="text-muted-foreground font-medium text-sm">
            Bitácora institucional inmutable. Registra cada inicio de sesión, cambio de estado de tesis, evaluaciones y eventos críticos.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchAllAuditLogs}
            variant="outline"
            size="sm"
            className="rounded-full gap-1.5 text-xs font-bold"
            disabled={isLogsLoading}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLogsLoading ? "animate-spin" : ""}`} /> Actualizar
          </Button>

          <Button
            onClick={handleExportAudit}
            size="sm"
            className="rounded-full gap-2 text-xs font-bold bg-[#FF6B00] hover:bg-[#E05E00] text-white shadow-md"
            disabled={filteredLogs.length === 0}
          >
            <Download className="h-3.5 w-3.5" /> Exportar Bitácora Oficial
          </Button>
        </div>
      </div>

      {isProjectsLoading || isLogsLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : logs.length === 0 ? (
        <Card className="border-dashed border-2 py-20 text-center bg-white flex flex-col items-center gap-4 rounded-3xl">
          <Activity className="h-14 w-14 text-slate-300" />
          <div className="space-y-1 max-w-sm">
            <h3 className="text-sm font-black uppercase text-slate-800 tracking-wide">Sin Registros de Auditoría</h3>
            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Aún no se registran actividades en la bitácora. A medida que los usuarios inicien sesión, envíen propuestas y dictaminen proyectos, aparecerán aquí.
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Card className="bg-primary text-white border-none shadow-md p-5 rounded-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-primary-foreground/75 text-[10px] font-black uppercase tracking-widest">Total Eventos</p>
                  <h3 className="text-3xl font-black mt-1 tracking-tighter">{stats.total}</h3>
                </div>
                <div className="p-2.5 bg-white/10 rounded-xl"><Activity className="h-5 w-5" /></div>
              </div>
              <p className="text-[9px] text-primary-foreground/60 font-bold uppercase mt-2">Bitácora completa</p>
            </Card>

            <Card className="bg-emerald-700 text-white border-none shadow-md p-5 rounded-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/75 text-[10px] font-black uppercase tracking-widest">Logs Inmutables</p>
                  <h3 className="text-3xl font-black mt-1 tracking-tighter">{stats.immutableCount}</h3>
                </div>
                <div className="p-2.5 bg-white/10 rounded-xl"><ShieldCheck className="h-5 w-5" /></div>
              </div>
              <p className="text-[9px] text-white/60 font-bold uppercase mt-2">Protegidos contra borrado</p>
            </Card>

            <Card className="bg-[#1E6EAA] text-white border-none shadow-md p-5 rounded-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/75 text-[10px] font-black uppercase tracking-widest">Eventos Seguridad</p>
                  <h3 className="text-3xl font-black mt-1 tracking-tighter">{stats.securityEvents}</h3>
                </div>
                <div className="p-2.5 bg-white/10 rounded-xl"><KeyRound className="h-5 w-5" /></div>
              </div>
              <p className="text-[9px] text-white/60 font-bold uppercase mt-2">Logins, PIN y registros</p>
            </Card>

            <Card className="bg-[#33B8AD] text-white border-none shadow-md p-5 rounded-2xl">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-white/75 text-[10px] font-black uppercase tracking-widest">Dictámenes / Estados</p>
                  <h3 className="text-3xl font-black mt-1 tracking-tighter">{stats.stateChanges}</h3>
                </div>
                <div className="p-2.5 bg-white/10 rounded-xl"><FileBarChart className="h-5 w-5" /></div>
              </div>
              <p className="text-[9px] text-white/60 font-bold uppercase mt-2">Aprobaciones y revisiones</p>
            </Card>
          </div>

          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Buscador */}
            <div className="relative md:col-span-6">
              <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por usuario, correo institucional, proyecto o acción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border rounded-full py-2.5 pl-10 pr-4 text-xs font-semibold focus:ring-primary focus:border-primary shadow-sm"
              />
            </div>

            {/* Selector de Acciones */}
            <div className="flex gap-2 md:col-span-6 justify-start md:justify-end overflow-x-auto pb-2 md:pb-0">
              <Button
                variant={actionFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full font-black uppercase text-[9px] tracking-wider shrink-0"
                onClick={() => setActionFilter('all')}
              >
                Todos ({logs.length})
              </Button>
              <Button
                variant={actionFilter === 'security' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full font-black uppercase text-[9px] tracking-wider shrink-0"
                onClick={() => setActionFilter('security')}
              >
                Seguridad & Auth
              </Button>
              <Button
                variant={actionFilter === 'states' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full font-black uppercase text-[9px] tracking-wider shrink-0"
                onClick={() => setActionFilter('states')}
              >
                Estados Tesis
              </Button>
              <Button
                variant={actionFilter === 'proposals' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full font-black uppercase text-[9px] tracking-wider shrink-0"
                onClick={() => setActionFilter('proposals')}
              >
                Propuestas
              </Button>
              <Button
                variant={actionFilter === 'deletions' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full font-black uppercase text-[9px] tracking-wider shrink-0"
                onClick={() => setActionFilter('deletions')}
              >
                Eliminaciones
              </Button>
            </div>
          </div>

          {/* Feed de Auditoría Central */}
          <div className="bg-white border rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b pb-4">
              <h3 className="text-xs font-black uppercase text-slate-800 tracking-widest flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#FF6B00]" /> Bitácora Forense Cronológica ({filteredLogs.length} eventos)
              </h3>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Orden: Más reciente primero
              </span>
            </div>

            <div className="space-y-3">
              {filteredLogs.map((log) => (
                <div 
                  key={log.id} 
                  className="flex flex-col sm:flex-row items-start gap-4 p-4 border rounded-2xl hover:bg-slate-50/70 transition-all bg-white shadow-sm"
                >
                  <div className="h-10 w-10 bg-primary/10 text-primary font-black rounded-2xl shrink-0 flex items-center justify-center text-xs border border-primary/20">
                    {log.actorName?.[0] || 'U'}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-1.5 w-full">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-black uppercase text-slate-900 tracking-tight">
                          {log.actorName}
                        </span>
                        {log.actorEmail && (
                          <span className="text-[11px] text-slate-500 font-semibold">
                            ({log.actorEmail})
                          </span>
                        )}
                        <div className="h-1 w-1 bg-slate-300 rounded-full" />
                        {getActionBadge(log)}
                        {log.isImmutableAudit && (
                          <span className="text-[8px] font-black uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-0.5">
                            <Lock className="h-2.5 w-2.5" /> Inmutable
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold shrink-0">
                        <Clock className="h-3 w-3 text-slate-300" />
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                      {log.details}
                    </p>

                    {log.projectTitle && (
                      <div className="flex items-center gap-1.5 text-[9px] font-bold text-slate-500 uppercase truncate pt-1">
                        <BookOpen className="h-3 w-3 text-[#FF6B00] shrink-0" />
                        <span className="text-slate-400">Proyecto: </span>
                        <span className="font-black text-slate-700 truncate">{log.projectTitle}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {filteredLogs.length === 0 && (
                <div className="py-20 text-center opacity-40 text-xs font-black uppercase tracking-wider">
                  No se encontraron eventos coincidentes con los filtros seleccionados
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
