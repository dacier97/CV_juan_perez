export const mockCVData = {
  themeColor: "#FF5E1A", // Default orange/secondary color
  personalInfo: {
    name: "DANIEL",
    lastName: "ORTIZ",
    role: "Ingeniero Electrónico",
    photo: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400",
    photos: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400&h=400",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=400&h=400",
      "https://images.unsplash.com/photo-1554151228-14d9def656e4?auto=format&fit=crop&q=80&w=400&h=400"
    ],
    contactInfo: [
      { id: 1, type: "email", value: "daniel.ortiz@ejemplo.com" },
      { id: 2, type: "phone", value: "+57 321 000 0000" },
      { id: 3, type: "location", value: "Bogotá, Colombia" },
    ],
  },
  objective: "Ingeniero electrónico con experiencia en dirección y gestión estratégica de proyectos tecnológicos. Especialista en transformación digital, software, redes y ciberseguridad, aplicando Scrum y PMI para asegurar eficiencia y cumplimiento de objetivos. Resuelvo desafíos de integración tecnológica, automatización y continuidad operativa, liderando equipos multidisciplinarios. Impacto en telecomunicaciones, infraestructura TI, analítica de datos, energía y soluciones digitales empresariales.",
  skills: {
    professional: [
      "Gestión de Proyectos",
      "Transformación Digital",
      "Ciberseguridad",
      "Redes y Software",
      "Metodología Scrum",
      "Liderazgo de Equipos",
      "Continuidad Operativa",
      "Analítica de Datos",
      "Infraestructura TI",
    ],
  },
  experience: [
    {
      id: 1,
      period: "2020 — Presente",
      title: "DIRECTOR DE PROYECTOS TECNOLÓGICOS — TECH SOLUTIONS",
      description: "Liderazgo en la ejecución de proyectos de infraestructura crítica y soluciones de ciberseguridad para el sector energía y telecomunicaciones.",
      bullets: [
        "Implementación exitosa de sistemas de automatización industrial con Scrum.",
        "Reducción del 20% en tiempos de inactividad operativa mediante optimización de redes.",
        "Gestión de presupuestos superiores a $500k USD con cumplimiento del 100% de hitos.",
      ],
    },
    {
      id: 2,
      period: "2017 — 2020",
      title: "ESPECIALISTA EN INFRAESTRUCTURA TI — GLOBAL NETWORKS",
      description: "Diseño y despliegue de redes empresariales y protocolos de seguridad informática. Soporte avanzado a infraestructuras de misión crítica.",
      bullets: [
        "Migración completa a entornos de nube híbrida para clientes corporativos.",
        "Desarrollo de planes de continuidad del negocio y recuperación ante desastres.",
        "Capacitación de equipos técnicos en nuevas tecnologías de red.",
      ],
    },
  ],
  education: [
    {
      id: 1,
      period: "2012 — 2017",
      degree: "INGENIERÍA ELECTRÓNICA",
      institution: "PONTIFICIA UNIVERSIDAD JAVERIANA",
    },
    {
      id: 2,
      period: "2018",
      degree: "CERTIFICACIÓN PMP (PROJECT MANAGEMENT PROFESSIONAL)",
      institution: "PROJECT MANAGEMENT INSTITUTE",
    }
  ]
};
