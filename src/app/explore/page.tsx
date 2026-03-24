'use client';

import React, { useState, useEffect } from 'react';
import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabase';

const POLLS_PER_PAGE = 10;

export default function ExplorePage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);
  const [polls, setPolls] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchPolls(0);
    // 페이지 진입 시 애니메이션 트리거
    setTimeout(() => setIsLoaded(true), 100);
  }, []);

  const fetchPolls = async (pageNumber: number) => {
    setIsLoading(true);
    const from = pageNumber * POLLS_PER_PAGE;
    const to = from + POLLS_PER_PAGE - 1;

    const { data } = await supabase
      .from('balancia_polls')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (data) {
      if (pageNumber === 0) setPolls(data);
      else setPolls(prev => [...prev, ...data]);
      if (data.length < POLLS_PER_PAGE) setHasMore(false);
    }
    setIsLoading(false);
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchPolls(nextPage);
  };

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] pb-10 font-sans antialiased text-[#1A1A1A] overflow-x-hidden">
      {/* HEADER */}
      <div className={`sticky top-0 z-50 bg-white border-b border-gray-100 p-6 flex items-center gap-4 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={() => router.back()} className="text-black active:scale-90 transition-transform">
          <ChevronLeft size={28} strokeWidth={3} />
        </button>
        <h1 className="text-xl font-[1000] uppercase tracking-tighter text-black">Explorar Dilemas</h1>
      </div>

      {/* POLL LIST SECTION */}
      <div className={`p-6 space-y-3 transition-all duration-1000 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
        {polls.map((poll) => (
          <Link key={poll.id} href={`/vote/${poll.id}`}>
            <div className="bg-white px-6 py-5 rounded-[22px] border border-gray-100 active:bg-gray-50 mb-3 shadow-sm transition-all active:scale-[0.98]">
              <p className="text-[15px] font-[1000] truncate text-gray-700 uppercase leading-none">
                {poll.title}
              </p>
            </div>
          </Link>
        ))}

        {/* LOAD MORE BUTTON */}
        {hasMore && polls.length > 0 && (
          <button 
            onClick={handleLoadMore}
            disabled={isLoading}
            className="w-full mt-6 py-5 rounded-[24px] bg-black text-white font-[1000] uppercase text-xs tracking-[0.2em] active:scale-[0.97] transition-all disabled:opacity-20 shadow-lg"
          >
            {isLoading ? 'Cargando...' : 'Cargar más +'}
          </button>
        )}

        {/* EMPTY STATE */}
        {!isLoading && polls.length === 0 && (
          <div className="text-center py-20 text-gray-300 font-black uppercase text-[10px] tracking-[0.3em]">
            No hay dilemas disponibles
          </div>
        )}
      </div>
    </div>
  );
}