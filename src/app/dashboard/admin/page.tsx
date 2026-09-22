
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ShieldCheck, TrendingUp, Users, FileBarChart, Languages, UserCog, FileDown, Database, Activity, ChevronRight } from "lucide-react";
import { useLanguage, Language } from "@/context/language-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import { Button } from "@/components/ui/button";

// Datos de especialidades ENSUB
const SPECIALTY_MAPPING = [
  { name: 'Hidrografía', key: 'Hidrografía', color: '#1E6EAA' },
  { name: 'Oceanografía', key: 'Oceanografía', color: '#33B8AD' },
  { name: 'Naviera', key: 'Naviera', color: '#1E6EAA' },
  { name: 'Aeronaval', key: 'Aeronaval', color: '#33B8AD' },
  { name: 'Electrónica', key: 'Electrónica', color: '#1E6EAA' },
  { name: 'Electromecánica', key: 'Electromecánica', color: '#33B8AD' },
  { name: 'Adm. Marítima', key: 'Administración', color: '#1E6EAA' },
  { name: 'Sanidad Naval', key: 'Sanidad', color: '#33B8AD' },
];

export default function AdminDashboard() {
  const { t, language, setLanguage } = useLanguage();
  const db = useFirestore();

  const projectsQuery = useMemoFirebase(() => db ? collection(db, "projects") : null, [db]);
  const { data: projects } = useCollection(projectsQuery);

  const usersQuery = useMemoFirebase(() => db ? collection(db, "users") : null, [db]);
  const { data: users } = useCollection(usersQuery);

  const handleExportData = () => {
    try {
      const exportData = {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        users: users || [],
        projects: projects || [],
      };
      
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      let linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', 'ensub_backup_datos.json');
      linkElement.click();
    } catch (error) {
      console.error("Error exportando datos", error);
    }
  };

  // Cálculo de estadísticas reales para el gráfico
  const chartData = SPECIALTY_MAPPING.map(spec => ({
    name: spec.name,
    total: projects?.filter(p => p.programa?.includes(spec.key)).length || 0,
    color: spec.color
  }));

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-6">
        <div>
          <h1 className="text-3xl font-black font-headline text-primary uppercase tracking-tight">{t('adminTitle')}</h1>
          <p className="text-muted-foreground font-medium">{t('adminDesc')}</p>
        </div>
        <div className="flex items-center gap-2 px-5 py-2 bg-primary/10 rounded-full border border-primary/20 shadow-sm">
          <ShieldCheck className="h-4 w-4 text-primary" />
          <span className="text-[10px] font-black uppercase text-primary tracking-widest">Control Total del Sistema</span>
        </div>
      </div>

      {/* Métricas de Alto Nivel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AdminStatCard 
          title={t('totalUsers')} 
          value={users?.length.toString() || "0"} 
          delta="+4%" 
          icon={<Users className="h-6 w-6" />} 
          label="Usuarios Activos" 
        />
        <AdminStatCard 
          title={t('totalProjects')} 
          value={projects?.length.toString() || "0"} 
          delta="+8%" 
          icon={<FileBarChart className="h-6 w-6" />} 
          label="Tesis en Proceso" 
        />
        <AdminStatCard 
          title={t('gradRate')} 
          value="92.5%" 
          delta="+1.2%" 
          icon={<TrendingUp className="h-6 w-6" />} 
          label="Éxito Académico" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfico de Especialidades */}
        <Card className="lg:col-span-2 border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase text-primary">Proyectos por Especialidad Naval</CardTitle>
            <CardDescription>Distribución de trabajos de grado por programa tecnológico.</CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} opacity={0.3} />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold' }} width={120} />
                <Tooltip 
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                />
                <Bar dataKey="total" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Panel de Control de Configuraciones Administrativas */}
        <Card className="border-none shadow-sm bg-slate-50">
          <CardHeader>
            <CardTitle className="text-lg font-black uppercase text-primary flex items-center gap-2">
               <ShieldCheck className="h-5 w-5" /> Centro de Mando
            </CardTitle>
            <CardDescription>Gestión de permisos, auditoría y globalización.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-white rounded-2xl border shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Languages className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-primary uppercase">Idioma Global</p>
                  <p className="text-xs font-bold text-muted-foreground">Preferencias</p>
                </div>
              </div>
              <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
                <SelectTrigger className="w-[120px] h-9 text-xs font-bold border-none bg-slate-50 rounded-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="pt">Português</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <AdminControlItem 
              icon={<UserCog className="h-5 w-5" />} 
              title={t('manageRoles')} 
              description={t('manageRolesDesc')} 
              color="text-amber-600"
            />
            <AdminControlItem 
              icon={<FileDown className="h-5 w-5" />} 
              title={t('exportReports')} 
              description={t('exportReportsDesc')} 
              color="text-emerald-600"
            />
            <AdminControlItem 
              icon={<Database className="h-5 w-5" />} 
              title={t('backups')} 
              description={t('backupsDesc')} 
              color="text-blue-600"
              onClick={handleExportData}
            />
            <AdminControlItem 
              icon={<Activity className="h-5 w-5" />} 
              title="Monitor de Salud" 
              description="Estado de servicios Firebase y GenAI." 
              color="text-accent"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminStatCard({ title, value, delta, icon, label }: { title: string, value: string, delta: string, icon: React.ReactNode, label: string }) {
  return (
    <Card className="bg-primary text-white overflow-hidden relative border-none shadow-lg group hover:scale-[1.02] transition-transform">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-primary-foreground/70 text-[10px] font-black uppercase tracking-widest">{title}</p>
            <h3 className="text-4xl font-black mt-2 tracking-tighter">{value}</h3>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] bg-accent text-white px-2 py-0.5 rounded-full font-black">{delta}</span>
              <p className="text-[10px] text-primary-foreground/60 font-bold uppercase">{label}</p>
            </div>
          </div>
          <div className="p-4 bg-white/10 rounded-2xl group-hover:bg-accent/20 transition-colors">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AdminControlItem({ title, description, icon, color, onClick }: { title: string, description: string, icon: React.ReactNode, color: string, onClick?: () => void }) {
  return (
    <div onClick={onClick} className="p-4 bg-white border rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <div className={`p-2 bg-muted rounded-xl group-hover:bg-white transition-colors ${color}`}>
          {icon}
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-tight group-hover:text-primary transition-colors">{title}</p>
          <p className="text-[10px] text-muted-foreground font-medium">{description}</p>
        </div>
      </div>
      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full opacity-20 group-hover:opacity-100 transition-opacity">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}
