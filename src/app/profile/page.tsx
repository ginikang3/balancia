'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, LogOut, User, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async (provider: 'google' | 'facebook') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      alert('Error: ' + error.message);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  if (loading) return <div className="min-h-screen bg-white flex items-center justify-center font-[1000] text-gray-400 uppercase tracking-tighter text-xl">Cargando...</div>;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] text-[#1A1A1A] select-none pb-20">
      {/* 1. 상단 헤더 */}
      <div className="flex items-center p-6 pt-10">
        <button onClick={() => router.back()} className="p-2 -ml-2 active:scale-90 transition-transform">
          <ChevronLeft size={28} strokeWidth={3} />
        </button>
        <h1 className="ml-2 text-2xl font-[1000] uppercase tracking-tighter">Mi Perfil</h1>
      </div>

      <div className="px-8 mt-6 text-center">
        {user ? (
          /* --- 로그인 된 상태 --- */
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 flex flex-col items-center">
              <div className="w-24 h-24 bg-black rounded-[30px] flex items-center justify-center mb-6 overflow-hidden shadow-xl border-4 border-white">
                {user.user_metadata.avatar_url ? (
                  <img src={user.user_metadata.avatar_url} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={40} className="text-white" />
                )}
              </div>
              <h2 className="text-2xl font-[1000] uppercase tracking-tight leading-none mb-2">
                {user.user_metadata.full_name || 'Usuario'}
              </h2>
              <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{user.email}</p>
            </div>

            <div className="space-y-3">
              <button className="w-full bg-white p-6 rounded-[24px] border border-gray-100 flex items-center justify-center gap-4 active:scale-95 transition-all shadow-sm">
                <ShieldCheck className="text-[#4A90E2]" />
                <span className="font-black uppercase text-sm">Mis Votos</span>
              </button>
              <button onClick={handleLogout} className="w-full bg-red-50 p-6 rounded-[24px] border border-red-100 flex items-center justify-center gap-4 active:scale-95 transition-all text-red-500">
                <LogOut />
                <span className="font-black uppercase text-sm tracking-widest">Cerrar Sesión</span>
              </button>
            </div>
          </div>
        ) : (
          /* --- 로그인 안 된 상태 --- */
          <div className="mt-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="mb-12">
              <h2 className="text-[42px] font-[1000] leading-[1.05] uppercase tracking-tighter mb-6">
                Únete a <br /> Balancia
              </h2>
              <p className="text-gray-400 font-black text-sm leading-snug uppercase tracking-tight">
                Vota en los dilemas más virales <br /> y guarda tus resultados favoritos
              </p>
            </div>

            <div className="flex flex-col gap-4">
              {/* Google Login */}
              <button 
                onClick={() => handleLogin('google')}
                className="w-full bg-white text-black p-6 rounded-[28px] border-2 border-gray-100 flex items-center justify-center gap-4 active:scale-95 transition-all shadow-sm"
              >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/action/google.svg" alt="Google" className="w-6 h-6" />
                <span className="font-[1000] uppercase tracking-tight text-[15px]">Continuar con Google</span>
              </button>

              {/* Facebook Login */}
              <button 
                onClick={() => handleLogin('facebook')}
                className="w-full bg-[#1877F2] text-white p-6 rounded-[28px] flex items-center justify-center gap-4 active:scale-95 transition-all shadow-lg"
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="font-[1000] uppercase tracking-tight text-[15px]">Continuar con Facebook</span>
              </button>
            </div>

            <div className="mt-16 text-center">
              <p className="text-[10px] text-gray-300 font-black uppercase tracking-[0.2em]">
                Al continuar, aceptas nuestros <br /> 
                <span className="underline decoration-gray-200 decoration-2 underline-offset-4 cursor-pointer">términos 및 condiciones</span>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}