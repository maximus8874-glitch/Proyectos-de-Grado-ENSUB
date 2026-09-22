
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { useLanguage, Language } from "@/context/language-context";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Languages, Settings, Bell, Accessibility, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PreferencesPage() {
  const { t, language, setLanguage } = useLanguage();
  const { toast } = useToast();

  const handleSave = () => {
    toast({
      title: t('saveSuccess'),
      description: "✓ Language set to " + language.toUpperCase(),
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold font-headline text-primary">{t('preferencesTitle')}</h1>
        <p className="text-muted-foreground">{t('preferencesDesc')}</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              {t('interfaceSettings')}
            </CardTitle>
            <CardDescription>
              Configura los parámetros visuales y de interacción.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl bg-muted/20 border">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Languages className="h-4 w-4 text-primary" />
                  <Label className="font-bold text-sm">{t('languageLabel')}</Label>
                </div>
                <p className="text-xs text-muted-foreground">{t('languageDescription')}</p>
              </div>
              <Select value={language} onValueChange={(val) => setLanguage(val as Language)}>
                <SelectTrigger className="w-[200px] h-10">
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
              <Button variant="outline" size="sm" disabled>Desactivado</Button>
            </div>

            <div className="flex items-center justify-between p-4 rounded-xl border opacity-50 cursor-not-allowed">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <Label className="font-bold text-sm">{t('notifications')}</Label>
                </div>
                <p className="text-xs text-muted-foreground">Configura alertas sonoras y de sistema.</p>
              </div>
              <Button variant="outline" size="sm" disabled>Configurar</Button>
            </div>
          </CardContent>
          <CardFooter className="bg-slate-50 border-t p-6 rounded-b-lg flex justify-end">
            <Button onClick={handleSave} className="gap-2 rounded-full px-8 shadow-lg">
              <CheckCircle2 className="h-4 w-4" />
              {t('savePreferences')}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
