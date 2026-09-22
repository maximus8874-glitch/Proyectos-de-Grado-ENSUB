
"use client";

import { useState, useRef, useEffect } from "react";
import { GraduationCap, BookOpen, ShieldCheck, LogIn } from "lucide-react";
import Link from "next/link";
import { Header } from "@/components/Header";
import { RoleCard } from "@/components/RoleCard";
import { Button } from "@/components/ui/button";

export default function Home() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [currentVideo, setCurrentVideo] = useState(0);

  // Lista de videos:
  const playlist = [
    "https://www.escuelanavalsuboficiales.edu.co/sites/default/files/images/suboficial_naval.mp4",
    "/WhatsApp Video 2026-04-08 at 20.12.43.mp4",
    "/video_plataforma.mp4"
  ];

  const handleVideoEnded = () => {
    // Escala progresivamente entre todos los videos configurados y vuelve a empezar
    setCurrentVideo((prev) => (prev + 1) % playlist.length);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Institutional Header extracted to Component */}
      <Header />

      {/* Hero Section with Official Institutional Background Video */}
      <main className="flex-1 pt-24">
        <section className="relative h-[680px] flex items-center justify-center overflow-hidden bg-black">
          {/* Background Video Container Optimizado */}
          <div className="absolute inset-0 z-0 flex items-center justify-center bg-black">
            <video 
              ref={videoRef}
              src={playlist[currentVideo]}
              autoPlay
              muted 
              playsInline 
              onEnded={handleVideoEnded}
              onCanPlay={(e) => {
                // Forzar reproducción nativa al apenas tener buffer disponible
                e.currentTarget.play().catch(() => {});
              }}
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Minimal overlay to ensure text readability */}
            <div className="absolute inset-0 z-20 bg-gradient-to-b from-black/60 via-black/20 to-black/80" />
          </div>

          <div className="container relative z-10 text-center space-y-6 px-4">
            {/* Botón ACCEDER de gran tamaño encima de Excelencia Académica */}
            <div className="flex justify-center mb-3">
              <Button 
                size="lg" 
                asChild 
                className="bg-[#FF6B00] hover:bg-[#e05e00] text-white text-base md:text-lg font-black px-10 py-6 h-auto rounded-full shadow-2xl hover:scale-105 transition-all duration-300 gap-3 border-2 border-white/30"
              >
                <Link href="#roles">
                  <LogIn className="h-6 w-6" />
                  ACCEDER
                </Link>
              </Button>
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 rounded-full border border-primary/20 shadow-sm mb-4">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <span className="text-xs font-bold text-primary uppercase tracking-widest">Excelencia Académica Naval</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-white font-headline leading-tight drop-shadow-2xl">
              Gestión Integral de <span className="text-[#FF6B00]">Proyectos de Grado</span>
            </h1>
            <p className="text-xl text-white max-w-2xl mx-auto font-bold drop-shadow-lg bg-black/10 backdrop-blur-[1px] rounded-lg inline-block px-4 py-1">
              Plataforma oficial para la trazabilidad, supervisión y éxito de los trabajos de investigación formativa de la Escuela Naval.
            </p>
          </div>
        </section>

        {/* Role Selection - INVESTIGACION FORMATIVA */}
        <section id="roles" className="py-24 bg-white scroll-mt-24">
          <div className="container px-4 mx-auto text-center mb-16">
            <h2 className="text-3xl font-black font-headline mb-4 uppercase">Investigación Formativa</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Selecciona tu perfil institucional para acceder a las herramientas de seguimiento y evaluación.</p>
          </div>
          <div className="container px-4 mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
            <RoleCard 
              title="Estudiantes" 
              description="Desarrolla tu tesis, carga avances y recibe retroalimentación inmediata de tus asesores." 
              icon={<BookOpen className="h-10 w-10 text-[#FF6B00]" />}
              link="/login"
              buttonText="Iniciar Sesión"
            />
            <RoleCard 
              title="Docentes Asesores" 
              description="Supervisa el progreso académico, evalúa entregables y guía el desarrollo de la investigación." 
              icon={<GraduationCap className="h-10 w-10 text-primary" />}
              link="/login"
              buttonText="Iniciar Sesión"
            />
            <RoleCard 
              title="Administración" 
              description="Gestión de usuarios, asignación de tutores y control de indicadores institucionales." 
              icon={<ShieldCheck className="h-10 w-10 text-primary" />}
              link="/login"
              buttonText="Iniciar Sesión"
            />
          </div>
        </section>
      </main>

      {/* Footer with ENSUB branding only */}
      <footer className="py-12 border-t bg-slate-50">
        <div className="container px-4 mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <p className="font-bold text-sm text-slate-900">ENSUB</p>
            <p className="text-[10px] text-muted-foreground uppercase">Escuela Naval de Suboficiales ARC Barranquilla</p>
          </div>
          <p className="text-xs text-muted-foreground">© 2024 Escuela Naval de Suboficiales "ARC BARRANQUILLA". Todos los derechos reservados.</p>
          <div className="flex gap-6">
            <Link href="#" className="text-xs text-muted-foreground hover:text-primary">Ver Normativas</Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-primary">Términos</Link>
            <Link href="#" className="text-xs text-muted-foreground hover:text-primary">Privacidad</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
