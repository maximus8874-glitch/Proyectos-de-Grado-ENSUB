"use client";

import { useState, useMemo } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  UserCog, Search, Loader2, ShieldCheck, ShieldAlert, GraduationCap, User,
  CheckCircle2, XCircle, ChevronRight, Lock, Unlock, RefreshCw, Settings2,
  BookOpen, Eye, PenLine, Stamp
} from "lucide-react";

// --- PERMISSION MATRIX ---
const PERMISSIONS: { key: string; label: string; description: string; icon: React.ReactNode; roles: string[] }[] = [
  {
    key: "can_view_projects",
    label: "Ver Proyectos",
    description: "Acceder al listado y detalle de proyectos de grado",
    icon: <Eye className="h-4 w-4" />,
    roles: ["student", "advisor", "admin"],
  },
  {
    key: "can_edit_proposal",
    label: "Editar Propuesta",
    description: "Modificar el contenido de la propuesta V03",
    icon: <PenLine className="h-4 w-4" />,
    roles: ["student"],
  },
  {
    key: "can_review_projects",
    label: "Revisar y Corregir",
    description: "Solicitar correcciones y dar retroalimentación",
    icon: <BookOpen className="h-4 w-4" />,
    roles: ["advisor", "admin"],
  },
  {
    key: "can_approve_projects",
    label: "Aprobar Fases",
    description: "Emitir visto bueno y avanzar el proyecto de etapa",
    icon: <Stamp className="h-4 w-4" />,
    roles: ["advisor", "admin"],
  },
  {
    key: "can_manage_users",
    label: "Gestionar Usuarios",
    description: "Crear, editar y asignar roles a usuarios del sistema",
    icon: <UserCog className="h-4 w-4" />,
    roles: ["admin"],
  },
  {
    key: "can_export_reports",
    label: "Exportar Reportes",
    description: "Generar y descargar reportes institucionales en PDF",
    icon: <ShieldCheck className="h-4 w-4" />,
    roles: ["advisor", "admin"],
  },
  {
    key: "can_view_audit",
    label: "Ver Auditoría",
    description: "Acceder al historial completo de actividad del sistema",
    icon: <ShieldAlert className="h-4 w-4" />,
    roles: ["admin"],
  },
];

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  student: {
    label: "Estudiante",
    color: "text-blue-600",
    bg: "bg-blue-50 border-blue-100",
    icon: <User className="h-4 w-4 text-blue-500" />,
  },
  advisor: {
    label: "Asesor Docente",
    color: "text-amber-600",
    bg: "bg-amber-50 border-amber-100",
    icon: <GraduationCap className="h-4 w-4 text-amber-500" />,
  },
  admin: {
    label: "Administrador",
    color: "text-red-600",
    bg: "bg-red-50 border-red-100",
    icon: <ShieldCheck className="h-4 w-4 text-red-500" />,
  },
};

export default function GestionarRolesPage() {
  const db = useFirestore();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const usersQuery = useMemoFirebase(() => db ? collection(db, "users") : null, [db]);
  const { data: users, isLoading } = useCollection<any>(usersQuery);

  const projectsQuery = useMemoFirebase(() => db ? collection(db, "projects") : null, [db]);
  const { data: projects } = useCollection<any>(projectsQuery);

  // Stats per role
  const roleStats = useMemo(() => ({
    student: users?.filter(u => u.role === "student").length || 0,
    advisor: users?.filter(u => u.role === "advisor").length || 0,
    admin: users?.filter(u => u.role === "admin").length || 0,
  }), [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const name = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      const matchSearch = name.includes(searchTerm.toLowerCase()) || u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchRole = !selectedRole || u.role === selectedRole;
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, selectedRole]);

  const handleToggleRole = async (userId: string, currentRole: string) => {
    if (!db) return;
    const roleOrder = ["student", "advisor", "admin"];
    const nextRole = roleOrder[(roleOrder.indexOf(currentRole) + 1) % roleOrder.length];
    setIsUpdating(userId);
    try {
      await updateDoc(doc(db, "users", userId), {
        role: nextRole,
        updatedAt: new Date().toISOString(),
      });
      toast({ title: "Rol Actualizado", description: `El usuario ahora tiene el rol de ${ROLE_CONFIG[nextRole]?.label}.` });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el rol." });
    } finally {
      setIsUpdating(null);
    }
  };

  const handleSetRole = async (userId: string, newRole: string) => {
    if (!db) return;
    setIsUpdating(userId);
    try {
      await updateDoc(doc(db, "users", userId), { role: newRole, updatedAt: new Date().toISOString() });
      toast({ title: "Rol asignado", description: `Rol actualizado a: ${ROLE_CONFIG[newRole]?.label}` });
    } catch {
      toast({ variant: "destructive", title: "Error", description: "No se pudo actualizar el rol." });
    } finally {
      setIsUpdating(null);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="border-b pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline text-primary uppercase tracking-tight flex items-center gap-2.5">
            <UserCog className="h-7 w-7 text-amber-500" /> Gestionar Roles
          </h1>
          <p className="text-muted-foreground font-medium">
            Configura quién puede revisar, corregir y aprobar proyectos de grado en ENSUB.
          </p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-full">
          <Settings2 className="h-4 w-4 text-amber-600" />
          <span className="text-[10px] font-black uppercase text-amber-600 tracking-widest">Control de Acceso</span>
        </div>
      </div>

      {/* Resumen de Permisos por Rol */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
          <Card key={role} className="border-none shadow-sm overflow-hidden">
            <CardHeader className={`p-5 ${cfg.bg} border-b`}>
              <CardTitle className={`text-sm font-black uppercase flex items-center gap-2 ${cfg.color}`}>
                {cfg.icon} {cfg.label}
                <span className="ml-auto text-xs font-bold opacity-60">
                  {roleStats[role as keyof typeof roleStats]} usuarios
                </span>
              </CardTitle>
              <CardDescription className="text-xs mt-1">Permisos activos para este rol</CardDescription>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              {PERMISSIONS.map(perm => {
                const hasPermission = perm.roles.includes(role);
                return (
                  <div key={perm.key} className="flex items-center gap-3">
                    <div className={`shrink-0 ${hasPermission ? "text-emerald-500" : "text-slate-200"}`}>
                      {hasPermission ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[11px] font-bold ${hasPermission ? "text-slate-700" : "text-slate-300"}`}>{perm.label}</p>
                    </div>
                    {perm.icon && (
                      <div className={`shrink-0 ${hasPermission ? cfg.color : "text-slate-200"}`}>
                        {perm.icon}
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Asignación Individual */}
      <Card className="border-none shadow-sm">
        <CardHeader className="border-b p-6">
          <CardTitle className="text-lg font-black uppercase text-primary flex items-center gap-2">
            <UserCog className="h-5 w-5 text-amber-500" /> Asignación Individual de Roles
          </CardTitle>
          <CardDescription>Busca un usuario y modifica su nivel de acceso en tiempo real.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          {/* Filtros */}
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-4 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border rounded-full py-2 pl-10 pr-4 text-xs font-semibold focus:ring-primary focus:border-primary"
              />
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={!selectedRole ? "default" : "outline"}
                className="rounded-full text-[10px] font-black uppercase"
                onClick={() => setSelectedRole(null)}
              >
                Todos
              </Button>
              {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                <Button
                  key={role}
                  size="sm"
                  variant={selectedRole === role ? "default" : "outline"}
                  className="rounded-full text-[10px] font-black uppercase"
                  onClick={() => setSelectedRole(role)}
                >
                  {cfg.label}
                </Button>
              ))}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="divide-y rounded-2xl border overflow-hidden">
              {filteredUsers.map(u => {
                const cfg = ROLE_CONFIG[u.role] || ROLE_CONFIG.student;
                const projectCount = projects?.filter(p => p.studentId === u.id || p.advisorIds?.includes(u.id)).length || 0;
                return (
                  <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors group">
                    {/* Avatar */}
                    <div className="h-10 w-10 bg-primary/10 text-primary font-black rounded-full flex items-center justify-center text-sm shrink-0">
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </div>
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-slate-800 truncate">{u.firstName} {u.lastName}</p>
                      <p className="text-[10px] text-slate-400 truncate">{u.email}</p>
                    </div>
                    {/* Projects count */}
                    <div className="text-center hidden sm:block">
                      <p className="text-xs font-black text-slate-700">{projectCount}</p>
                      <p className="text-[9px] text-slate-400 uppercase">Proyectos</p>
                    </div>
                    {/* Current role badge */}
                    <div className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 border ${cfg.bg} ${cfg.color} hidden md:flex`}>
                      {cfg.icon} {cfg.label}
                    </div>
                    {/* Role Selector */}
                    <div className="flex gap-1.5 shrink-0">
                      {Object.entries(ROLE_CONFIG).map(([role, rc]) => (
                        <button
                          key={role}
                          disabled={u.role === role || isUpdating === u.id}
                          onClick={() => handleSetRole(u.id, role)}
                          title={`Asignar: ${rc.label}`}
                          className={`h-7 w-7 rounded-full flex items-center justify-center border-2 transition-all ${
                            u.role === role
                              ? "border-primary bg-primary text-white"
                              : "border-slate-200 text-slate-400 hover:border-primary hover:text-primary"
                          } disabled:opacity-40 disabled:cursor-not-allowed`}
                        >
                          {isUpdating === u.id ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            rc.icon
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {filteredUsers.length === 0 && (
                <div className="py-16 text-center text-xs font-black text-slate-300 uppercase tracking-wider">
                  No se encontraron usuarios
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Leyenda de permisos */}
      <Card className="border-none shadow-sm bg-slate-50">
        <CardHeader className="p-6 border-b">
          <CardTitle className="text-sm font-black uppercase text-primary flex items-center gap-2">
            <Lock className="h-4 w-4" /> Matriz de Control de Acceso
          </CardTitle>
          <CardDescription>Resumen de permisos asignados por rol en el sistema ENSUB.</CardDescription>
        </CardHeader>
        <CardContent className="p-6 overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left font-black uppercase text-[10px] text-slate-400 pb-3 pr-4 min-w-[200px]">Permiso</th>
                {Object.entries(ROLE_CONFIG).map(([role, cfg]) => (
                  <th key={role} className={`text-center font-black uppercase text-[10px] pb-3 px-4 ${cfg.color}`}>
                    {cfg.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y">
              {PERMISSIONS.map(perm => (
                <tr key={perm.key} className="hover:bg-white transition-colors">
                  <td className="py-3 pr-4">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-400">{perm.icon}</span>
                      <div>
                        <p className="font-bold text-slate-700">{perm.label}</p>
                        <p className="text-[9px] text-slate-400">{perm.description}</p>
                      </div>
                    </div>
                  </td>
                  {Object.keys(ROLE_CONFIG).map(role => (
                    <td key={role} className="text-center py-3 px-4">
                      {perm.roles.includes(role) ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 mx-auto" />
                      ) : (
                        <XCircle className="h-4 w-4 text-slate-200 mx-auto" />
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
