'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, User, Vote, FolderEdit } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function MyQuizzesPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [myPolls, setMyPolls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        router.replace('/profile');
        return;
      }
      
      setUser(session.user);

      // 내가 만든 투표만 가져오기 (author_id 필터링)
      const { data: created, error } = await supabase
        .from('balancia_polls')
        .select('*')
        .eq('author_id', session.user.id)
        .order('created_at', { ascending: false });

      if (!error && created) {
        setMyPolls(created);
      }

      setLoading(false);
      setTimeout(() => setIsLoaded(true), 100);
    };

    fetchData();
  }, [router]);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white font-sans antialiased text-[#1A1A1A] pb-20">
      {/* HEADER */}
      <header className={`px-6 pt-12 pb-6 flex items-center gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={() => router.back()} className="p-2 -ml-2 text-black active:scale-90 transition-transform">
          <ChevronLeft size={28} strokeWidth={3} />
        </button>
        <h1 className="text-xl font-[1000] uppercase tracking-tighter">Mis Dilemas</h1>
      </header>

      {/* USER INFO SECTION */}
      <div className={`px-8 mb-10 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex items-center gap-4 bg-gray-50 p-6 rounded-[32px]">
          <div className="w-14 h-14 bg-black rounded-full flex items-center justify-center text-white">
            <User size={28} />
          </div>
          <div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">Usuario</p>
            <p className="text-lg font-[1000] uppercase tracking-tight truncate w-40">
              {user?.email?.split('@')[0] || 'Anónimo'}
            </p>
          </div>
        </div>
      </div>

      {/* SECTION TITLE */}
      <div className={`px-8 mb-4 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <h2 className="text-[11px] font-black text-black uppercase tracking-widest">Contenido Creado</h2>
      </div>

      {/* CONTENT LIST */}
      <div className={`px-6 space-y-3 transition-all duration-1000 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        {loading ? (
          <p className="text-center py-20 font-black text-gray-200 uppercase text-[10px] tracking-widest animate-pulse">Cargando...</p>
        ) : (
          myPolls.length > 0 ? (
            myPolls.map((poll) => (
              <Link key={poll.id} href={`/vote/${poll.id}`}>
                <div className="bg-white p-6 rounded-[24px] border border-gray-100 mb-3 shadow-sm active:scale-[0.98] transition-all">
                  <p className="text-sm font-bold uppercase text-gray-700">{poll.title}</p>
                  <div className="mt-3 flex items-center gap-2 text-[10px] font-black text-[#4A90E2] uppercase">
                    <Vote size={12} />
                    <span>{(poll.votes_1 || 0) + (poll.votes_2 || 0)} Votos</span>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-gray-100 rounded-[32px]">
               <FolderEdit size={40} className="mx-auto text-gray-100 mb-4" />
               <p className="font-black text-gray-200 uppercase text-[10px] tracking-widest">No has creado nada aún</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}