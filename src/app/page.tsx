'use client';

import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, Search, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { supabase } from './lib/supabase';

const CATEGORIES = ['전체', '경제', '부동산', '정치', '사회', '복지'];

export default function BalanciaHomePage() {
  const [isMounted, setIsMounted] = useState(false); // 하이드레이션 방지
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState('전체');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [hotPolls, setHotPolls] = useState<any[]>([]);
  const [categoryPolls, setCategoryPolls] = useState<any[]>([]);

  // 1. 컴포넌트 마운트 체크
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 2. 데이터 페칭 (탭이나 검색어 바뀔 때마다)
  useEffect(() => {
    if (isMounted) {
      fetchMainData();
    }
  }, [isMounted, activeTab, searchTerm]);

  const fetchMainData = async () => {
    try {
      // HOT 섹션 (최근 7일로 확장해서 데이터 잘 나오게 수정)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const { data: hotData } = await supabase
        .from('balancia_polls')
        .select('*')
        .gt('created_at', sevenDaysAgo.toISOString())
        .order('votes_1', { ascending: false })
        .limit(3);
      if (hotData) setHotPolls(hotData);

      // 카테고리별 + 검색 필터 쿼리
      let query = supabase.from('balancia_polls').select('*');
      
      if (activeTab !== '전체') {
        query = query.eq('category', activeTab);
      }
      
      if (searchTerm) {
        query = query.ilike('title', `%${searchTerm}%`);
      }

      const { data: catData } = await query.order('created_at', { ascending: false }).limit(10);
      if (catData) setCategoryPolls(catData);
      
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  // 하이드레이션 완료 전엔 빈 화면 대신 기본 배경만 출력
  if (!isMounted) return <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA]" />;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-[#F8F9FA] pb-20 font-sans antialiased text-[#1A1A1A] overflow-x-hidden">
      
      {/* SEARCH & HEADER */}
      <header className={`p-6 pt-10 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-4xl font-[1000] tracking-tighter text-black uppercase">지금 국회는</h1>
            <p className="text-gray-500 text-xs mt-1 font-bold">당신의 선택이 법이 됩니다 ⚖️</p>
          </div>
        </div>

        <div className="relative group">
          <input 
            type="text"
            placeholder="법안 이름, 의원 검색..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white border-2 border-gray-100 rounded-2xl py-4 pl-12 pr-4 font-bold text-sm focus:outline-none focus:border-black transition-all shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-black transition-colors" size={20} strokeWidth={3} />
        </div>
      </header>

      {/* HOT SECTION */}
      <section className={`px-6 mb-10 transition-all duration-700 delay-200 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="bg-orange-100 p-1.5 rounded-full"><Flame size={18} className="text-orange-500" fill="currentColor" /></div>
            <h2 className="text-lg font-[1000] uppercase tracking-tight text-black italic">지금 뜨거운 논란</h2>
          </div>
        </div>
        
        <div className="space-y-4">
          {hotPolls.map((poll) => (
            <Link key={poll.id} href={`/vote/${poll.id}`}>
              <div className="bg-white p-6 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-50 active:scale-[0.98] transition-all relative overflow-hidden group">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">{poll.category} · {poll.status}</span>
                  <span className="text-lg font-[1000] leading-tight uppercase break-keep pr-4">{poll.title}</span>
                  <span className="text-[11px] font-bold text-gray-400 uppercase mt-1">{poll.proposer_party} · {poll.proposer_name} 의원</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* CATEGORY TABS & LIST */}
      <section className={`transition-all duration-700 delay-500 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="px-6 flex items-center justify-between mb-4">
           <div className="flex items-center gap-2">
            <div className="bg-blue-100 p-1.5 rounded-full"><Sparkles size={18} className="text-blue-500" fill="currentColor" /></div>
            <h2 className="text-lg font-[1000] uppercase tracking-tight text-black italic">테마별 법안</h2>
          </div>
          <Link href="/explore" className="text-[10px] font-black text-gray-300 uppercase tracking-widest hover:text-black flex items-center gap-1">
            전체보기 <ChevronRight size={12} strokeWidth={4} />
          </Link>
        </div>

        <div className="flex gap-2 overflow-x-auto px-6 mb-6 no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`whitespace-nowrap px-6 py-2.5 rounded-full font-black text-[11px] uppercase tracking-wider transition-all
                ${activeTab === cat ? 'bg-black text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100 hover:bg-gray-50'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="px-6 space-y-3">
          {categoryPolls.length > 0 ? (
            categoryPolls.map((poll) => (
              <Link key={poll.id} href={`/vote/${poll.id}`}>
                <div className="bg-white px-6 py-5 rounded-[24px] border border-gray-100 active:bg-gray-50 flex items-center justify-between shadow-sm">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="text-[14px] font-[1000] truncate text-gray-700 uppercase mb-1">{poll.title}</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase">{poll.proposer_party} · {poll.proposer_name}</p>
                  </div>
                  <div className="text-[10px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
                    {((poll.votes_1 || 0) + (poll.votes_2 || 0)).toLocaleString()}명
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-10 text-gray-300 font-bold text-sm uppercase italic">
              아직 법안이 없어요 🗳️
            </div>
          )}
        </div>
      </section>
    </div>
  );
}