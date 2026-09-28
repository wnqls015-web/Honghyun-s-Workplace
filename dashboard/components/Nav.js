import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Nav({ dark = false }) {
  const router = useRouter();
  const { pathname } = router;
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLoggedIn(!!data.session));

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <nav className={`nav${dark ? " nav-dark" : ""}`}>
      <div className="nav-inner">
        <Link href="/" className="nav-brand">
          HongHyun&apos;s Work Space
        </Link>
        <div className="nav-links">
          <Link href="/minutes" className={pathname === "/minutes" ? "active" : ""}>
            회의록
          </Link>
          {loggedIn ? (
            <button type="button" className="nav-logout" onClick={handleLogout}>
              로그아웃
            </button>
          ) : (
            <Link href="/login" className={pathname === "/login" ? "active" : ""}>
              로그인
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
