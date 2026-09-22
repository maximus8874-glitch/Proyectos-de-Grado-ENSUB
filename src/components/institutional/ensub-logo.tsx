
'use client';

import { cn } from "@/lib/utils";

interface ENSUBLogoProps {
  className?: string;
}

/**
 * Escudo oficial de la Escuela Naval de Suboficiales "ARC BARRANQUILLA".
 * Reconstrucción vectorial de alta fidelidad basada fielmente en el escudo institucional proporcionado.
 */
export function ENSUBLogo({ className }: ENSUBLogoProps) {
  return (
    <svg 
      viewBox="0 0 400 500" 
      className={cn("h-full w-full drop-shadow-md", className)}
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Ancla de Plata (Fondo) */}
      <path 
        d="M200 60V440M100 110H300M60 320C60 400 130 450 200 450C270 450 340 400 340 320" 
        stroke="#D1D5DB" 
        strokeWidth="20" 
        strokeLinecap="round"
      />
      <circle cx="200" cy="50" r="15" stroke="#D1D5DB" strokeWidth="10" />
      <path d="M100 110V130M300 110V130" stroke="#9CA3AF" strokeWidth="8" strokeLinecap="round" />

      {/* Cinta Superior (Ribbon) */}
      <path 
        d="M40 130C100 80 300 80 360 130L375 160C300 120 100 120 25 160L40 130Z" 
        fill="#111827"
      />
      <defs>
        <path id="crestRibbonPath" d="M60 142C120 105 280 105 340 142" />
      </defs>
      <text fill="#FACC15" fontSize="11" fontWeight="900" fontFamily="Arial, sans-serif">
        <textPath href="#crestRibbonPath" startOffset="50%" textAnchor="middle">
          ESCUELA NAVAL DE SUBOFICIALES
        </textPath>
      </text>
      <text x="200" y="156" textAnchor="middle" fill="#FACC15" fontSize="10" fontWeight="900" fontFamily="Arial, sans-serif">
        ARC BARRANQUILLA
      </text>

      {/* Rosa de los Vientos (Brújula) */}
      <g transform="translate(200, 185) scale(0.6)">
        <path d="M0 -30L10 0L0 10L-10 0L0 -30Z" fill="white" stroke="black" />
        <path d="M0 -30L-10 0L0 10V-30Z" fill="black" />
        <path d="M0 30L10 0L0 10L-10 0L0 30Z" fill="white" stroke="black" />
        <path d="M0 30L10 0L0 10V30Z" fill="black" />
        <path d="M-30 0L0 -10L10 0L0 10L-30 0Z" fill="white" stroke="black" />
        <path d="M-30 0L0 -10L10 0H-30Z" fill="black" />
        <path d="M30 0L0 -10L10 0L0 10L30 0Z" fill="white" stroke="black" />
        <path d="M30 0L0 10L10 0H30Z" fill="black" />
      </g>

      {/* Cuerpo del Escudo (Shield) */}
      <path 
        d="M200 440C200 440 360 390 360 200H40C40 390 200 440 200 440Z" 
        fill="#F3F4F6" 
        stroke="#003366" 
        strokeWidth="4"
      />
      
      {/* División en Aspa (X Division) */}
      <path d="M40 200L200 320L360 200H40Z" fill="#1E40AF" stroke="#FACC15" strokeWidth="1.5" />
      <path d="M40 320L200 440L360 320L200 320L40 320Z" fill="#1E40AF" stroke="#FACC15" strokeWidth="1.5" />

      {/* Cuartel Superior: Águila de Oro */}
      <g transform="translate(150, 215) scale(0.5)">
        <path d="M100 20C80 40 20 60 20 80L100 100L180 80C180 60 120 40 100 20Z" fill="#FACC15" />
        <path d="M100 40L120 70H140L120 85L130 110L100 95L70 110L80 85L60 70H80L100 40Z" fill="#FACC15" stroke="#A16207" strokeWidth="1" />
      </g>

      {/* Cuartel Inferior: Libro Abierto */}
      <g transform="translate(165, 365) scale(0.7)">
        <path d="M0 0C25 -5 50 0 50 5V40C50 35 25 30 0 35V0Z" fill="#FDE047" stroke="#A16207" strokeWidth="2" />
        <path d="M100 0C75 -5 50 0 50 5V40C50 35 75 30 100 35V0Z" fill="#FDE047" stroke="#A16207" strokeWidth="2" />
        <path d="M10 10H40M10 20H40M10 30H40M60 10H90M60 20H90M60 30H90" stroke="#A16207" strokeWidth="1" />
      </g>

      {/* Cuartel Izquierdo: Megáfono */}
      <g transform="translate(80, 275) scale(0.8)">
        <path d="M0 10L40 0V30L0 20V10Z" fill="#4B5563" stroke="black" />
        <rect x="-10" y="12" width="10" height="8" fill="#4B5563" stroke="black" />
      </g>

      {/* Cuartel Derecho: Hélice de Oro */}
      <g transform="translate(290, 290) scale(0.9)">
        <path d="M0 -20C8 -5 8 5 0 20C-8 5 -8 -5 0 -20Z" fill="#D97706" stroke="#451A03" strokeWidth="1.5" />
        <path d="M-20 0C-5 8 5 8 20 0C5 -8 -5 -8 -20 0Z" fill="#D97706" stroke="#451A03" strokeWidth="1.5" />
        <circle cx="0" cy="0" r="5" fill="#451A03" />
      </g>

      {/* Estrella Central (Azul sobre Blanco) */}
      <circle cx="200" cy="320" r="14" fill="white" stroke="#1E40AF" strokeWidth="2" />
      <path 
        d="M200 308L204 316L212 316L206 322L208 330L200 325L192 330L194 322L188 316L196 316L200 308Z" 
        fill="#1E40AF" 
      />
    </svg>
  );
}
