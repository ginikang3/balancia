'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Send } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

export default function CreatePollPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [option1, setOption1] = useState('');
  const [option2, setOption2] = useState('');

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !option1.trim() || !option2.trim()) {
      return alert('¡Por favor, completa todos los campos!');
    }

    setLoading(true);

    try {
      // 1. 현재 로그인한 유저 세션 가져오기
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        alert('Debes iniciar sesión para publicar.');
        router.push('/profile');
        return;
      }

      // 2. balancia_polls 테이블에 데이터 삽입 (author_id 추가)
      const { error } = await supabase
        .from('balancia_polls')
        .insert([
          { 
            title: title.trim(), 
            option_1: option1.trim(), 
            option_2: option2.trim(),
            category: 'General',
            is_hot: false,
            votes_1: 0,
            votes_2: 0,
            author_id: session.user.id // 유저 ID를 여기에 박습니다
          }
        ]);

      if (error) throw error;

      alert('¡Tu dilema ha sido publicado! 🚀');
      router.push('/');
      router.refresh();
    } catch (error: any) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white font-sans antialiased text-[#1A1A1A] overflow-x-hidden">
      {/* 1. HEADER */}
      <header className={`px-6 pt-12 pb-6 flex items-center justify-between transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={() => router.back()} className="p-2 -ml-2 text-gray-400 active:scale-90 transition-transform">
          <ChevronLeft size={28} />
        </button>
        <h1 className="text-xl font-[1000] tracking-tighter uppercase">NUEVA BALANCIA</h1>
        <div className="w-10"></div>
      </header>

      <main className="px-8 pt-4">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 3. 제목 입력창 */}
          <div className={`transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Título de la encuesta</label>
            <input
              type="text"
              placeholder="¿Qué prefieres...?"
              className="w-full text-xl font-bold border-b-2 border-gray-100 focus:border-black outline-none pb-2 transition-all"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* 4. 옵션 A */}
          <div className={`bg-gray-50 p-6 rounded-[32px] border-2 border-dashed border-gray-200 transition-all duration-700 delay-[200ms] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <label className="block text-xs font-black text-blue-500 uppercase tracking-widest mb-2">Opción A</label>
            <input
              type="text"
              placeholder="Escribe la opción 1"
              className="w-full bg-transparent text-lg font-bold outline-none"
              value={option1}
              onChange={(e) => setOption1(e.target.value)}
              required
            />
          </div>

          {/* VS 배지 */}
          <div className={`flex justify-center -my-4 relative z-10 transition-all duration-1000 delay-[300ms] ${isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
            <div className="bg-white px-4 py-1 rounded-full border border-gray-100 shadow-sm text-xs font-black text-gray-300">VS</div>
          </div>

          {/* 5. 옵션 B */}
          <div className={`bg-gray-50 p-6 rounded-[32px] border-2 border-dashed border-gray-200 transition-all duration-700 delay-[300ms] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <label className="block text-xs font-black text-red-500 uppercase tracking-widest mb-2">Opción B</label>
            <input
              type="text"
              placeholder="Escribe la option 2"
              className="w-full bg-transparent text-lg font-bold outline-none"
              value={option2}
              onChange={(e) => setOption2(e.target.value)}
              required
            />
          </div>

          {/* 6. 버튼 */}
          <div className={`transition-all duration-700 delay-[400ms] ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-5 rounded-[28px] font-black text-lg flex items-center justify-center gap-3 transition-all ${
                loading ? 'bg-gray-200 text-gray-400' : 'bg-black text-white active:scale-95 shadow-xl shadow-black/10'
              }`}
            >
              <Send size={20} />
              {loading ? 'PUBLICANDO...' : 'PUBLICAR AHORA'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}