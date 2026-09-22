"use client";

import { useState, useEffect } from "react";
import { DegreeProject } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  FileText,
  Languages,
  Users,
  AlignLeft,
  Microscope,
  BarChart2,
  CheckSquare,
  BookMarked,
  Info,
  Save,
  Loader2,
  Printer,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  Target,
  Layers,
  FlaskConical,
  AreaChart,
  CheckCircle2,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── tipos de campo para cada sección ───────────────────────────────────────

interface ArticleField {
  key: keyof DegreeProject;
  label: string;
  placeholder: string;
  hint: string;         // instrucción visible al lado del textarea
  minH: string;         // min-height tailwind class
  icon: React.ReactNode;
}

// ─── configuración de secciones ─────────────────────────────────────────────

const SECTIONS: {
  id: string;
  num: string;
  title: string;
  color: string;
  borderColor: string;
  bgHeader: string;
  icon: React.ReactNode;
  required: boolean;
  fields: ArticleField[];
}[] = [
  {
    id: "cabecera",
    num: "",
    title: "Cabecera del Artículo",
    color: "text-primary",
    borderColor: "border-primary",
    bgHeader: "bg-primary text-white",
    icon: <GraduationCap className="h-5 w-5" />,
    required: true,
    fields: [
      {
        key: "articleTitle",
        label: "Título (Español)",
        placeholder: "TÍTULO DEL ARTÍCULO EN MAYÚSCULAS",
        hint: "El título debe ser claro, conciso y reflejar el contenido principal. Se escribe en mayúsculas sostenidas.",
        minH: "min-h-[60px]",
        icon: <FileText className="h-4 w-4" />,
      },
      {
        key: "articleTitleEn",
        label: "Title (English)",
        placeholder: "TITLE IN ENGLISH",
        hint: "Traducción exacta y fiel al inglés del título en español.",
        minH: "min-h-[60px]",
        icon: <Languages className="h-4 w-4" />,
      },
      {
        key: "articleAuthors",
        label: "Autor(es): GN¹, GN",
        placeholder: "Ej: García Martínez, A.¹, Rodríguez López, B.",
        hint: "Usa el formato Apellido, Inicial. Agrega superíndice ¹ para identificar la afiliación en la nota al pie. Separa con coma si hay más de un autor.",
        minH: "min-h-[60px]",
        icon: <Users className="h-4 w-4" />,
      },
      {
        key: "articleAffiliation",
        label: "1. Afiliación Institucional (Nota al pie)",
        placeholder: "Pregrado, Escuela Naval de Suboficiales \u201cARC BARRANQUILLA\u201d, ENSUB; Facultad de XXXXX, Grupo de Investigaci\u00f3n XXXXX, Barranquilla, Colombia; email@ensub.edu.co (CORREO ELECTR\u00d3NICO)",
        hint: "Incluye: Programa académico, Institución completa, Facultad, Grupo de Investigación, Ciudad, País y correo electrónico institucional.",
        minH: "min-h-[90px]",
        icon: <Info className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "resumen",
    num: "",
    title: "Resumen / Abstract",
    color: "text-blue-700",
    borderColor: "border-blue-500",
    bgHeader: "bg-blue-700 text-white",
    icon: <AlignLeft className="h-5 w-5" />,
    required: true,
    fields: [
      {
        key: "articleResumen",
        label: "Resumen (150-250 palabras MÁXIMO)",
        placeholder: `Redacta el resumen siguiendo esta estructura:

Problema o Necesidad Identificada: Enunciar brevemente el problema o necesidad que se aborda.
Objetivo Principal: Enunciar claramente cuál fue el propósito del proyecto (e.g., diseñar, desarrollar, implementar, evaluar).
Metodología: Describir de manera concisa cómo se llevó a cabo (e.g., "Se desarrolló un prototipo usando Arduino y sensores de humedad...", "Se implementó un algoritmo de clasificación usando Python y la biblioteca Scikit-learn...").
Resultado/Solución más Relevante: Mencionar el producto principal obtenido (e.g., "El resultado fue un sistema funcional que...", "Se logró una precisión del 95% en la detección de...").
Conclusión Principal o Impacto: Destacar la contribución, ventaja o impacto del proyecto desarrollado.`,
        hint: "Es un texto breve y autocontenido que presenta una síntesis de todo el proyecto. Permite al lector evaluar rápidamente la relevancia del trabajo. MÁXIMO 250 palabras.",
        minH: "min-h-[220px]",
        icon: <AlignLeft className="h-4 w-4" />,
      },
      {
        key: "articleAbstract",
        label: "Abstract (traducción fiel al inglés)",
        placeholder: "Is the faithful and complete translation of the Resumen into English. It must maintain the same structure and convey the same information with technical precision...",
        hint: "Es la traducción fiel y completa del Resumen al inglés. Debe mantener la misma estructura y transmitir la misma información con precisión técnica.",
        minH: "min-h-[220px]",
        icon: <Languages className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "introduccion",
    num: "1.",
    title: "Introducción",
    color: "text-indigo-700",
    borderColor: "border-indigo-500",
    bgHeader: "bg-indigo-700 text-white",
    icon: <BookOpen className="h-5 w-5" />,
    required: true,
    fields: [
      {
        key: "articleIntroduccion",
        label: "1. Introducción",
        placeholder: `Redacta la introducción incluyendo los siguientes elementos:

CONTEXTO Y PLANTEAMIENTO DEL PROBLEMA:
Situar el tema en un área específica y describir el problema o necesidad concreta que se va a solucionar.

JUSTIFICACIÓN:
Explicar la relevancia y pertinencia del proyecto. ¿Por qué es útil o necesario desarrollar esta solución?

OBJETIVO GENERAL:
La meta global del proyecto (e.g., "Diseñar e implementar un sistema de monitorización remota para...").

OBJETIVOS ESPECÍFICOS:
Pasos detallados y medibles para alcanzar el objetivo general (e.g., "Investigar el estado del arte de...", "Seleccionar los sensores y actuadores...", "Programar el firmware del microcontrolador...", "Validar el funcionamiento del sistema mediante...").

ENFOQUE (Aplicado o Desarrollo Tecnológico):
Especifique si el fin es crear un producto, proceso o servicio (un prototipo, un software, un sistema), no solo generar conocimiento teórico. Mencione si es experimental o descriptivo.

FASES O ETAPAS DEL PROYECTO:
Desglose el proyecto en etapas claras:
• Fase 1: Investigación y Análisis
• Fase 2: Diseño (arquitectura, diagramas de bloques, circuitos, flujos UI/UX)
• Fase 3: Implementación/Construcción
• Fase 4: Pruebas y Validación`,
        hint: "Esta sección prepara al lector, proporcionando el contexto, la justificación y los objetivos del proyecto. Responde a las preguntas: ¿Qué se hizo?, ¿Por qué es importante? y ¿Cuáles son los objetivos?",
        minH: "min-h-[500px]",
        icon: <Lightbulb className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "metodologia",
    num: "2.",
    title: "Metodología",
    color: "text-purple-700",
    borderColor: "border-purple-500",
    bgHeader: "bg-purple-700 text-white",
    icon: <FlaskConical className="h-5 w-5" />,
    required: true,
    fields: [
      {
        key: "articleMetodologia",
        label: "2. Metodología",
        placeholder: `Describe la metodología utilizada incluyendo:

TIPO DE INVESTIGACIÓN/DESARROLLO:
Especifique el enfoque: Aplicado o de Desarrollo Tecnológico. Aclare que el fin es crear un producto, proceso o servicio (un prototipo, un software, un sistema), no solo generar conocimiento teórico.

Puede mencionar si es experimental (se construye y prueba un prototipo), descriptivo (se caracteriza el funcionamiento de un sistema) o basado en diseño y construcción.

DISEÑO EXPERIMENTAL (si aplica):
Si se realizaron experimentos para validar el desempeño, describe las variables (independiente, dependiente, de control), cómo se midieron y el número de réplicas o pruebas realizadas.

DATOS CUANTITATIVOS:
Presentar métricas y resultados de las pruebas realizadas (e.g., "El sistema respondió en un promedio de 2.3 segundos", "La eficiencia energética mejoró en un 15%").`,
        hint: "Esta sección describe de forma precisa, detallada y secuencial el proceso, técnicas, herramientas y materiales utilizados para desarrollar el proyecto y alcanzar los objetivos.",
        minH: "min-h-[400px]",
        icon: <Microscope className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "resultados",
    num: "3.",
    title: "Resultados",
    color: "text-emerald-700",
    borderColor: "border-emerald-500",
    bgHeader: "bg-emerald-700 text-white",
    icon: <AreaChart className="h-5 w-5" />,
    required: true,
    fields: [
      {
        key: "articleResultados",
        label: "3. Resultados",
        placeholder: `Presenta los resultados siguiendo estas pautas:

PRESENTACIÓN OBJETIVA Y ORDENADA:
Mostrar los datos, gráficos, diagramas, prototipos y desempeño del sistema desarrollado. Presentar sin interpretar ni opinar sobre ellos. Se muestran los frutos del trabajo de desarrollo.

FIGURAS Y TABLAS:
Incluir diagramas de circuito, esquemáticos, gráficos de desempeño, capturas de pantalla de la interfaz de usuario, fotografías del prototipo físico. Todas deben estar numeradas y con un título descriptivo.

DESCRIPCIÓN DE FIGURAS/TABLAS:
Explicar brevemente qué se muestra en cada elemento visual (e.g., "La Figura 1 muestra el diagrama de bloques del sistema...", "La Tabla 1 presenta los resultados de las pruebas de respuesta del sensor...").

DATOS CUANTITATIVOS:
Presentar métricas y resultados de las pruebas realizadas (e.g., "El sistema respondió en un promedio de 2.3 segundos", "La eficiencia energética mejoró en un 15%").`,
        hint: "Sección central donde se presentan los hallazgos y productos obtenidos del proyecto, sin interpretarlos ni opinar sobre ellos. Se muestran los frutos del trabajo de desarrollo.",
        minH: "min-h-[400px]",
        icon: <BarChart2 className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "conclusiones",
    num: "4.",
    title: "Conclusiones",
    color: "text-amber-700",
    borderColor: "border-amber-500",
    bgHeader: "bg-amber-700 text-white",
    icon: <Target className="h-5 w-5" />,
    required: true,
    fields: [
      {
        key: "articleConclusiones",
        label: "4. Conclusiones",
        placeholder: `Redacta las conclusiones incluyendo:

• Respuesta a los objetivos: ¿Se lograron los objetivos planteados? Explicar cómo.
• Hallazgos principales: ¿Qué se encontró o desarrolló que sea significativo?
• Limitaciones del proyecto: ¿Qué restricciones tuvo el trabajo? ¿Qué no se pudo hacer?
• Trabajos futuros: ¿Qué mejoras o líneas de investigación se proponen?
• Recomendaciones: Sugerencias para quienes continúen o implementen el sistema.`,
        hint: "Es el cierre del artículo, donde se interpretan los resultados, se responde a los objetivos planteados y se reflexiona sobre el alcance y las limitaciones del proyecto. Debe incluir: Respuesta a los objetivos, hallazgos principales, limitaciones, trabajos futuros, recomendaciones.",
        minH: "min-h-[300px]",
        icon: <CheckSquare className="h-4 w-4" />,
      },
    ],
  },
  {
    id: "bibliografia",
    num: "5.",
    title: "Bibliografía",
    color: "text-rose-700",
    borderColor: "border-rose-500",
    bgHeader: "bg-rose-700 text-white",
    icon: <BookMarked className="h-5 w-5" />,
    required: true,
    fields: [
      {
        key: "articleBibliografia",
        label: "5. Bibliografía — FORMATO APA",
        placeholder: `Lista todas las fuentes en formato APA. Prioriza fuentes recientes (últimos 5-10 años):

Ejemplo libro:
Apellido, A. A. (Año). Título del libro. Editorial.

Ejemplo artículo de revista:
Apellido, A. A., & Apellido, B. B. (Año). Título del artículo. Nombre de la Revista, volumen(número), páginas. https://doi.org/xxxxx

Ejemplo página web:
Apellido, A. A. (Año, Mes Día). Título de la página. Nombre del sitio web. URL

Debe incluir todos los datos necesarios para localizar la fuente: autor(es), año de publicación, título, editorial, DOI (si está disponible).`,
        hint: "Lista de todas las fuentes de información consultadas y citadas en el documento en FORMATO APA. Debe incluir todos los datos necesarios para localizar la fuente. Priorizar fuentes recientes (últimos 5-10 años) para demostrar conocimiento del estado actual de la tecnología.",
        minH: "min-h-[350px]",
        icon: <BookMarked className="h-4 w-4" />,
      },
    ],
  },
];

// ─── completion score helper ──────────────────────────────────────────────────

function getCompletionScore(form: Partial<DegreeProject>) {
  const allKeys: (keyof DegreeProject)[] = [
    "articleTitle", "articleTitleEn", "articleAuthors", "articleAffiliation",
    "articleResumen", "articleAbstract", "articleIntroduccion",
    "articleMetodologia", "articleResultados", "articleConclusiones", "articleBibliografia"
  ];
  const filled = allKeys.filter(k => form[k] && String(form[k]).trim().length > 30).length;
  return Math.round((filled / allKeys.length) * 100);
}

// ─── component ───────────────────────────────────────────────────────────────

interface ArticuloCientificoProps {
  project: DegreeProject;
  canEdit: boolean;
  onSave: (data: Partial<DegreeProject>) => Promise<void>;
  isSaving: boolean;
  /** When true the component renders in "audit/readonly" mode with tighter layout */
  auditMode?: boolean;
}

export function ArticuloCientifico({
  project,
  canEdit,
  onSave,
  isSaving,
  auditMode = false,
}: ArticuloCientificoProps) {
  const [form, setForm] = useState<Partial<DegreeProject>>({});
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(
    Object.fromEntries(SECTIONS.map(s => [s.id, true]))
  );
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    setForm({
      articleTitle: project.articleTitle || "",
      articleTitleEn: project.articleTitleEn || "",
      articleAuthors: project.articleAuthors || `${project.proponent1Name || ""}${project.proponent2Name ? ", " + project.proponent2Name : ""}`,
      articleAffiliation: project.articleAffiliation || `Pregrado, Escuela Naval de Suboficiales "ARC BARRANQUILLA", ENSUB; Facultad de ${project.facultad || "XXXXX"}, Barranquilla, Colombia; ${project.proponent1Email || ""}`,
      articleResumen: project.articleResumen || "",
      articleAbstract: project.articleAbstract || "",
      articleIntroduccion: project.articleIntroduccion || "",
      articleMetodologia: project.articleMetodologia || "",
      articleResultados: project.articleResultados || "",
      articleConclusiones: project.articleConclusiones || "",
      articleBibliografia: project.articleBibliografia || "",
    });
  }, [project]);

  const toggleSection = (id: string) =>
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));

  const score = getCompletionScore(form);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 200);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* ── Banner superior ────────────────────────────────────────── */}
      <div className="bg-slate-900 p-8 rounded-[2rem] text-white shadow-lg relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-rose-500/10 opacity-40" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-white/10 rounded-2xl border border-white/20">
              <Microscope className="h-10 w-10 text-rose-300" />
            </div>
            <div>
              <p className="text-[10px] text-rose-300 font-black uppercase tracking-widest mb-1">
                Escuela Naval "ARC BARRANQUILLA" · ENSUB
              </p>
              <h2 className="text-2xl font-black uppercase tracking-tight">
                Artículo Científico
              </h2>
              <p className="text-[11px] text-white/60 font-semibold mt-1">
                Formato oficial ENSUB — Trabajo de Grado
              </p>
            </div>
          </div>

          {/* Progreso y acciones */}
          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-4 bg-white/10 rounded-2xl px-5 py-3 border border-white/10">
              <div className="text-right">
                <p className="text-[8px] text-white/50 font-black uppercase tracking-widest">Integridad</p>
                <p className="text-2xl font-black text-white">{score}%</p>
              </div>
              <div className="w-24">
                <Progress value={score} className="h-2 bg-white/20" />
              </div>
            </div>
            {!auditMode && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrint}
                  disabled={isPrinting}
                  className="rounded-full gap-2 text-[10px] font-black uppercase bg-white/10 text-white border-white/20 hover:bg-white/20"
                >
                  <Printer className="h-3.5 w-3.5" /> Imprimir
                </Button>
                {canEdit && (
                  <Button
                    size="sm"
                    onClick={() => onSave(form)}
                    disabled={isSaving}
                    className="rounded-full gap-2 text-[10px] font-black uppercase bg-rose-500 hover:bg-rose-600 shadow-lg"
                  >
                    {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                    Guardar Artículo
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Instrucción general ────────────────────────────────────── */}
      {!auditMode && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <Lightbulb className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-black text-amber-800 uppercase tracking-tight">Instrucciones de Diligenciamiento</p>
            <p className="text-xs text-amber-700 font-medium mt-1 leading-relaxed">
              Completa cada sección siguiendo las indicaciones en azul junto a cada campo. Los campos se autocompletarán
              con datos del proyecto cuando estén disponibles. Guarda frecuentemente con el botón <strong>"Guardar Artículo"</strong>.
              El artículo puede imprimirse en cualquier momento con el botón <strong>"Imprimir"</strong>.
            </p>
          </div>
        </div>
      )}

      {/* ── Secciones ─────────────────────────────────────────────── */}
      {SECTIONS.map((section) => (
        <Card
          key={section.id}
          className={cn(
            "border-none shadow-sm rounded-2xl overflow-hidden",
            `border-l-4 ${section.borderColor}`
          )}
        >
          {/* Cabecera de sección colapsable */}
          <button
            type="button"
            onClick={() => toggleSection(section.id)}
            className={cn(
              "w-full flex items-center justify-between p-5 text-left transition-colors",
              section.bgHeader,
              "hover:opacity-90"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white/20 rounded-lg">
                {section.icon}
              </div>
              <div>
                <span className="text-xs font-black uppercase tracking-widest opacity-70">
                  {section.num && `Sección ${section.num}`}
                </span>
                <h3 className="text-sm font-black uppercase tracking-tight">
                  {section.num} {section.title}
                </h3>
              </div>
            </div>
            {openSections[section.id]
              ? <ChevronUp className="h-4 w-4 opacity-70" />
              : <ChevronDown className="h-4 w-4 opacity-70" />
            }
          </button>

          {/* Contenido de la sección */}
          {openSections[section.id] && (
            <CardContent className="p-0">
              {section.fields.map((field, fi) => (
                <div
                  key={String(field.key)}
                  className={cn(
                    "p-6 space-y-3",
                    fi < section.fields.length - 1 && "border-b border-slate-100"
                  )}
                >
                  {/* Label */}
                  <div className="flex items-center gap-2">
                    <span className={section.color}>{field.icon}</span>
                    <Label className={cn("text-[11px] font-black uppercase tracking-tight", section.color)}>
                      {field.label}
                    </Label>
                    {form[field.key] && String(form[field.key]).trim().length > 30 && (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 ml-auto" />
                    )}
                  </div>

                  {/* Indicación / Hint */}
                  <div className="flex items-start gap-2.5 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                    <Info className="h-3.5 w-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                      {field.hint}
                    </p>
                  </div>

                  {/* Textarea */}
                  <Textarea
                    disabled={!canEdit || auditMode}
                    value={String(form[field.key] ?? "")}
                    onChange={(e) => setForm(prev => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className={cn(
                      field.minH,
                      "bg-slate-50/70 border-slate-200 text-sm leading-relaxed focus:ring-primary resize-y font-mono",
                      !canEdit && "cursor-default opacity-80"
                    )}
                  />

                  {/* Contador de palabras */}
                  {!auditMode && (
                    <p className="text-[9px] text-slate-400 font-bold text-right">
                      {String(form[field.key] ?? "").trim().split(/\s+/).filter(Boolean).length} palabras
                    </p>
                  )}
                </div>
              ))}
            </CardContent>
          )}
        </Card>
      ))}

      {/* ── Vista previa estructural del artículo ─────────────────── */}
      {!auditMode && score > 0 && (
        <Card className="border-none shadow-sm rounded-2xl bg-white overflow-hidden">
          <CardHeader className="bg-slate-50 border-b p-6">
            <CardTitle className="text-sm font-black uppercase text-primary flex items-center gap-2">
              <Layers className="h-4 w-4" /> Vista Previa — Estructura del Artículo
            </CardTitle>
            <CardDescription>
              Resumen visual de los nodos completados en el artículo científico.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[
                { key: "articleTitle", label: "Título (ES)", icon: <FileText className="h-3.5 w-3.5" /> },
                { key: "articleTitleEn", label: "Title (EN)", icon: <Languages className="h-3.5 w-3.5" /> },
                { key: "articleAuthors", label: "Autores", icon: <Users className="h-3.5 w-3.5" /> },
                { key: "articleAffiliation", label: "Afiliación", icon: <Info className="h-3.5 w-3.5" /> },
                { key: "articleResumen", label: "Resumen", icon: <AlignLeft className="h-3.5 w-3.5" /> },
                { key: "articleAbstract", label: "Abstract", icon: <Languages className="h-3.5 w-3.5" /> },
                { key: "articleIntroduccion", label: "1. Introducción", icon: <BookOpen className="h-3.5 w-3.5" /> },
                { key: "articleMetodologia", label: "2. Metodología", icon: <FlaskConical className="h-3.5 w-3.5" /> },
                { key: "articleResultados", label: "3. Resultados", icon: <BarChart2 className="h-3.5 w-3.5" /> },
                { key: "articleConclusiones", label: "4. Conclusiones", icon: <CheckSquare className="h-3.5 w-3.5" /> },
                { key: "articleBibliografia", label: "5. Bibliografía", icon: <BookMarked className="h-3.5 w-3.5" /> },
              ].map(({ key, label, icon }) => {
                const done = form[key as keyof DegreeProject] && String(form[key as keyof DegreeProject]).trim().length > 30;
                return (
                  <div
                    key={key}
                    className={cn(
                      "flex items-center gap-2.5 p-3 rounded-xl border transition-all text-[10px] font-black uppercase tracking-tight",
                      done
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    )}
                  >
                    <div className={cn("shrink-0", done ? "text-emerald-500" : "text-slate-300")}>
                      {done ? <CheckCircle2 className="h-4 w-4" /> : icon}
                    </div>
                    <span className="truncate">{label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
