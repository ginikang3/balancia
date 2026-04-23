'use client';

import React, { useState, useEffect, use } from 'react';
import { ChevronLeft, Share2, Send, Plus, Users, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

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

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  useEffect(() => {
    const fetchInitialData = async () => {
      if (!pollId) return;

      const savedVote = localStorage.getItem(`voted_${pollId}`);
      if (savedVote) {
        setVoted(true);
        setSelectedOption(Number(savedVote));
        setShowGauge(true);
      }

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
        alert('링크가 복사되었습니다!');
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = shareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('링크가 복사되었습니다!');
      }
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

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;
    setIsSubmitting(true);
    const { data, error } = await supabase.from('balancia_comments').insert([{ poll_id: pollId, content: newComment, nickname: '익명' }]).select();
    if (!error && data) {
      setComments([data[0], ...comments]);
      setNewComment('');
    }
    setIsSubmitting(false);
  };

  if (!poll) return <div className="min-h-screen bg-white flex items-center justify-center font-black text-gray-400 uppercase tracking-tighter text-xl">불러오는 중...</div>;

  const total = (poll.votes_1 || 0) + (poll.votes_2 || 0);
  const percent1 = total === 0 ? 50 : Math.round((poll.votes_1 / total) * 100);
  const percent2 = total === 0 ? 50 : 100 - percent1;

  return (
    <div className="max-w-md mx-auto min-h-screen bg-white text-[#1A1A1A] select-none overflow-x-hidden pb-20">
      {/* 1. HEADER */}
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

      {/* 2. TITLE SECTION (중간 정렬 및 볼드체 수정) */}
      <div className={`px-8 mt-6 mb-10 text-center transition-all duration-700 delay-100 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <h2 className="text-[30px] font-black leading-[1.2] uppercase tracking-tighter mb-4 break-keep">
          {poll.title}
        </h2>
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <Users size={14} strokeWidth={3} className="text-[#4A90E2]" />
          <span className="text-xs font-black uppercase tracking-widest">
            총 {total.toLocaleString()}명 참여 중
          </span>
        </div>
      </div>

      {/* 3. VOTE CARDS */}
      <div className={`px-6 transition-all duration-700 delay-300 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
        <div className="flex gap-3 items-stretch relative min-h-[220px]">
          <div 
            onClick={() => !voted && setSelectedOption(1)} 
            className={`relative flex-1 p-5 rounded-[32px] cursor-pointer overflow-hidden border-4 transition-all duration-500 flex flex-col justify-between
              ${selectedOption === 1 ? 'border-[#4A90E2] bg-white scale-[1.02] z-10 shadow-lg' : 'border-transparent bg-[#F8F9FA]'} 
              ${voted && selectedOption !== 1 ? 'opacity-40 grayscale-[0.5]' : ''}
              ${!voted ? 'active:scale-95' : ''}`}
          >
            {voted && <div className="absolute left-0 bottom-0 w-full bg-[#E3F2FD] transition-all duration-1000 origin-bottom" style={{ height: showGauge ? `${percent1}%` : '0%' }} />}
            <div className="relative z-10 text-center flex flex-col items-center justify-center h-full gap-2">
              <span className={`font-[1000] text-xl uppercase tracking-tighter break-keep ${selectedOption === 1 ? 'text-[#4A90E2]' : 'text-[#333]'}`}>
                {poll.option_1}
              </span>
              {voted && <span className="text-[#4A90E2] font-[1000] text-2xl animate-in fade-in zoom-in duration-500">{percent1}%</span>}
            </div>
          </div>

          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className={`w-10 h-10 bg-black text-white rounded-full flex items-center justify-center font-black border-4 border-white shadow-xl text-[10px] transition-transform duration-500 ${voted ? 'scale-75 rotate-[360deg]' : ''}`}>VS</div>
          </div>

          <div 
            onClick={() => !voted && setSelectedOption(2)} 
            className={`relative flex-1 p-5 rounded-[32px] cursor-pointer overflow-hidden border-4 transition-all duration-500 flex flex-col justify-between
              ${selectedOption === 2 ? 'border-[#FF4B91] bg-white scale-[1.02] z-10 shadow-lg' : 'border-transparent bg-[#F8F9FA]'} 
              ${voted && selectedOption !== 2 ? 'opacity-40 grayscale-[0.5]' : ''}
              ${!voted ? 'active:scale-95' : ''}`}
          >
            {voted && <div className="absolute left-0 bottom-0 w-full bg-[#FFF0F5] transition-all duration-1000 origin-bottom" style={{ height: showGauge ? `${percent2}%` : '0%' }} />}
            <div className="relative z-10 text-center flex flex-col items-center justify-center h-full gap-2">
              <span className={`font-[1000] text-xl uppercase tracking-tighter break-keep ${selectedOption === 2 ? 'text-[#FF4B91]' : 'text-[#333]'}`}>
                {poll.option_2}
              </span>
              {voted && <span className="text-[#FF4B91] font-[1000] text-2xl animate-in fade-in zoom-in duration-500">{percent2}%</span>}
            </div>
          </div>
        </div>

        {!voted && selectedOption && (
          <button 
            onClick={submitVote}
            className="w-full mt-8 py-5 bg-black text-white rounded-[24px] font-[1000] uppercase tracking-[0.1em] shadow-2xl flex items-center justify-center gap-2 active:scale-95 transition-all animate-in slide-in-from-bottom-4 duration-300"
          >
            <CheckCircle2 size={20} />
            투표 확정하기
          </button>
        )}
      </div>

      {/* 4. COMMENT SECTION */}
      <div className={`mt-16 px-6 pb-12 transition-all duration-1000 delay-700 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
        <h3 className="font-[900] uppercase text-sm mb-6 tracking-tighter text-gray-300">댓글</h3>
        
        <form onSubmit={handleCommentSubmit} className="relative mb-10">
          <input 
            type="text" 
            value={newComment} 
            onChange={(e) => setNewComment(e.target.value)} 
            placeholder="당신의 의견은 어떤가요?" 
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
              {isLoadingComments ? '불러오는 중...' : <><Plus size={16} strokeWidth={4} /> 댓글 더보기</>}
            </button>
          )}

          {comments.length === 0 && (
            <p className="text-center py-16 text-gray-200 font-black uppercase text-[10px] tracking-[0.3em]">첫 번째 댓글을 남겨보세요</p>
          )}
        </div>
      </div>
    </div>
  );
}