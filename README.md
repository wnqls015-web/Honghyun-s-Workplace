# Honghyun's Workplace — 업무 자동화 대시보드

경영기획/인사 업무 자동화 도구 모음 + 통합 대시보드 프로젝트입니다.

## 폴더 구조

```
.
├── dashboard/              # 대시보드 프론트엔드 (Next.js + Supabase)
│   ├── lib/supabase.js     # Supabase 클라이언트 설정
│   └── pages/index.js      # 자동화 결과 목록 화면
├── automation/
│   └── meeting-minutes/    # 회의록 자동화 스크립트
│       ├── format_minutes.py
│       └── template.md
├── .github/workflows/      # GitHub Actions (정기 실행 / 배포)
│   └── meeting-minutes.yml
└── .env.example
```

## 시작하는 순서

1. **Supabase 프로젝트 생성** → https://supabase.com
   - `meeting_minutes` 테이블 생성 (아래 스키마 참고)
   - 프로젝트 URL / anon key / service role key 확보
2. **.env.example → .env로 복사** 후 값 채우기
3. **로컬 테스트**
   ```bash
   cd automation/meeting-minutes
   pip install -r requirements.txt
   python format_minutes.py --input transcript.txt
   ```
4. **GitHub Secrets 등록** (repo Settings → Secrets and variables → Actions)
   - `ANTHROPIC_API_KEY`
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
5. **대시보드 배포**
   - Vercel에 `dashboard/` 폴더를 GitHub 연동으로 배포
   - 환경변수(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)를 Vercel 프로젝트 설정에 등록

## Supabase 테이블 스키마 (meeting_minutes)

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid (PK, default: gen_random_uuid()) | 고유 ID |
| title | text | 회의명 |
| meeting_date | date | 회의 일시 |
| attendees | text | 참석자 |
| summary | text | Claude가 생성한 정리본 (Markdown) |
| action_items | jsonb | Action Item 목록 |
| created_at | timestamptz (default: now()) | 생성 시각 |
| source | text | 어떤 자동화(회의록/보고서 등)에서 왔는지 구분용 |

> RLS(Row Level Security)를 반드시 켜고, 로그인한 본인만 조회 가능하도록 정책을 설정하세요.

## 새 워크플로우 연결 방법 (n8n/Zapier)

1. Plaud(또는 다른 녹음/전사 도구)의 웹훅이 전사 완료 시 n8n/Zapier를 트리거합니다.
2. n8n/Zapier의 HTTP Request 노드에서 GitHub `repository_dispatch` API를 호출합니다.
   ```
   POST https://api.github.com/repos/<owner>/<repo>/dispatches
   Headers: Authorization: token <GITHUB_TOKEN>
   Body: { "event_type": "new-transcript",
           "client_payload": { "transcript_url": "...", "title": "...", "date": "..." } }
   ```
3. GitHub Actions(`meeting-minutes.yml`)가 전사 파일을 받아 Claude API로 정리하고 Supabase에 저장합니다.
4. `dashboard/`에서 결과를 바로 확인할 수 있습니다.

## 보안 주의사항

- `.env`, API 키는 절대 커밋하지 않습니다 (`.gitignore`에 포함됨)
- 민감한 M&A 관련 회의는 이 자동화 파이프라인에 태우지 않고 별도로 수동 처리합니다
- Private 저장소 유지, 사내 정보보안 정책 확인 후 확장하세요
