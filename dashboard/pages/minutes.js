import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { supabase } from "../lib/supabase";

export default function Minutes() {
  const [minutes, setMinutes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMinutes() {
      const { data, error } = await supabase
        .from("meeting_minutes")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setMinutes(data);
      setLoading(false);
    }
    fetchMinutes();
  }, []);

  return (
    <>
      <Nav />

      <header className="hero">
        <p className="hero-eyebrow">Minutes</p>
        <h1 className="hero-title">회의록</h1>
        <p className="hero-subtitle">
          자동으로 생성된 회의록 요약을 한곳에서 확인하세요.
        </p>
      </header>

      <main className="section">
        {loading && <p className="state-text">불러오는 중...</p>}

        {!loading && (
          <div className="card-list">
            {minutes.map((m) => (
              <article key={m.id} className="card">
                <div className="card-top">
                  <h3 className="card-title">{m.title}</h3>
                </div>
                <p className="card-meta">
                  {m.meeting_date} · {m.attendees}
                </p>
                <details className="disclosure">
                  <summary>내용 보기</summary>
                  <p className="card-summary">{m.summary}</p>
                </details>
              </article>
            ))}
          </div>
        )}

        {!loading && minutes.length === 0 && (
          <p className="state-text">아직 저장된 회의록이 없습니다.</p>
        )}
      </main>
    </>
  );
}
