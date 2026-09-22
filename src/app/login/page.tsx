"use client";

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { GraduationCap, Loader2, KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

import { recordAuditLog } from "@/lib/audit";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Estado para modal de restablecer contraseña
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
      const userDoc = await getDoc(doc(db, "users", userCredential.user.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data();

        // Registrar inicio de sesión en auditoría inmutable
        await recordAuditLog(db, {
          actorId: userCredential.user.uid,
          actorEmail: cleanEmail,
          actorName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || cleanEmail,
          actorRole: userData.role || 'student',
          actionType: "AUTH_LOGIN",
          entityType: "Auth",
          entityId: userCredential.user.uid,
          details: `Inicio de sesión exitoso en perfil ${String(userData.role || 'student').toUpperCase()}.`,
        });

        router.push(`/dashboard/${userData.role}`);
      } else {
        toast({
          variant: "destructive",
          title: "Error de perfil",
          description: "No se encontró información institucional para este usuario.",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error al iniciar sesión",
        description: "Credenciales inválidas o problema de conexión.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetEmail = resetEmail.trim().toLowerCase() || email.trim().toLowerCase();
    if (!targetEmail) {
      toast({
        variant: "destructive",
        title: "Correo requerido",
        description: "Por favor ingresa tu correo institucional.",
      });
      return;
    }

    setResetLoading(true);
    try {
      await sendPasswordResetEmail(auth, targetEmail);
      
      // Registrar solicitud de restablecimiento en auditoría
      await recordAuditLog(db, {
        actorId: "anonymous",
        actorEmail: targetEmail,
        actorName: targetEmail,
        actorRole: "student",
        actionType: "PASSWORD_RESET_REQUESTED",
        entityType: "Security",
        details: `Solicitud de enlace para restablecer contraseña enviado a ${targetEmail}.`,
      });

      toast({
        title: "Enlace de Recuperación Enviado",
        description: `Hemos enviado un enlace a ${targetEmail} para que crees una nueva contraseña.`,
      });
      setIsResetOpen(false);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "No se pudo enviar el correo",
        description: error.message || "Verifica que el correo ingresado sea el correcto.",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="text-center bg-primary text-white p-10">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black uppercase tracking-tight leading-tight">ESCUELA NAVAL<br/>"ENSUB"</CardTitle>
          <CardDescription className="text-white/70 font-medium">Ingreso al Portal Académico</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="space-y-6 bg-white pt-10 px-10 pb-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Correo Institucional</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="usuario@escuelanavalsuboficiales.edu.co" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required 
                className="bg-slate-50 border-none h-12 rounded-xl focus-visible:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Contraseña</Label>
                <button
                  type="button"
                  onClick={() => {
                    setResetEmail(email);
                    setIsResetOpen(true);
                  }}
                  className="text-[10px] font-bold text-primary hover:underline transition-colors"
                >
                  Restablecer contraseña
                </button>
              </div>
              <Input 
                id="password" 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required 
                className="bg-slate-50 border-none h-12 rounded-xl focus-visible:ring-primary"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 bg-white p-10 pt-2">
            <Button type="submit" className="w-full h-14 rounded-full bg-primary font-black uppercase text-xs shadow-xl transition-all hover:scale-[1.02]" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Iniciar Sesión Institucional"}
            </Button>
            <p className="text-xs text-center text-slate-500 font-medium">
              ¿No tienes cuenta? <Link href="/register" className="text-primary font-black hover:underline">Regístrate aquí</Link>
            </p>
          </CardFooter>
        </form>
      </Card>

      {/* Modal de Restablecer Contraseña */}
      <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl p-6">
          <DialogHeader className="text-center sm:text-left">
            <div className="mx-auto sm:mx-0 w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-3">
              <KeyRound className="h-6 w-6" />
            </div>
            <DialogTitle className="text-xl font-black text-slate-900">Restablecer Contraseña</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Ingresa tu correo institucional registrado y te enviaremos un enlace seguro para crear una nueva contraseña.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleResetPassword} className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="reset-email" className="text-[10px] font-black uppercase text-slate-400 tracking-widest">
                Correo Institucional
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
                <Input 
                  id="reset-email" 
                  type="email"
                  placeholder="usuario@escuelanavalsuboficiales.edu.co" 
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required 
                  className="bg-slate-50 border-none h-12 pl-10 rounded-xl focus-visible:ring-primary text-sm"
                />
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => setIsResetOpen(false)}
                className="rounded-full font-bold text-xs"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="rounded-full bg-primary hover:bg-primary/90 font-black uppercase text-xs shadow-md"
                disabled={resetLoading}
              >
                {resetLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Enviar Enlace de Recuperación"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}