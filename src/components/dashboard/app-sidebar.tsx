"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  MessageSquare, 
  LogOut, 
  ShieldAlert, 
  GraduationCap, 
  UserCircle,
  UserCog,
  ShieldCheck,
  ClipboardList,
  Activity,
  Settings,
  ChevronRight
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@/lib/types";
import { useLanguage } from "@/context/language-context";
import { useUser } from "@/firebase";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface AppSidebarProps {
  role: UserRole;
}

export function AppSidebar({ role }: AppSidebarProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { user } = useUser();

  const isSuperUser = user?.email === "felipetorrez502@gmail.com" || user?.email === "administracionmaritima@ensub.edu.co";

  // Ítems de navegación estándar según el rol actual de la vista
  const getStandardMenuItems = () => {
    const base = [
      { title: t('dashboard'), icon: LayoutDashboard, href: `/dashboard/${role}` },
    ];

    if (role === 'student') {
      return [
        ...base,
        { title: t('myProjects'), icon: FileText, href: `/dashboard/student` },
        { title: t('feedback'), icon: MessageSquare, href: `/dashboard/feedback` },
      ];
    }

    if (role === 'advisor') {
      return [
        ...base,
        { title: t('reviewProjects'), icon: ClipboardList, href: `/dashboard/advisor` },
        { title: t('tutorados'), icon: Users, href: `/dashboard/advisor/tutees` },
      ];
    }

    if (role === 'admin') {
      return [
        ...base,
        { title: t('globalProjects'), icon: FileText, href: `/dashboard/admin` },
        { title: t('users'), icon: Users, href: `/dashboard/admin/users` },
      ];
    }

    return base;
  };

  const standardItems = getStandardMenuItems();

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="h-20 flex flex-col justify-center px-6 bg-primary text-white">
        <div className="flex flex-col group-data-[collapsible=icon]:hidden">
          <span className="font-black text-xs uppercase tracking-tighter leading-none">ENSUB</span>
          <span className="font-bold text-[10px] opacity-80 leading-tight">ESCUELA NAVAL "ENSUB"</span>
          {isSuperUser && (
            <div className="mt-1 flex items-center gap-1">
              <div className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[8px] text-accent font-black uppercase tracking-widest">Master Control</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-slate-50">
        {/* SECCIÓN ESTÁNDAR: Visible para todos según su rol */}
        <SidebarGroup>
          <SidebarGroupLabel className="font-black uppercase text-[9px] tracking-widest text-slate-400 mb-2">
            {t('academicProcess')}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {standardItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.href}
                    tooltip={item.title}
                    className={cn(
                      "transition-all duration-200",
                      pathname === item.href ? "bg-primary text-white shadow-md" : "text-primary hover:bg-slate-200"
                    )}
                  >
                    <Link href={item.href}>
                      <item.icon className={cn("h-5 w-5", pathname === item.href ? "text-white" : "text-primary")} />
                      <span className="font-bold">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SECCIÓN DE CONTROL MAESTRO: EXCLUSIVA PARA SUPERUSUARIO */}
        {isSuperUser && (
          <SidebarGroup className="mt-4 border-t pt-6">
            <SidebarGroupLabel className="font-black uppercase text-[9px] tracking-widest text-accent mb-2">
              Gestión de Roles & Sistema
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <Collapsible className="group/collapsible">
                  <SidebarMenuItem>
                    <CollapsibleTrigger asChild>
                      <SidebarMenuButton tooltip="Gestionar Roles" className="hover:bg-accent/10">
                        <UserCog className="h-5 w-5 text-accent" />
                        <span className="font-black text-accent uppercase text-[11px]">{t('manageRoles')}</span>
                        <ChevronRight className="ml-auto h-4 w-4 transition-transform group-data-[state=open]/collapsible:rotate-90" />
                      </SidebarMenuButton>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="pl-6 mt-1 space-y-1">
                        <SidebarMenuButton asChild isActive={pathname === "/dashboard/student"} className={pathname === "/dashboard/student" ? "bg-primary text-white" : "text-primary hover:bg-slate-200"}>
                          <Link href="/dashboard/student" className="flex items-center gap-3">
                            <UserCircle className={cn("h-4 w-4", pathname === "/dashboard/student" ? "text-white" : "text-primary")} />
                            <span className="text-xs font-bold">Portal Estudiante</span>
                          </Link>
                        </SidebarMenuButton>
                        <SidebarMenuButton asChild isActive={pathname === "/dashboard/advisor"} className={pathname === "/dashboard/advisor" ? "bg-primary text-white" : "text-primary hover:bg-slate-200"}>
                          <Link href="/dashboard/advisor" className="flex items-center gap-3">
                            <GraduationCap className={cn("h-4 w-4", pathname === "/dashboard/advisor" ? "text-white" : "text-primary")} />
                            <span className="text-xs font-bold">Panel de Asesor</span>
                          </Link>
                        </SidebarMenuButton>
                        <SidebarMenuButton asChild isActive={pathname === "/dashboard/admin"} className={pathname === "/dashboard/admin" ? "bg-primary text-white" : "text-primary hover:bg-slate-200"}>
                          <Link href="/dashboard/admin" className="flex items-center gap-3">
                            <ShieldCheck className={cn("h-4 w-4", pathname === "/dashboard/admin" ? "text-white" : "text-primary")} />
                            <span className="text-xs font-bold">Gestión Administrativa</span>
                          </Link>
                        </SidebarMenuButton>
                      </div>
                    </CollapsibleContent>
                  </SidebarMenuItem>
                </Collapsible>

                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/preferences"} className={pathname === "/dashboard/preferences" ? "bg-primary text-white" : "text-primary hover:bg-slate-200"}>
                    <Link href="/dashboard/preferences">
                      <Settings className={cn("h-5 w-5", pathname === "/dashboard/preferences" ? "text-white" : "text-primary")} />
                      <span className="text-xs font-bold">Configuración Global</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={pathname === "/dashboard/admin/activity"} className={pathname === "/dashboard/admin/activity" ? "bg-primary text-white" : "text-primary hover:bg-slate-200"}>
                    <Link href="/dashboard/admin/activity" className="flex items-center gap-3">
                      <Activity className={cn("h-5 w-5", pathname === "/dashboard/admin/activity" ? "text-white" : "text-primary")} />
                      <span className="text-xs font-bold">Monitor de Actividad</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter className="p-4 bg-slate-100 border-t">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild 
              tooltip={t('logout')} 
              className="text-destructive hover:bg-destructive/10 rounded-xl"
            >
              <Link href="/">
                <LogOut className="h-5 w-5" />
                <span className="font-black uppercase text-[10px] tracking-widest">{t('logout')}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}