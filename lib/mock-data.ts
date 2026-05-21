import type {
  User,
  Department,
  Objective,
  KeyResult,
  REMI,
  Quarter,
  ObjectiveStatus,
  DashboardStats,
  Notification,
} from "./types";

// Users - roles are now only "admin" or "user"
export const users: User[] = [
  { id: "u1", name: "María García", email: "maria.garcia@company.com", role: "admin", department: "Admin" },
  { id: "u2", name: "Carlos Rodríguez", email: "carlos.rodriguez@company.com", role: "user", department: "Comercial" },
  { id: "u3", name: "Ana Martínez", email: "ana.martinez@company.com", role: "admin", department: "IT" },
  { id: "u4", name: "Pedro López", email: "pedro.lopez@company.com", role: "user", department: "Producto" },
  { id: "u5", name: "Laura Sánchez", email: "laura.sanchez@company.com", role: "user", department: "Business Operations" },
  { id: "u6", name: "Diego Fernández", email: "diego.fernandez@company.com", role: "user", department: "Performance" },
  { id: "u7", name: "Sofía Ruiz", email: "sofia.ruiz@company.com", role: "user", department: "Chile" },
  { id: "u8", name: "Alejandro Torres", email: "alejandro.torres@company.com", role: "user", department: "Perú" },
  { id: "u9", name: "Isabella Moreno", email: "isabella.moreno@company.com", role: "admin", department: "Europa" },
  { id: "u10", name: "Javier Díaz", email: "javier.diaz@company.com", role: "user", department: "Comercial" },
];

export const currentUser = users[0];

// Departments
export const departments: Department[] = [
  { id: "d1", name: "Comercial", slug: "comercial", color: "#10B981", head: users[1], memberCount: 24, objectiveCount: 4, averageProgress: 68 },
  { id: "d2", name: "IT", slug: "it", color: "#6366F1", head: users[2], memberCount: 18, objectiveCount: 3, averageProgress: 72 },
  { id: "d3", name: "Producto", slug: "producto", color: "#F59E0B", head: users[3], memberCount: 12, objectiveCount: 3, averageProgress: 55 },
  { id: "d4", name: "Admin", slug: "admin", color: "#8B5CF6", head: users[0], memberCount: 8, objectiveCount: 2, averageProgress: 81 },
  { id: "d5", name: "Business Operations", slug: "business-operations", color: "#EC4899", head: users[4], memberCount: 15, objectiveCount: 3, averageProgress: 63 },
  { id: "d6", name: "Performance", slug: "performance", color: "#14B8A6", head: users[5], memberCount: 10, objectiveCount: 2, averageProgress: 77 },
  { id: "d7", name: "Chile", slug: "chile", color: "#EF4444", head: users[6], memberCount: 32, objectiveCount: 4, averageProgress: 59 },
  { id: "d8", name: "Perú", slug: "peru", color: "#F97316", head: users[7], memberCount: 28, objectiveCount: 3, averageProgress: 64 },
  { id: "d9", name: "Europa", slug: "europa", color: "#3B82F6", head: users[8], memberCount: 45, objectiveCount: 4, averageProgress: 71 },
];

// REMIs - Strategic groupings (no metrics)
export const remis: REMI[] = [
  {
    id: "remi1",
    name: "Expansión de Ingresos LATAM",
    description: "Consolidar y expandir nuestra presencia en mercados latinoamericanos, aumentando la participación de mercado y diversificando fuentes de ingreso.",
    responsibleUser: users[1],
    responsibleDepartment: departments[0],
    progresoManual: 0,
  },
  {
    id: "remi2",
    name: "Excelencia Tecnológica",
    description: "Modernizar la infraestructura tecnológica y garantizar una plataforma confiable, escalable y segura para soportar el crecimiento del negocio.",
    responsibleUser: users[2],
    responsibleDepartment: departments[1],
    progresoManual: 0,
  },
  {
    id: "remi3",
    name: "Experiencia de Usuario Superior",
    description: "Ofrecer una experiencia de producto excepcional que incremente la retención, satisfacción y engagement de nuestros usuarios.",
    responsibleUser: users[3],
    responsibleDepartment: departments[2],
    progresoManual: 0,
  },
];

// Helper to create key results with new fields
const createKeyResult = (
  id: string,
  objectiveId: string,
  title: string,
  owner: User,
  target: number,
  currentValue: number,
  unit: string,
  startValue: number = 0,
  sumsToObjective: boolean = true,
  blockers: string = "",
  comments: string = ""
): KeyResult => {
  const progress = Math.min(Math.round((currentValue / target) * 100), 100);
  // Status: "completado" if currentValue >= target, otherwise ""
  const status: KeyResult["status"] = currentValue >= target ? "completado" : "";
  
  return {
    id,
    objectiveId,
    title,
    description: `Key result for tracking ${title.toLowerCase()}`,
    owner,
    status,
    progress,
    target,
    currentValue,
    unit,
    startValue,
    sumsToObjective,
    blockers,
    comments,
  };
};

// Calculate objective progress and status
export function calculateObjectiveProgress(objective: Objective): { progress: number; status: ObjectiveStatus } {
  if (objective.calculationMode === "manual") {
    return {
      progress: objective.manualProgress ?? 0,
      status: objective.manualStatus ?? "",
    };
  }

  // Automatic calculation
  const relevantKRs = objective.keyResults.filter((kr) => kr.sumsToObjective === true);
  
  if (relevantKRs.length === 0) {
    return { progress: 0, status: "" };
  }

  const progress = Math.round(
    relevantKRs.reduce((sum, kr) => sum + kr.progress, 0) / relevantKRs.length
  );

  // Status logic:
  // - "completado" if ALL relevantKRs have status === "completado"
  // - "en-riesgo" if AT LEAST ONE relevantKR has status === "en-riesgo"
  // - "" in all other cases
  const allCompleted = relevantKRs.every((kr) => kr.status === "completado");
  const anyAtRisk = relevantKRs.some((kr) => kr.status === "en-riesgo");

  let status: ObjectiveStatus = "";
  if (allCompleted) {
    status = "completado";
  } else if (anyAtRisk) {
    status = "en-riesgo";
  }

  return { progress, status };
}

// Objectives with new structure
export const objectives: Objective[] = [
  // Comercial Department Objectives - REMI 1 (Expansión LATAM)
  {
    id: "obj1",
    title: "Incrementar Ingresos Q4 en 25%",
    description: "Impulsar un crecimiento significativo de ingresos a través de la adquisición de nuevos clientes y upselling de cuentas existentes.",
    department: departments[0],
    quarter: "Q4-2024",
    owner: users[1],
    status: "",
    progress: 0,
    remi: remis[0],
    calculationMode: "automatic",
    createdAt: "2024-10-01T00:00:00.000Z",
    updatedAt: "2024-11-15T00:00:00.000Z",
    keyResults: [
      createKeyResult("kr1-1", "obj1", "Cerrar 50 nuevos contratos enterprise", users[1], 50, 34, " contratos", 0, true, "", "Buen avance en el pipeline de Q4"),
      createKeyResult("kr1-2", "obj1", "Alcanzar $2M en revenue de upsell", users[9], 2000000, 1500000, "", 0, true, "", ""),
      createKeyResult("kr1-3", "obj1", "Reducir ciclo de ventas a 45 días", users[1], 45, 52, " días", 60, true, "Proceso de aprobación interno lento en algunos clientes", "Necesitamos revisar el proceso de onboarding"),
      createKeyResult("kr1-4", "obj1", "Incrementar valor del pipeline en 40%", users[9], 40, 34, "%", 0, true, "", ""),
    ],
  },
  {
    id: "obj2",
    title: "Expandir a 3 Nuevos Segmentos de Mercado",
    description: "Identificar y penetrar tres nuevos segmentos de mercado para diversificar fuentes de ingreso.",
    department: departments[0],
    quarter: "Q4-2024",
    owner: users[9],
    status: "en-riesgo",
    progress: 0,
    remi: remis[0],
    calculationMode: "automatic",
    createdAt: "2024-10-01T00:00:00.000Z",
    updatedAt: "2024-11-10T00:00:00.000Z",
    keyResults: [
      createKeyResult("kr2-1", "obj2", "Completar investigación de mercado para 5 segmentos", users[9], 5, 4, " reportes", 0, true, "", ""),
      { ...createKeyResult("kr2-2", "obj2", "Lanzar pilotos en 3 segmentos", users[9], 3, 1, " pilotos", 0, true, "Falta definición de propuesta de valor para segmento fintech", ""), status: "en-riesgo" as const },
      { ...createKeyResult("kr2-3", "obj2", "Lograr $500K revenue de nuevos segmentos", users[1], 500000, 100000, "", 0, true, "Ciclos de venta más largos de lo esperado", ""), status: "en-riesgo" as const },
    ],
  },
  // IT Department Objectives - REMI 2 (Excelencia Tecnológica)
  {
    id: "obj3",
    title: "Alcanzar 99.9% de Uptime de Plataforma",
    description: "Garantizar una confiabilidad excepcional de la plataforma a través de mejoras de infraestructura y monitoreo proactivo.",
    department: departments[1],
    quarter: "Q4-2024",
    owner: users[2],
    status: "",
    progress: 0,
    remi: remis[1],
    calculationMode: "automatic",
    createdAt: "2024-10-01T00:00:00.000Z",
    updatedAt: "2024-11-14T00:00:00.000Z",
    keyResults: [
      createKeyResult("kr3-1", "obj3", "Reducir MTTR a menos de 15 minutos", users[2], 15, 12, " min", 45, true, "", "Objetivo superado"),
      createKeyResult("kr3-2", "obj3", "Implementar failover automático para servicios críticos", users[2], 100, 75, "%", 0, true, "", ""),
      createKeyResult("kr3-3", "obj3", "Desplegar dashboards de monitoreo para todos los servicios", users[2], 12, 12, " dashboards", 0, true, "", "Completado exitosamente"),
      createKeyResult("kr3-4", "obj3", "Completar pruebas de disaster recovery", users[2], 3, 2, " pruebas", 0, true, "", ""),
    ],
  },
  {
    id: "obj4",
    title: "Migrar 80% de Servicios a la Nube",
    description: "Acelerar la adopción de cloud migrando servicios legacy on-premise a infraestructura cloud moderna.",
    department: departments[1],
    quarter: "Q4-2024",
    owner: users[2],
    status: "",
    progress: 0,
    remi: remis[1],
    calculationMode: "automatic",
    createdAt: "2024-10-01T00:00:00.000Z",
    updatedAt: "2024-11-12T00:00:00.000Z",
    keyResults: [
      createKeyResult("kr4-1", "obj4", "Migrar 10 aplicaciones críticas", users[2], 10, 7, " apps", 0, true, "", ""),
      { ...createKeyResult("kr4-2", "obj4", "Reducir costos de infraestructura en 30%", users[2], 30, 15, "%", 0, true, "Costos de licencias cloud más altos de lo presupuestado", ""), status: "en-riesgo" as const },
      createKeyResult("kr4-3", "obj4", "Capacitar a 50 ingenieros en tecnologías cloud", users[2], 50, 40, " ingenieros", 0, true, "", ""),
    ],
  },
  // Producto Department Objectives - REMI 3 (Experiencia de Usuario)
  {
    id: "obj5",
    title: "Lanzar App Móvil v2.0",
    description: "Entregar una experiencia móvil completamente rediseñada con nuevas funcionalidades y mejor rendimiento.",
    department: departments[2],
    quarter: "Q4-2024",
    owner: users[3],
    status: "en-riesgo",
    progress: 0,
    remi: remis[2],
    calculationMode: "automatic",
    createdAt: "2024-10-01T00:00:00.000Z",
    updatedAt: "2024-11-13T00:00:00.000Z",
    keyResults: [
      { ...createKeyResult("kr5-1", "obj5", "Completar desarrollo de nuevas funcionalidades", users[3], 100, 55, "%", 0, true, "Retrasos en definición de UX para flujo de checkout", ""), status: "en-riesgo" as const },
      createKeyResult("kr5-2", "obj5", "Lograr rating 4.5+ en app stores (beta)", users[3], 4.5, 4.2, " estrellas", 3.8, true, "", ""),
      { ...createKeyResult("kr5-3", "obj5", "Reducir tiempo de carga a menos de 2 segundos", users[3], 2, 2.8, " seg", 4.5, true, "Optimización de imágenes pendiente", ""), status: "en-riesgo" as const },
      { ...createKeyResult("kr5-4", "obj5", "Completar auditoría y correcciones de accesibilidad", users[3], 100, 30, "%", 0, true, "Falta de recursos especializados en a11y", "Solicitar apoyo externo"), status: "en-riesgo" as const },
    ],
  },
  {
    id: "obj6",
    title: "Mejorar Retención de Usuarios en 15%",
    description: "Implementar funcionalidades y mejoras que impulsen el engagement y reduzcan el churn.",
    department: departments[2],
    quarter: "Q4-2024",
    owner: users[3],
    status: "",
    progress: 0,
    remi: remis[2],
    calculationMode: "automatic",
    createdAt: "2024-10-01T00:00:00.000Z",
    updatedAt: "2024-11-11T00:00:00.000Z",
    keyResults: [
      createKeyResult("kr6-1", "obj6", "Lanzar motor de recomendaciones personalizadas", users[3], 100, 100, "%", 0, true, "", "Mostrando resultados positivos"),
      createKeyResult("kr6-2", "obj6", "Implementar optimización de notificaciones push", users[3], 100, 65, "%", 0, true, "", ""),
      createKeyResult("kr6-3", "obj6", "Reducir churn rate Day-30 a 25%", users[3], 25, 28, "%", 35, true, "", ""),
    ],
  },
  // Admin Department Objectives - No REMI
  {
    id: "obj7",
    title: "Reducir Costos Operativos en 20%",
    description: "Optimizar procesos administrativos y renegociar contratos con proveedores para lograr ahorros.",
    department: departments[3],
    quarter: "Q4-2024",
    owner: users[0],
    status: "",
    progress: 78,
    remi: null,
    calculationMode: "manual",
    manualProgress: 78,
    manualStatus: "",
    createdAt: "2024-10-01T00:00:00.000Z",
    updatedAt: "2024-11-14T00:00:00.000Z",
    keyResults: [
      createKeyResult("kr7-1", "obj7", "Renegociar 10 contratos principales con proveedores", users[0], 10, 9, " contratos", 0, true, "", ""),
      createKeyResult("kr7-2", "obj7", "Automatizar 5 procesos manuales", users[0], 5, 4, " procesos", 0, true, "", ""),
      createKeyResult("kr7-3", "obj7", "Reducir costos de espacio de oficina en 15%", users[0], 15, 10, "%", 0, false, "", "Este KR no suma al objetivo por decisión estratégica"),
    ],
  },
  // Business Operations Department Objectives
  {
    id: "obj8",
    title: "Implementar Sistema OKR Company-Wide",
    description: "Desplegar y lograr adopción completa de metodología OKR en todos los departamentos.",
    department: departments[4],
    quarter: "Q4-2024",
    owner: users[4],
    status: "completado",
    progress: 100,
    remi: null,
    calculationMode: "manual",
    manualProgress: 100,
    manualStatus: "completado",
    createdAt: "2024-10-01T00:00:00.000Z",
    updatedAt: "2024-11-01T00:00:00.000Z",
    keyResults: [
      createKeyResult("kr8-1", "obj8", "Capacitar a todos los jefes de departamento en OKR", users[4], 9, 9, " jefes", 0, true, "", ""),
      createKeyResult("kr8-2", "obj8", "Lograr 100% de participación de departamentos", users[4], 9, 9, " deptos", 0, true, "", ""),
      createKeyResult("kr8-3", "obj8", "Establecer cadencia de check-ins semanales", users[4], 100, 100, "%", 0, true, "", ""),
    ],
  },
  // Performance Department Objectives
  {
    id: "obj9",
    title: "Lanzar Sistema de Gestión de Desempeño",
    description: "Implementar un sistema moderno de gestión de desempeño con feedback continuo.",
    department: departments[5],
    quarter: "Q4-2024",
    owner: users[5],
    status: "",
    progress: 0,
    remi: null,
    calculationMode: "automatic",
    createdAt: "2024-10-01T00:00:00.000Z",
    updatedAt: "2024-11-10T00:00:00.000Z",
    keyResults: [
      createKeyResult("kr9-1", "obj9", "Seleccionar e implementar software de performance", users[5], 100, 100, "%", 0, true, "", ""),
      createKeyResult("kr9-2", "obj9", "Completar sesiones de capacitación para managers", users[5], 25, 20, " sesiones", 0, true, "", ""),
      { ...createKeyResult("kr9-3", "obj9", "Lograr 90% de onboarding de empleados", users[5], 90, 54, "%", 0, true, "Resistencia al cambio en algunos equipos", ""), status: "en-riesgo" as const },
    ],
  },
  // Chile Department Objectives - REMI 1
  {
    id: "obj10",
    title: "Crecer Market Share Chile a 25%",
    description: "Expandir presencia en el mercado chileno a través de partnerships estratégicos y marketing localizado.",
    department: departments[6],
    quarter: "Q4-2024",
    owner: users[6],
    status: "en-riesgo",
    progress: 0,
    remi: remis[0],
    calculationMode: "automatic",
    createdAt: "2024-10-01T00:00:00.000Z",
    updatedAt: "2024-11-09T00:00:00.000Z",
    keyResults: [
      { ...createKeyResult("kr10-1", "obj10", "Establecer 5 partnerships estratégicos", users[6], 5, 3, " socios", 0, true, "Negociaciones lentas con partner clave", ""), status: "en-riesgo" as const },
      createKeyResult("kr10-2", "obj10", "Lanzar 3 campañas de marketing localizadas", users[6], 3, 2, " campañas", 0, true, "", ""),
      { ...createKeyResult("kr10-3", "obj10", "Abrir 2 nuevas oficinas regionales", users[6], 2, 1, " oficinas", 0, true, "Demoras en permisos municipales", ""), status: "en-riesgo" as const },
      { ...createKeyResult("kr10-4", "obj10", "Contratar 20 representantes de ventas locales", users[6], 20, 9, " reps", 0, true, "Competencia agresiva por talento", ""), status: "en-riesgo" as const },
    ],
  },
  // Perú Department Objectives - REMI 1
  {
    id: "obj11",
    title: "Establecer Excelencia Operativa en Perú",
    description: "Construir un equipo de operaciones de clase mundial e infraestructura en Perú.",
    department: departments[7],
    quarter: "Q4-2024",
    owner: users[7],
    status: "",
    progress: 0,
    remi: remis[0],
    calculationMode: "automatic",
    createdAt: "2024-10-01T00:00:00.000Z",
    updatedAt: "2024-11-08T00:00:00.000Z",
    keyResults: [
      createKeyResult("kr11-1", "obj11", "Completar construcción oficina Lima", users[7], 100, 85, "%", 0, true, "", ""),
      createKeyResult("kr11-2", "obj11", "Contratar y capacitar equipo de operaciones de 15", users[7], 15, 11, " personas", 0, true, "", ""),
      { ...createKeyResult("kr11-3", "obj11", "Lograr compliance regulatorio local", users[7], 100, 50, "%", 0, true, "Nuevos requerimientos regulatorios identificados", ""), status: "en-riesgo" as const },
    ],
  },
  // Europa Department Objectives - REMI 1
  {
    id: "obj12",
    title: "Lanzar Expansión Mercado EU",
    description: "Entrar y establecer presencia exitosa en mercados europeos clave con ofertas localizadas.",
    department: departments[8],
    quarter: "Q4-2024",
    owner: users[8],
    status: "",
    progress: 0,
    remi: remis[0],
    calculationMode: "automatic",
    createdAt: "2024-10-01T00:00:00.000Z",
    updatedAt: "2024-11-12T00:00:00.000Z",
    keyResults: [
      createKeyResult("kr12-1", "obj12", "Lograr compliance GDPR completo", users[8], 100, 100, "%", 0, true, "", ""),
      createKeyResult("kr12-2", "obj12", "Lanzar en Alemania, Francia y España", users[8], 3, 2, " países", 0, true, "", ""),
      createKeyResult("kr12-3", "obj12", "Establecer equipo de soporte EU", users[8], 10, 6, " agentes", 0, true, "", ""),
      { ...createKeyResult("kr12-4", "obj12", "Firmar 20 clientes enterprise EU", users[8], 20, 11, " clientes", 0, true, "Competencia local fuerte en Francia", ""), status: "en-riesgo" as const },
    ],
  },
];

// Apply calculated progress and status to objectives
objectives.forEach((obj) => {
  if (obj.calculationMode === "automatic") {
    const calculated = calculateObjectiveProgress(obj);
    obj.progress = calculated.progress;
    obj.status = calculated.status;
  }
});

// Available Quarters
export const quarters: Quarter[] = ["Q1-2024", "Q2-2024", "Q3-2024", "Q4-2024", "Q1-2025", "Q2-2025"];
export const currentQuarter: Quarter = "Q4-2024";

// Dashboard Stats Calculator - Updated for new status values
export const getDashboardStats = (): DashboardStats => {
  const currentObjectives = objectives.filter((o) => o.quarter === currentQuarter);
  const allKeyResults = currentObjectives.flatMap((o) => o.keyResults);

  // Recalculate progress/status for all objectives
  currentObjectives.forEach((obj) => {
    const calculated = calculateObjectiveProgress(obj);
    obj.progress = calculated.progress;
    obj.status = calculated.status;
  });

  return {
    totalObjectives: currentObjectives.length,
    completedObjectives: currentObjectives.filter((o) => o.status === "completado").length,
    enRiesgoObjectives: currentObjectives.filter((o) => o.status === "en-riesgo").length,
    sinEstadoObjectives: currentObjectives.filter((o) => o.status === "").length,
    averageProgress: Math.round(
      currentObjectives.reduce((acc, o) => acc + o.progress, 0) / currentObjectives.length
    ),
    totalKeyResults: allKeyResults.length,
    completedKeyResults: allKeyResults.filter((kr) => kr.status === "completado").length,
  };
};

// Progress over time data for charts
export const progressOverTime = [
  { week: "S1", progress: 15, target: 25 },
  { week: "S2", progress: 28, target: 35 },
  { week: "S3", progress: 38, target: 45 },
  { week: "S4", progress: 45, target: 55 },
  { week: "S5", progress: 52, target: 65 },
  { week: "S6", progress: 58, target: 70 },
  { week: "S7", progress: 65, target: 75 },
  { week: "S8", progress: 68, target: 80 },
];

// Status distribution data for charts - Updated for new status values
export const statusDistribution = [
  { status: "Sin Estado", count: 6, fill: "var(--color-muted-foreground)" },
  { status: "En Riesgo", count: 5, fill: "var(--color-warning)" },
  { status: "Completado", count: 1, fill: "var(--color-success)" },
];

// Department performance data for charts
export const departmentPerformance = departments.map((d) => ({
  name: d.name,
  progress: d.averageProgress,
  objectives: d.objectiveCount,
}));

// Notifications for topbar
export const notifications: Notification[] = [
  {
    id: "notif-1",
    type: "warning",
    title: "OKR en riesgo",
    description: "El objetivo 'Mejorar tasa de renovación' está por debajo del 50% de progreso.",
    read: false,
    createdAt: "2024-12-18T10:00:00Z",
  },
  {
    id: "notif-2",
    type: "info",
    title: "Nuevo comentario",
    description: "María García comentó en 'Lanzar MVP del producto digital'.",
    read: false,
    createdAt: "2024-12-17T15:30:00Z",
  },
  {
    id: "notif-3",
    type: "success",
    title: "Objetivo completado",
    description: "Felicitaciones! El objetivo 'Reducir deuda técnica' ha sido completado.",
    read: true,
    createdAt: "2024-12-16T09:00:00Z",
  },
  {
    id: "notif-4",
    type: "info",
    title: "Actualización de KR",
    description: "Carlos Rodríguez actualizó el progreso de 'Alcanzar 10M en ventas'.",
    read: true,
    createdAt: "2024-12-15T14:20:00Z",
  },
];
