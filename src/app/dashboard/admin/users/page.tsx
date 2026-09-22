"use client";

import { useState, useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, updateDoc } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/context/language-context";
import { 
  Users, 
  UserCheck, 
  Search, 
  Loader2, 
  Shield, 
  GraduationCap, 
  User, 
  Mail, 
  RefreshCw 
} from "lucide-react";

export default function AdminUsersPage() {
  const { user: currentUser } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const { t } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'advisor' | 'admin'>('all');
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "users");
  }, [db]);

  const { data: users, isLoading } = useCollection<any>(usersQuery);

  // Filtrar usuarios
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    return users.filter(u => {
      const fullName = `${u.firstName || ""} ${u.lastName || ""}`.toLowerCase();
      const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                            u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === 'all' || u.role === roleFilter;
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  // Actualizar rol del usuario en Firestore
  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!db) return;
    setIsUpdating(userId);
    try {
      await updateDoc(doc(db, "users", userId), {
        role: newRole,
        updatedAt: new Date().toISOString()
      });

      toast({
        title: "Rol Actualizado",
        description: "El rol del usuario se ha modificado correctamente en la base de datos.",
      });
    } catch (error) {
      console.error("Error updating user role:", error);
      toast({
        variant: "destructive",
        title: "Error de Guardado",
        description: "No se pudieron actualizar los permisos del usuario.",
      });
    } finally {
      setIsUpdating(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-50 text-red-600 border-red-100';
      case 'advisor':
        return 'bg-amber-50 text-amber-600 border-amber-100';
      default:
        return 'bg-blue-50 text-blue-600 border-blue-100';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin':
        return <Shield className="h-4 w-4 text-red-500" />;
      case 'advisor':
        return <GraduationCap className="h-4 w-4 text-amber-500" />;
      default:
        return <User className="h-4 w-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto animate-in fade-in duration-500 pb-12">
      {/* Header */}
      <div className="border-b pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black font-headline text-primary uppercase tracking-tight flex items-center gap-2.5">
            <Users className="h-7 w-7 text-[#FF6B00]" /> {t('users')}
          </h1>
          <p className="text-muted-foreground font-medium">
            Administración de permisos, acreditación y roles académicos para la Escuela Naval.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Controles de Búsqueda y Filtro */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            {/* Buscador */}
            <div className="relative md:col-span-6 lg:col-span-5">
              <Search className="absolute left-4 top-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-white border rounded-full py-2.5 pl-10 pr-4 text-xs font-semibold focus:ring-primary focus:border-primary shadow-sm"
              />
            </div>

            {/* Selector de Rol */}
            <div className="flex flex-wrap gap-2 md:col-span-6 lg:col-span-7 justify-start md:justify-end">
              <Button
                variant={roleFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full font-black uppercase text-[9px] tracking-wider"
                onClick={() => setRoleFilter('all')}
              >
                Todos ({users?.length || 0})
              </Button>
              <Button
                variant={roleFilter === 'student' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full font-black uppercase text-[9px] tracking-wider"
                onClick={() => setRoleFilter('student')}
              >
                Estudiantes ({users?.filter(u => u.role === 'student').length || 0})
              </Button>
              <Button
                variant={roleFilter === 'advisor' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full font-black uppercase text-[9px] tracking-wider"
                onClick={() => setRoleFilter('advisor')}
              >
                Asesores ({users?.filter(u => u.role === 'advisor').length || 0})
              </Button>
              <Button
                variant={roleFilter === 'admin' ? 'default' : 'outline'}
                size="sm"
                className="rounded-full font-black uppercase text-[9px] tracking-wider"
                onClick={() => setRoleFilter('admin')}
              >
                Admins ({users?.filter(u => u.role === 'admin').length || 0})
              </Button>
            </div>
          </div>

          {/* Listado de Usuarios */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredUsers.map((u) => (
              <Card key={u.id} className="bg-white border rounded-3xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between group">
                <CardHeader className="p-6 pb-4 flex flex-row items-start justify-between space-y-0 border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-primary/10 text-primary font-black rounded-full flex items-center justify-center text-sm ring-2 ring-white">
                      {u.firstName?.[0]}{u.lastName?.[0]}
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase text-slate-800 line-clamp-1 group-hover:text-primary transition-colors">
                        {u.firstName} {u.lastName}
                      </h4>
                      <div className="flex items-center gap-1 mt-0.5 text-[9px] font-bold text-slate-400">
                        <Mail className="h-2.5 w-2.5 shrink-0" />
                        <span className="truncate max-w-[150px]">{u.email}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-md text-[8px] font-black uppercase tracking-wider border shrink-0 flex items-center gap-1.5 ${getRoleBadgeColor(u.role)}`}>
                    {getRoleIcon(u.role)}
                    {u.role === 'student' ? 'Estudiante' : (u.role === 'advisor' ? 'Asesor' : 'Admin')}
                  </div>
                </CardHeader>
                
                <CardContent className="p-6 pt-4 space-y-4">
                  {/* Selector de Rol */}
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black uppercase text-slate-400 tracking-widest block">Asignar Permisos</label>
                    <Select 
                      disabled={isUpdating === u.id || u.email === currentUser?.email}
                      defaultValue={u.role || 'student'}
                      onValueChange={(val) => handleUpdateRole(u.id, val)}
                    >
                      <SelectTrigger className="w-full text-xs font-bold rounded-full bg-slate-50 border-none">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="student">Estudiante</SelectItem>
                        <SelectItem value="advisor">Docente Asesor</SelectItem>
                        <SelectItem value="admin">Administrador Decano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>

                {/* Footer Tarjeta */}
                <div className="px-6 py-3.5 bg-slate-50/50 border-t flex justify-between items-center text-[9px] font-black uppercase tracking-wider text-slate-400">
                  <span>ID: {u.id?.slice(0, 8)}...</span>
                  {isUpdating === u.id ? (
                    <span className="text-primary flex items-center gap-1 font-bold">
                      <RefreshCw className="h-3 w-3 animate-spin" /> Guardando...
                    </span>
                  ) : (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <UserCheck className="h-3 w-3" /> Sincronizado
                    </span>
                  )}
                </div>
              </Card>
            ))}

            {filteredUsers.length === 0 && (
              <div className="col-span-full py-20 text-center opacity-30 text-xs font-black uppercase tracking-wider">
                No se encontraron usuarios coincidentes
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
