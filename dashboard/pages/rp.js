import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../lib/supabase";

export default function RpReports() {
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
    <main style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
      <p>
        <Link href="/">← 대시보드 홈</Link>
      </p>
      <h1>RP (회의록 리포트)</h1>
      <p>회의 전사록에서 자동 생성된 사내 표준 양식 회의록 모음</p>

      {loading && <p>불러오는 중...</p>}

      {!loading &&
        reports.map((r) => (
          <div
            key={r.id}
            style={{
              border: "1px solid #eee",
              borderRadius: 8,
              padding: 16,
              marginBottom: 12,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <h3 style={{ margin: 0 }}>{r.meeting_name}</h3>
              {r.file_url && (
                <a href={r.file_url} target="_blank" rel="noopener noreferrer">
                  .xlsx 다운로드
                </a>
              )}
            </div>
            <p style={{ color: "#666", fontSize: 14 }}>
              {r.meeting_datetime} · {r.location} · 작성자: {r.author}
            </p>
            <p style={{ color: "#666", fontSize: 14 }}>참석자: {r.attendees}</p>

            <details>
              <summary>회의 내용 / 지시사항 보기</summary>

              <h4>회의 내용</h4>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr>
                    <th style={cellStyle}>순번</th>
                    <th style={cellStyle}>안건</th>
                    <th style={cellStyle}>논의 내용</th>
                  </tr>
                </thead>
                <tbody>
                  {(r.agenda_items || []).map((item, i) => (
                    <tr key={i}>
                      <td style={cellStyle}>{i + 1}</td>
                      <td style={cellStyle}>{item.agenda}</td>
                      <td style={{ ...cellStyle, whiteSpace: "pre-wrap" }}>{item.discussion}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <h4>지시사항</h4>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr>
                    <th style={cellStyle}>순번</th>
                    <th style={cellStyle}>지시사항</th>
                    <th style={cellStyle}>담당자</th>
                    <th style={cellStyle}>비고</th>
                  </tr>
                </thead>
                <tbody>
                  {(r.instructions || []).map((item, i) => (
                    <tr key={i}>
                      <td style={cellStyle}>{i + 1}</td>
                      <td style={cellStyle}>{item.instruction}</td>
                      <td style={cellStyle}>{item.owner}</td>
                      <td style={cellStyle}>{item.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          </div>
        ))}

      {!loading && reports.length === 0 && <p>아직 생성된 RP가 없습니다.</p>}
    </main>
  );
}

const cellStyle = {
  border: "1px solid #eee",
  padding: "6px 8px",
  textAlign: "left",
  verticalAlign: "top",
};
