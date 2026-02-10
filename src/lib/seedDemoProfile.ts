import { createClient } from './supabase/server';
import { ProfileData } from './types';

/**
 * Script de servidor para sembrar datos DEMO automáticamente.
 * Se ejecuta exclusivamente en el servidor para garantizar que la sesión (cookies)
 * y el RLS funcionen correctamente.
 */
export async function seedDemoProfile() {
    const supabase = await createClient();

    // 1. Obtener usuario actual desde la sesión del servidor
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const userId = user.id;

    // 2. Verificar si ya existe un perfil con contenido
    const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, bio')
        .eq('id', userId)
        .single();

    // Si ya existe nombre o bio, no sembramos nada nuevo
    if (profile?.full_name || profile?.bio) {
        return;
    }

    // 3. Datos DEMO Profesionales (Juan Perez)
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
                period: "2021 - Actual",
                title: "Product Manager",
                description: "Liderazgo de la visión y estrategia de productos SaaS de alto impacto en Globant.",
                bullets: [
                    "Incremento del 40% en retención de usuarios a través de mejoras en UX.",
                    "Liderazgo en el lanzamiento de 3 productos clave del ecosistema digital.",
                    "Optimización de costos operativos en un 15% mediante automatización."
                ]
            },
            {
                id: 2,
                period: "2019 - 2021",
                title: "UX Lead",
                description: "Gestión del diseño de experiencia de usuario para plataformas en Rappi.",
                bullets: [
                    "Reducción del churn rate en un 25% tras rediseño completo del checkout.",
                    "Implementación de cultura de user research y pruebas de usabilidad continuas.",
                    "Dirección de un equipo de 5 diseñadores UI/UX."
                ]
            }
        ],
        education: [
            {
                id: 1,
                period: "2016",
                degree: "Ingeniería Industrial",
                institution: "Universidad Nacional"
            }
        ],
        theme_color: "#FF5E1A",
        avatar_url: "https://randomuser.me/api/portraits/men/44.jpg"
    };

    // 4. Insertar en 'profiles' usando el ID del usuario
    await supabase.from('profiles').upsert({
        id: userId,
        ...demoData,
        updated_at: new Date().toISOString()
    });

    // 5. Sincronizar con 'drafts' para que el editor (cliente) vea la data inmediatamente
    const uiData: ProfileData = {
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

    await supabase.from('drafts').upsert({
        user_id: userId,
        content: uiData,
        is_current: true,
        updated_at: new Date().toISOString()
    });
}
