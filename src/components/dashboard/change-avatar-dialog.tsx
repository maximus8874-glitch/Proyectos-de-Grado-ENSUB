"use client";

import { useState, useRef } from "react";
import { useAuth, useFirestore, useUser } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { updateProfile } from "firebase/auth";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Camera, 
  Upload, 
  Check, 
  Loader2, 
  Image as ImageIcon, 
  Link as LinkIcon
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { recordAuditLog } from "@/lib/audit";

interface ChangeAvatarDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPhotoUrl?: string;
  userName?: string;
  onAvatarUpdated?: (newUrl: string) => void;
}

export function ChangeAvatarDialog({
  open,
  onOpenChange,
  currentPhotoUrl,
  userName = "Usuario",
  onAvatarUpdated,
}: ChangeAvatarDialogProps) {
  const { user } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedUrl, setSelectedUrl] = useState<string>(currentPhotoUrl || "");
  const [customUrlInput, setCustomUrlInput] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Manejar subida de archivo local (convertir a Base64 optimizada)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      toast({
        variant: "destructive",
        title: "Archivo inválido",
        description: "Por favor selecciona una imagen en formato JPG, PNG o WebP.",
      });
      return;
    }

    // Validar tamaño máximo (hasta 4MB antes de compresión)
    if (file.size > 4 * 1024 * 1024) {
      toast({
        variant: "destructive",
        title: "Imagen muy pesada",
        description: "Por favor selecciona una imagen menor a 4MB.",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Redimensionar y comprimir en canvas para almacenamiento ligero
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const MAX_SIZE = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
        setSelectedUrl(compressedDataUrl);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setSelectedUrl(customUrlInput.trim());
    setCustomUrlInput("");
  };

  const handleSaveAvatar = async () => {
    if (!user || !db || !selectedUrl) return;

    setIsUploading(true);
    try {
      // 1. Actualizar documento de Firestore `users/{uid}`
      const userDocRef = doc(db, "users", user.uid);
      await updateDoc(userDocRef, {
        photoURL: selectedUrl,
        updatedAt: new Date().toISOString(),
      });

      // 2. Actualizar perfil de Firebase Auth
      if (auth.currentUser) {
        await updateProfile(auth.currentUser, {
          photoURL: selectedUrl,
        });
      }

      // 3. Registrar auditoría inmutable
      await recordAuditLog(db, {
        actorId: user.uid,
        actorEmail: user.email || "unknown",
        actorName: userName,
        actorRole: "user",
        actionType: "AUTH_LOGIN",
        entityType: "User",
        entityId: user.uid,
        details: "El usuario actualizó exitosamente su foto de perfil.",
      });

      if (onAvatarUpdated) {
        onAvatarUpdated(selectedUrl);
      }

      toast({
        title: "Foto de Perfil Actualizada",
        description: "Tu nueva imagen se ha guardado correctamente.",
      });

      onOpenChange(false);
    } catch (error: any) {
      console.error("Error al actualizar foto de perfil:", error);
      toast({
        variant: "destructive",
        title: "Error al guardar foto",
        description: error.message || "No se pudo sincronizar la nueva imagen.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl p-6">
        <DialogHeader className="text-center sm:text-left">
          <div className="flex items-center gap-2.5 text-primary mb-1">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <DialogTitle className="text-xl font-black uppercase tracking-tight">
              Cambiar Foto de Perfil
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs font-medium text-muted-foreground">
            Sube tu fotografía personal para personalizar tu perfil institucional en la plataforma.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Vista previa central */}
          <div className="flex flex-col items-center justify-center gap-3 p-5 rounded-2xl bg-slate-50 border border-slate-100">
            <div className="relative group">
              <Avatar className="h-32 w-32 border-4 border-white shadow-xl ring-4 ring-primary/20">
                <AvatarImage src={selectedUrl || currentPhotoUrl} className="object-cover" />
                <AvatarFallback className="bg-primary text-white text-3xl font-black">
                  {userName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-1 right-1 p-2.5 bg-primary hover:bg-primary/90 text-white rounded-full shadow-lg border-2 border-white transition-transform hover:scale-110 cursor-pointer"
                title="Subir archivo desde el equipo"
              >
                <Upload className="h-4 w-4" />
              </button>
            </div>

            <div className="text-center">
              <p className="text-xs font-black uppercase text-slate-800 tracking-tight">{userName}</p>
              <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wider">
                {selectedUrl ? "Nueva foto seleccionada" : "Foto actual"}
              </p>
            </div>
          </div>

          {/* Input oculto para subir archivo */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png, image/jpeg, image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* Botón directo de carga desde archivo */}
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="w-full rounded-2xl border-dashed border-2 py-6 gap-2 text-xs font-bold hover:bg-primary/5 hover:border-primary/40 text-slate-700 shadow-sm"
          >
            <Upload className="h-4 w-4 text-primary" />
            Seleccionar foto desde mi computador (JPG, PNG)
          </Button>

          {/* Opción de URL externa */}
          <div className="space-y-1.5 pt-1">
            <Label className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-1">
              <LinkIcon className="h-3 w-3 text-slate-400" /> O pegar enlace de imagen (URL)
            </Label>
            <div className="flex gap-2">
              <Input
                placeholder="https://ejemplo.com/mifoto.jpg"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="text-xs rounded-xl h-9"
              />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={handleApplyCustomUrl}
                className="rounded-xl text-xs font-bold px-3 h-9"
              >
                Cargar
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 pt-3 border-t">
          <Button
            type="button"
            variant="ghost"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
            className="rounded-xl text-xs font-bold"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            onClick={handleSaveAvatar}
            disabled={isUploading || !selectedUrl}
            className="rounded-xl text-xs font-bold bg-primary hover:bg-primary/90 text-white gap-2 shadow-md"
          >
            {isUploading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Guardando...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" /> Guardar Foto de Perfil
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
