
'use client';

import { DegreeProject } from "@/lib/types";
import { ENSUBLogo } from "@/components/institutional/ensub-logo";

interface PrintThesisAPAProps {
  project: DegreeProject;
}

/**
 * Componente que renderiza el formato de Tesis Final (APA V1) para impresión.
 * Sigue los estándares de la ENSUB con portadas, preliminares y capítulos técnicos.
 */
export function PrintThesisAPA({ project }: PrintThesisAPAProps) {
  const currentYear = new Date().getFullYear();

  return (
    <div className="hidden print:block print:relative print:top-0 print:left-0 bg-white text-black font-serif leading-relaxed text-[12pt] w-full">
      <style jsx global>{`
        @media print {
          @page {
            size: letter;
            margin: 2.54cm; /* Estándar APA */
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
            background-color: white !important;
            font-family: "Times New Roman", Times, serif !important;
          }
          body * {
            visibility: hidden;
          }
          #print-area-thesis, #print-area-thesis * {
            visibility: visible;
          }
          #print-area-thesis {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
          .page-break {
            page-break-after: always;
          }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
          .indent { text-indent: 1.27cm; }
          h1 { font-size: 14pt; text-align: center; margin-bottom: 2rem; font-weight: bold; text-transform: uppercase; }
          h2 { font-size: 12pt; margin-top: 1.5rem; margin-bottom: 1rem; font-weight: bold; }
          p { margin-bottom: 1rem; text-align: justify; line-height: 2; }
        }
      `}</style>

      <div id="print-area-thesis" className="w-full">
        {/* PÁGINA 1: PORTADA INSTITUCIONAL */}
        <div className="page-break flex flex-col items-center justify-between h-[25cm] py-10">
          <div className="text-center space-y-2">
            <p className="font-bold uppercase text-[12pt] m-0">ESCUELA NAVAL DE SUBOFICIALES ARC "BARRANQUILLA"</p>
            <p className="font-bold uppercase text-[11pt] m-0">{project.programa}</p>
            <p className="text-[10pt] m-0">CONTINGENTE NO. {project.curso}</p>
          </div>

          <div className="h-48 w-48 py-4">
            <ENSUBLogo />
          </div>

          <div className="text-center px-10">
            <h1 className="leading-tight mb-0">{project.thesisTitle || project.title}</h1>
          </div>

          <div className="text-center space-y-8">
            <div>
              <p className="font-bold uppercase text-[11pt] m-0 mb-2">AUTORES:</p>
              <p className="font-bold uppercase text-[12pt] m-0">{project.proponent1Name}</p>
              {project.proponent2Name && <p className="font-bold uppercase text-[12pt] m-0">{project.proponent2Name}</p>}
            </div>
            
            <div className="pt-20">
              <p className="font-bold uppercase text-[11pt] m-0">BARRANQUILLA, COLOMBIA</p>
              <p className="font-bold text-[11pt] m-0">{project.deliveryYear || currentYear}</p>
            </div>
          </div>
        </div>

        {/* PÁGINA 2: DEDICATORIA Y AGRADECIMIENTOS */}
        {(project.thesisDedication || project.thesisAcknowledgments) && (
          <div className="page-break py-10">
            {project.thesisDedication && (
              <div className="mb-20">
                <h1 className="text-right italic">Dedicatoria</h1>
                <p className="text-right italic max-w-[50%] ml-auto">{project.thesisDedication}</p>
              </div>
            )}
            {project.thesisAcknowledgments && (
              <div>
                <h1>Agradecimientos</h1>
                <p className="indent">{project.thesisAcknowledgments}</p>
              </div>
            )}
          </div>
        )}

        {/* PÁGINA 3: RESUMEN Y ABSTRACT */}
        <div className="page-break py-10">
          <div className="mb-20">
            <h1>Resumen</h1>
            <p className="indent">{project.thesisAbstract}</p>
          </div>
          {project.thesisAbstractEnglish && (
            <div>
              <h1>Abstract</h1>
              <p className="indent italic">{project.thesisAbstractEnglish}</p>
            </div>
          )}
        </div>

        {/* CAPÍTULO 1: INTRODUCCIÓN */}
        <div className="page-break py-10">
          <h1>Capítulo 1: Introducción</h1>
          <p className="indent">{project.thesisIntroduction}</p>
        </div>

        {/* CAPÍTULO 2: MARCO REFERENCIAL */}
        <div className="page-break py-10">
          <h1>Capítulo 2: Marco Referencial</h1>
          
          {project.thesisBackground && (
            <div className="mb-8">
              <h2>2.1 Antecedentes</h2>
              <p className="indent">{project.thesisBackground}</p>
            </div>
          )}
          
          {project.thesisTheoreticalFramework && (
            <div className="mb-8">
              <h2>2.2 Marco Teórico</h2>
              <p className="indent">{project.thesisTheoreticalFramework}</p>
            </div>
          )}
          
          {project.thesisConceptualFramework && (
            <div className="mb-8">
              <h2>2.3 Marco Conceptual</h2>
              <p className="indent">{project.thesisConceptualFramework}</p>
            </div>
          )}
          
          {project.thesisLegalFramework && (
            <div className="mb-8">
              <h2>2.4 Marco Legal</h2>
              <p className="indent">{project.thesisLegalFramework}</p>
            </div>
          )}
        </div>

        {/* CAPÍTULO 3: DISEÑO METODOLÓGICO */}
        <div className="page-break py-10">
          <h1>Capítulo 3: Diseño Metodológico</h1>
          
          <div className="mb-8">
            <h2>3.1 Tipo y Diseño de Investigación</h2>
            <p className="indent">{project.thesisMethodologyDesign}</p>
          </div>
          
          <div className="mb-8">
            <h2>3.2 Población y Muestra</h2>
            <p className="indent">{project.thesisMethodologyPopulation}</p>
            {project.thesisMethodologySample && <p className="indent">{project.thesisMethodologySample}</p>}
          </div>
          
          <div className="mb-8">
            <h2>3.3 Instrumentos de Recolección</h2>
            <p className="indent">{project.thesisMethodologyInstruments}</p>
          </div>
        </div>

        {/* CAPÍTULO 4: RESULTADOS */}
        <div className="page-break py-10">
          <h1>Capítulo 4: Resultados y Análisis</h1>
          <p className="indent">{project.thesisResults}</p>
        </div>

        {/* CAPÍTULO 5: DISCUSIÓN, CONCLUSIONES Y RECOMENDACIONES */}
        <div className="page-break py-10">
          <h1>Capítulo 5: Discusión</h1>
          <p className="indent">{project.thesisDiscussion}</p>
          
          <div className="mt-10">
            <h1>Conclusiones</h1>
            <p className="indent">{project.thesisConclusions}</p>
          </div>
          
          <div className="mt-10">
            <h1>Recomendaciones</h1>
            <p className="indent">{project.thesisRecommendations}</p>
          </div>
        </div>

        {/* REFERENCIAS BIBLIOGRÁFICAS */}
        <div className="page-break py-10">
          <h1>Referencias Bibliográficas</h1>
          <div className="text-[10pt] leading-normal font-mono">
            <p className="whitespace-pre-wrap">{project.thesisReferences}</p>
          </div>
        </div>

        {/* ANEXOS */}
        {project.thesisAnnexes && (
          <div className="py-10">
            <h1>Anexos</h1>
            <p className="indent">{project.thesisAnnexes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
