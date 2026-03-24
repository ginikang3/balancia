'use client';

import React, { useState, useEffect, use } from 'react';
import { ChevronLeft, Share2, Send, Plus, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

// 한 번에 불러올 댓글 수
const COMMENTS_PER_PAGE = 5;

export default function VoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const pollId = unwrappedParams.id;

  const [isLoaded, setIsLoaded] = useState(false);
  const [voted, setVoted] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showGauge, setShowGauge] = useState(false);
  const [poll, setPoll] = useState<any>(null);

  // 댓글 관련 State
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // 페이징 관련 State
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!pollId) return;

      // 1. 투표 기록 확인
      const savedVote = localStorage.getItem(`voted_${pollId}`);
      if (savedVote) {
        setVoted(true);
        setSelectedOption(Number(savedVote));
        setShowGauge(true);
      }

      // 2. 투표 본문 & 초기 댓글(첫 페이지) 가져오기
      const [pollRes, commentRes] = await Promise.all([
        supabase.from('balancia_polls').select('*').eq('id', pollId).single(),
        supabase.from('balancia_comments')
          .select('*')
          .eq('poll_id', pollId)
          .order('created_at', { ascending: false })
          .range(0, COMMENTS_PER_PAGE - 1)
      ]);

      if (pollRes.data) {
        setPoll(pollRes.data);
        setTimeout(() => setIsLoaded(true), 100);
      }
      
      if (commentRes.data) {
        setComments(commentRes.data);
        if (commentRes.data.length < COMMENTS_PER_PAGE) setHasMore(false);
      }
    };

    fetchInitialData();
  }, [pollId]);

  const loadMoreComments = async () => {
    if (isLoadingComments || !hasMore) return;
    setIsLoadingComments(true);
    
    const nextPage = page + 1;
    const from = nextPage * COMMENTS_PER_PAGE;
    const to = from + COMMENTS_PER_PAGE - 1;

    const { data } = await supabase
      .from('balancia_comments')
      .select('*')
      .eq('poll_id', pollId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (data && data.length > 0) {
      setComments(prev => [...prev, ...data]);
      setPage(nextPage);
      if (data.length < COMMENTS_PER_PAGE) setHasMore(false);
    } else {
      setHasMore(false);
    }
    setIsLoadingComments(false);
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        alert('¡Enlace copiado!');
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('¡Enlace copiado!');
      }
    } catch (err) { console.error(err); }
  };

  const handleVote = async (option: number) => {
    if (voted || !poll) return;
    setSelectedOption(option);
    setVoted(true);
    localStorage.setItem(`voted_${pollId}`, option.toString());
    const columnName = option === 1 ? 'votes_1' : 'votes_2';
    const { error } = await supabase.from('balancia_polls').update({ [columnName]: (poll[columnName] || 0) + 1 }).eq('id', pollId);
    if (!error) {
      setPoll({ ...poll, [columnName]: (poll[columnName] || 0) + 1 });
      setTimeout(() => setShowGauge(true), 50);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const { data, error } = await supabase.from('balancia_comments').insert([{ poll_id: pollId, content: newComment, nickname: 'Anónimo' }]).select();
    if (!error && data) {
      setComments([data[0], ...comments]);
      setNewComment('');
    }
    setIsSubmitting(false);
  };

  if (!poll) return <div className="min-h-screen bg-white flex items-center justify-center font-black text-gray-400 uppercase tracking-tighter text-xl">Cargando...</div>;

  const total = (poll.votes_1 || 0) + (poll.votes_2 || 0);
  const percent1 = total === 0 ? 50 : Math.round((poll.votes_1 / total) * 100);
  const percent2 = total === 0 ? 50 : 100 - percent1;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white text-[#1A1A1A] select-none overflow-x-hidden pb-20">
      {/* 1. HEADER (Heart 아이콘 제거됨) */}
      <div className={`flex justify-between items-center p-6 transition-all duration-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <button onClick={() => router.back()} className="p-2 -ml-2 active:scale-90 transition-transform">
          <ChevronLeft size={28} strokeWidth={3} />
        </button>
        <div className="flex gap-3">
          <button onClick={handleShare} className="p-2 active:scale-90 hover:text-[#4A90E2] transition-colors">
            <Share2 size={24} />
          </button>
        </div>
      </div>

      {/* 2. TITLE SECTION */}
      <div className={`px-8 mt-6 mb-10 transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="text-[34px] font-[1000] leading-[1.1] uppercase tracking-tighter mb-4">
          {poll.title}
        </h2>
        <div className="flex items-center gap-2 text-gray-400">
          <Users size={14} strokeWidth={3} className="text-[#4A90E2]" />
          <span className="text-xs font-black uppercase tracking-widest">
            {total.toLocaleString()} personas han votado
          </span>
        </div>
      </div>

      {/* 3. VOTE CARDS */}
      <div className={`px-6 flex flex-col gap-6 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div onClick={() => handleVote(1)} className={`relative w-full p-8 rounded-[32px] cursor-pointer overflow-hidden border-4 transition-all duration-500 ${voted && selectedOption === 1 ? 'border-[#4A90E2] bg-white scale-[1.03]' : 'border-transparent bg-[#F8F9FA]'} ${voted && selectedOption !== 1 && voted ? 'opacity-40 grayscale-[0.5]' : 'active:scale-95'}`}>
          <div className="absolute left-0 top-0 h-full bg-[#E3F2FD] transition-all duration-1000" style={{ width: showGauge ? `${percent1}%` : '0%' }} />
          <div className="relative z-10 flex justify-between items-center font-[1000] text-2xl uppercase tracking-tighter">
            <span className={voted && selectedOption === 1 ? 'text-[#4A90E2]' : 'text-[#333]'}>{poll.option_1}</span>
            {voted && <span className="text-[#4A90E2] text-2xl">{percent1}%</span>}
          </div>
        </div>

        <div className="flex justify-center -my-9 relative z-20">
          <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center font-black border-4 border-white shadow-xl text-sm transition-transform duration-500" style={{ transform: voted ? 'scale(0.8) rotate(15deg)' : 'scale(1)' }}>VS</div>
        </div>

        <div onClick={() => handleVote(2)} className={`relative w-full p-8 rounded-[32px] cursor-pointer overflow-hidden border-4 transition-all duration-500 ${voted && selectedOption === 2 ? 'border-[#FF4B91] bg-white scale-[1.03]' : 'border-transparent bg-[#F8F9FA]'} ${voted && selectedOption !== 2 && voted ? 'opacity-40 grayscale-[0.5]' : 'active:scale-95'}`}>
          <div className="absolute left-0 top-0 h-full bg-[#FFF0F5] transition-all duration-1000" style={{ width: showGauge ? `${percent2}%` : '0%' }} />
          <div className="relative z-10 flex justify-between items-center font-[1000] text-2xl uppercase tracking-tighter">
            <span className={voted && selectedOption === 2 ? 'text-[#FF4B91]' : 'text-[#333]'}>{poll.option_2}</span>
            {voted && <span className="text-[#FF4B91] text-2xl">{percent2}%</span>}
          </div>
        </div>
      </div>

      {/* 4. COMMENT SECTION */}
      <div className={`mt-16 px-6 pb-12 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <h3 className="font-[900] uppercase text-sm mb-6 tracking-tighter text-gray-300">Comentarios</h3>
        
        <form onSubmit={handleCommentSubmit} className="relative mb-10">
          <input 
            type="text" 
            value={newComment} 
            onChange={(e) => setNewComment(e.target.value)} 
            placeholder="¿Qué opinas?" 
            className="w-full bg-[#F3F4F6] rounded-[22px] px-6 py-5 pr-14 font-bold text-sm focus:outline-none focus:bg-[#EDEEF0] transition-all shadow-inner"
          />
          <button type="submit" disabled={isSubmitting} className="absolute right-5 top-1/2 -translate-y-1/2 p-2 text-black active:scale-90 disabled:opacity-20 transition-transform">
            <Send size={20} strokeWidth={3} />
          </button>
        </form>

        <div className="flex flex-col gap-8 mb-10">
          {comments.map((c) => (
            <div key={c.id} className="border-l-[3px] border-gray-100 pl-5 py-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] font-black uppercase text-[#4A90E2] tracking-widest">{c.nickname}</span>
                <span className="text-[9px] text-gray-300 font-bold uppercase">{new Date(c.created_at).toLocaleDateString()}</span>
              </div>
              <p className="font-bold text-[15px] text-[#333] leading-relaxed">{c.content}</p>
            </div>
          ))}

          {hasMore && (
            <button 
              onClick={loadMoreComments} 
              disabled={isLoadingComments}
              className="mt-4 w-full py-5 rounded-[24px] border-2 border-gray-50 text-gray-300 font-black uppercase text-[11px] tracking-widest flex items-center justify-center gap-2 active:bg-gray-50 transition-all disabled:opacity-50"
            >
              {isLoadingComments ? 'Cargando...' : <><Plus size={16} strokeWidth={4} /> Ver más comentarios</>}
            </button>
          )}

          {comments.length === 0 && (
            <p className="text-center py-16 text-gray-200 font-black uppercase text-[10px] tracking-[0.3em]">No hay comentarios aún</p>
          )}
        </div>
      </div>
    </div>
  );
}