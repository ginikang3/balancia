'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Plus, Home, User, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation'; // 경로 확인용 추가
import { supabase } from './lib/supabase';

export default function BalanciaHomePage() {
  const pathname = usePathname(); // 현재 경로 가져오기
  const [isLoaded, setIsLoaded] = useState(false);
  const [hotPolls, setHotPolls] = useState<any[]>([]);
  const [recentPolls, setRecentPolls] = useState<any[]>([]);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const twoDaysAgo = new Date();
        twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
        const dateLimit = twoDaysAgo.toISOString();

        const { data: hotData } = await supabase
          .from('balancia_polls')
          .select('*')
          .gt('created_at', dateLimit)
          .order('votes_1', { ascending: false })
          .limit(2);
        
        if (hotData) setHotPolls(hotData);

        const hotIds = hotData?.map(poll => poll.id) || [];

        const { data: recentData } = await supabase
          .from('balancia_polls')
          .select('*')
          .not('id', 'in', `(${hotIds.length > 0 ? hotIds.join(',') : '00000000-0000-0000-0000-000000000000'})`)
          .order('created_at', { ascending: false })
          .limit(5);

        if (recentData) setRecentPolls(recentData);
      } catch (error) {
        console.error('Error fetching polls:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    fetchPolls();
  }, []);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] pb-28 font-sans antialiased text-[#1A1A1A] overflow-x-hidden">
      {/* HEADER */}
      <header className={`p-6 pt-10 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <h1 className="text-4xl font-[1000] tracking-tighter text-black uppercase">BALANCIA</h1>
        <p className="text-gray-500 text-sm mt-1 font-bold">¿Cuál es tu elección perfecta? ⚖️</p>
      </header>

      {/* HOT SECTION */}
      <section className={`px-6 mb-8 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-orange-100 p-1.5 rounded-full"><Flame size={20} className="text-orange-500" fill="currentColor" /></div>
          <h2 className="text-xl font-[1000] uppercase tracking-tight text-black">Hot</h2>
        </div>
        <div className="space-y-4">
          {hotPolls.map((poll) => (
            <Link key={poll.id} href={`/vote/${poll.id}`}>
              <div className="bg-white p-6 rounded-[28px] shadow-sm border border-gray-100 active:scale-[0.98] transition-all mb-4">
                <div className="flex flex-col gap-1">
                  <span className="text-lg font-[1000] leading-tight uppercase">{poll.title}</span>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs font-black text-gray-400">{(poll.votes_1 || 0) + (poll.votes_2 || 0)} VOTOS</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* RECIENTES SECTION */}
      <section className={`px-6 transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex items-center gap-2 mb-4">
          <div className="bg-blue-100 p-1.5 rounded-full"><Sparkles size={20} className="text-blue-500" fill="currentColor" /></div>
          <h2 className="text-xl font-[1000] uppercase tracking-tight text-black">Recientes</h2>
        </div>
        <div className="space-y-3">
          {recentPolls.map((poll) => (
            <Link key={poll.id} href={`/vote/${poll.id}`}>
              <div className="bg-white px-6 py-5 rounded-[22px] border border-gray-100 active:bg-gray-50 mb-3 shadow-sm">
                <p className="text-[15px] font-[1000] truncate text-gray-700 uppercase">{poll.title}</p>
              </div>
            </Link>
          ))}
        </div>

        <Link href="/explore">
          <button className="w-full mt-4 py-4 rounded-[22px] border-2 border-dashed border-gray-200 text-gray-400 font-[1000] uppercase text-[10px] tracking-[0.2em] active:bg-gray-50 transition-all">
            Ver todos los dilemas 🗳️
          </button>
        </Link>
      </section>

      {/* BOTTOM NAV & FAB */}
      <Link href="/create">
        <button className="fixed bottom-24 right-6 w-16 h-16 bg-black text-white rounded-[24px] shadow-2xl flex items-center justify-center z-50 active:scale-95 transition-all">
          <Plus size={32} strokeWidth={3} />
        </button>
      </Link>

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-gray-100 px-8 py-5 flex justify-between items-center rounded-t-[32px] z-40">
        {/* Inicio */}
        <Link href="/" className={`flex flex-col items-center gap-1 ${pathname === '/' ? 'text-black' : 'text-gray-400'}`}>
          <Home size={24} fill={pathname === '/' ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-[1000] uppercase">Inicio</span>
        </Link>
        
        {/* Mis Quiz - 연결 및 상태 반영 완료 */}
        <Link href="/my-quizzes" className={`flex flex-col items-center gap-1 ${pathname === '/my-quizzes' ? 'text-black' : 'text-gray-400'}`}>
          <MessageCircle size={24} fill={pathname === '/my-quizzes' ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-[1000] uppercase">Mis Quiz</span>
        </Link>

        {/* Perfil */}
        <Link href="/profile" className={`flex flex-col items-center gap-1 ${pathname === '/profile' ? 'text-black' : 'text-gray-400'}`}>
          <User size={24} fill={pathname === '/profile' ? 'currentColor' : 'none'} />
          <span className="text-[10px] font-[1000] uppercase">Perfil</span>
        </Link>
      </nav>
    </div>
  );
}