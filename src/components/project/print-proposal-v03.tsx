'use client';

import { DegreeProject } from "@/lib/types";
import { ENSUBLogo } from "@/components/institutional/ensub-logo";

interface PrintProposalV03Props {
  project: DegreeProject;
}

/**
 * Componente que renderiza el formato oficial EDUCA-FT-093-JINEN-V03 para impresión.
 * Réplica EXACTA del documento institucional basado en imagen de referencia.
 */
export function PrintProposalV03({ project }: PrintProposalV03Props) {
  return (
    <div className="hidden print:block print:relative print:top-0 print:left-0 bg-white text-black font-sans leading-tight text-[9pt] w-full">
      <style jsx global>{`
        @media print {
          @page {
            size: letter;
            margin: 1.2cm;
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
            background-color: white !important;
          }
          body * {
            visibility: hidden;
          }
          #print-area-v03, #print-area-v03 * {
            visibility: visible;
          }
          #print-area-v03 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            display: block !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
          }
          td, th {
            border: 1px solid black !important;
            padding: 4px;
            vertical-align: middle;
            word-wrap: break-word;
          }
          .bg-header {
            background-color: #f3f4f6 !important;
            -webkit-print-color-adjust: exact;
          }
          .vertical-text {
            writing-mode: vertical-lr;
            transform: rotate(180deg);
            text-align: center;
            font-weight: bold;
            font-size: 8pt;
          }
          .text-center { text-align: center; }
          .font-bold { font-weight: bold; }
          .uppercase { text-transform: uppercase; }
        }
      `}</style>

      <div id="print-area-v03" className="w-full">
        {/* CABECERA TÉCNICA OFICIAL */}
        <table className="mb-2">
          <tbody>
            <tr>
              <td rowSpan={3} className="w-[18%] text-center">
                <div className="h-16 w-16 mx-auto">
                  <ENSUBLogo />
                </div>
              </td>
              <td colSpan={4} className="text-center font-bold text-[12pt] py-4">
                PROPUESTA DE TRABAJO DE GRADO
              </td>
            </tr>
            <tr className="text-[8pt]">
              <td colSpan={2} className="text-center"><span className="font-bold">Proceso:</span> Educación</td>
              <td colSpan={2} className="text-center"><span className="font-bold">Autoridad:</span> JINEN</td>
            </tr>
            <tr className="text-[8pt]">
              <td className="text-center"><span className="font-bold">Código:</span> EDUCA-FT-093-JINEN-V03</td>
              <td className="text-center"><span className="font-bold">Rige a partir de:</span> 01/06/2022</td>
              <td colSpan={2} className="text-center"><span className="font-bold">Página 1 de 5</span></td>
            </tr>
          </tbody>
        </table>

        {/* 1. IDENTIFICACIÓN - BLOQUE SUPERIOR */}
        <table className="mb-0">
          <thead>
            <tr className="bg-header font-bold text-center text-[8pt]">
              <td className="w-[45%]">FACULTAD</td>
              <td className="w-[45%]">PROGRAMA</td>
              <td className="w-[10%]">CURSO</td>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center h-10">
              <td className="uppercase">{project.facultad}</td>
              <td className="uppercase">{project.programa}</td>
              <td>{project.curso}</td>
            </tr>
            <tr className="bg-header font-bold text-center text-[8pt]">
              <td>LÍNEA DE INVESTIGACIÓN</td>
              <td colSpan={2}>SUBLÍNEA</td>
            </tr>
            <tr className="text-center h-10">
              <td>{project.researchLine}</td>
              <td colSpan={2}>{project.researchSubLine}</td>
            </tr>
          </tbody>
        </table>

        {/* PROPONENTES COMPARATIVOS */}
        <table className="mb-0">
          <thead>
            <tr className="bg-header font-bold text-center text-[8pt]">
              <td className="w-[50%]">NOMBRE COMPLETO PROPONENTE 1</td>
              <td className="w-[50%]">NOMBRE COMPLETO PROPONENTE 2</td>
            </tr>
          </thead>
          <tbody>
            <tr className="h-8">
              <td className="uppercase font-bold">{project.proponent1Name}</td>
              <td className="uppercase font-bold">{project.proponent2Name || "N/A"}</td>
            </tr>
            <tr className="h-8">
              <td><span className="font-bold">C.C:</span> {project.proponent1Id}</td>
              <td><span className="font-bold">C.C:</span> {project.proponent2Id || "N/A"}</td>
            </tr>
            <tr className="h-8">
              <td><span className="font-bold">Correo Electrónico:</span> {project.proponent1Email}</td>
              <td><span className="font-bold">Correo Electrónico:</span> {project.proponent2Email || "N/A"}</td>
            </tr>
            <tr className="h-8">
              <td><span className="font-bold">Número Celular:</span> {project.proponent1Phone}</td>
              <td><span className="font-bold">Número Celular:</span> {project.proponent2Phone || "N/A"}</td>
            </tr>
          </tbody>
        </table>

        {/* DIRECTOR Y FIRMA */}
        <table className="mb-0">
          <thead>
            <tr className="bg-header font-bold text-center text-[8pt]">
              <td className="w-[50%]">NOMBRE COMPLETO DIRECTOR PROPUESTO</td>
              <td className="w-[50%]">FIRMA DIRECTOR PROPUESTO</td>
            </tr>
          </thead>
          <tbody>
            <tr className="h-12">
              <td className="uppercase text-center font-bold">{project.proposedDirectorName}</td>
              <td className="text-center italic text-gray-400">
                {project.directorSignature ? project.directorSignature : ""}
              </td>
            </tr>
          </tbody>
        </table>

        {/* FECHA DE ENTREGA */}
        <table className="mb-4">
          <tbody>
            <tr className="h-10">
              <td className="w-[30%] bg-header font-bold">FECHA DE ENTREGA</td>
              <td className="w-[10%] bg-header font-bold text-center text-[8pt]">DÍA</td>
              <td className="w-[10%] text-center font-bold">{project.deliveryDay}</td>
              <td className="w-[10%] bg-header font-bold text-center text-[8pt]">MES</td>
              <td className="w-[20%] text-center font-bold uppercase">{project.deliveryMonth}</td>
              <td className="w-[10%] bg-header font-bold text-center text-[8pt]">AÑO</td>
              <td className="w-[10%] text-center font-bold">{project.deliveryYear}</td>
            </tr>
          </tbody>
        </table>

        {/* SECCIÓN ACADÉMICA - TÍTULO */}
        <table className="mb-0">
          <tbody>
            <tr>
              <td className="w-[25%] bg-header font-bold text-[8pt] text-center p-4">
                TÍTULO PRELIMINAR DE LA PROPUESTA
              </td>
              <td className="p-4 text-justify leading-relaxed font-bold uppercase">
                {project.title}
              </td>
            </tr>
          </tbody>
        </table>

        {/* SECCIÓN ACADÉMICA - PLANTEAMIENTO */}
        <table className="mb-2">
          <tbody>
            <tr>
              <td rowSpan={2} className="w-[8%] text-center font-bold bg-header p-0">
                <div className="vertical-text mx-auto">
                  PLANTEAMIENTO DEL PROBLEMA
                </div>
              </td>
              <td className="w-[17%] bg-header font-bold text-[8pt] text-center">
                DESCRIPCIÓN DEL PROBLEMA
              </td>
              <td className="p-4 text-justify text-[9pt] leading-normal whitespace-pre-wrap">
                {project.problemStatement}
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="p-4">
                <div className="font-bold text-[8pt] mb-2">FORMULACIÓN DEL PROBLEMA:</div>
                <div className="italic font-bold">"{project.problemFormulation}"</div>
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="bg-header font-bold text-[8pt] text-center">JUSTIFICACIÓN</td>
              <td className="p-4 text-justify text-[9pt] leading-normal whitespace-pre-wrap">{project.justification}</td>
            </tr>
          </tbody>
        </table>

        {/* OBJETIVOS */}
        <table className="mb-2">
          <tbody>
            <tr>
              <td colSpan={2} className="bg-header font-bold text-[10pt] text-center uppercase py-1">3. OBJETIVOS</td>
            </tr>
            <tr>
              <td className="w-[25%] bg-header font-bold text-[8pt] text-center">OBJETIVO GENERAL</td>
              <td className="p-4 font-bold">{project.generalObjective}</td>
            </tr>
            <tr>
              <td className="w-[25%] bg-header font-bold text-[8pt] text-center">OBJETIVOS ESPECÍFICOS</td>
              <td className="p-4 whitespace-pre-wrap leading-relaxed">{project.specificObjectives}</td>
            </tr>
          </tbody>
        </table>

        {/* METODOLOGÍA Y RESULTADOS */}
        <table className="mb-2">
          <tbody>
            <tr>
              <td colSpan={2} className="bg-header font-bold text-[10pt] text-center uppercase py-1">4. DISEÑO METODOLÓGICO Y RESULTADOS</td>
            </tr>
            <tr>
              <td className="w-[25%] bg-header font-bold text-[8pt] text-center">DISEÑO METODOLÓGICO</td>
              <td className="p-4 text-justify whitespace-pre-wrap">{project.methodology}</td>
            </tr>
            <tr>
              <td className="w-[25%] bg-header font-bold text-[8pt] text-center">RESULTADOS ESPERADOS</td>
              <td className="p-4 text-justify whitespace-pre-wrap">{project.expectedResults}</td>
            </tr>
          </tbody>
        </table>

        {/* BIBLIOGRAFÍA */}
        <table className="mb-10">
          <tbody>
            <tr>
              <td className="bg-header font-bold text-[10pt] text-center uppercase py-1">5. REFERENCIAS BIBLIOGRÁFICAS</td>
            </tr>
            <tr>
              <td className="p-4 font-mono text-[8pt] leading-tight whitespace-pre-wrap">
                {project.bibliography || "No se han registrado referencias."}
              </td>
            </tr>
          </tbody>
        </table>

        {/* BLOQUE DE FIRMAS FINALES */}
        <div className="mt-20 flex justify-between px-10 page-break-inside-avoid">
          <div className="text-center w-[40%]">
            <div className="border-t border-black pt-1">
              <p className="font-bold uppercase mb-0">{project.proponent1Name}</p>
              <p className="text-[7pt] font-bold uppercase">Proponente 1</p>
            </div>
          </div>
          <div className="text-center w-[40%]">
            <div className="border-t border-black pt-1">
              <p className="font-bold uppercase mb-0">{project.proponent2Name || "_________________________"}</p>
              <p className="text-[7pt] font-bold uppercase">Proponente 2</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
