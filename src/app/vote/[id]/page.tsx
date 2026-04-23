'use client';

import React, { useState, useEffect, use } from 'react';
import { ChevronLeft, Share2, Users, CheckCircle2, Info, ExternalLink, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function VoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const pollId = unwrappedParams.id;

  const [isLoaded, setIsLoaded] = useState(false);
  const [voted, setVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showGauge, setShowGauge] = useState(false);
  const [poll, setPoll] = useState<any>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!pollId) return;

      const savedVote = localStorage.getItem(`voted_${pollId}`);
      if (savedVote) {
        setVoted(true);
        setSelectedOption(Number(savedVote));
        setShowGauge(true);
      }

      const { data } = await supabase
        .from('balancia_polls')
        .select('*')
        .eq('id', pollId)
        .single();

      if (data) {
        setPoll(data);
        setTimeout(() => setIsLoaded(true), 100);
      }
    };

    fetchInitialData();
  }, [pollId]);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('링크가 복사되었습니다!');
    } catch (err) { console.error(err); }
  };

  const submitVote = async () => {
    if (voted || !poll || selectedOption === null) return;
    
    const option = selectedOption;
    setVoted(true);
    localStorage.setItem(`voted_${pollId}`, option.toString());
    
    const columnName = option === 1 ? 'votes_1' : 'votes_2';
    const { error } = await supabase.from('balancia_polls').update({ [columnName]: (poll[columnName] || 0) + 1 }).eq('id', pollId);
    
    if (!error) {
      setPoll({ ...poll, [columnName]: (poll[columnName] || 0) + 1 });
      setTimeout(() => setShowGauge(true), 50);
    }
  };

  if (!poll) return <div className="min-h-screen bg-white flex items-center justify-center font-black text-gray-400 uppercase tracking-tighter text-xl italic">Loading Balancia...</div>;

  const total = (poll.votes_1 || 0) + (poll.votes_2 || 0);
  const percent1 = total === 0 ? 50 : Math.round((poll.votes_1 / total) * 100);
  const percent2 = total === 0 ? 50 : 100 - percent1;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white text-[#1A1A1A] select-none overflow-x-hidden pb-12">
      {/* 1. HEADER */}
      <div className={`flex justify-between items-center p-6 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={() => router.back()} className="p-2 -ml-2 active:scale-90 transition-transform">
          <ChevronLeft size={28} strokeWidth={3} />
        </button>
        <div className="flex gap-3">
          <button onClick={handleShare} className="p-2 active:scale-90 transition-colors">
            <Share2 size={24} />
          </button>
        </div>
      </div>

      {/* 2. CATEGORY & STATUS */}
      <div className={`px-8 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-full">
            {poll.category}
          </span>
          <span className="px-3 py-1 border-2 border-black text-black text-[10px] font-black uppercase tracking-widest rounded-full">
            {poll.status}
          </span>
        </div>
        <h2 className="text-[32px] font-[1000] leading-[1.1] uppercase tracking-tighter mb-4 break-keep">
          {poll.title}
        </h2>
        <div className="flex items-center gap-2 text-gray-400 font-bold text-xs uppercase italic">
          <Info size={14} />
          {poll.proposer_party} · {poll.proposer_name} 의원 발의
        </div>
      </div>

      {/* 3. VOTE CARDS */}
      <div className={`px-6 mt-10 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex gap-3 items-stretch relative min-h-[180px]">
          {/* 찬성 버튼 */}
          <div 
            onClick={() => !voted && setSelectedOption(1)} 
            className={`relative flex-1 p-6 rounded-[32px] cursor-pointer overflow-hidden border-4 transition-all duration-500 flex flex-col items-center justify-center
              ${selectedOption === 1 ? 'border-[#4A90E2] bg-white scale-[1.02] z-10 shadow-xl' : 'border-transparent bg-[#F8F9FA]'} 
              ${voted && selectedOption !== 1 ? 'opacity-40 grayscale-[0.8]' : ''}
              ${!voted ? 'active:scale-95' : ''}`}
          >
            {voted && <div className="absolute left-0 bottom-0 w-full bg-[#E3F2FD] transition-all duration-1000 origin-bottom" style={{ height: showGauge ? `${percent1}%` : '0%' }} />}
            <span className={`relative z-10 font-[1000] text-xl uppercase italic ${selectedOption === 1 ? 'text-[#4A90E2]' : 'text-gray-400'}`}>찬성</span>
            {voted && <span className="relative z-10 text-[#4A90E2] font-[1000] text-3xl mt-1">{percent1}%</span>}
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-black border-4 border-white shadow-xl text-[10px]">VS</div>
          </div>

          {/* 반대 버튼 */}
          <div 
            onClick={() => !voted && setSelectedOption(2)} 
            className={`relative flex-1 p-6 rounded-[32px] cursor-pointer overflow-hidden border-4 transition-all duration-500 flex flex-col items-center justify-center
              ${selectedOption === 2 ? 'border-[#FF4B91] bg-white scale-[1.02] z-10 shadow-xl' : 'border-transparent bg-[#F8F9FA]'} 
              ${voted && selectedOption !== 2 ? 'opacity-40 grayscale-[0.8]' : ''}
              ${!voted ? 'active:scale-95' : ''}`}
          >
            {voted && <div className="absolute left-0 bottom-0 w-full bg-[#FFF0F5] transition-all duration-1000 origin-bottom" style={{ height: showGauge ? `${percent2}%` : '0%' }} />}
            <span className={`relative z-10 font-[1000] text-xl uppercase italic ${selectedOption === 2 ? 'text-[#FF4B91]' : 'text-gray-400'}`}>반대</span>
            {voted && <span className="relative z-10 text-[#FF4B91] font-[1000] text-3xl mt-1">{percent2}%</span>}
          </div>
        </div>

        {!voted && selectedOption && (
          <button 
            onClick={submitVote}
            className="w-full mt-6 py-5 bg-black text-white rounded-[24px] font-[1000] uppercase tracking-[0.2em] shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-all"
          >
            <CheckCircle2 size={20} />
            의견 확정
          </button>
        )}
      </div>

      {/* 4. BILL DETAIL (법안 상세 정보 - 요약만 남김) */}
      <div className={`mt-12 px-8 transition-all duration-1000 delay-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="bg-gray-50 rounded-[32px] p-8">
          <h4 className="flex items-center gap-2 font-black text-xs uppercase tracking-wider text-gray-400 mb-4">
            <AlertCircle size={14} />
            법안 요약 정보
          </h4>
          <p className="text-[14px] font-bold leading-relaxed text-gray-600 mb-6 break-keep">
            {poll.content}
          </p>
          
          {poll.bill_link && (
            <a 
              href={poll.bill_link} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-black border-b-2 border-black pb-1 hover:opacity-60 transition-opacity"
            >
              의안 정보 시스템에서 확인하기 <ExternalLink size={12} strokeWidth={3} />
            </a>
          )}
        </div>
      </div>

      {/* 5. BOTTOM STATS */}
      <div className={`mt-12 px-8 flex justify-center transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <div className="flex items-center gap-2 px-6 py-3 bg-gray-100 rounded-full">
          <Users size={14} className="text-gray-400" />
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
            총 {total.toLocaleString()}명의 시민 참여 중
          </span>
        </div>
      </div>
    </div>
  );
}