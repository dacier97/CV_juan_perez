# 📄 Plan de Desarrollo y Arquitectura de la Aplicación

Este documento define la **arquitectura completa**, el **diseño técnico** y el **plan de implementación** de una aplicación web para la creación de **CV / Hojas de Vida profesionales y Cartas de Presentación**, optimizada para ATS.

El archivo está diseñado para ser consumido por el **IDE Google Antigravity**, proporcionando el contexto necesario para generar el sistema completo: frontend, backend, autenticación, base de datos y despliegue.

---

## 🎯 Objetivo del Proyecto

Desarrollar una aplicación web **responsive** que permita a los usuarios crear, personalizar y descargar CVs profesionales con diseño moderno, infografías y compatibilidad ATS, incluyendo autenticación y control de acceso.

---

## 🧩 Alcance Funcional

### Funcionalidades Principales

- Creación de **CV / Hoja de Vida profesional**
- Generación de **Carta de Presentación**
- Redacción guiada y optimizada para **ATS**
- Diseño moderno con **infografías**
- Personalización completa de campos
- Cambio de **foto de perfil ilimitado**
- Descarga en **PDF y Word** desde la aplicación
- Soporte para documentos de hasta **4 páginas**
- Gestión de múltiples CV por usuario

### Tipos de Usuario Objetivo

- Perfiles junior y entry-level
- Profesionales
- Gerentes y directivos
- Emprendedores
- Ejecutivos (CEO, CTO, CFO, SVP, etc.)

---

## 🧱 Arquitectura General

Arquitectura **Full Stack moderna**, desacoplada y escalable:

- **Frontend**: Next.js + Tailwind CSS
- **Backend / BaaS**: Supabase (PostgreSQL)
- **Autenticación y Autorización**: Supabase Auth
- **Almacenamiento**: Supabase Storage (fotos y documentos)
- **Control de Versiones**: Git + GitHub

---

# 🟢 FASE 1: FRONTEND

## 🎨 Objetivo

Construir la interfaz de usuario completa, basada en un **modelo de imagen suministrado**, priorizando UX, accesibilidad y diseño responsive.

---

## 🛠️ Tecnologías Frontend

- **Framework**: Next.js (App Router)
- **Estilos**: Tailwind CSS
- **Manejo de estado**: React Context / Zustand
- **Renderizado**: SSR + CSR híbrido
- **Generación de documentos**: Librerías JS (PDF / DOCX)

---

## 🧩 Componentes Clave

### UI / Layout

- `Navbar`
- `Footer`
- `Sidebar (Dashboard)`
- `ResponsiveContainer`

### CV Builder

- `CVEditor`
- `SectionEditor` (Experiencia, Educación, Skills, etc.)
- `InfographicBlocks`
- `PhotoUploader`
- `TemplateSelector`

### Autenticación

- `LoginForm`
- `RegisterForm`
- `ProtectedRoute`

### Exportación

- `PDFExporter`
- `WordExporter`

---

## 📁 Estructura de Proyecto (Frontend)

```
/app
  /auth
  /dashboard
  /editor
  /templates
  /preview
/components
  /ui
  /forms
  /cv
/lib
/hooks
/styles
/public
```

---

## 📱 Responsive Design

- Mobile First
- Breakpoints Tailwind
- Compatibilidad total escritorio / tablet / móvil

---

## 🔐 Seguridad Frontend

- Rutas protegidas por sesión
- Validación de formularios
- Control de acceso por usuario

---

# 🔵 FASE 2: BACKEND (SUPABASE)

## 🎯 Objetivo

Implementar persistencia de datos, autenticación, autorización y almacenamiento de archivos.

---

## 🛠️ Tecnologías Backend

- **Supabase Auth**
- **Supabase Database (PostgreSQL)**
- **Supabase Storage**
- **Row Level Security (RLS)**

---

## 🧬 Modelo de Datos (PostgreSQL)

### Tabla: users (Supabase)

- id (uuid)
- email
- created_at

### Tabla: profiles

- id
- user_id (FK)
- full_name
- profession
- summary
- photo_url

### Tabla: cvs

- id
- user_id (FK)
- title
- template_id
- created_at
- updated_at

### Tabla: cv_sections

- id
- cv_id (FK)
- type (experience, education, skills, etc.)
- content (JSONB)

### Tabla: cover_letters

- id
- cv_id (FK)
- content

---

## 🔐 Autenticación y Autorización

- Registro / Login con email
- Sesiones JWT
- Row Level Security:
  - Cada usuario accede solo a sus datos

---

## 🗂️ Almacenamiento

- Bucket: `profile-photos`
- Bucket: `exports`
- Control de acceso privado

---

## 🔄 Flujo de Datos

1. Usuario se autentica
2. Crea o edita CV
3. Datos se guardan en PostgreSQL
4. Foto se sube a Storage
5. Usuario exporta PDF / Word

---

## 🔧 Control de Versiones

- Repositorio GitHub
- Ramas:
  - `main`
  - `develop`
  - `feature/*`

---

## 🚀 Despliegue (Sugerido)

- Frontend: Vercel
- Backend: Supabase

---

## 📌 Consideraciones Futuras

- IA para redacción automática
- Plantillas premium
- Multi-idioma
- Pagos (Stripe)
- Historial de versiones de CV

---

## ✅ Resultado Esperado

Una aplicación **moderna, escalable y segura**, lista para producción, capaz de crear CVs profesionales optimizados para ATS con excelente experiencia de usuario.

---

📎 **Este archivo sirve como fuente única de verdad para el IDE Google Antigravity.**

