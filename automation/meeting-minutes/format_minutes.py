"""
회의 전사(transcript)를 받아 Claude API로 지정 템플릿에 맞게 정리하고
Supabase의 meeting_minutes 테이블에 저장하는 스크립트.

사용 예:
    python format_minutes.py --input transcript.txt --title "10월 주간 회의"

환경변수 (.env):
    ANTHROPIC_API_KEY
    SUPABASE_URL
    SUPABASE_SERVICE_KEY
"""

import os
import argparse
from datetime import date

import anthropic
from supabase import create_client

TEMPLATE_PATH = os.path.join(os.path.dirname(__file__), "template.md")


def load_template() -> str:
    with open(TEMPLATE_PATH, "r", encoding="utf-8") as f:
        return f.read()


def format_with_claude(transcript: str, template: str) -> str:
    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    message = client.messages.create(
        model="claude-sonnet-5",
        max_tokens=2000,
        system=(
            "너는 회의 전사록을 받아 지정된 템플릿 형식의 회의록으로 "
            "정리하는 비서야. 원문에 없는 내용을 지어내지 말고, "
            "핵심만 간결하게 정리해."
        ),
        messages=[
            {
                "role": "user",
                "content": f"다음 템플릿 형식으로 정리해줘:\n\n{template}\n\n"
                           f"---\n\n전사 원문:\n\n{transcript}",
            }
        ],
    )
    return message.content[0].text


def save_to_supabase(title: str, summary_md: str, meeting_date: str, attendees: str):
    supabase = create_client(
        os.environ["SUPABASE_URL"], os.environ["SUPABASE_SERVICE_KEY"]
    )
    supabase.table("meeting_minutes").insert(
        {
            "title": title,
            "meeting_date": meeting_date,
            "attendees": attendees,
            "summary": summary_md,
            "source": "meeting-minutes-automation",
        }
    ).execute()


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="전사 텍스트 파일 경로")
    parser.add_argument("--title", default="제목 미정 회의")
    parser.add_argument("--date", default=str(date.today()))
    parser.add_argument("--attendees", default="")
    parser.add_argument("--no-upload", action="store_true", help="Supabase 저장 생략")
    args = parser.parse_args()

    with open(args.input, "r", encoding="utf-8") as f:
        transcript = f.read()

    template = load_template()
    summary_md = format_with_claude(transcript, template)

    print(summary_md)

    if not args.no_upload:
        save_to_supabase(args.title, summary_md, args.date, args.attendees)
        print("\n✅ Supabase에 저장 완료")


if __name__ == "__main__":
    main()
