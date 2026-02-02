import { getPublicProfile } from '@/app/actions/profile';
import CVTemplate from "@/components/cv/CVTemplate";
import { mockCVData } from "@/lib/mockData";
import { Metadata } from 'next';
import Link from 'next/link';
import { User } from 'lucide-react';

export const metadata: Metadata = {
  title: "Daniel Ortiz | Portfolio Profesional",
  description: "Explora mi trayectoria profesional, proyectos y habilidades en Ingeniería Electrónica y Desarrollo Full Stack.",
};

import { createClient } from '@/lib/supabase/server';

export default async function PortfolioPage() {
  const profile = await getPublicProfile();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let cvData = mockCVData;

  if (profile) {
    cvData = {
      ...mockCVData,
      themeColor: profile.theme_color || mockCVData.themeColor,
      personalInfo: {
        ...mockCVData.personalInfo,
        name: profile.full_name?.split(' ')[0] || mockCVData.personalInfo.name,
        lastName: profile.full_name?.split(' ').slice(1).join(' ') || mockCVData.personalInfo.lastName,
        role: profile.role || mockCVData.personalInfo.role,
        photo: profile.avatar_url || '',
        photos: profile.avatar_gallery?.length ? profile.avatar_gallery : ['', '', ''],
        contactInfo: profile.contact_info || mockCVData.personalInfo.contactInfo,
      },
      objective: profile.bio || mockCVData.objective,
      skills: profile.skills || mockCVData.skills,
      experience: profile.experience || mockCVData.experience,
      education: profile.education || mockCVData.education,
    };
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      {/* Minimalist Top Bar for Admin Access */}
      <div className="w-full flex justify-end p-4 absolute top-0 right-0 z-10">
        <Link
          href={user ? "/dashboard" : "/login"}
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-primary transition-colors bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-100 shadow-sm"
        >
          <User size={14} />
          {user ? "Ir al Dashboard" : "Admin Login"}
        </Link>
      </div>

      <main className="w-full">
        <CVTemplate data={cvData} isAtsFriendly={false} />
      </main>

      <footer className="py-12 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} Daniel Ortiz. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
