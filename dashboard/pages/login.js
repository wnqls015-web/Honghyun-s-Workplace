import { useState } from "react";
import { useRouter } from "next/router";
import Nav from "../components/Nav";
import { supabase } from "../lib/supabase";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      setError("이메일 또는 비밀번호가 올바르지 않습니다.");
      return;
    }
    router.push("/minutes");
  }

  return (
    <>
      <Nav />

      <header className="hero">
        <p className="hero-eyebrow">Sign in</p>
        <h1 className="hero-title">로그인</h1>
        <p className="hero-subtitle">회사 계정으로 로그인하고 회의록을 확인하세요.</p>
      </header>

      <main className="section">
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">
            이메일
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="login-input"
              autoComplete="email"
            />
          </label>
          <label className="login-label">
            비밀번호
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              autoComplete="current-password"
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
            {loading ? "로그인 중..." : "로그인"}
          </button>
        </form>

        <p className="login-hint">계정이 없으신가요? 관리자에게 계정 생성을 요청해 주세요.</p>
      </main>
    </>
  );
}
