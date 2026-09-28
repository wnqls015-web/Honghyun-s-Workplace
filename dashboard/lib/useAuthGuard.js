import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { supabase } from "./supabase";

// 로그인 세션이 없으면 /login으로 보내는 훅. session === undefined면 확인 중.
export function useAuthGuard() {
  const router = useRouter();
  const [session, setSession] = useState(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (!data.session) router.replace("/login");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) router.replace("/login");
    });

    return () => listener.subscription.unsubscribe();
  }, [router]);

  return session;
}
