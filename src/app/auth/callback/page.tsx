'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const processAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (session && !error) {
        // 세션이 이미 있으면 바로 홈으로
        router.replace('/');
      } else {
        // 세션 없으면 주소창에서 코드 추출해서 교환
        const code = new URL(window.location.href).searchParams.get('code');
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          router.replace('/');
        } else {
          router.replace('/profile');
        }
      }
    };

    processAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-[4px] border-black border-t-transparent rounded-full animate-spin" />
        <p className="font-[1000] uppercase tracking-tighter text-[11px] text-black">
          Cargando...
        </p>
      </div>
    </div>
  );
}