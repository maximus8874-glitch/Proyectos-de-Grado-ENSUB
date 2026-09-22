"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useLanguage, Language } from "@/context/language-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Languages, Settings, Bell, Accessibility, CheckCircle2, Camera, User, ShieldCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/firebase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChangeAvatarDialog } from "@/components/dashboard/change-avatar-dialog";

export default function PreferencesPage() {
  const { t, language, setLanguage } = useLanguage();
  const { user } = useUser();
  const { toast } = useToast();

  const [isAvatarDialogOpen, setIsAvatarDialogOpen] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string>(user?.photoURL || "");

  const handleSave = () => {
    toast({
      title: t('saveSuccess'),
      description: "✓ Language set to " + language.toUpperCase(),
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary">{t('preferencesTitle')}</h1>
        <p className="text-muted-foreground">{t('preferencesDesc')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* SECCIÓN FOTO DE PERFIL INSTITUCIONAL */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b bg-slate-50/50 p-6">
            <CardTitle className="flex items-center gap-2 text-xl font-black text-primary uppercase tracking-tight">
              <Camera className="h-5 w-5 text-primary" />
              Foto de Perfil Institucional
            </CardTitle>
            <CardDescription className="text-xs font-medium">
              Gestiona tu imagen oficial en la Escuela Naval ENSUB. Visible para directores, asesores y jurados.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-5 rounded-2xl bg-primary/5 border border-primary/20">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20 border-4 border-white shadow-md ring-2 ring-primary/20">
                  <AvatarImage src={photoUrl || user?.photoURL || `https://picsum.photos/seed/${user?.uid}/200/200`} className="object-cover" />
                  <AvatarFallback className="bg-primary text-white text-xl font-bold">
                    {user?.email?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-black text-slate-900 text-sm uppercase">{user?.displayName || user?.email || "Usuario Naval"}</h3>
                  <p className="text-[11px] text-muted-foreground font-semibold">{user?.email}</p>
                  <span className="inline-flex items-center gap-1 mt-1 text-[9px] font-black uppercase text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    <ShieldCheck className="h-3 w-3" /> Perfil Activo
                  </span>
                </div>
              </div>

              <Button
                type="button"
                onClick={() => setIsAvatarDialogOpen(true)}
                className="rounded-full px-6 gap-2 text-xs font-bold bg-primary hover:bg-primary/90 text-white shadow-md"
              >
                <Camera className="h-4 w-4" />
                Cambiar foto de perfil
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* SECCIÓN CONFIGURACIÓN DE IDIOMA E INTERFAZ */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="border-b bg-slate-50/50 p-6">
            <CardTitle className="flex items-center gap-2 text-xl font-black text-primary uppercase tracking-tight">
              <Settings className="h-5 w-5 text-primary" />
              {t('interfaceSettings')}
            </CardTitle>
            <CardDescription className="text-xs font-medium">
              Configura los parámetros visuales y de interacción.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-muted/20 border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4 text-primary" />
                  <Label className="font-bold text-sm">{t('languageLabel')}</Label>
                </div>
                <p className="text-xs text-muted-foreground">{t('languageDescription')}</p>
              </div>
              <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
                <SelectTrigger className="w-[200px] h-10 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="es">Español (Castellano)</SelectItem>
                  <SelectItem value="en">English (US/UK)</SelectItem>
                  <SelectItem value="pt">Português (Brasil)</SelectItem>
                  <SelectItem value="fr">Français (France)</SelectItem>
                  <SelectItem value="it">Italiano (Italia)</SelectItem>
                  <SelectItem value="de">Deutsch (Deutschland)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border opacity-50 cursor-not-allowed">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Accessibility className="h-4 w-4" />
                  <Label className="font-bold text-sm">{t('accessibility')}</Label>
                </div>
                <p className="text-xs text-muted-foreground">Modo alto contraste y fuentes legibles.</p>
              </div>
              <Button variant="outline" size="sm" disabled className="rounded-xl">Desactivado</Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border opacity-50 cursor-not-allowed">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <Label className="font-bold text-sm">{t('notifications')}</Label>
                </div>
                <p className="text-xs text-muted-foreground">Configura alertas sonoras y de sistema.</p>
              </div>
              <Button variant="outline" size="sm" disabled className="rounded-xl">Configurar</Button>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t p-6 rounded-b-lg flex justify-end">
            <Button onClick={handleSave} className="gap-2 rounded-full px-8 shadow-lg font-bold text-xs">
              <CheckCircle2 className="h-4 w-4" />
              {t('savePreferences')}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <ChangeAvatarDialog
        open={isAvatarDialogOpen}
        onOpenChange={setIsAvatarDialogOpen}
        currentPhotoUrl={photoUrl || user?.photoURL || undefined}
        userName={user?.displayName || user?.email || "Usuario"}
        onAvatarUpdated={(newUrl) => setPhotoUrl(newUrl)}
      />
    </div>
  );
}
