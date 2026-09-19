import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export default function Home() {
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
    <main style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
      <h1>업무 자동화 대시보드</h1>
      <p>자동으로 생성된 회의록 및 업무 자료 모음</p>

      {loading && <p>불러오는 중...</p>}

      {!loading &&
        minutes.map((m) => (
          <div
            key={m.id}
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <h3>{m.title}</h3>
            <p style={{ color: "#666", fontSize: 14 }}>
              {m.meeting_date} · {m.attendees}
            </p>
            <details>
              <summary>내용 보기</summary>
              <pre style={{ whiteSpace: "pre-wrap" }}>{m.summary}</pre>
            </details>
          </div>
        ))}

      {!loading && minutes.length === 0 && <p>아직 저장된 회의록이 없습니다.</p>}
    </main>
  );
}
