-- ==============================
-- RESET OPCIONAL (recomendado en demos)
-- ==============================
delete from profiles;

-- ==============================
-- SEED PERFIL DEMO
-- ==============================
insert into profiles (
  id,
  full_name,
  role,
  bio,
  skills,
  experience,
  education,
  contact_info,
  theme_color,
  avatar_url,
  avatar_gallery
)
values (
  gen_random_uuid(),

  'Juan Pérez',
  'Project Manager',

  'Profesional con experiencia liderando proyectos tecnológicos, optimizando procesos y coordinando equipos multidisciplinarios para entregar soluciones de alto impacto.',

  -- skills (ARRAY)
  '[
    "Project Management",
    "Agile / Scrum",
    "Next.js",
    "React",
    "Supabase",
    "TailwindCSS"
  ]'::jsonb,

  -- experience (ARRAY)
  '[
    {
      "company":"Globant",
      "role":"Frontend Developer",
      "period":"2022-2024",
      "description":"Desarrollo de aplicaciones web modernas con React y Next.js"
    },
    {
      "company":"Konecta",
      "role":"Soporte Técnico",
      "period":"2020-2022",
      "description":"Gestión de redes GPON y resolución de incidencias críticas"
    }
  ]'::jsonb,

  -- education (ARRAY)
  '[
    {
      "institution":"Universidad Nacional",
      "degree":"Ingeniería Electrónica",
      "period":"2015-2020"
    }
  ]'::jsonb,

  -- ✅ contact_info (ARRAY para .map())
  '[
    {"type":"email","value":"juan@email.com"},
    {"type":"phone","value":"+57 300000000"},
    {"type":"linkedin","value":"linkedin.com/in/juanperez"}
  ]'::jsonb,

  '#7C3AED',

  -- avatar principal
  'https://images.unsplash.com/photo-1494790108755-2616b612b786',

  -- galería (ARRAY de texto)
  ARRAY[
    'https://images.unsplash.com/photo-1494790108755-2616b612b786',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d'
  ]
);
