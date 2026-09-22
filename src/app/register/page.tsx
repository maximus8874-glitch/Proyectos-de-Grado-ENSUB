"use client";

import { useState } from "react";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GraduationCap, Loader2, User, UserCheck } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { recordAuditLog } from "@/lib/audit";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("student");
  const [adminPin, setAdminPin] = useState("");
  const [loading, setLoading] = useState(false);
  
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const ADMIN_SECURITY_PIN = "ENSUB-ADM-2026";
  const ADMIN_WHITELIST = [
    "maximus8874@gmail.com",
    "josediazdoria08@gmail.com",
    "administracionmaritima@ensub.edu.co",
    "felipetorrez502@gmail.com"
  ];

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();

    // Verificación estricta de seguridad para Administradores
    if (role === 'admin') {
      const isWhitelisted = ADMIN_WHITELIST.includes(cleanEmail);
      const isValidPin = adminPin.trim() === ADMIN_SECURITY_PIN;

      if (!isValidPin && !isWhitelisted) {
        toast({
          variant: "destructive",
          title: "Acceso Restringido - Rol Administrativo",
          description: "El código de autorización maestro es incorrecto o el correo no está pre-autorizado.",
        });
        setLoading(false);
        return;
      }
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Envío obligatorio del correo de verificación
      try {
        await sendEmailVerification(user);
      } catch (emailErr) {
        console.warn("No se pudo enviar el correo de verificación inicial:", emailErr);
      }

      let finalRole = role;
      if (role === 'admin' || ADMIN_WHITELIST.includes(cleanEmail)) {
        finalRole = 'admin';
      }

      const userData = {
        id: user.uid,
        email: cleanEmail,
        firstName,
        lastName,
        role: finalRole,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await setDoc(doc(db, "users", user.uid), userData);

      // Si es administrador autorizado o introdujo el PIN válido, registrar rol admin
      if (finalRole === 'admin') {
        try {
          await setDoc(doc(db, "roles_admin", user.uid), { active: true });
        } catch (e) {
          console.warn("No se pudo escribir en roles_admin:", e);
        }
      }
      
      // Si es asesor, registrar en roles_advisor
      if (role === 'advisor') {
        try {
          await setDoc(doc(db, "roles_advisor", user.uid), { active: true });
        } catch (e) {
          console.warn("Nota: roles_advisor gestionado por users.role", e);
        }
      }

      // Registro de Auditoría Inmutable
      await recordAuditLog(db, {
        actorId: user.uid,
        actorEmail: cleanEmail,
        actorName: `${firstName} ${lastName}`.trim(),
        actorRole: finalRole,
        actionType: "AUTH_REGISTER",
        entityType: "User",
        entityId: user.uid,
        details: `Nuevo usuario registrado con perfil ${finalRole.toUpperCase()}. Correo de verificación enviado a ${cleanEmail}.`,
      });

      if (role === 'admin') {
        await recordAuditLog(db, {
          actorId: user.uid,
          actorEmail: cleanEmail,
          actorName: `${firstName} ${lastName}`.trim(),
          actorRole: 'admin',
          actionType: "SECURITY_PIN_VALIDATED",
          entityType: "Security",
          entityId: user.uid,
          details: `PIN Maestro de Administrador validado con éxito para registro de ${cleanEmail}.`,
        });
      }

      toast({
        title: "¡Registro Exitoso!",
        description: `Hemos enviado un correo de verificación a ${cleanEmail}. Bienvenido a la ENSUB.`,
      });
      
      router.push(`/dashboard/${finalRole}`);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error en el registro",
        description: error.message || "No se pudo crear la cuenta.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-xl border-none shadow-2xl rounded-[2.5rem] overflow-hidden">
        <CardHeader className="text-center bg-primary text-white p-10 pb-14">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20">
              <GraduationCap className="h-10 w-10 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-black uppercase tracking-tight">ESCUELA NAVAL "ENSUB"</CardTitle>
          <CardDescription className="text-white/70 font-medium">Registro de Usuario Institucional</CardDescription>
        </CardHeader>
        
        <form onSubmit={handleRegister} className="relative -mt-10">
          <CardContent className="space-y-8 bg-white rounded-t-[3rem] pt-12 px-10">
            {/* TIPO DE USUARIO - 3 PERFILES CON PROTECCIÓN */}
            <div className="space-y-4">
              <Label className="text-[10px] font-black uppercase text-primary tracking-widest block text-center">Selecciona tu Perfil</Label>
              <RadioGroup 
                value={role} 
                onValueChange={setRole} 
                className="grid grid-cols-1 md:grid-cols-3 gap-4"
              >
                <div>
                  <RadioGroupItem value="student" id="student" className="sr-only" />
                  <Label
                    htmlFor="student"
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 h-28",
                      role === "student" 
                        ? "bg-primary text-white border-primary shadow-xl scale-105" 
                        : "bg-slate-50 text-slate-500 border-slate-100 hover:border-primary/30"
                    )}
                  >
                    <User className="h-6 w-6" />
                    <span className="font-black uppercase text-[11px] tracking-tight text-center">Estudiante</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="advisor" id="advisor" className="sr-only" />
                  <Label
                    htmlFor="advisor"
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 h-28",
                      role === "advisor" 
                        ? "bg-accent text-white border-accent shadow-xl scale-105" 
                        : "bg-slate-50 text-slate-500 border-slate-100 hover:border-accent/30"
                    )}
                  >
                    <UserCheck className="h-6 w-6" />
                    <span className="font-black uppercase text-[11px] tracking-tight text-center">Asesor / Docente</span>
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="admin" id="admin" className="sr-only" />
                  <Label
                    htmlFor="admin"
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 h-28",
                      role === "admin" 
                        ? "bg-slate-900 text-white border-slate-900 shadow-xl scale-105" 
                        : "bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-900/30"
                    )}
                  >
                    <GraduationCap className="h-6 w-6" />
                    <span className="font-black uppercase text-[11px] tracking-tight text-center">Administración</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* CAMPO DE SEGURIDAD EXCLUSIVO PARA ADMINISTRACIÓN */}
            {role === 'admin' && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                  <span>🔒 Código de Autorización Institucional (PIN Maestro)</span>
                </div>
                <Input 
                  type="password"
                  placeholder="Introduce el PIN secreto de administración..."
                  value={adminPin}
                  onChange={(e) => setAdminPin(e.target.value)}
                  className="bg-white border-amber-300 h-11 rounded-xl text-xs"
                  required={role === 'admin'}
                />
                <p className="text-[10px] text-amber-700 leading-tight">
                  Requisito de seguridad: Solo la Decanatura y administradores autorizados poseen este código.
                </p>
              </div>
            )}

            <div className="h-px bg-slate-100 w-full" />

            {/* DATOS PERSONALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-[10px] font-black uppercase text-slate-400">Nombre</Label>
                <Input 
                  id="firstName" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  required 
                  className="bg-slate-50 border-none h-12 rounded-xl"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-[10px] font-black uppercase text-slate-400">Apellido</Label>
                <Input 
                  id="lastName" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  required 
                  className="bg-slate-50 border-none h-12 rounded-xl"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-[10px] font-black uppercase text-slate-400">Correo Institucional</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="usuario@escuelanavalsuboficiales.edu.co"
                className="bg-slate-50 border-none h-12 rounded-xl"
              />
            </div>
            
            <div className="space-y-2 pb-4">
              <Label htmlFor="password" className="text-[10px] font-black uppercase text-slate-400">Contraseña</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                className="bg-slate-50 border-none h-12 rounded-xl"
              />
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col space-y-4 bg-white p-10 pt-0">
            <Button 
              type="submit" 
              className={cn(
                "w-full h-14 rounded-full font-black uppercase text-xs shadow-2xl transition-all hover:scale-105",
                role === "student" ? "bg-primary" : "bg-accent"
              )} 
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Completar Registro Institucional"}
            </Button>
            <p className="text-xs text-center text-slate-500 font-medium">
              ¿Ya tienes cuenta? <Link href="/login" className="text-primary font-black hover:underline">Inicia Sesión</Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}