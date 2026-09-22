"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@/firebase";
import { sendEmailVerification } from "firebase/auth";
import { AlertCircle, CheckCircle2, Mail, RefreshCw, Send, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function EmailVerificationBanner() {
  const { user } = useUser();
  const auth = useAuth();
  const { toast } = useToast();

  const [isSending, setIsSending] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [verifiedState, setVerifiedState] = useState(false);

  useEffect(() => {
    if (user) {
      setVerifiedState(user.emailVerified);
    }
  }, [user]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  if (!user || verifiedState) {
    return null;
  }

  const handleResendEmail = async () => {
    if (!auth.currentUser || cooldown > 0) return;
    setIsSending(true);
    try {
      await sendEmailVerification(auth.currentUser);
      setCooldown(60);
      toast({
        title: "Correo de Verificación Enviado",
        description: `Hemos enviado un enlace de confirmación a ${user.email}. Por favor revisa tu bandeja de entrada o spam.`,
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "No se pudo enviar el correo",
        description: error.message || "Por favor espera unos minutos antes de intentar de nuevo.",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleReloadStatus = async () => {
    if (!auth.currentUser) return;
    setIsReloading(true);
    try {
      await auth.currentUser.reload();
      if (auth.currentUser.emailVerified) {
        setVerifiedState(true);
        toast({
          title: "¡Correo Verificado con Éxito!",
          description: "Tu cuenta institucional ahora cuenta con acceso completo y verificado.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Aún no verificado",
          description: "No detectamos la confirmación del enlace aún. Por favor haz clic en el link recibido en tu correo.",
        });
      }
    } catch (error) {
      console.error("Error al recargar estado del usuario:", error);
    } finally {
      setIsReloading(false);
    }
  };

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/30 px-4 py-3 text-amber-900 dark:text-amber-200 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-amber-500/20 text-amber-600 rounded-lg flex-shrink-0">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold uppercase tracking-wider text-[11px] block sm:inline text-amber-700 dark:text-amber-300 sm:mr-2">
              Verificación Requerida:
            </span>
            <span>
              Por favor confirma tu correo institucional (<strong>{user.email}</strong>) para validar tu identidad académica.
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResendEmail}
            disabled={isSending || cooldown > 0}
            className="h-8 text-xs border-amber-500/40 text-amber-900 hover:bg-amber-500/20 gap-1.5"
          >
            {isSending ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            {cooldown > 0 ? `Reenviar en (${cooldown}s)` : "Reenviar Enlace"}
          </Button>

          <Button
            size="sm"
            onClick={handleReloadStatus}
            disabled={isReloading}
            className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white gap-1.5 shadow-sm"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isReloading ? "animate-spin" : ""}`} />
            Ya verifiqué
          </Button>
        </div>
      </div>
    </div>
  );
}
