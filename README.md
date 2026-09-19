# Honghyun's Workplace — 업무 자동화 대시보드

경영기획/인사 업무 자동화 도구 모음 + 통합 대시보드 프로젝트입니다.

## 폴더 구조

```
.
├── dashboard/               # 대시보드 프론트엔드 (Next.js + Supabase)
│   ├── lib/supabase.js      # Supabase 클라이언트 설정
│   ├── components/Nav.js    # 공용 상단 내비게이션
│   ├── pages/index.js       # 랜딩 화면 (HongHyun's Work Space)
│   └── pages/minutes.js     # 회의록(RP) 목록/다운로드 화면
├── automation/
│   └── rp/                  # 회의록 자동화 - 사내 표준 엑셀 양식 생성
│       ├── generate_rp.py
│       └── template.xlsx    # 사내 표준 회의록 양식 (기밀 데이터 제거된 빈 템플릿)
├── .github/workflows/       # GitHub Actions (정기 실행 / 배포)
│   └── rp.yml
└── .env.example
```

> 이전에는 회의록 자동화가 Markdown 요약(`automation/meeting-minutes`)과 사내 표준 엑셀 양식
> (`automation/rp`) 두 갈래로 나뉘어 있었습니다. RP가 필드(장소/작성자/지시사항 등)도 더 많고
> 실제 다운로드 가능한 파일과 이메일 발송까지 지원해 기능이 완전히 상위 호환이라, 구분할 이유가
> 없다고 판단해 RP 하나로 합쳤습니다. 대시보드에서도 "회의록" 메뉴 하나만 남았습니다.

## 시작하는 순서

1. **Supabase 프로젝트 생성** → https://supabase.com
   - `rp_reports` 테이블 생성 (아래 스키마 참고)
   - `rp-reports` Storage 버킷 생성 (Public, 생성된 .xlsx 저장용)
   - 프로젝트 URL / anon key / service role key 확보
2. **.env.example → .env로 복사** 후 값 채우기
3. **로컬 테스트**
   ```bash
   cd automation/rp
   pip install -r requirements.txt
   python generate_rp.py --input transcript.txt --title "주간업무보고 회의"
   ```
4. **GitHub Secrets 등록** (repo Settings → Secrets and variables → Actions)
   - `ANTHROPIC_API_KEY`
   - `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` (Supabase 저장을 쓸 경우)
   - `SMTP_USER`, `SMTP_PASSWORD`, `RP_EMAIL_TO` (생성된 회의록을 이메일로 받고 싶을 경우, 아래 참고)
5. **대시보드 배포**
   - Vercel에 `dashboard/` 폴더를 GitHub 연동으로 배포
   - 환경변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)를 Vercel 프로젝트 설정에 등록

## Supabase 테이블 스키마 (rp_reports)

회의록 자동화(`automation/rp`)가 사내 표준 회의록 양식(`template.xlsx`)을 채워 저장하는 테이블입니다.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid (PK, default: gen_random_uuid()) | 고유 ID |
| meeting_name | text | 회의명 |
| meeting_datetime | text | 일시 (원문 그대로, 형식 불확실한 경우 대비) |
| meeting_date | date | 리포트 생성 기준 날짜 (파일명/정렬용) |
| location | text | 장소 |
| author | text | 작성자 |
| attendees | text | 참석자 |
| agenda_items | jsonb | 회의 내용 (안건/논의내용 배열) |
| instructions | jsonb | 지시사항 (지시사항/담당자/비고 배열) |
| file_url | text | Supabase Storage(`rp-reports` 버킷)에 저장된 .xlsx 공개 URL |
| created_at | timestamptz (default: now()) | 생성 시각 |
| source | text | 어떤 자동화에서 왔는지 구분용 (`rp-automation`) |

> RLS(Row Level Security)를 반드시 켜고 조회 정책을 설정하세요. `rp-reports` Storage 버킷도
> 필요한 사용자만 다운로드 가능하도록 정책을 설정하세요.

> 이전에 Markdown 요약용 `meeting_minutes` 테이블을 만드셨다면 이제 안 쓰이니
> `drop table if exists meeting_minutes;`로 정리하셔도 됩니다 (선택 사항).

## Plaud → Zapier → GitHub 연결 방법 (회의록 자동 생성)

Plaud는 Zapier에서 **트리거 전용 앱**으로 제공됩니다(Plaud → 다른 앱으로 데이터를 보내는 것만 가능).
아래처럼 Zap 1개(트리거 1 + 액션 1)만 만들면 녹음 → 전사 완료 → 사내 표준 양식 회의록 자동 생성까지 끝입니다.

1. **GitHub Personal Access Token 발급** (Zapier가 이 저장소에 이벤트를 보낼 때 사용, 1회만 설정)
   - GitHub → Settings → Developer settings → Personal access tokens (classic) → `repo` 권한으로 생성
   - ⚠️ 이 토큰은 GitHub Actions Secrets가 아니라 **Zapier 쪽에 붙여넣는** 값입니다 (완전히 다른 용도)
2. **Zap 트리거**: 앱 `PLAUD` → 이벤트 `Transcript & Summary Ready` → Plaud 계정 연결
3. **Zap 액션**: 앱 `Webhooks by Zapier` → 이벤트 `POST`
   - URL: `https://api.github.com/repos/wnqls015-web/Honghyun-s-Workplace/dispatches`
   - Headers: `Authorization: token <위에서 발급한 PAT>`, `Accept: application/vnd.github+json`
   - Data (JSON, Payload Type = json):
     ```json
     {
       "event_type": "new-rp-transcript",
       "client_payload": {
         "transcript": "{{Plaud 전사(Transcript) 필드를 여기에 매핑}}"
       }
     }
     ```
   - `transcript` 하나만 넘기면 충분합니다. 회의명은 Claude가 전사 내용에서 자동 추출하고, 날짜는 실행일로 자동 지정됩니다.
   - 회의명/날짜를 직접 지정하고 싶으면 `client_payload`에 `title`, `date`를 추가로 매핑하세요.
4. `rp.yml` 워크플로우가 전사를 받아 Claude로 구조화 → `template.xlsx` 양식 그대로 채워 Supabase에 저장합니다.
5. `dashboard/minutes`에서 결과를 바로 확인/다운로드할 수 있습니다. 새로 생성된 회의록은 항상
   최상단에 추가됩니다 (최신순 정렬).

## 생성된 회의록을 이메일로 받기 (선택)

Supabase 설정 없이도, 생성된 `.xlsx`를 바로 메일로 받을 수 있습니다. Gmail 계정 기준:

1. 이메일을 **보낼** Gmail 계정에서 [구글 계정 → 보안 → 2단계 인증](https://myaccount.google.com/security) 켜기 (앱 비밀번호는 2단계 인증이 켜져 있어야 발급 가능)
2. [앱 비밀번호 발급 페이지](https://myaccount.google.com/apppasswords)에서 새 앱 비밀번호 생성 → 16자리 문자열 복사
3. repo Settings → Secrets and variables → Actions에 아래 3개 등록
   - `SMTP_USER`: 보내는 Gmail 주소 (예: `내계정@gmail.com`)
   - `SMTP_PASSWORD`: 방금 발급받은 16자리 앱 비밀번호 (계정 로그인 비밀번호 아님)
   - `RP_EMAIL_TO`: 받을 주소 (예: `jkim0723@gmail.com`)
4. 셋 다 등록되면 `rp.yml` 실행 시 생성된 회의록 파일이 자동으로 첨부되어 메일 발송됩니다. 하나라도 비어 있으면 이메일 단계는 조용히 건너뛰고 나머지(아티팩트/Supabase)는 그대로 진행됩니다.

## 보안 주의사항

- `.env`, API 키는 절대 커밋하지 않습니다 (`.gitignore`에 포함됨)
- 민감한 M&A 관련 회의는 이 자동화 파이프라인에 태우지 않고 별도로 수동 처리합니다
- Private 저장소 유지, 사내 정보보안 정책 확인 후 확장하세요
