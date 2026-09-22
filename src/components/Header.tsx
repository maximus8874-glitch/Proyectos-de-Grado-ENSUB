import React, { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Megaphone, LogIn, Mail, Phone, Headphones, LifeBuoy } from 'lucide-react';

export function Header() {
  const [showSupport, setShowSupport] = useState(false);

  return (
    <header className="px-6 h-24 flex items-center justify-between border-b bg-white/90 backdrop-blur-sm fixed w-full top-0 z-50">
      <div className="flex items-center gap-4">
        <div className="flex flex-col justify-center leading-tight">
          <span className="text-xs font-black text-primary uppercase">ENSUB</span>
          <h1 className="text-sm md:text-xl font-bold text-[#FF6B00]">
            Escuela Naval de Suboficiales &quot;ARC BARRANQUILLA&quot;
          </h1>
          <p className="text-[8px] md:text-[10px] font-bold text-black uppercase tracking-wider">
            BARRANQUILLA-COLOMBIA
          </p>
        </div>
      </div>
      
      {/* Navigation with requested icons */}
      <nav className="flex items-center gap-3">
        <div className="hidden lg:flex items-center gap-6 mr-4">
          <Link href="#features" className="text-sm font-medium hover:text-primary transition-colors">Características</Link>
          <Link href="#roles" className="text-sm font-medium hover:text-primary transition-colors">Roles</Link>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Botón de Información de Contacto / Soporte (Sin redirección, muestra rectángulo al acercarse) */}
          <div 
            className="relative"
            onMouseEnter={() => setShowSupport(true)}
            onMouseLeave={() => setShowSupport(false)}
          >
            <Button 
              type="button"
              variant="ghost" 
              size="icon" 
              onClick={() => setShowSupport(!showSupport)}
              className="rounded-full hover:bg-slate-100 text-slate-700 hover:text-primary transition-colors" 
              title="Soporte y Ayuda"
            >
              <Megaphone className="h-5 w-5" />
            </Button>

            {/* Rectángulo flotante con información de contacto */}
            {showSupport && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100">
                  <div className="p-2 bg-primary/10 rounded-xl text-primary">
                    <Headphones className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-base leading-tight">Soporte</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Mesa de Ayuda ENSUB</p>
                  </div>
                </div>

                <div className="space-y-3.5 pt-3.5 text-xs">
                  <div className="flex items-start gap-3 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Mail className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Correo Electrónico</span>
                      <a href="mailto:soportetecnico@ensub.edu.co" className="font-semibold text-primary hover:underline break-all">
                        soportetecnico@ensub.edu.co
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <Phone className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">Teléfono</span>
                      <a href="tel:6017000000" className="font-semibold text-slate-900 hover:text-primary">
                        (601)-700-0000
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Botón Registrarse */}
          <Button 
            variant="outline" 
            size="sm" 
            asChild 
            className="rounded-full px-4 md:px-5 h-10 font-black uppercase text-[11px] border-primary/30 text-primary hover:bg-primary/5 transition-all"
          >
            <Link href="/register">
              Registrarse
            </Link>
          </Button>

          {/* Botón Iniciar Sesión */}
          <Button 
            variant="default" 
            size="sm" 
            asChild 
            className="rounded-full px-4 md:px-5 h-10 font-black uppercase text-[11px] bg-primary hover:bg-primary/90 text-white shadow-md hover:scale-105 transition-all"
          >
            <Link href="/login">
              Iniciar Sesión
            </Link>
          </Button>
        </div>

      </nav>
    </header>
  );
}
