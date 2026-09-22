
"use client";

import { useState, useEffect, useMemo } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, doc, setDoc, getDoc, getDocs, updateDoc, query, where, addDoc } from "firebase/firestore";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Send, Loader2, CheckCircle2, Clock, Save, TrendingUp, ClipboardCheck, XCircle, Calendar } from "lucide-react";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { DegreeProject } from "@/lib/types";
import { useLanguage } from "@/context/language-context";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { recordAuditLog } from "@/lib/audit";

const SPECIALTIES = [
  "Tecnología Naval en Hidrografía",
  "Tecnología Naval en Oceanografía Física",
  "Tecnología Naviera",
  "Tecnología Naval en Mantenimiento Aeronaval",
  "Tecnología Naval en Electrónica",
  "Tecnología Naval en Electromecánica",
  "Tecnología Naval en Administración Marítima",
  "Tecnología en Sanidad Naval"
];

// Estructura: grupo → área → línea → sublíneas
const ALL_GROUPS_DATA: Record<string, Record<string, Record<string, string[]>>> = {

  "Grupo de Investigación Tridente": {
    "GESTIÓN INSTITUCIONAL": {
      "SEGURIDAD Y DEFENSA": [
        "DEFENSA NACIONAL",
        "SEGURIDAD NACIONAL",
        "INTERESES MARÍTIMOS Y FLUVIALES",
        "SEGURIDAD INTEGRAL MARÍTIMA Y FLUVIAL",
        "CIBERSEGURIDAD",
        "CIBERDEFENSA",
        "PROYECCIÓN INTERNACIONALES",
        "VIGILANCIA TECNOLÓGICA"
      ],
      "SOCIEDAD Y DESARROLLO": [
        "LIDERAZGO",
        "ÉTICA Y VALORES",
        "POLÍTICAS PUBLICAS",
        "ANÁLISIS DE CONFLICTOS",
        "FENÓMENOS CRIMINALES",
        "ESTUDIOS DE PAZ",
        "HISTORIA Y SOCIOLOGÍA MILITAR",
        "DESARROLLO SOSTENIBLE",
        "TRANSPORTE Y COMERCIO MARÍTIMO",
        "DOCTRINA"
      ],
      "PROCESOS ESTRATÉGICOS": [
        "PLANEAMIENTO INSTITUCIONAL",
        "DIRECCIONAMIENTO ESTRATÉGICO",
        "COMUNICACIONES ESTRATÉGICAS",
        "GESTIÓN DE PROYECTOS"
      ],
      "PROCESOS MISIONALES": [
        "OPERACIONES NAVALES",
        "INTELIGENCIA Y CONTRAINTELIGENCIA NAVAL",
        "ACCIÓN INTEGRAL"
      ],
      "PROCESOS DE APOYO": [
        "EDUCACIÓN",
        "BIENESTAR",
        "SERVICIOS DE APOYO",
        "MANTENIMIENTO",
        "GESTIÓN DE ACTIVOS",
        "ADMINISTRACIÓN DEL TALENTO HUMANO",
        "TELEMÁTICA",
        "ABASTECIMIENTOS",
        "ADQUISICIONES",
        "FINANZAS",
        "GESTIÓN JURÍDICA INTEGRAL",
        "DERECHO OPERACIONAL",
        "EDUCACIÓN\u200B"
      ],
      "SANIDAD NAVAL": [
        "SEGURIDAD Y SALUD EN EL TRABAJO",
        "SEGURIDAD DEL PACIENTE",
        "ATENCIÓN PREHOSPITALARIA",
        "SALUD CARDIOVASCULAR",
        "SALUD PÚBLICA",
        "SALUD MENTAL",
        "ADMINISTRACIÓN DE SERVICIOS DE SALUD"
      ],
      "PROCESO DE EVALUACIÓN": [
        "EVALUACIÓN INDEPENDIENTE"
      ],
      "PROCESOS DOCTRINALES": [
        "DOCTRINA"
      ]
    }
  },

  "Grupo de Investigación Trirreme": {
    "CIENCIAS MARÍTIMAS, FLUVIALES, OCEANOGRÁFICAS, HIDROGRÁFICAS Y AMBIENTALES": {
      "CIENCIAS MARÍTIMAS, FLUVIALES, OCEANOGRÁFICAS E HIDROGRÁFICAS": [
        "OCEANOGRAFÍA TÁCTICA Y OPERACIONAL",
        "HIDROGRAFÍA",
        "HIDROACÚSTICA",
        "METEOROLOGÍA",
        "GEOMORFOLOGÍA, GEOLOGÍA Y GEO FÍSICA MARINA",
        "INSTRUMENTACIÓN OCEANOGRÁFICA Y FLUVIAL",
        "SISTEMAS DE SENSORES REMOTOS",
        "GESTIÓN DEL RIESGO DE DESASTRES EN ZONAS COSTERAS",
        "MANEJO INTEGRADO DE ZONAS COSTERAS"
      ],
      "MEDIO AMBIENTE, RECURSOS MARINOS, COSTEROS Y FLUVIALES": [
        "MONITOREO, VIGILANCIA Y CONTROL MEDIOAMBIENTAL",
        "DESARROLLO SOSTENIBLE",
        "CAMBIO CLIMÁTICO",
        "EDUCACIÓN AMBIENTAL",
        "REHABILITACIÓN Y RESTAURACIÓN DE ECOSISTEMAS",
        "DESARROLLO MARÍTIMO Y FLUVIAL",
        "GESTIÓN AMBIENTAL",
        "ENERGÍAS ALTERNATIVAS"
      ],
      "PROCESOS DOCTRINALES": [
        "DOCTRINA"
      ]
    },
    "GESTIÓN INSTITUCIONAL": {
      "SEGURIDAD Y DEFENSA": [
        "DEFENSA NACIONAL",
        "SEGURIDAD NACIONAL",
        "INTERESES MARÍTIMOS Y FLUVIALES",
        "SEGURIDAD INTEGRAL MARÍTIMA Y FLUVIAL",
        "CIBERSEGURIDAD",
        "CIBERDEFENSA",
        "PROYECCIÓN INTERNACIONAL",
        "VIGILANCIA TECNOLÓGICA"
      ],
      "SOCIEDAD Y DESARROLLO": [
        "LIDERAZGO",
        "ÉTICA Y LABORES",
        "POLÍTICAS PÚBLICAS",
        "ANÁLISIS DE CONFLICTOS",
        "FENÓMENOS CRIMINALES",
        "ESTUDIOS DE PAZ",
        "HISTORIA SOCIOLOGÍA MILITAR",
        "DESARROLLO SOSTENIBLE",
        "TRANSPORTE Y COMERCIO MARÍTIMO",
        "DOCTRINA"
      ],
      "PROCESOS ESTRATÉGICOS": [
        "PLANEAMIENTO INSTITUCIONAL",
        "DIRECCIONAMIENTO ESTRATÉGICO",
        "COMUNICACIONES ESTRATÉGICAS",
        "GESTIÓN DE PROYECTOS"
      ],
      "PROCESOS MISIONALES": [
        "OPERACIONES NAVALES",
        "INTELIGENCIA Y CONTRAINTELIGENCIA NAVAL",
        "ACCIÓN INTEGRAL"
      ],
      "PROCESOS APOYO": [
        "EDUCACIÓN",
        "BIENESTAR",
        "SERVICIOS DE APOYO",
        "MANTENIMIENTO",
        "GESTIÓN DE ACTIVOS",
        "ADMINISTRACIÓN DE TALENTO HUMANO",
        "TELEMÁTICA",
        "ABASTECIMIENTOS",
        "ADQUISICIONES",
        "FINANZAS",
        "GESTIÓN JURÍDICA INTEGRAL",
        "DERECHO OPERACIONAL",
        "EDUCACIÓN\u200B"
      ],
      "SANIDAD NAVAL": [
        "SEGURIDAD Y SALUD EN EL TRABAJO",
        "SEGURIDAD DEL PACIENTE",
        "ATENCIÓN PRE HOSPITALARIA",
        "SALUD CARDIO VASCULAR",
        "SALUD PÚBLICA",
        "SALUD MENTAL",
        "ADMINISTRACIÓN DE SERVICIOS DE SALUD"
      ],
      "PROCESO DE EVALUACIÓN": [
        "EVALUACIÓN INDEPENDIENTE"
      ],
      "PROCESOS DOCTRINALES": [
        "DOCTRINA"
      ]
    },
    "INGENIERÍA": {
      "VEHÍCULOS NO TRIPULADOS": [
        "VEHÍCULOS NO TRIPULADOS UAV (UAV/USV/UUV)",
        "INTEGRACIÓN DE VEHÍCULOS NO TRIPULADOS EN LA PLATAFORMA DE SERVICIOS"
      ],
      "ENERGÍA": [
        "ENERGÍA NO CONVENCIONALES Y GESTIÓN EFICIENTE DE LA ENERGÍA",
        "SISTEMAS DE ALMACENAMIENTO DE ENERGÍA",
        "PROPULSIÓN MARINA HÍBRIDA Y ELÉCTRICA",
        "EFICIENCIA Y TRANSICIÓN ELÉCTRICA A BORDO"
      ],
      "SISTEMAS DE INFORMACIÓN Y COMUNICACIONES": [
        "COMUNICACIONES ACÚSTICAS Y ÓPTICAS EN EL MEDIO SUBMARINO",
        "COMUNICACIONES ÓPTICAS EN EL ESPACIO LIBRE ANTENAS DISPERSIVAS Y MÓDULOS RF"
      ],
      "SENSORES": [
        "SENSORES ELECTROÓPTICOS (E/SENSORES INFRARROJOS IR)",
        "SENSORES NAVALES",
        "INTEGRACIÓN Y REDES DE SENSORES"
      ],
      "SISTEMAS ELECTRÓNICOS": [
        "SISTEMAS EMBEBIDOS DISEÑO ELECTRÓNICO",
        "DISEÑO ELECTRÓNICO",
        "SISTEMAS DE RADAR",
        "SISTEMAS DE SONAR",
        "SISTEMAS DE GUERRA ELECTRÓNICA (EW/CARMA)"
      ],
      "SISTEMAS PARA LA FORMACIÓN Y ENTRENAMIENTO": [
        "ADIESTRAMIENTO AVANZADO MEDIANTE SIMULACIÓN",
        "INTROSPECCIÓN INTELIGENTE PARA SIMULADORES"
      ],
      "MANTENIMIENTO": [
        "INTELIGENCIA DE DATOS APLICADA AL MANTENIMIENTO PREDICTIVO DE LA PLATAFORMA"
      ],
      "BASES E INSTALACIONES": [
        "DISEÑO DE EDIFICACIONES INTELIGENTES Y EFICIENTES PARA BASES",
        "REDES DE SENSORES PARA PROTECCIÓN DE INSTALACIONES Y DESPLIEGUES TERRESTRES",
        "REDES DE SENSORES PARA LA PROTECCIÓN DE LAS ZONAS MARÍTIMAS"
      ],
      "PROTECCIÓN DE BASES E INSTALACIONES": [
        "CONTENER ARTEFACTOS EXPLOSIVOS IMPROVISADOS CONTROLADOS POR RF",
        "HERRAMIENTAS SUBACUÁTICAS",
        "SISTEMAS NEUMÁTICOS Y HIDRÁULICOS",
        "SISTEMAS DE CORTE Y SOLDADURA SUBACUÁTICA",
        "EQUIPOS SOPORTES DE VIDA PARA ACTIVIDADES SUBACUÁTICAS",
        "DOCTRINA OPERACIONAL SUBACUÁTICA",
        "ROBÓTICA SUBACUÁTICA",
        "EQUIPOS, CONTENEDORES Y GENERADORES DE GASES",
        "MEDICINA SUBACUÁTICA"
      ],
      "BUCEO": [
        "GEOFÍSICA, GEOTÉCNIA, SÍSMICA SUBACUÁTICA Y PROSPECCIÓN SUBACUÁTICA",
        "NAVEGACIÓN SUBACUÁTICA",
        "COMUNICACIONES SUBACUÁTICAS",
        "EQUIPOS E INFRAESTRUCTURA DE APOYO",
        "SISTEMAS DE DEFENSA SUBACUÁTICA",
        "SENSORES, NODOS E INTELIGENCIA ARTIFICIAL",
        "INSTALACIONES SUBACUÁTICAS PORTUARIAS",
        "DOCTRINA"
      ]
    }
  },

  "Grupo de Investigación Tritón": {
    "CIENCIAS MARÍTIMAS, FLUVIALES, OCEANOGRÁFICAS E HIDROGRÁFICAS Y MEDIOAMBIENTALES": {
      "CIENCIAS MARÍTIMAS, FLUVIALES, OCEANOGRÁFICAS E HIDROGRÁFICAS": [
        "OCEANOGRAFÍA TÁCTICA Y OPERACIONAL",
        "HIDROGRAFÍA",
        "HIDRO ACÚSTICA",
        "METEOROLOGÍA",
        "GEOMORFOLOGÍA, GEOLOGÍA Y GEOFÍSICA MARINA",
        "INSTRUMENTACIÓN OCEANOGRÁFICA Y FLUVIAL",
        "SISTEMAS DE SENSORES REMOTOS",
        "GESTIÓN DEL RIESGO DE DESASTRES EN ZONAS COSTERAS",
        "MANEJO INTEGRADO DE ZONAS COSTERAS"
      ],
      "MEDIO AMBIENTE, RECURSOS MARINOS, COSTEROS Y FLUVIALES": [
        "MONITOREO, VIGILANCIA Y CONTROL MEDIOAMBIENTAL",
        "DESARROLLO SOSTENIBLE",
        "CAMBIO CLIMÁTICO",
        "EDUCACIÓN AMBIENTAL",
        "REHABILITACIÓN Y RESTAURACIÓN DE ECOSISTEMAS",
        "DESARROLLO MARÍTIMO Y FLUVIAL",
        "GESTIÓN AMBIENTAL",
        "ENERGÍAS ALTERNATIVAS"
      ]
    }
  }
};

const PROGRESS_FIELDS: { key: keyof DegreeProject; label: string }[] = [
  { key: "title", label: "Título del Proyecto" },
  { key: "facultad", label: "Facultad" },
  { key: "programa", label: "Programa / Especialidad" },
  { key: "curso", label: "Curso" },
  { key: "researchGroup", label: "Grupo de Investigación" },
  { key: "researchLine", label: "Línea de Investigación" },
  { key: "researchSubLine", label: "Sublínea" },
  { key: "proponent1Name", label: "Nombre Proponente 1" },
  { key: "proponent1Id", label: "ID Proponente 1" },
  { key: "proponent1Email", label: "Email Proponente 1" },
  { key: "proponent1Phone", label: "Teléfono Proponente 1" },
  { key: "proposedDirectorName", label: "Director Propuesto" },
  { key: "problemStatement", label: "Descripción del Problema" },
  { key: "problemFormulation", label: "Formulación del Problema" },
  { key: "justification", label: "Justificación" },
  { key: "generalObjective", label: "Objetivo General" },
  { key: "specificObjectives", label: "Objetivos Específicos" },
  { key: "methodology", label: "Diseño Metodológico" },
  { key: "expectedResults", label: "Resultados e Impacto" }
];

export default function NewProjectPage() {
  const { user } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const { t } = useLanguage();
  
  const existingId = searchParams.get("draftId");
  
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [projectId, setProjectId] = useState<string | null>(existingId);
  
  const advisorsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "users"), where("role", "==", "advisor"));
  }, [db]);
  const { data: advisors } = useCollection(advisorsQuery);

  const [formData, setFormData] = useState<Partial<DegreeProject>>({
    title: "",
    facultad: "Administración Marítima y Sanidad Naval",
    programa: "",
    curso: "",
    researchGroup: "",
    researchArea: "",
    researchLine: "",
    researchSubLine: "",
    proponent1Name: "",
    proponent1Id: "",
    proponent1Email: "",
    proponent1Phone: "",
    proponent2Name: "",
    proponent2Id: "",
    proponent2Email: "",
    proponent2Phone: "",
    proposedDirectorName: "",
    evaluator1Name: "",
    evaluator2Name: "",
    directorSignature: "",
    deliveryDay: "",
    deliveryMonth: "",
    deliveryYear: new Date().getFullYear().toString(),
    problemStatement: "",
    problemFormulation: "",
    justification: "",
    generalObjective: "",
    specificObjectives: "",
    methodology: "",
    expectedResults: "",
    summary: "",
    bibliography: "",
    advisorIds: [],
    progressPercent: 1, 
  });

  const fieldStatus = useMemo(() => {
    return PROGRESS_FIELDS.map(field => {
      const value = formData[field.key];
      const isComplete = value && String(value).trim().length > 0;
      return { ...field, isComplete };
    });
  }, [formData]);

  const currentProgress = useMemo(() => {
    const filledCount = fieldStatus.filter(f => f.isComplete).length;
    const calculated = Math.floor((filledCount / PROGRESS_FIELDS.length) * 100);
    return Math.max(1, Math.min(99, calculated));
  }, [fieldStatus]);

  useEffect(() => {
    if (existingId && db) {
      const loadDraft = async () => {
        const docRef = doc(db, "projects", existingId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data() as DegreeProject);
        }
      };
      loadDraft();
    }
  }, [existingId, db]);

  useEffect(() => {
    if (!projectId && user && db) {
      const initDraft = async () => {
        try {
          const draftsQuery = query(
            collection(db, "projects"),
            where("studentId", "==", user.uid),
            where("status", "==", "Borrador")
          );
          const querySnapshot = await getDocs(draftsQuery);
          
          if (!querySnapshot.empty) {
            // Reutilizar el borrador existente más reciente
            let mostRecentDraft = querySnapshot.docs[0];
            for (let i = 1; i < querySnapshot.docs.length; i++) {
              const docA = mostRecentDraft.data();
              const docB = querySnapshot.docs[i].data();
              const timeA = new Date(docA.updatedAt || docA.createdAt).getTime();
              const timeB = new Date(docB.updatedAt || docB.createdAt).getTime();
              if (timeB > timeA) {
                mostRecentDraft = querySnapshot.docs[i];
              }
            }
            
            const draftId = mostRecentDraft.id;
            setFormData(mostRecentDraft.data() as DegreeProject);
            setProjectId(draftId);
            window.history.replaceState(null, "", `/dashboard/projects/new?draftId=${draftId}`);
            return;
          }
        } catch (error) {
          console.error("Error querying existing drafts:", error);
        }

        const newId = doc(collection(db, "projects")).id;
        const initialData = {
          id: newId,
          studentId: user.uid,
          advisorIds: [],
          status: "Borrador" as const,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          progressPercent: 1,
          ...formData
        };
        await setDoc(doc(db, "projects", newId), initialData);
        setProjectId(newId);
        window.history.replaceState(null, "", `/dashboard/projects/new?draftId=${newId}`);
      };
      initDraft();
    }
  }, [user, db, projectId]);

  useEffect(() => {
    if (!projectId || !db) return;

    const timeout = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        await updateDoc(doc(db, "projects", projectId), {
          ...formData,
          progressPercent: currentProgress,
          updatedAt: new Date().toISOString()
        });
        setSaveStatus("saved");
        setTimeout(() => setSaveStatus("idle"), 2000);
      } catch (error) {
        console.error("Auto-save error:", error);
      }
    }, 5000);

    return () => clearTimeout(timeout);
  }, [formData, projectId, db, currentProgress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !projectId || !db) return;
    
    const incompleteFields = fieldStatus.filter(f => !f.isComplete);
    if (incompleteFields.length > 0) {
      toast({
        variant: "destructive",
        title: "Propuesta Incompleta",
        description: `Faltan ${incompleteFields.length} campos por diligenciar correctamente.`,
      });
      return;
    }

    setLoading(true);
    try {
      await updateDoc(doc(db, "projects", projectId), {
        ...formData,
        status: "Pendiente",
        proposalDate: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        progressPercent: 100,
      });

      // Registrar log de auditoría
      try {
        let actorName = user.displayName || user.email || "Estudiante";
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const userData = userSnap.data();
          actorName = `${userData.firstName || ""} ${userData.lastName || ""}`.trim() || actorName;
        }
        await addDoc(collection(db, "projects", projectId, "activityLogs"), {
          actorId: user.uid,
          actorName,
          projectId: projectId,
          actionType: "Propuesta Enviada",
          details: "El estudiante envió la propuesta formal para revisión del comité.",
          createdAt: new Date().toISOString()
        });

        // Registrar auditoría inmutable forense
        await recordAuditLog(db, {
          actorId: user.uid,
          actorEmail: user.email || "unknown",
          actorName,
          actorRole: "student",
          actionType: "PROJECT_CREATE",
          entityType: "Project",
          entityId: projectId,
          projectTitle: formData.title || "Sin título",
          details: `Propuesta de grado formulada y radicada formalmente bajo formato EDUCA-FT-093-JINEN-V03 (${formData.programa || 'Programa no especificado'}).`,
          metadata: {
            programa: formData.programa,
            directorPropuesto: formData.proposedDirectorName,
          }
        });
      } catch (logErr) {
        console.error("Error creating activity log:", logErr);
      }

      toast({ title: "Propuesta Enviada al 100%" });
      router.push("/dashboard/student");
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error en envío" });
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field: keyof DegreeProject, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAdvisorSelect = (advisorId: string) => {
    const selectedAdvisor = advisors?.find(a => a.id === advisorId);
    if (selectedAdvisor) {
      setFormData(prev => ({
        ...prev,
        proposedDirectorName: `${selectedAdvisor.firstName} ${selectedAdvisor.lastName}`,
        advisorIds: [advisorId]
      }));
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500 pb-20 px-4">
      <div className="flex flex-col md:flex-row items-center justify-between bg-white p-4 rounded-xl border shadow-sm sticky top-0 z-50 gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/student">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-xl font-black font-headline tracking-tight uppercase">{t('proposalTitle')}</h1>
            <p className="text-[10px] text-muted-foreground font-bold flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-emerald-500" /> EDUCA-FT-093-JINEN-V03
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4 px-6 py-2 bg-slate-50 rounded-full border shadow-inner">
             <div className="flex flex-col items-end leading-none">
               <span className="text-[8px] font-black text-primary uppercase tracking-widest">Avance Propuesta</span>
               <span className="text-lg font-black text-primary">{currentProgress}%</span>
             </div>
             <div className="w-32 h-2.5 bg-slate-200 rounded-full overflow-hidden">
               <div 
                 className="h-full bg-primary transition-all duration-700 ease-out" 
                 style={{ width: `${currentProgress}%` }} 
               />
             </div>
          </div>

          <Button onClick={handleSubmit} className="gap-2 rounded-full px-8 shadow-lg hover:scale-105 transition-transform" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {t('sendProposal')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Tabs defaultValue="identificacion" className="w-full">
            <TabsList className="grid w-full grid-cols-4 h-14 bg-slate-100 p-1 mb-6 rounded-xl border">
              <TabsTrigger value="identificacion" className="font-bold">{t('tab1')}</TabsTrigger>
              <TabsTrigger value="problema" className="font-bold">{t('tab2')}</TabsTrigger>
              <TabsTrigger value="objetivos" className="font-bold">{t('tab3')}</TabsTrigger>
              <TabsTrigger value="metodologia" className="font-bold">{t('tab4')}</TabsTrigger>
            </TabsList>

            <Card className="border-none shadow-sm min-h-[600px]">
              <CardContent className="pt-8 px-8 pb-12">
                <TabsContent value="identificacion" className="space-y-8 m-0">
                  <div className="grid gap-3">
                    <Label className="text-xs font-black uppercase text-primary">Título Preliminar</Label>
                    <Input 
                      value={formData.title || ""} 
                      onChange={(e) => handleFieldChange("title", e.target.value)} 
                      className="font-bold text-lg h-14" 
                      placeholder="Redacte el título preliminar de la propuesta, de manera clara y que sea coherente con el problema." 
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Facultad</Label>
                      <Input value={formData.facultad || ""} onChange={(e) => handleFieldChange("facultad", e.target.value)} placeholder="Acuerdo facultad adscrita" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Programa</Label>
                      <Select value={formData.programa || ""} onValueChange={(val) => handleFieldChange("programa", val)}>
                        <SelectTrigger><SelectValue placeholder="Acuerdo facultad adscrita" /></SelectTrigger>
                        <SelectContent>
                          {SPECIALTIES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Curso</Label>
                      <Input value={formData.curso || ""} onChange={(e) => handleFieldChange("curso", e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Grupo de Investigación</Label>
                      <Select 
                        value={formData.researchGroup || ""} 
                        onValueChange={(val) => {
                          handleFieldChange("researchGroup", val);
                          handleFieldChange("researchArea", "");
                          handleFieldChange("researchLine", "");
                          handleFieldChange("researchSubLine", "");
                        }}
                      >
                        <SelectTrigger><SelectValue placeholder="Seleccionar Grupo" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Grupo de Investigación Tridente">Grupo de Investigación Tridente</SelectItem>
                          <SelectItem value="Grupo de Investigación Trirreme">Grupo de Investigación Trirreme</SelectItem>
                          <SelectItem value="Grupo de Investigación Tritón">Grupo de Investigación Tritón</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Área de Investigación</Label>
                      <Select
                        value={formData.researchArea || ""}
                        onValueChange={(val) => {
                          handleFieldChange("researchArea", val);
                          handleFieldChange("researchLine", "");
                          handleFieldChange("researchSubLine", "");
                        }}
                        disabled={!formData.researchGroup || Object.keys(ALL_GROUPS_DATA[formData.researchGroup] || {}).length === 0}
                      >
                        <SelectTrigger><SelectValue placeholder="Seleccionar Área" /></SelectTrigger>
                        <SelectContent>
                          {formData.researchGroup && Object.keys(ALL_GROUPS_DATA[formData.researchGroup] || {}).length > 0 ? (
                            Object.keys(ALL_GROUPS_DATA[formData.researchGroup]).map(area => (
                              <SelectItem key={area} value={area}>{area}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>Seleccione un grupo primero</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Línea de Investigación</Label>
                      <Select 
                        value={formData.researchLine || ""} 
                        onValueChange={(val) => {
                          handleFieldChange("researchLine", val);
                          handleFieldChange("researchSubLine", "");
                        }}
                        disabled={!formData.researchGroup || !formData.researchArea || Object.keys(ALL_GROUPS_DATA[formData.researchGroup]?.[formData.researchArea] || {}).length === 0}
                      >
                        <SelectTrigger><SelectValue placeholder="(VER LÍNEAS DE INVESTIGACIÓN)" /></SelectTrigger>
                        <SelectContent>
                          {formData.researchGroup && formData.researchArea && Object.keys(ALL_GROUPS_DATA[formData.researchGroup]?.[formData.researchArea] || {}).length > 0 ? (
                            Object.keys(ALL_GROUPS_DATA[formData.researchGroup][formData.researchArea]).map(line => (
                              <SelectItem key={line} value={line}>{line}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>Seleccione un área primero</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Sublínea</Label>
                      <Select 
                        value={formData.researchSubLine || ""} 
                        onValueChange={(val) => handleFieldChange("researchSubLine", val)}
                        disabled={!formData.researchGroup || !formData.researchArea || !formData.researchLine || !ALL_GROUPS_DATA[formData.researchGroup]?.[formData.researchArea]?.[formData.researchLine]}
                      >
                        <SelectTrigger><SelectValue placeholder="(VER SUBLÍNEAS DE INVESTIGACIÓN)" /></SelectTrigger>
                        <SelectContent>
                          {formData.researchGroup && formData.researchArea && formData.researchLine && ALL_GROUPS_DATA[formData.researchGroup]?.[formData.researchArea]?.[formData.researchLine] ? (
                            ALL_GROUPS_DATA[formData.researchGroup][formData.researchArea][formData.researchLine].map(subline => (
                              <SelectItem key={subline} value={subline}>{subline}</SelectItem>
                            ))
                          ) : (
                            <SelectItem value="none" disabled>Seleccione una línea primero</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-xs font-black uppercase text-primary">Proponentes</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Card className="p-4 bg-slate-50/50">
                        <div className="space-y-4">
                          <div className="grid gap-1.5">
                            <Label className="text-[9px] font-black uppercase">Nombre Proponente 1</Label>
                            <Input value={formData.proponent1Name || ""} onChange={(e) => handleFieldChange("proponent1Name", e.target.value)} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                              <Label className="text-[9px] font-black uppercase">ID</Label>
                              <Input value={formData.proponent1Id || ""} onChange={(e) => handleFieldChange("proponent1Id", e.target.value)} />
                            </div>
                            <div className="grid gap-1.5">
                              <Label className="text-[9px] font-black uppercase">Celular</Label>
                              <Input value={formData.proponent1Phone || ""} onChange={(e) => handleFieldChange("proponent1Phone", e.target.value)} />
                            </div>
                          </div>
                          <div className="grid gap-1.5">
                            <Label className="text-[9px] font-black uppercase">Email</Label>
                            <Input value={formData.proponent1Email || ""} onChange={(e) => handleFieldChange("proponent1Email", e.target.value)} />
                          </div>
                        </div>
                      </Card>
                      <Card className="p-4 bg-slate-50/50">
                        <div className="space-y-4">
                          <div className="grid gap-1.5">
                            <Label className="text-[9px] font-black uppercase">Nombre Proponente 2</Label>
                            <Input value={formData.proponent2Name || ""} onChange={(e) => handleFieldChange("proponent2Name", e.target.value)} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-1.5">
                              <Label className="text-[9px] font-black uppercase">ID</Label>
                              <Input value={formData.proponent2Id || ""} onChange={(e) => handleFieldChange("proponent2Id", e.target.value)} />
                            </div>
                            <div className="grid gap-1.5">
                              <Label className="text-[9px] font-black uppercase">Celular</Label>
                              <Input value={formData.proponent2Phone || ""} onChange={(e) => handleFieldChange("proponent2Phone", e.target.value)} />
                            </div>
                          </div>
                          <div className="grid gap-1.5">
                            <Label className="text-[9px] font-black uppercase">Email</Label>
                            <Input value={formData.proponent2Email || ""} onChange={(e) => handleFieldChange("proponent2Email", e.target.value)} />
                          </div>
                        </div>
                      </Card>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Director Propuesto</Label>
                      <Input
                        value={formData.proposedDirectorName || ""}
                        onChange={(e) => handleFieldChange("proposedDirectorName", e.target.value)}
                        placeholder="COLOCAR EL NOMBRE DEL DIRECTOR PROPUESTO"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Fecha de Entrega (D/M/A)</Label>
                      <div className="flex gap-2">
                        <Input value={formData.deliveryDay || ""} onChange={(e) => handleFieldChange("deliveryDay", e.target.value)} placeholder="Día" className="w-1/3" />
                        <Input value={formData.deliveryMonth || ""} onChange={(e) => handleFieldChange("deliveryMonth", e.target.value)} placeholder="Mes" className="w-1/3" />
                        <Input value={formData.deliveryYear || ""} onChange={(e) => handleFieldChange("deliveryYear", e.target.value)} placeholder="Año" className="w-1/3" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Evaluador 1</Label>
                      <Input value={formData.evaluator1Name || ""} onChange={(e) => handleFieldChange("evaluator1Name", e.target.value)} placeholder="Nombre del Evaluador 1" />
                    </div>
                    <div className="grid gap-2">
                      <Label className="text-[10px] font-black uppercase opacity-60">Evaluador 2</Label>
                      <Input value={formData.evaluator2Name || ""} onChange={(e) => handleFieldChange("evaluator2Name", e.target.value)} placeholder="Nombre del Evaluador 2" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="problema" className="space-y-6 m-0">
                  <div className="grid gap-3">
                    <Label className="text-xs font-black uppercase">2.1 Descripción del Problema</Label>
                    <Textarea 
                      className="min-h-[250px]" 
                      value={formData.problemStatement || ""} 
                      onChange={(e) => handleFieldChange("problemStatement", e.target.value)} 
                      placeholder={`Para describir el problema, identifique los siguientes ítems:
✓ ¿Cuál es, o en qué consiste el problema que ha sido identificado?
✓ ¿Cuáles son las consecuencias que ese problema ha generado?
✓ ¿Qué se ha hecho para solucionar el problema? (Para desarrollar y argumentar este ítem es obligatorio hacer revisión bibliográfica previa: textos impresos, trabajos de investigación, revistas especializadas, bases de datos, artículos científicos, memorias de congresos, etc.).
✓ ¿Qué podría ocurrir si no se busca una solución al problema?
(3 párrafos de 8 a 10 líneas aprox.)`}
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label className="text-xs font-black uppercase text-primary">2.2 Formulación (Pregunta)</Label>
                    <Input 
                      className="font-bold h-12" 
                      value={formData.problemFormulation || ""} 
                      onChange={(e) => handleFieldChange("problemFormulation", e.target.value)} 
                      placeholder="Para buscar una respuesta o solución al problema redacte una pregunta. Esta debe relacionarse con lo que se espera hacer (objetivo) y la situación actual (problema). (De 2 a 3 líneas aprox. Según objetivo y título)." 
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label className="text-xs font-black uppercase">2.3 Justificación</Label>
                    <Textarea 
                      className="min-h-[200px]" 
                      value={formData.justification || ""} 
                      onChange={(e) => handleFieldChange("justification", e.target.value)} 
                      placeholder={`Para justificar la investigación se deben exponer las razones por las cuales conviene hacer la investigación, las siguientes preguntas le ayudarán:
✓ ¿Por qué se va a hacer?
✓ ¿Cuál es la importancia de esta investigación?
✓ ¿Para quién es importante? Entidades, dependencias, grupos específicos de la comunidad.
✓ ¿Pertinencia con las líneas de investigación?
✓ ¿Cuáles son los beneficios que se obtendrán con el desarrollo de esta investigación?
(3 párrafos de 8 a 10 líneas aprox.)`}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="objetivos" className="space-y-6 m-0">
                  <div className="grid gap-3">
                    <Label className="text-xs font-black uppercase text-primary">3.1 Objetivo General</Label>
                    <Input 
                      className="font-bold h-12" 
                      value={formData.generalObjective || ""} 
                      onChange={(e) => handleFieldChange("generalObjective", e.target.value)} 
                      placeholder="Es la meta que se espera cumplir con la realización del trabajo y debe dar respuesta al problema presentado anteriormente. Debe comenzar con un verbo en infinitivo que sea alcanzable y evaluable y según el problema debe presentar la delimitación conceptual, espacial o temporal acorde con la formulación del problema. (De 2 a 3 líneas. Según título y formulación.)" 
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label className="text-xs font-black uppercase">3.2 Objetivos Específicos</Label>
                    <Textarea 
                      className="min-h-[250px]" 
                      value={formData.specificObjectives || ""} 
                      onChange={(e) => handleFieldChange("specificObjectives", e.target.value)} 
                      placeholder="Mínimo 3" 
                    />
                  </div>
                </TabsContent>

                <TabsContent value="metodologia" className="space-y-6 m-0">
                  <div className="grid gap-3">
                    <Label className="text-xs font-black uppercase">4.1 Diseño Metodológico</Label>
                    <Textarea 
                      className="min-h-[250px]" 
                      value={formData.methodology || ""} 
                      onChange={(e) => handleFieldChange("methodology", e.target.value)} 
                      placeholder="Describa brevemente cual será el tipo de investigación, metodología a emplear para lograr los objetivos y descripción de las posibles fases de la investigación. (3 párrafos de 8 líneas máximo)" 
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label className="text-xs font-black uppercase">4.2 Resultados Esperados</Label>
                    <Textarea 
                      className="min-h-[150px]" 
                      value={formData.expectedResults || ""} 
                      onChange={(e) => handleFieldChange("expectedResults", e.target.value)} 
                      placeholder="Indique los resultados que desea obtener, está relacionado con el objetivo general y objetivos específicos." 
                    />
                  </div>
                </TabsContent>
              </CardContent>
            </Card>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card className="border-none shadow-sm bg-slate-50">
            <CardHeader className="bg-primary text-white py-4 rounded-t-lg">
              <CardTitle className="text-sm font-black uppercase tracking-tight flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4" /> Checklist Académico
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="p-4 space-y-3">
                  {fieldStatus.map((field) => (
                    <div key={field.key} className="flex items-start gap-3 p-3 bg-white rounded-xl border shadow-sm">
                      {field.isComplete ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 mt-0.5" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      )}
                      <div>
                        <p className={`text-[10px] font-black uppercase leading-tight ${field.isComplete ? 'text-slate-900' : 'text-red-600'}`}>
                          {field.label}
                        </p>
                        <p className="text-[9px] text-muted-foreground">
                          {field.isComplete ? 'Diligenciado' : 'Campo pendiente'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
            <CardFooter className="p-4 border-t bg-slate-100 rounded-b-lg">
              <div className="flex flex-col w-full gap-2">
                <div className="flex justify-between items-center text-[10px] font-black uppercase">
                  <span>Integridad Formato</span>
                  <span>{currentProgress}%</span>
                </div>
                <Progress value={currentProgress} className="h-1.5" />
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
