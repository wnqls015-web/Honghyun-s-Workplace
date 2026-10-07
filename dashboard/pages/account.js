import { useState } from "react";
import Nav from "../components/Nav";
import { supabase } from "../lib/supabase";
import { useAuthGuard } from "../lib/useAuthGuard";

export default function Account() {
  const session = useAuthGuard();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (password !== confirm) {
      setError("새 비밀번호가 서로 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setError(`변경 실패: ${error.message}`);
        return;
      }
      setSuccess(true);
      setPassword("");
      setConfirm("");
    } catch (e) {
      setError(`연결 실패: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  if (!session) {
    return (
      <>
        <Nav />
        <p className="state-text">로그인 확인 중...</p>
      </>
    );
  }

  return (
    <>
      <Nav />

      <header className="hero">
        <p className="hero-eyebrow">Account</p>
        <h1 className="hero-title">비밀번호 변경</h1>
        <p className="hero-subtitle">{session.user.email} 계정의 비밀번호를 변경합니다.</p>
      </header>

      <main className="section">
        <form className="login-form" onSubmit={handleSubmit}>
          <label className="login-label">
            새 비밀번호
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="login-input"
              autoComplete="new-password"
            />
          </label>
          <label className="login-label">
            새 비밀번호 확인
            <input
              type="password"
              required
              minLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="login-input"
              autoComplete="new-password"
            />
          </label>

          {error && <p className="login-error">{error}</p>}
          {success && <p className="login-success">비밀번호가 변경되었습니다.</p>}

          <button type="submit" className="btn btn-primary login-submit" disabled={loading}>
            {loading ? "변경 중..." : "비밀번호 변경"}
          </button>
        </form>
      </main>
    </>
  );
}
