import { createClient as createBrowserClient } from './supabase/client';
import { ProfileData } from './types';

/**
 * Script para sembrar datos DEMO automáticamente si el usuario no tiene perfil.
 * Compatible con Cliente y Servidor.
 */
export async function seedDemoProfile(supabaseInstance?: any) {
    const supabase = supabaseInstance || createBrowserClient();

    // 1. Obtener usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const userId = user.id;

    // 2. Verificar si ya existe un perfil con contenido
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, bio')
        .eq('id', userId)
        .single();

    // Si ya tiene nombre o bio, asumimos que no es un perfil nuevo/vacio
    if (profile?.full_name || profile?.bio) {
        return;
    }

    // 3. Datos DEMO Masculinos (Juan Perez) - Según requerimientos
    const demoData = {
        full_name: "Juan Perez",
        role: "Senior Product Manager | UX & Digital Strategy",
        bio: "Profesional con 8+ años liderando productos digitales, transformación tecnológica y equipos ágiles. Experto en UX, analytics y growth.",
        contact_info: {
            email: "juan_perez@hotmail.com",
            phone: "+57 300 555 7788"
        },
        skills: {
            professional: [
                "Product Management",
                "UX Research",
                "Scrum / Agile",
                "Data Analytics",
                "Roadmapping",
                "Stakeholder Management"
            ]
        },
        experience: [
            {
                id: 1,
                period: "2019 - Presente",
                title: "Product Manager",
                description: "Liderazgo de la visión y estrategia de productos SaaS de alto impacto. Coordinación de equipos multidisciplinarios bajo metodologías ágiles.",
                bullets: [
                    "Incremento del 40% en retención de usuarios a través de mejoras en UX.",
                    "Liderazgo en el lanzamiento de 3 productos clave del ecosistema digital.",
                    "Optimización de costos operativos en un 15% mediante automatización."
                ]
            },
            {
                id: 2,
                period: "2016 - 2019",
                title: "UX Lead",
                description: "Gestión del diseño de experiencia de usuario para plataformas fintech. Implementación de sistemas de diseño escalables.",
                bullets: [
                    "Reducción del churn rate en un 25% tras rediseño completo del checkout.",
                    "Implementación de cultura de user research y pruebas de usabilidad continuas.",
                    "Dirección de un equipo de 5 diseñadores UI/UX."
                ]
            },
            {
                id: 3,
                period: "2014 - 2016",
                title: "Business Analyst",
                description: "Análisis de procesos de negocio y requisitos técnicos para la transformación digital de clientes corporativos.",
                bullets: [
                    "Levantamiento de requerimientos para más de 12 proyectos exitosos.",
                    "Intervención en la optimización de flujos de trabajo reduciendo tiempos en un 30%.",
                    "Aseguramiento del alineamiento entre negocio y tecnología."
                ]
            }
        ],
        education: [
            {
                id: 1,
                period: "2010 - 2015",
                degree: "Ingeniería Industrial",
                institution: "Universidad Nacional"
            },
            {
                id: 2,
                period: "2017 - 2018",
                degree: "MBA Digital Business",
                institution: "Business School International"
            }
        ],
        theme_color: "#FF5E1A",
        avatar_url: "https://randomuser.me/api/portraits/men/44.jpg"
    };

    // 4. Insertar/Upsert en la tabla 'profiles'
    const { error: upsertError } = await supabase
        .from('profiles')
        .upsert({
            id: userId,
            ...demoData,
            updated_at: new Date().toISOString()
        });

    if (upsertError) {
        console.error('Error seeding demo profile:', upsertError);
        return;
    }

    // 5. Sincronizar con la tabla 'drafts' para que el editor también vea los datos
    const uiFriendlyData: ProfileData = {
        personalInfo: {
            name: "Juan",
            lastName: "Perez",
            role: demoData.role,
            photo: demoData.avatar_url,
            photos: [demoData.avatar_url, '', ''],
            contactInfo: demoData.contact_info
        },
        skills: demoData.skills,
        experience: demoData.experience,
        education: demoData.education,
        objective: demoData.bio,
        themeColor: demoData.theme_color
    };

    await supabase
        .from('drafts')
        .upsert({
            user_id: userId,
            content: uiFriendlyData,
            is_current: true,
            updated_at: new Date().toISOString()
        });
}
