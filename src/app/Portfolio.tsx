import { getPublicProfile } from '@/app/actions/profile';
import CVTemplate from "@/components/cv/CVTemplate";
import { Metadata } from 'next';
import Link from 'next/link';
import { User } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: "Juan Pérez | Curriculum Vitae Profesional",
  description: "Explora la trayectoria profesional y habilidades de Juan Pérez.",
};

export default async function PortfolioPage() {
  const profile = await getPublicProfile(); // Already normalized with defaults
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

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
        <CVTemplate data={profile} isAtsFriendly={false} />
      </main>

      <footer className="py-12 text-center text-gray-400 text-sm">
        <p>© {new Date().getFullYear()} Juan Pérez. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
