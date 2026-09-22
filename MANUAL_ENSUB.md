# MEMORIA TÉCNICA E INGENIERÍA DEL SISTEMA
## Plataforma Integral de Gestión de Proyectos de Grado - Escuela Naval de Suboficiales ARC "Barranquilla" (ENSUB)

El presente documento constituye el manual técnico, arquitectónico y operativo del sistema web desarrollado. Está diseñado para servir como anexo o cuerpo documental dentro de un documento de investigación aplicativa (Tesis de Grado en Ingeniería/Tecnologías de la Información).

---

## CAPÍTULO 1: ARQUITECTURA GENERAL DEL SISTEMA

El desarrollo de la plataforma se enmarcó dentro de los estándares más rigurosos de la ingeniería de software moderna, optando por una arquitectura híbrida de Renderizado del Lado del Servidor (SSR) y Generación de Sitios Estáticos (SSG) apoyada fundamentalmente sobre una infraestructura Serverless ("sin servidor local").

### 1.1. Arquitectura Frontend (Interfaces de Usuario)

El cliente web no opera como un sitio monolítico tradicional, sino como una "Single-Page Application" (SPA) dinámica y jerárquica gestionada por el enrutador matricial de la tecnología **Next.js**.

- **Patrón de Estructura:** Se utilizó el patrón `App Router` de Next.js. El flujo de datos obedece un modelo unidireccional proporcionado por **React (v.19)**, lo que impide manipulaciones directas, descontroladas y riesgosas del Modelo de Objetos del Documento (DOM), brindando altísima robustez algorítmica frente a concurrencias masivas.
- **Tipado Fuerte Estricto:** Toda la base de código ha sido declarada bajo el supra-conjunto **TypeScript**, garantizando que las abstracciones del dominio del proyecto (ej. `DegreeProject`, `ActivityLog`) se respeten sin flexibilidades, evadiendo excepciones de tiempo de ejecución (runtime crashing) comúnmente encontradas en los programas académicos heredados elaborados en JavaScript plano.
- **Micro-interacciones y UI Sensible:** El diseño de sistema adoptado obedece principios ergonómicos (Design System) propulsados por el motor utilitario **Tailwind CSS**. A diferencia del CSS nativo tradicional, su compilador "Just-In-Time" compila única y atómicamente las clases demandadas por la plataforma, resultando en un archivo ultra-ligero que agiliza exponencialmente los *Core Web Vitals* para las máquinas limitadas por redes navales convencionales.

### 1.2. Infraestructura Backend ("Serverless Database" e Identidad)

Toda la responsabilidad de cómputo permanente, permanencia de información, criptografía de credenciales y escalado reside en **Google Firebase**:

- **Firestore (NoSQL de Tiempo Real):** La estructura relacional obsoleta fue reemplazada por la estructuración documental NoSQL de Firestore. Todo formato _V03 (EDUCA-FT-093)_ almacenado en nuestra red equivale a un "Documento" dentro de la "Colección" de proyectos (`projects`). Esta latencia cero (real-time listeners) permite arquitectar una interfaz re-activa. Si el asesor aprueba una iniciativa, la pantalla del estudiante muta de inmediato reflejando el progreso sin menester un "Refresh".
- **Gestión de Identidades y RBAC:** El Control de Acceso Basado en Roles (Role Based Access Control) es propulsado por **Firebase Auth**, aislando herméticamente las rutas jerárquicas: `/dashboard/student`, `/dashboard/advisor` y `/dashboard/admin`.

### 1.3. Integración de Componentes Multimedia e Interfaz de Vanguardia

La optimización multimedia (Sección Hero / Principal) involucra un protocolo "Cross-Fade Video Player". Dado que la plataforma ostenta un componente visual clave mediante formatos en video MP4 ultra-pesados y simultáneos, el equipo de ingeniería diseñó una precarga basada exclusivamente en _metadatos_ nativos HTML5. Esto interrumpe el cuello de botella (buffering delay) que hubiese bloqueado a los navegadores clientes, y a la vez, evita un doble-ciclo de reconciliación algorítmica del React-DOM, favoreciendo un rendimiento institucional en resolución *Full HD* constante, dinámico y estéticamente fluido ("object-cover").

---

## CAPÍTULO 2: MANUAL OPERATIVO A NIVEL USUARIO-ROL

La experiencia del software ha sido dividida transversalmente en tres carriles operativos, dependiendo del sujeto autenticado en el sistema.

### 2.1. Módulo del Estudiante (Proponente)
Constituye la línea base para capturar y formalizar las investigaciones.
1. **Acceso Seguro Institucional:** Ingreso mediante portón OAuth/Credenciales. Al dictaminarse sus privilegios de `Estudiante`, el servidor provee el `Dashboard/Student`.
2. **Generación del Documento V03:** Presencia de la digitalización interactiva del formulario _EDUCA-FT-093-JINEN-V03_. Al interaccionar sobre cualquier variable (Planteamiento del problema, Metodología, ID Proponentes), el modelo guarda los "Drafts" eficientemente hacia Firestore, emitiendo actualizaciones sobre la fase actual del mismo que oscilarán en la máquina de estados: `Pendiente`, `Corregir`, `Aprobado` y `Defendido`.
3. **Salida y Productor Final:** Si el asesor global aprueba la propuesta V03, el estudiante accede a plantillas estrictas según las Reglas de la Asociación Estadounidense de Psicología (APA - V1). Un algoritmo visual toma dichos extractos y provee la interfaz gráfica con función PDF "IMPRIMIR TESIS" lista para foliación biblioteconomía y grados plenos.

### 2.2. Módulo del Asesor y Docente Universitario
Es una subarquitectura de gestión de calidad normativa.
1. **Bandeja de Proyectos Centralizada:** Un tablero de fiscalización o matriz en el que reside todo estudiante tutelado.
2. **Panel Detalle y Criterios Formatos Operativos:** El revisor o asesor no modifica directamente el archivo del aspirante. Se le suministra un _Centro de Comandos_ bajo las solapas "Propuesta V03", "Auditoría" y "Foro". Desde allí, tiene herramientas para presionar las peticiones de corrección. El mecanismo empuja al proyecto nuevamente como `Draft` para que el Estudiante pueda solventar el impasse. Trazando todo ello, el "Monitor de Auditorías" graba perpetuamente las firmas de reloj exactas correspondientes a la iteración.
3. **Herramienta Avanzada IA (Refinamiento Lógico Modal V03):** Se equipó un módulo generacionista ("Auditoría Integral V03") destinado explícitamente al perfil del Docente Evaluador. Aterrizado en un ambiente hermético o modal escalable (diseñado para pre-visualizar *overscroll* adaptable), permite inyectar el planteamiento y propósito de la tesis propuesta ante un Motor Analítico, quien extrae tres vectores académicos: **Predicción del Éxito o Viabilidad Técnica, Riesgos o Debilidades en Plagio / Método, y Modificaciones Literales Sugeridas**. Se procesan sin fatigar la base, en una fracción marginal del tiempo comparado con fiscalización humana manual, resultando una de las más grandes adiciones e innovación en la gestión de proyectos de las Fuerzas y sus escuelas técnicas asociadas.

### 2.3. Módulo de Administración de Roles Master (Decanatura / IT System)
La capa directiva para el administrador superior:
- Se expone la solapa **Gestión Administrativa**, facultada a leer cualquier registro persistido (eliminando fronteras por roles).
- Goza de facultades tipo _Hard Deletion_. Pudiendo intervenir la base de datos Firestore y destruir un registro corcrupto y limpiar historiales de Logs (`ActivityLogs`) erróneas. Contienen el control maestro sobre el ciclo de vida de todo el software ENSUB.
