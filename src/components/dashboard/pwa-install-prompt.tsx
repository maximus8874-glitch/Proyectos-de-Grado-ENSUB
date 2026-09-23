"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Download, 
  Smartphone, 
  X, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  Sparkles 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 1. Detectar si ya está instalada / abierta como standalone
    const isRunningStandalone = window.matchMedia("(display-mode: standalone)").matches || 
      (window.navigator as any).standalone === true;
    
    setIsStandalone(isRunningStandalone);
    if (isRunningStandalone) return;

    // 2. Detectar si es iOS (iPhone / iPad)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 3. Capturar evento de instalación en Android / Chrome
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Registrar Service Worker
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.log("SW registration skipped or failed:", err);
      });
    }

    // En iOS siempre podemos mostrar el botón si no está en standalone
    if (isIosDevice && !isRunningStandalone) {
      setIsVisible(true);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        setIsVisible(false);
      }
      setDeferredPrompt(null);
    } else {
      setShowIOSModal(true);
    }
  };

  if (isStandalone || !isVisible) return null;

  return (
    <>
      <div className="fixed bottom-20 right-4 z-40 sm:bottom-6 sm:right-6 animate-in slide-in-from-bottom-3 duration-500">
        <div className="bg-slate-900/95 backdrop-blur-md text-white border border-slate-700/80 p-3 rounded-2xl shadow-2xl flex items-center gap-3">
          <div className="p-2 bg-primary/30 text-accent rounded-xl">
            <Smartphone className="h-5 w-5" />
          </div>
          <div className="space-y-0.5 pr-2">
            <p className="text-[11px] font-black uppercase tracking-tight text-white flex items-center gap-1">
              <span>Instalar en {isIOS ? "iOS (iPhone)" : "Android"}</span>
              <Sparkles className="h-3 w-3 text-accent" />
            </p>
            <p className="text-[10px] text-slate-300 font-medium">
              Accede directo desde tu pantalla de inicio
            </p>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              onClick={handleInstallClick}
              className="bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-wider rounded-xl px-3 h-8 shadow-md"
            >
              <Download className="h-3.5 w-3.5 mr-1" />
              Instalar
            </Button>
            <Button
              size="icon"
              variant="ghost"
              onClick={() => setIsVisible(false)}
              className="h-7 w-7 text-slate-400 hover:text-white rounded-lg"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Modal con instrucciones paso a paso para iPhone/iPad */}
      <Dialog open={showIOSModal} onOpenChange={setShowIOSModal}>
        <DialogContent className="max-w-md rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-base font-black uppercase text-primary flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-accent" />
              Instalar en iPhone o iPad (iOS)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-600">
              Sigue estos 2 sencillos pasos en Safari para agregar la app a tu pantalla de inicio:
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3.5 py-3">
            <div className="flex items-start gap-3 p-3.5 bg-slate-50 border rounded-xl">
              <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                <Share className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900">
                  1. Toca el botón "Compartir" en Safari
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Es el icono de un cuadrado con una flecha hacia arriba ubicado en la barra inferior de Safari.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3.5 bg-slate-50 border rounded-xl">
              <div className="p-2 bg-primary/10 text-primary rounded-lg shrink-0">
                <PlusSquare className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <p className="text-xs font-bold text-slate-900">
                  2. Selecciona "Añadir a pantalla de inicio"
                </p>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  Baja en las opciones del menú y presiona <strong>"Añadir a pantalla de inicio"</strong>. Luego pulsa <strong>"Añadir"</strong> arriba a la derecha.
                </p>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <p className="text-[11px] text-emerald-900 font-medium">
                ¡Listo! La aplicación aparecerá con el logo oficial de la ENSUB en tu pantalla de inicio.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowIOSModal(false)}
              className="w-full bg-primary text-white rounded-xl font-bold text-xs uppercase tracking-wider"
            >
              Entendido
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
