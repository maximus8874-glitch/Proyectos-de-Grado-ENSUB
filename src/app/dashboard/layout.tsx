
"use client";

import { useEffect, useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { UserRole } from "@/lib/types";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser, useFirestore } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { Loader2, Languages, Check, LogOut, Settings, User, Camera } from "lucide-react";
import { useLanguage, Language } from "@/context/language-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { EmailVerificationBanner } from "@/components/auth/email-verification-banner";
import { ChangeAvatarDialog } from "@/components/dashboard/change-avatar-dialog";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { language, setLanguage, t } = useLanguage();
  const [userData, setUserData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);

  const languages: { code: Language; label: string }[] = [
    { code: "es", label: "Español" },
    { code: "en", label: "English" },
    { code: "pt", label: "Português" },
    { code: "fr", label: "Français" },
    { code: "it", label: "Italiano" },
    { code: "de", label: "Deutsch" },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push("/login");
      return;
    }

    if (user) {
      const fetchUserData = async () => {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchUserData();
    }
  }, [user, isUserLoading, db, router]);

  if (!mounted || isUserLoading || isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          {mounted && (
            <p className="text-sm font-bold text-primary animate-pulse uppercase tracking-widest">
              {t('loadingApp')}
            </p>
          )}
        </div>
      </div>
    );
  }

  let role = userData?.role as UserRole || 'student';

  const ADMIN_WHITELIST = [
    "felipetorrez502@gmail.com",
    "administracionmaritima@ensub.edu.co",
    "maximus8874@gmail.com",
    "josediazdoria08@gmail.com"
  ];

  if (ADMIN_WHITELIST.includes(user?.email?.toLowerCase() || '')) {
    role = 'admin';
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen w-full overflow-hidden bg-background print:h-auto print:overflow-visible">
        <div className="print:hidden">
          <AppSidebar role={role} />
        </div>
        <SidebarInset className="flex-1 overflow-y-auto print:overflow-visible print:bg-white print:m-0 print:p-0 print:shadow-none print:border-none">
          <header className="h-20 flex items-center justify-between px-6 border-b bg-white sticky top-0 z-40 shadow-sm print:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div className="h-10 w-[1px] bg-border mx-2" />
              
              <div className="flex flex-col justify-center leading-tight">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-primary uppercase">ENSUB</span>
                  <div className="h-1 w-1 rounded-full bg-accent" />
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">ESCUELA NAVAL "ENSUB"</span>
                </div>
                <h1 className="text-sm md:text-lg font-black text-[#FF6B00] tracking-tight">
                  Escuela Naval de Suboficiales "ARC BARRANQUILLA"
                </h1>
                <p className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em]">
                  {t('barranquilla')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm font-black text-slate-900 leading-none">
                  {userData?.firstName} {userData?.lastName}
                </p>
                <div className="flex items-center justify-end gap-1 mt-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{role}</p>
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-10 w-10 border-2 border-primary/20 shadow-sm ring-2 ring-white cursor-pointer hover:opacity-90 transition-opacity">
                    <AvatarImage src={userData?.photoURL || user?.photoURL || `https://picsum.photos/seed/${user?.uid}/200/200`} className="object-cover" />
                    <AvatarFallback className="bg-primary text-white font-bold">
                      {userData?.firstName?.[0]}{userData?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 p-2">
                  <DropdownMenuLabel className="font-bold flex items-center gap-2">
                    <User className="h-4 w-4" /> {t('institutionalProfile')}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* OPCIÓN CAMBIAR FOTO DE PERFIL */}
                  <DropdownMenuItem 
                    className="cursor-pointer font-bold text-primary focus:text-primary focus:bg-primary/10"
                    onClick={() => setIsAvatarDialogOpen(true)}
                  >
                    <Camera className="mr-2 h-4 w-4 text-primary" />
                    <span>Cambiar foto de perfil</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="cursor-pointer">
                      <Languages className="mr-2 h-4 w-4 text-primary" />
                      <span>{t('changeLanguage')}</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent className="p-1">
                        {languages.map((lang) => (
                          <DropdownMenuItem
                            key={lang.code}
                            onClick={() => setLanguage(lang.code)}
                            className="flex items-center justify-between cursor-pointer px-3 py-2"
                          >
                            <span className={cn("text-xs", language === lang.code && "font-bold text-primary")}>
                              {lang.label}
                            </span>
                            {language === lang.code && <Check className="h-3 w-3 text-primary" />}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>

                  <DropdownMenuItem className="cursor-pointer" onClick={() => router.push("/dashboard/preferences")}>
                    <Settings className="mr-2 h-4 w-4 text-slate-500" />
                    <span>{t('settings')}</span>
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuItem 
                    className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/5"
                    onClick={() => router.push("/")}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{t('logout')}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          <EmailVerificationBanner />
          <main className="p-6 bg-slate-50/50 min-h-[calc(100vh-5rem)] relative print:p-0 print:bg-white print:min-h-0 print:block">
            {children}
          </main>
        </SidebarInset>
      </div>

      {/* Modal interactivo para Cambiar Foto de Perfil */}
      <ChangeAvatarDialog
        open={isAvatarDialogOpen}
        onOpenChange={setIsAvatarDialogOpen}
        currentPhotoUrl={userData?.photoURL || user?.photoURL}
        userName={`${userData?.firstName || ''} ${userData?.lastName || ''}`.trim() || user?.email || 'Usuario'}
        onAvatarUpdated={(newUrl) => {
          setUserData((prev: any) => ({ ...prev, photoURL: newUrl }));
        }}
      />
    </SidebarProvider>
  );
}
