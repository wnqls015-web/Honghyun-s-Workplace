import { useEffect, useState } from "react";
import Nav from "../components/Nav";
import { supabase } from "../lib/supabase";

export default function Minutes() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      const { data, error } = await supabase
        .from("rp_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error) setReports(data);
      setLoading(false);
    }
    fetchReports();
  }, []);

  return (
    <>
      <Nav />

      <header className="hero">
        <p className="hero-eyebrow">Minutes</p>
        <h1 className="hero-title">회의록</h1>
        <p className="hero-subtitle">
          회의 전사록에서 자동 생성된 사내 표준 양식 회의록입니다. 새 회의록은 맨 위에 쌓입니다.
        </p>
      </header>

      <main className="section">
        {loading && <p className="state-text">불러오는 중...</p>}

        {!loading && (
          <div className="card-list">
            {reports.map((r) => (
              <article key={r.id} className="card">
                <div className="card-top">
                  <h3 className="card-title">{r.meeting_name}</h3>
                  {r.file_url && (
                    <a
                      href={r.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-link"
                    >
                      .xlsx 다운로드
                    </a>
                  )}
                </div>
                <p className="card-meta">
                  {r.meeting_datetime} · {r.location} · 작성자 {r.author}
                  <br />
                  참석자 {r.attendees}
                </p>

                <details className="disclosure">
                  <summary>회의 내용 / 지시사항 보기</summary>

                  <p className="table-label">회의 내용</p>
                  <div className="table-wrap">
                    <table className="rp-table">
                      <thead>
                        <tr>
                          <th>순번</th>
                          <th>안건</th>
                          <th>논의 내용</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(r.agenda_items || []).map((item, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{item.agenda}</td>
                            <td style={{ whiteSpace: "pre-wrap" }}>{item.discussion}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <p className="table-label">지시사항</p>
                  <div className="table-wrap">
                    <table className="rp-table">
                      <thead>
                        <tr>
                          <th>순번</th>
                          <th>지시사항</th>
                          <th>담당자</th>
                          <th>비고</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(r.instructions || []).map((item, i) => (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>{item.instruction}</td>
                            <td>{item.owner}</td>
                            <td>{item.note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </details>
              </article>
            ))}
          </div>
        )}

        {!loading && reports.length === 0 && (
          <p className="state-text">아직 생성된 회의록이 없습니다.</p>
        )}
      </main>
    </>
  );
}
